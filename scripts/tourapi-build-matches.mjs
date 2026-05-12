import fs from "node:fs/promises";
import path from "node:path";
import { loadDotEnv } from "./env.mjs";

loadDotEnv();

const root = process.cwd();
const serviceKey = process.env.TOUR_API_KEY ?? process.env.TOUR_API_KEY_DECODED;
const baseUrl = "https://apis.data.go.kr/B551011/KorService2/searchKeyword2";
const cacheDir = path.join(root, "cache", "kto");
const dataPath = path.join(root, "prototype", "data", "app-data.js");
const outputPath = path.join(root, "prototype", "data", "tourapi-matches.js");

const fallbackWords = ["경복궁", "남산 서울 타워", "한복", "김치", "국밥", "떡볶이", "태권도", "판소리", "갯벌", "감귤"];

const keywordAliases = {
  "남산 서울 타워": ["남산서울타워", "N서울타워", "남산타워"],
};

const preferredContentTypes = {
  place: ["12", "14", "15", "28"],
  tradition: ["12", "14", "15"],
  history: ["12", "14", "15"],
  nature: ["12", "28"],
  food: ["39", "38", "12", "15"],
  daily: ["12", "14", "15", "38", "39"],
};

const contentTypeLabels = {
  12: "관광지",
  14: "문화시설",
  15: "축제/공연/행사",
  25: "여행코스",
  28: "레포츠",
  32: "숙박",
  38: "쇼핑",
  39: "음식점",
};

function readAppData(text) {
  const prefix = "window.KCULTURE_DATA = ";
  const trimmed = text.trim();
  if (!trimmed.startsWith(prefix)) throw new Error("Unexpected app-data.js format.");
  return JSON.parse(trimmed.slice(prefix.length).replace(/;$/, ""));
}

function cacheName(keyword) {
  return `kor-search-${keyword.replace(/\s+/g, "_")}.json`;
}

function normalizeItems(json) {
  const rawItems = json?.response?.body?.items?.item;
  if (!rawItems) return [];
  return Array.isArray(rawItems) ? rawItems : [rawItems];
}

function scorePlace(vocab, keyword, item) {
  const title = String(item.title ?? "");
  const contentTypeId = String(item.contenttypeid ?? "");
  const preferred = preferredContentTypes[vocab.category] ?? [];
  let score = 30;
  if (title === vocab.word) score += 70;
  if (title === keyword) score += 50;
  if (title.replace(/\s+/g, "") === vocab.word.replace(/\s+/g, "")) score += 45;
  if (title.includes(keyword) || keyword.includes(title)) score += 25;
  if (title.includes(vocab.word) || vocab.word.includes(title)) score += 25;
  if (preferred.includes(contentTypeId)) score += 20;
  if (vocab.category !== "food" && contentTypeId === "39") score -= 35;
  if (vocab.category !== "food" && /(점|식당|가든|갈비|한정식|카페|호텔)$/.test(title)) score -= 30;
  if (item.firstimage || item.firstimage2) score += 8;
  if (item.addr1) score += 7;
  if (item.mapx && item.mapy) score += 5;
  return score;
}

async function fetchKeyword(keyword) {
  await fs.mkdir(cacheDir, { recursive: true });
  const filePath = path.join(cacheDir, cacheName(keyword));

  if (!serviceKey) {
    try {
      return await fs.readFile(filePath, "utf8");
    } catch {
      return null;
    }
  }

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
  await fs.writeFile(filePath, text, "utf8");

  if (!response.ok) {
    console.warn(`${keyword}: HTTP ${response.status}`);
  }

  return text;
}

const appData = readAppData(await fs.readFile(dataPath, "utf8"));
const targetWords = appData.apiTestTargets?.map((target) => target.word) ?? fallbackWords;
const targetVocabulary = targetWords
  .map((word) => appData.vocabulary.find((item) => item.word === word))
  .filter(Boolean);

const matches = [];
const publicPlaces = [];
const errors = [];

