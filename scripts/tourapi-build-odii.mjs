import fs from "node:fs/promises";
import path from "node:path";
import { loadDotEnv } from "./env.mjs";

loadDotEnv();

const root = process.cwd();
const serviceKey = process.env.TOUR_API_KEY ?? process.env.TOUR_API_KEY_DECODED;
const appDataPath = path.join(root, "prototype", "data", "app-data.js");
const placeDetailsPath = path.join(root, "prototype", "data", "tourapi-place-details.js");
const outputPath = path.join(root, "prototype", "data", "odii-stories.js");
const cacheDir = path.join(root, "cache", "odii");
const baseUrl = "https://apis.data.go.kr/B551011/Odii/storySearchList";

const queryAliases = {
  경복궁: ["경복궁", "궁궐", "조선"],
  "남산 서울 타워": ["남산 서울 타워", "남산서울타워", "N서울타워"],
  한복: ["한복", "전통의상"],
  김치: ["김치", "김장"],
  국밥: ["국밥"],
  떡볶이: ["떡볶이"],
  태권도: ["태권도"],
  판소리: ["판소리", "소리", "국악"],
  갯벌: ["갯벌", "고창갯벌", "습지"],
  감귤: ["감귤", "제주 감귤", "제주감귤"],
};

function readJsData(text, globalName) {
  const prefix = `window.${globalName} = `;
  const trimmed = text.trim();
  if (!trimmed.startsWith(prefix)) throw new Error(`Unexpected ${globalName} format.`);
  return JSON.parse(trimmed.slice(prefix.length).replace(/;$/, ""));
}

function normalizeItems(json) {
  const rawItems = json?.response?.body?.items?.item;
  if (!rawItems) return [];
  return Array.isArray(rawItems) ? rawItems : [rawItems];
}

