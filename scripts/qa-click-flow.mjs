import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const root = process.cwd();
const port = Number(process.env.PORT ?? 4273);
const debugPort = Number(process.env.CHROME_DEBUG_PORT ?? 9223);
const browsers = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findBrowser() {
  for (const candidate of browsers) {
    if (await exists(candidate)) return candidate;
  }
  return null;
}

async function waitForJson(url, attempts = 50) {
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {
      // Wait for Chrome remote debugging to come up.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function waitForHttp(url, attempts = 50) {
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Wait for local static server.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function connect(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  let id = 0;
  const pending = new Map();

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id) return;
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  });

  return new Promise((resolve, reject) => {
    socket.addEventListener("open", () => {
      resolve({
        send(method, params = {}) {
          id += 1;
          socket.send(JSON.stringify({ id, method, params }));
          return new Promise((requestResolve, requestReject) => {
            pending.set(id, { resolve: requestResolve, reject: requestReject });
          });
        },
        close() {
          socket.close();
        },
      });
    });
    socket.addEventListener("error", reject);
  });
}

const browser = await findBrowser();
if (!browser) {
  console.error("Chrome or Edge was not found.");
  process.exit(1);
}

const userDataDir = await fs.mkdtemp(path.join(os.tmpdir(), "korean-edu-click-qa-"));
const server = spawn(process.execPath, ["scripts/serve-prototype.mjs"], {
  cwd: root,
  env: { ...process.env, PORT: String(port) },
  windowsHide: true,
});
const chrome = spawn(browser, [
  "--headless=new",
  "--disable-gpu",
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${userDataDir}`,
  "--no-first-run",
  "--no-default-browser-check",
  `http://127.0.0.1:${port}/`,
], {
  windowsHide: true,
});

try {
  await waitForHttp(`http://127.0.0.1:${port}/`);
  const pages = await waitForJson(`http://127.0.0.1:${debugPort}/json`);
  const page = pages.find((item) => item.type === "page");
  if (!page?.webSocketDebuggerUrl) throw new Error("Could not find Chrome page target.");

  const client = await connect(page.webSocketDebuggerUrl);
  await client.send("Runtime.enable");
  await client.send("Page.enable");
  await client.send("Page.navigate", { url: `http://127.0.0.1:${port}/` });
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const result = await client.send("Runtime.evaluate", {
    awaitPromise: true,
    returnByValue: true,
    expression: `
      (async () => {
        const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const text = () => document.body.innerText;
        const fail = (message) => { throw new Error(message); };
        const waitForText = async (needle) => {
          for (let index = 0; index < 50; index += 1) {
            if (text().includes(needle)) return;
            await wait(200);
          }
          fail("Missing text: " + needle + " at " + location.href + " body=" + text().slice(0, 160));
        };
        const click = (selector) => {
          const element = document.querySelector(selector);
          if (!element) fail("Missing selector: " + selector);
          element.click();
          return element;
        };

        await waitForText("한 장 끝내기");
        if (!document.querySelector("[data-reading-word]")) fail("reading fallback CTA missing");

        click("[data-reading-word]");
        await wait(300);
        if (!text().includes("현재 단계: 퀴즈")) fail("reading did not advance toward quiz for no-expression word");

        const quiz = document.querySelector(".quiz-card");
        if (!quiz) fail("quiz card missing");
        const answer = quiz.dataset.answer;
        const answerButton = [...quiz.querySelectorAll("[data-option]")].find((button) => button.dataset.option === answer);
        if (!answerButton) fail("correct answer option missing");
        answerButton.click();
        await wait(500);
        if (!text().includes("다음 어휘:")) fail("next lesson CTA missing after completion");

        const nextButtonText = document.querySelector("[data-next-word]")?.textContent ?? "";

        const wrongQuiz = [...document.querySelectorAll(".quiz-card")].find((card) => card.dataset.answer && [...card.querySelectorAll("[data-option]")].some((button) => button.dataset.option !== card.dataset.answer));
        if (!wrongQuiz) fail("no quiz available for wrong-answer setup");
        const wrongOption = [...wrongQuiz.querySelectorAll("[data-option]")].find((button) => button.dataset.option !== wrongQuiz.dataset.answer);
        wrongOption.click();
        await wait(400);
        const wrongWord = wrongQuiz.dataset.word;
        const currentWord = document.querySelector(".detail h3")?.textContent?.trim();
        const current = window.KCULTURE_DATA.vocabulary.find((item) => item.word === currentWord);
        const recommended = window.KCULTURE_DATA.vocabulary.find((item) => item.word === wrongWord);
        const sameCategoryFallback = current && recommended && current.category === recommended.category;
        if (!wrongWord || (!text().includes("오답 1회") && !sameCategoryFallback)) fail("wrong-answer priority signal missing");

        return {
          ok: true,
          nextButtonText,
          wrongWord,
          hasReadingProgress: Boolean(JSON.parse(localStorage.getItem("kculture-learning-progress-v1")).reading),
        };
      })();
    `,
  });
  client.close();

  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text ?? "Runtime exception");
  }
  console.log("Click flow QA passed.");
  console.log(JSON.stringify(result.result.value, null, 2));
} finally {
  chrome.kill();
  server.kill();
  await new Promise((resolve) => chrome.once("close", resolve));
  await fs.rm(userDataDir, { recursive: true, force: true }).catch((error) => {
    console.warn(`Could not remove temporary browser profile: ${error.message}`);
  });
}
