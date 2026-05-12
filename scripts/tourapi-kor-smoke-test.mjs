import fs from "node:fs/promises";
import path from "node:path";
import { loadDotEnv } from "./env.mjs";

loadDotEnv();

const serviceKey = process.env.TOUR_API_KEY ?? process.env.TOUR_API_KEY_DECODED;

if (!serviceKey) {
  console.error("Missing TOUR_API_KEY. Copy .env.example to .env or set the variable in your shell.");
  process.exit(1);
}

const keywords = process.argv.slice(2);
const testKeywords = keywords.length ? keywords : ["경복궁", "한복", "김치", "남산 서울 타워", "태권도"];
const baseUrl = "https://apis.data.go.kr/B551011/KorService2/searchKeyword2";

await fs.mkdir(path.join(process.cwd(), "cache", "kto"), { recursive: true });

for (const keyword of testKeywords) {
  const url = new URL(baseUrl);
  url.searchParams.set("serviceKey", serviceKey);
  url.searchParams.set("MobileOS", "ETC");
  url.searchParams.set("MobileApp", "KCultureKoreanMVP");
  url.searchParams.set("_type", "json");
  url.searchParams.set("numOfRows", "10");
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("keyword", keyword);

  const response = await fetch(url);
  const text = await response.text();
  const outputPath = path.join(process.cwd(), "cache", "kto", `kor-search-${keyword.replace(/\s+/g, "_")}.json`);
  await fs.writeFile(outputPath, text, "utf8");

  let count = "unknown";
  try {
    const json = JSON.parse(text);
    count = json?.response?.body?.totalCount ?? "unknown";
  } catch {
    count = "non-json";
  }

  console.log(`${keyword}: ${response.status} (${count} results) -> ${outputPath}`);
}