function cacheName(keyword) {
  return `story-search-${keyword.replace(/\s+/g, "_")}.json`;
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function snippet(script, terms) {
  const text = cleanText(script);
  const index = terms
    .map((term) => text.indexOf(term))
    .filter((value) => value >= 0)
    .sort((a, b) => a - b)[0];
  const start = Math.max(0, (index ?? 0) - 80);
  return text.slice(start, start + 260);
}

function scoreStory(vocab, representative, query, item) {
  const title = cleanText(`${item.title ?? ""} ${item.audioTitle ?? ""}`);
  const script = cleanText(item.script);
  const haystack = `${title} ${script}`;
  const word = vocab.word;
  const compactWord = word.replace(/\s+/g, "");
  const repTitle = representative?.place?.title ?? "";
  let score = 0;

  if (title.includes(word)) score += 80;
  if (haystack.includes(word)) score += 55;
  if (compactWord !== word && haystack.replace(/\s+/g, "").includes(compactWord)) score += 45;
  if (repTitle && haystack.includes(repTitle)) score += 45;
  if (title.includes(query)) score += 35;
  if (haystack.includes(query)) score += 20;
  if (item.audioUrl) score += 18;
  if (item.imageUrl) score += 8;
  if (Number(item.playTime) > 0 && Number(item.playTime) <= 240) score += 6;

  const categorySignals = {
    food: ["음식", "먹", "맛", "시장", "한식"],
    place: ["관광", "역사", "서울", "여행"],
    tradition: ["전통", "문화", "예술", "공연"],
    history: ["역사", "조선", "왕", "문화재"],
    nature: ["자연", "생태", "바다", "습지"],
  }[vocab.category] ?? [];

  if (categorySignals.some((signal) => haystack.includes(signal))) score += 10;
  if (!item.audioUrl) score -= 12;
  return score;
}

function isRelevantStory(vocab, representative, story) {
  const word = vocab.word;
  const compactWord = word.replace(/\s+/g, "");
  const repTitle = representative?.place?.title ?? "";
  const haystack = `${story.title} ${story.audioTitle} ${story.script}`;
  const compactHaystack = haystack.replace(/\s+/g, "");
  const hasDirectWord = haystack.includes(word) || compactHaystack.includes(compactWord);
  const hasRepTitle = repTitle && haystack.includes(repTitle);
  const hasStrongScore = story.score >= 120;
  return hasDirectWord || hasRepTitle || hasStrongScore;
}

async function fetchStorySearch(keyword) {
  await fs.mkdir(cacheDir, { recursive: true });
  const filePath = path.join(cacheDir, cacheName(keyword));

  if (!serviceKey) {
    const cached = await fs.readFile(filePath, "utf8").catch(() => null);
    return cached ? JSON.parse(cached) : null;
  }

  const url = new URL(baseUrl);
  url.searchParams.set("serviceKey", serviceKey);
  url.searchParams.set("MobileOS", "ETC");
  url.searchParams.set("MobileApp", "KCultureKoreanMVP");
  url.searchParams.set("_type", "json");
  url.searchParams.set("numOfRows", "10");
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("keyword", keyword);
  url.searchParams.set("langCode", "ko");

  const response = await fetch(url);
  const text = await response.text();
  await fs.writeFile(filePath, text, "utf8");

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${keyword} returned non-JSON: ${error.message}`);
  }
}

const appData = readJsData(await fs.readFile(appDataPath, "utf8"), "KCULTURE_DATA");
const placeDetails = readJsData(await fs.readFile(placeDetailsPath, "utf8"), "KCULTURE_TOURAPI_DETAILS");
const targetWords = placeDetails.details.map((detail) => detail.word);
const results = [];
const errors = [];

for (const word of targetWords) {
  const vocab = appData.vocabulary.find((item) => item.word === word);
  const representative = placeDetails.details.find((detail) => detail.word === word);
  if (!vocab) continue;

  const queries = [
    word,
    representative?.place?.title,
    ...(queryAliases[word] ?? []),
  ].filter(Boolean);
  const uniqueQueries = [...new Set(queries)];
  const responses = [];
  const storiesById = new Map();

  for (const query of uniqueQueries) {
    try {
      const json = await fetchStorySearch(query);
      if (!json) continue;
      const totalCount = json?.response?.body?.totalCount ?? 0;
      responses.push({
        query,
        resultCode: json?.response?.header?.resultCode ?? "",
        totalCount,
      });

      for (const item of normalizeItems(json)) {
        const id = `${item.tid ?? ""}-${item.tlid ?? ""}-${item.stid ?? ""}-${item.stlid ?? ""}`;
        const score = scoreStory(vocab, representative, query, item);
        const existing = storiesById.get(id);
        if (!existing || score > existing.score) {
          storiesById.set(id, {
            id,
            tid: item.tid ?? "",
            tlid: item.tlid ?? "",
            stid: item.stid ?? "",
            stlid: item.stlid ?? "",
            title: cleanText(item.title),
            audioTitle: cleanText(item.audioTitle || item.title),
            script: cleanText(item.script),
            scriptSnippet: snippet(item.script, [word, query, representative?.place?.title].filter(Boolean)),
            playTime: Number(item.playTime || 0),
            audioUrl: item.audioUrl ?? "",
            imageUrl: item.imageUrl ?? "",
            langCode: item.langCode ?? "",
            mapX: item.mapX ? Number(item.mapX) : null,
            mapY: item.mapY ? Number(item.mapY) : null,
            query,
            score,
          });
        }
      }
    } catch (error) {
      errors.push({ word, query, message: error.message });
    }
  }

  const stories = [...storiesById.values()]
    .filter((story) => story.score >= 60 && isRelevantStory(vocab, representative, story))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  results.push({
    vocabularyId: vocab.id,
    word,
    representativeContentId: representative?.place?.contentId ?? "",
    status: stories.length ? "ok" : "no-relevant-story",
    queries: responses,
    stories,
  });
}

const output = {
  generatedAt: new Date().toISOString(),
  source: "KTO_ODII storySearchList",
  hasApiKey: Boolean(serviceKey),
  summary: {
    targets: results.length,
    matchedTargets: results.filter((result) => result.stories.length > 0).length,
    stories: results.reduce((sum, result) => sum + result.stories.length, 0),
    storiesWithAudio: results.reduce((sum, result) => sum + result.stories.filter((story) => story.audioUrl).length, 0),
    errors: errors.length,
  },
  results,
  errors,
};

await fs.writeFile(outputPath, `window.KCULTURE_ODII_STORIES = ${JSON.stringify(output, null, 2)};\n`, "utf8");
console.log(JSON.stringify(output.summary, null, 2));
