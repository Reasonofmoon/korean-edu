import fs from "node:fs/promises";
import path from "node:path";
import { loadDotEnv } from "./env.mjs";

loadDotEnv();

const root = process.cwd();
const serviceKey = process.env.TOUR_API_KEY ?? process.env.TOUR_API_KEY_DECODED;
const matchesPath = path.join(root, "prototype", "data", "tourapi-matches.js");
const outputPath = path.join(root, "prototype", "data", "tourapi-place-details.js");
const cacheDir = path.join(root, "cache", "kto");

const commonBaseUrl = "https://apis.data.go.kr/B551011/KorService2/detailCommon2";
const imageBaseUrl = "https://apis.data.go.kr/B551011/KorService2/detailImage2";

const representativeOverrides = {
  경복궁: "126508",
  "남산 서울 타워": "126535",
  한복: "3019132",
  김치: "604097",
  태권도: "596511",
  판소리: "130538",
  갯벌: "2615234",
};

function readJsData(text, globalName) {
  const prefix = `window.${globalName} = `;
  const trimmed = text.trim();
  if (!trimmed.startsWith(prefix)) throw new Error(`Unexpected ${globalName} format.`);
  return JSON.parse(trimmed.slice(prefix.length).replace(/;$/, ""));
}

function normalizeItems(json) {
  if (!json?.response) return [];
  const rawItems = json?.response?.body?.items?.item;
  if (!rawItems) return [];
  return Array.isArray(rawItems) ? rawItems : [rawItems];
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function pickRepresentative(match) {
  const overrideContentId = representativeOverrides[match.word];
  if (overrideContentId) {
    const override = match.places.find((place) => place.contentId === overrideContentId);
    if (override) return { ...override, curationReason: "manual-override" };
  }

  const nonEvent = match.places.find((place) => place.contentTypeId !== "15");
  const selected = nonEvent ?? match.places[0] ?? null;
  return selected ? { ...selected, curationReason: "top-ranked-non-event" } : null;
}

async function fetchJsonWithCache(url, fileName) {
  await fs.mkdir(cacheDir, { recursive: true });
  const filePath = path.join(cacheDir, fileName);

  if (!serviceKey) {
    const cached = await fs.readFile(filePath, "utf8").catch(() => null);
    return cached ? JSON.parse(cached) : null;
  }

  const response = await fetch(url);
  const text = await response.text();
  await fs.writeFile(filePath, text, "utf8");

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${fileName} returned non-JSON: ${error.message}`);
  }
}

async function fetchDetailCommon(place) {
  const url = new URL(commonBaseUrl);
  url.searchParams.set("serviceKey", serviceKey);
  url.searchParams.set("MobileOS", "ETC");
  url.searchParams.set("MobileApp", "KCultureKoreanMVP");
  url.searchParams.set("_type", "json");
  url.searchParams.set("contentId", place.contentId);

  return fetchJsonWithCache(url, `detail-common-${place.contentId}.json`);
}

async function fetchDetailImages(place) {
  const url = new URL(imageBaseUrl);
  url.searchParams.set("serviceKey", serviceKey);
  url.searchParams.set("MobileOS", "ETC");
  url.searchParams.set("MobileApp", "KCultureKoreanMVP");
  url.searchParams.set("_type", "json");
  url.searchParams.set("contentId", place.contentId);
  url.searchParams.set("imageYN", "Y");
  url.searchParams.set("numOfRows", "10");
  url.searchParams.set("pageNo", "1");

  return fetchJsonWithCache(url, `detail-image-${place.contentId}.json`);
}

const matchesData = readJsData(await fs.readFile(matchesPath, "utf8"), "KCULTURE_TOURAPI_MATCHES");
const representatives = matchesData.matches
  .map((match) => ({ match, place: pickRepresentative(match) }))
  .filter((item) => item.place);

const details = [];
const errors = [];

for (const { match, place } of representatives) {
  try {
    const [commonJson, imageJson] = await Promise.all([fetchDetailCommon(place), fetchDetailImages(place)]);
    const common = normalizeItems(commonJson)[0] ?? {};
    const images = normalizeItems(imageJson)
      .map((image) => ({
        name: image.imgname ?? "",
        originUrl: image.originimgurl ?? "",
        smallUrl: image.smallimageurl ?? "",
        serial: image.serialnum ?? "",
      }))
      .filter((image) => image.originUrl || image.smallUrl);

    details.push({
      vocabularyId: match.vocabularyId,
      word: match.word,
      place: {
        ...place,
        title: common.title ?? place.title,
        address: common.addr1 ?? place.address,
        homepage: common.homepage ?? "",
        overview: cleanText(common.overview),
        zipcode: common.zipcode ?? "",
        mapx: common.mapx ?? place.lng,
        mapy: common.mapy ?? place.lat,
        firstImage: common.firstimage || place.imageUrl || "",
        firstImage2: common.firstimage2 || "",
        tel: common.tel ?? place.tel ?? "",
        modifiedTime: common.modifiedtime ?? "",
      },
      images,
      api: {
        commonResultCode: commonJson?.response?.header?.resultCode ?? "",
        imageResultCode: imageJson?.response?.header?.resultCode ?? "",
      },
    });
  } catch (error) {
    errors.push({
      word: match.word,
      contentId: place.contentId,
      message: error.message,
    });
  }
}

const output = {
  generatedAt: new Date().toISOString(),
  source: "KTO_KOR_TOUR_API detailCommon2/detailImage2",
  hasApiKey: Boolean(serviceKey),
  summary: {
    representatives: representatives.length,
    detailedPlaces: details.length,
    withOverview: details.filter((detail) => detail.place.overview).length,
    withImages: details.filter((detail) => detail.images.length || detail.place.firstImage).length,
    errors: errors.length,
  },
  details,
  errors,
};

await fs.writeFile(outputPath, `window.KCULTURE_TOURAPI_DETAILS = ${JSON.stringify(output, null, 2)};\n`, "utf8");

console.log(JSON.stringify(output.summary, null, 2));
