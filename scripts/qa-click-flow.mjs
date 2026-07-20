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
const chrome = spawn(
  browser,
  [
    "--headless=new",
    "--disable-gpu",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    `http://127.0.0.1:${port}/`,
  ],
  {
    windowsHide: true,
  },
);

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

  // Clear progress without reload inside evaluate (reload would drop CDP target).
  await client.send("Runtime.evaluate", {
    expression: `localStorage.removeItem("kculture-learning-progress-v1");`,
  });
  await client.send("Page.navigate", { url: `http://127.0.0.1:${port}/` });
  await new Promise((resolve) => setTimeout(resolve, 1200));

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
          fail("Missing text: " + needle + " at " + location.href + " body=" + text().slice(0, 200));
        };
        const clickIfPresent = (selector) => {
          const element = document.querySelector(selector);
          if (!element) return false;
          element.click();
          return true;
        };
        const click = (selector) => {
          if (!clickIfPresent(selector)) fail("Missing selector: " + selector);
        };

        await waitForText("한 장 끝내기");
        if (!text().includes("K-culture")) fail("session flow missing K-culture step");
        if (!text().includes("명대사 확인")) fail("session flow missing 명대사 확인 step");
        if (!text().includes("K-pop 미션")) fail("session flow missing K-pop 미션 step");
        if (!text().includes("K-food") && !text().includes("K-beauty")) fail("K-culture domain panel missing");

        // Prefer a reading-fallback word so we can drive the full pipeline.
        if (!document.querySelector("[data-reading-word]")) {
          const cards = [...document.querySelectorAll(".vocab-card")];
          if (cards[0]) cards[0].click();
          await wait(300);
        }
        if (!document.querySelector("[data-reading-word]")) fail("reading fallback CTA missing");

        click("[data-reading-word]");
        await wait(400);

        if (document.querySelector("[data-expression-word]")) {
          click("[data-expression-word]");
          await wait(400);
        }

        if (document.querySelector("[data-domain-word]")) {
          click("[data-domain-word]");
          await wait(400);
          if (!text().includes("K-culture 미션 완료")) fail("domain step did not mark complete");
        }

        if (!document.querySelector("[data-quote-word]")) fail("quote confirmation CTA missing");
        click("[data-quote-word]");
        await wait(400);
        if (!text().includes("명대사 확인 완료")) fail("quote step did not mark complete");

        if (document.querySelector("[data-kpop-word]")) {
          click("[data-kpop-word]");
          await wait(400);
          if (!text().includes("K-pop 미션 완료")) fail("kpop step did not mark complete");
        }

        document.querySelector("#quiz-step")?.setAttribute("open", "true");
        const quiz = document.querySelector(".quiz-card");
        if (!quiz) fail("quiz card missing");
        const answer = quiz.dataset.answer;
        const answerButton = [...quiz.querySelectorAll("[data-option]")].find((button) => button.dataset.option === answer);
        if (!answerButton) fail("correct answer option missing");
        answerButton.click();
        await wait(400);

        for (let round = 0; round < 8; round += 1) {
          const pending = [...document.querySelectorAll(".quiz-card")].find((card) => !card.querySelector("[data-option].correct"));
          if (!pending) break;
          const pendingAnswer = pending.dataset.answer;
          const btn = [...pending.querySelectorAll("[data-option]")].find((button) => button.dataset.option === pendingAnswer);
          if (!btn) break;
          btn.click();
          await wait(250);
        }

        await wait(400);
        if (!text().includes("다음 어휘:")) fail("next lesson CTA missing after full completion");

        const nextButtonText = document.querySelector("[data-next-word]")?.textContent ?? "";
        const progress = JSON.parse(localStorage.getItem("kculture-learning-progress-v1") || "{}");

        const wrongQuiz = [...document.querySelectorAll(".quiz-card")].find((card) =>
          card.dataset.answer && [...card.querySelectorAll("[data-option]")].some((button) => button.dataset.option !== card.dataset.answer),
        );
        if (wrongQuiz) {
          const wrongOption = [...wrongQuiz.querySelectorAll("[data-option]")].find(
            (button) => button.dataset.option !== wrongQuiz.dataset.answer,
          );
          wrongOption?.click();
          await wait(300);
        }

        // Rating filter smoke: switch to mature and ensure control works
        const rating = document.querySelector("#quote-rating-filter");
        if (rating) {
          rating.value = "mild";
          rating.dispatchEvent(new Event("change", { bubbles: true }));
          await wait(200);
        }

        return {
          ok: true,
          nextButtonText,
          hasReadingProgress: Boolean(progress.reading && Object.keys(progress.reading).length),
          hasQuoteProgress: Boolean(progress.quotes && Object.keys(progress.quotes).length),
          hasKpopProgress: Boolean(progress.kpop && Object.keys(progress.kpop).length),
          stageAfter: document.querySelector(".session-hint")?.textContent ?? "",
          quoteFilter: document.querySelector("#quote-rating-filter")?.value ?? null,
          hasQuoteSection: Boolean(document.querySelector("#quote-step")),
          hasKpopSection: Boolean(document.querySelector("#kpop-step")),
          hasSessionQuoteStep: text().includes("명대사 확인"),
        };
      })();
    `,
  });
  client.close();

  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text ?? "Runtime exception");
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