for (const vocab of targetVocabulary) {
  const searchKeywords = [...new Set([vocab.word, ...(keywordAliases[vocab.word] ?? [])])];
  const parsedResponses = [];

  for (const searchKeyword of searchKeywords) {
    const text = await fetchKeyword(searchKeyword);
    if (!text) continue;

    let json;
    try {
      json = JSON.parse(text);
      parsedResponses.push({ searchKeyword, json });
    } catch (error) {
      errors.push({ word: vocab.word, searchKeyword, message: `Non-JSON response: ${error.message}` });
    }
  }

  if (!parsedResponses.length) {
    matches.push({
      vocabularyId: vocab.id,
      word: vocab.word,
      source: "KTO_KOR_TOUR_API",
      status: "missing-api-key-or-cache",
      places: [],
    });
    continue;
  }

  const responseSummaries = parsedResponses.map(({ searchKeyword, json }) => ({
    searchKeyword,
    resultCode: json?.response?.header?.resultCode ?? "",
    resultMessage: json?.response?.header?.resultMsg ?? "",
    totalCount: json?.response?.body?.totalCount ?? 0,
  }));

  const mergedItems = parsedResponses.flatMap(({ searchKeyword, json }) =>
    normalizeItems(json).map((item) => ({ ...item, searchKeyword })),
  );

  const itemsById = mergedItems
    .map((item) => ({
      id: `kto-${item.contentid}`,
      contentId: String(item.contentid ?? ""),
      contentTypeId: String(item.contenttypeid ?? ""),
      contentTypeLabel: contentTypeLabels[String(item.contenttypeid ?? "")] ?? "기타",
      title: item.title ?? "",
      address: item.addr1 ?? "",
      areaCode: String(item.areacode ?? ""),
      sigunguCode: String(item.sigungucode ?? ""),
      lat: item.mapy ? Number(item.mapy) : null,
      lng: item.mapx ? Number(item.mapx) : null,
      imageUrl: item.firstimage || item.firstimage2 || "",
      tel: item.tel ?? "",
      searchKeyword: item.searchKeyword,
      score: scorePlace(vocab, item.searchKeyword, item),
    }))
    .filter((item) => item.contentId && item.title)
    .reduce((itemsById, item) => {
      const existing = itemsById.get(item.contentId);
      if (!existing || item.score > existing.score) itemsById.set(item.contentId, item);
      return itemsById;
    }, new Map());

  const candidateItems = [...itemsById.values()];
  const hasPreferredType = candidateItems.some((item) =>
    (preferredContentTypes[vocab.category] ?? []).includes(item.contentTypeId),
  );
  const qualityFilteredItems =
    vocab.category !== "food" && hasPreferredType
      ? candidateItems.filter((item) => item.contentTypeId !== "39")
      : candidateItems;

  const sortedItems = qualityFilteredItems
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  for (const place of sortedItems) {
    publicPlaces.push({
      ...place,
      matchedVocabulary: [vocab.word],
      matchedVocabularyIds: [vocab.id],
    });
  }

  matches.push({
    vocabularyId: vocab.id,
    word: vocab.word,
    source: "KTO_KOR_TOUR_API",
    status: responseSummaries.some((summary) => summary.resultCode === "0000") ? "ok" : "api-error",
    searches: responseSummaries,
    totalCount: responseSummaries.reduce((sum, summary) => sum + Number(summary.totalCount || 0), 0),
    places: sortedItems,
  });
}

const dedupedPlaces = [...publicPlaces.reduce((map, place) => {
  if (!map.has(place.contentId)) {
    map.set(place.contentId, place);
    return map;
  }

  const existing = map.get(place.contentId);
  existing.matchedVocabulary = [...new Set([...existing.matchedVocabulary, ...place.matchedVocabulary])];
  existing.matchedVocabularyIds = [...new Set([...existing.matchedVocabularyIds, ...place.matchedVocabularyIds])];
  existing.score = Math.max(existing.score, place.score);
  return map;
}, new Map()).values()].sort((a, b) => b.score - a.score);

const output = {
  generatedAt: new Date().toISOString(),
  source: "KTO_KOR_TOUR_API searchKeyword2",
  hasApiKey: Boolean(serviceKey),
  targetWords,
  summary: {
    targets: matches.length,
    matchedTargets: matches.filter((match) => match.places.length > 0).length,
    publicPlaces: dedupedPlaces.length,
    errors: errors.length,
  },
  matches,
  publicPlaces: dedupedPlaces,
  errors,
};

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `window.KCULTURE_TOURAPI_MATCHES = ${JSON.stringify(output, null, 2)};\n`, "utf8");

console.log(JSON.stringify(output.summary, null, 2));
if (!serviceKey) {
  console.log("TOUR_API_KEY is missing. Generated from existing cache only, if present.");
}
