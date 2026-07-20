/**
 * Build static Melon chart snapshot for K-pop learning missions.
 *
 * Source priority:
 *   1) MELON_API_BASE → self-hosted melon-api (/api/v1/chart/:time)
 *   2) Live Melon chart HTML (www.melon.com/chart) — snapshot only, educational use
 *   3) Educational seed fallback
 *
 * Usage:
 *   npm run fetch:melon
 *   MELON_API_BASE=http://127.0.0.1:5000 npm run fetch:melon
 *   MELON_CHART_TIME=week|day|month|live  (api mode)
 *   MELON_DISABLE_HTML=1  to skip HTML scrape
 *
 * Output: prototype/data/melon-chart.js
 */
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outFile = path.join(root, "prototype", "data", "melon-chart.js");
const base = process.env.MELON_API_BASE?.replace(/\/$/, "") ?? "";
const chartTime = process.env.MELON_CHART_TIME ?? "week";
const limit = Number(process.env.MELON_CHART_LIMIT ?? 30);
const disableHtml = process.env.MELON_DISABLE_HTML === "1";
const melonHtmlUrl = process.env.MELON_CHART_HTML_URL ?? "https://www.melon.com/chart/index.htm";

/** Educational seed — used only when live sources fail. Favors global K-pop hits. */
const seedChart = [
  { ranking: 1, name: "Dynamite", artists: "방탄소년단", songId: "seed-bts-1", albumId: "" },
  { ranking: 2, name: "Butter", artists: "방탄소년단", songId: "seed-bts-2", albumId: "" },
  { ranking: 3, name: "Permission to Dance", artists: "방탄소년단", songId: "seed-bts-3", albumId: "" },
  { ranking: 4, name: "How You Like That", artists: "BLACKPINK", songId: "seed-bp-1", albumId: "" },
  { ranking: 5, name: "Pink Venom", artists: "BLACKPINK", songId: "seed-bp-2", albumId: "" },
  { ranking: 6, name: "Shut Down", artists: "BLACKPINK", songId: "seed-bp-3", albumId: "" },
  { ranking: 7, name: "Hype Boy", artists: "NewJeans", songId: "seed-nj-1", albumId: "" },
  { ranking: 8, name: "Next Level", artists: "aespa", songId: "seed-ae-1", albumId: "" },
  { ranking: 9, name: "Celebrity", artists: "아이유", songId: "seed-iu-1", albumId: "" },
  { ranking: 10, name: "Super Shy", artists: "NewJeans", songId: "seed-nj-2", albumId: "" },
  { ranking: 11, name: "Boy With Luv", artists: "방탄소년단", songId: "seed-bts-4", albumId: "" },
  { ranking: 12, name: "DDU-DU DDU-DU", artists: "BLACKPINK", songId: "seed-bp-4", albumId: "" },
];

