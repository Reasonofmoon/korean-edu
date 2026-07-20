import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const port = Number(process.env.PORT ?? 4173);
const root = process.cwd();
const outputPath = path.join(root, "qa-dom.txt");
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

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      shell: false,
      windowsHide: true,
      ...options,
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(stderr || `Command failed with code ${code}`));
    });
  });
}

const browser = await async function findBrowser() {
  for (const candidate of browsers) {
    if (await exists(candidate)) return candidate;
  }
  return null;
}();

if (!browser) {
  console.error("Chrome or Edge was not found.");
  process.exit(1);
}

const server = spawn(process.execPath, ["scripts/serve-prototype.mjs"], {
  cwd: root,
  env: { ...process.env, PORT: String(port) },
  windowsHide: true,
});

try {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  const { stdout } = await run(browser, [
    "--headless=new",
    "--disable-gpu",
    "--dump-dom",
    `http://127.0.0.1:${port}/`,
  ]);
  await fs.writeFile(outputPath, stdout, "utf8");

  const required = [
    "한국문화 어휘로 시작하는 로컬 한국어 미션",
    "문화 어휘 카드",
    "듣기 퀴즈와 핵심 표현",
    "복습 카드와 완료 배지",
    "경복궁",
    "정답률",
    "K-movie 명대사",
    "K-pop 차트",
    "명대사 수위",
    "명대사 확인",
    "K-pop 미션",
    "hangul-utils",
    "전체 학습 기록 초기화",
  ];
  const missing = required.filter((text) => !stdout.includes(text));
  if (missing.length) {
    console.error(`Missing rendered text: ${missing.join(", ")}`);
    process.exitCode = 1;
  } else {
    console.log("Browser QA passed.");
    console.log(`DOM snapshot: ${outputPath}`);
  }
} finally {
  server.kill();
}