function decodeHtml(text) {
  return String(text ?? "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeEntry(entry, fallbackRank) {
  return {
    ranking: Number(entry.ranking ?? fallbackRank),
    name: decodeHtml(entry.name ?? entry.title ?? ""),
    artists: decodeHtml(entry.artists ?? entry.artist ?? ""),
    songId: String(entry.songId ?? entry.song_id ?? ""),
    albumId: String(entry.albumId ?? entry.album_id ?? ""),
  };
}

function normalizeChartPayload(payload) {
  if (Array.isArray(payload)) {
    return payload.map((item, index) => normalizeEntry(item, index + 1));
  }
  if (payload && typeof payload === "object") {
    return Object.entries(payload)
      .map(([key, value]) => normalizeEntry(value ?? {}, Number(key)))
      .sort((a, b) => a.ranking - b.ranking);
  }
  return [];
}

function missionForEntry(entry) {
  const titleShort = entry.name.length > 28 ? `${entry.name.slice(0, 28)}…` : entry.name;
  const artist = entry.artists;
  const isBts = /방탄소년단|BTS/i.test(artist);
  const isBp = /BLACKPINK|블랙핑크/i.test(artist);
  const extra = isBts
    ? ["BTS 콘서트 가 보고 싶어요.", "멤버 이름을 한국어로 말해 볼래요?"]
    : isBp
      ? ["BLACKPINK 안무 챌린지 알아요?", "뮤직비디오가 정말 화려해요."]
      : ["가수가 누구예요?", "안무가 멋져요."];
  return {
    title: isBts || isBp ? "글로벌 히트곡 표현 미션" : "K-pop 차트 표현 미션",
    phrases: [
      `${titleShort} 알아요?`,
      `${artist} 노래 좋아해요.`,
      "요즘 이 노래가 인기 있어요.",
      "이 노래 한국어 가사 연습하고 싶어요.",
      ...extra,
    ],
  };
}

/**
 * Ensure global icons appear near the top even when live Melon HTML is used.
 * Dedupes by song name + artist.
 */
function mergeSpotlightHits(liveEntries) {
  const spotlight = [
    { ranking: 0, name: "Dynamite", artists: "방탄소년단", songId: "spotlight-bts-dynamite", albumId: "" },
    { ranking: 0, name: "Butter", artists: "방탄소년단", songId: "spotlight-bts-butter", albumId: "" },
    { ranking: 0, name: "How You Like That", artists: "BLACKPINK", songId: "spotlight-bp-hylt", albumId: "" },
    { ranking: 0, name: "Pink Venom", artists: "BLACKPINK", songId: "spotlight-bp-pv", albumId: "" },
  ].map((e, i) => normalizeEntry(e, i + 1));

  const keyOf = (e) => `${e.name.toLowerCase()}::${e.artists.toLowerCase()}`;
  const seen = new Set();
  const merged = [];
  for (const entry of [...spotlight, ...liveEntries]) {
    const key = keyOf(entry);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(entry);
  }
  return merged.map((entry, index) => ({ ...entry, ranking: index + 1 }));
}

async function fetchFromSelfHosted() {
  const url = `${base}/api/v1/chart/${encodeURIComponent(chartTime)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    return { entries: normalizeChartPayload(await response.json()), sourceUrl: url };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Parse Melon chart HTML for educational snapshot.
 * Not an official API — used only to refresh static learning content.
 */
async function fetchFromMelonHtml() {
  const response = await fetch(melonHtmlUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    throw new Error(`Melon HTML HTTP ${response.status}`);
  }
  const html = await response.text();

  const songRe = /class="ellipsis rank01"[\s\S]*?<a[^>]*>([^<]+)<\/a>/g;
  // rank02 often wraps multiple artist links; take first visible name
  const artistBlockRe = /class="ellipsis rank02"([\s\S]*?)<\/div>/g;
  const songs = [];
  const artists = [];
  let m;
  while ((m = songRe.exec(html)) && songs.length < 100) {
    songs.push(decodeHtml(m[1]));
  }
  while ((m = artistBlockRe.exec(html)) && artists.length < 100) {
    const block = m[1];
    const firstArtist = block.match(/<a[^>]*>([^<]+)<\/a>/);
    artists.push(decodeHtml(firstArtist?.[1] ?? ""));
  }

  if (songs.length < 5) {
    throw new Error(`Melon HTML parse found only ${songs.length} songs`);
  }

  const entries = songs.map((name, index) =>
    normalizeEntry(
      {
        ranking: index + 1,
        name,
        artists: artists[index] || "unknown",
        songId: "",
        albumId: "",
      },
      index + 1,
    ),
  );

  return { entries, sourceUrl: melonHtmlUrl };
}

async function main() {
  let entries = [];
  let status = "seed";
  let error = null;
  let sourceUrl = null;
  const attempts = [];

  if (base) {
    try {
      const result = await fetchFromSelfHosted();
      entries = result.entries;
      sourceUrl = result.sourceUrl;
      status = entries.length ? "ok-api" : "empty-api";
      attempts.push({ mode: "melon-api", ok: entries.length > 0, sourceUrl });
      if (!entries.length) throw new Error("empty chart from melon-api");
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      attempts.push({ mode: "melon-api", ok: false, error });
      console.warn(`[build-melon-chart] melon-api failed (${error})`);
    }
  }

  if (!entries.length && !disableHtml) {
    try {
      const result = await fetchFromMelonHtml();
      entries = result.entries;
      sourceUrl = result.sourceUrl;
      status = "ok-html";
      error = null;
      attempts.push({ mode: "melon-html", ok: true, sourceUrl, count: entries.length });
      console.log(`[build-melon-chart] Live chart via Melon HTML (${entries.length} songs)`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      error = message;
      attempts.push({ mode: "melon-html", ok: false, error: message });
      console.warn(`[build-melon-chart] Melon HTML failed (${message})`);
    }
  }

  if (!entries.length) {
    entries = seedChart.map((item, index) => normalizeEntry(item, index + 1));
    status = "fallback-seed";
    console.warn("[build-melon-chart] Using educational seed chart.");
  } else {
    entries = mergeSpotlightHits(entries);
    console.log("[build-melon-chart] Prepended BTS/BLACKPINK spotlight hits onto live chart.");
  }

  const limited = entries.slice(0, limit).map((entry) => ({
    ...entry,
    mission: missionForEntry(entry),
  }));

  const payload = {
    generatedAt: new Date().toISOString(),
    source: {
      library: "https://github.com/ko28/melon-api",
      chartTime,
      apiBase: base || null,
      sourceUrl,
      status,
      error,
      attempts,
      note:
        status === "ok-html"
          ? "Snapshot scraped from Melon chart HTML for educational static content. Prefer MELON_API_BASE for production."
          : status === "ok-api"
            ? "Fetched from self-hosted melon-api."
            : "Educational seed chart. Set MELON_API_BASE or allow HTML scrape for live data.",
    },
    summary: {
      total: limited.length,
      artists: [...new Set(limited.map((item) => item.artists))].length,
    },
    chart: limited,
  };

  const body = `window.KCULTURE_MELON_CHART = ${JSON.stringify(payload, null, 2)};\n`;
  await fs.writeFile(outFile, body, "utf8");
  console.log(`Wrote ${path.relative(root, outFile)} (${limited.length} tracks, status=${status})`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
