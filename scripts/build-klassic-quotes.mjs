/**
 * Build static Korean movie quote data for the prototype.
 *
 * Primary source: klassic-quote-api
 *   GET https://klassic-quote-api.mooo.com/v1/quotes
 *
 * Adds:
 * - contentRating (clean | mild | mature)
 * - keywordHints (tokens + stems)
 * - vocabMatches: top quotes per vocabulary word from app-data.js
 *
 * Usage: npm run fetch:quotes
 * Env: KLASSIC_QUOTE_API_URL, KLASSIC_QUOTE_LIMIT, KLASSIC_MAX_RATING (optional filter at build)
 * Output: prototype/data/klassic-quotes.js
 */
import fs from "node:fs/promises";
import path from "node:path";
import { josa } from "es-hangul";
import { isRatingAllowed, rateQuoteText, ratingLabel } from "./lib/content-rating.mjs";

const root = process.cwd();
const outFile = path.join(root, "prototype", "data", "klassic-quotes.js");
const appDataPath = path.join(root, "prototype", "data", "app-data.js");
const apiUrl = process.env.KLASSIC_QUOTE_API_URL ?? "https://klassic-quote-api.mooo.com/v1/quotes";
const limit = Number(process.env.KLASSIC_QUOTE_LIMIT ?? 80);
const buildMaxRating = process.env.KLASSIC_MAX_RATING ?? "mature"; // keep all ratings in data; UI filters

/** Classic movie seeds (clean / mild flavor only — rating filter still applies). */
const movieSeedQuotes = [
  {
    id: "seed-1",
    author: "송강호 (역)",
    quote: "조금만 참으세요. 금방 지나갑니다.",
    name: "기생충",
    source: "seed",
  },
  {
    id: "seed-2",
    author: "공유 (역)",
    quote: "나는 지금 배가 고프다.",
    name: "부산행",
    source: "seed",
  },
  {
    id: "seed-3",
    author: "황정민 (역)",
    quote: "나 돌아가. 지금 당장.",
    name: "베테랑",
    source: "seed",
  },
];

/**
 * Multi-word culture bridges that cover several Sejong terms per line.
 * category is metadata for coverage reporting only.
 */
const multiWordCultureSeeds = [
  {
    id: "seed-culture-food-table",
    category: "food",
    quote: "김치와 된장찌개, 김밥, 떡볶이, 비빔밥까지 한국 식탁은 정말 풍성해요.",
  },
  {
    id: "seed-culture-food-order",
    category: "food",
    quote: "국밥 한 그릇 주세요. 라면은 덜 맵게, 닭갈비도 같이 시킬게요.",
  },
  {
    id: "seed-culture-place",
    category: "place",
    quote: "경복궁과 남산 서울 타워를 보고, 갯벌 체험과 템플 스테이도 예약했어요.",
  },
  {
    id: "seed-culture-tradition",
    category: "tradition",
    quote: "한복을 입고 판소리를 듣고, 태권도와 강강술래를 배워 보고 싶어요.",
  },
  {
    id: "seed-culture-history",
    category: "history",
    quote: "광화문에서 3·1 운동과 대한 독립 만세 이야기를 들었어요. 덕수궁 돌담길도 걸었습니다.",
  },
  {
    id: "seed-culture-nature",
    category: "nature",
    quote: "한라봉을 먹고 흔들바위를 보고, 장승과 해치 앞에서 사진을 찍었어요.",
  },
  {
    id: "seed-culture-daily",
    category: "daily",
    quote: "노래방에서 달고나를 만들고, 공항 철도를 타고 시장에 갔어요.",
  },
  {
    id: "seed-culture-daily-2",
    category: "daily",
    quote: "다도와 군고구마, 과일 빙수는 한국 일상에서 자주 만나는 문화예요.",
  },
  // Short (1-syllable) Sejong terms — dedicated lines so boundary matching can hit.
  {
    id: "seed-short-gim",
    category: "nature",
    quote: "바다에서 딴 김을 말려 밥 위에 올려 먹어요.",
  },
  {
    id: "seed-short-tteok",
    category: "food",
    quote: "설날에는 떡을 썰어 떡국을 끓여 먹어요.",
  },
  {
    id: "seed-short-bap",
    category: "history",
    quote: "따뜻한 밥 한 공기가 한국 식탁의 기본이에요.",
  },
  {
    id: "seed-short-byeo",
    category: "history",
    quote: "가을 들판의 벼가 노랗게 익으면 추수를 시작해요.",
  },
  {
    id: "seed-short-buk",
    category: "daily",
    quote: "사물놀이에서 북을 치며 장단을 맞춰 봐요.",
  },
  {
    id: "seed-short-jeon",
    category: "history",
    quote: "명절에 부친 전이 접시에 가득 담겨 있어요.",
  },
  {
    id: "seed-short-jing",
    category: "daily",
    quote: "풍물놀이에서 징을 크게 울려 리듬을 이끌어요.",
  },
];

const categoryTemplates = {
  food: (word) => `${josa(word, "을/를")} 한국 식당에서 꼭 먹어 보고 싶어요.`,
  place: (word) => `${josa(word, "에")} 가서 사진을 찍고 한국어로 설명했어요.`,
  tradition: (word) => `${josa(word, "을/를")} 직접 체험하며 한국 전통을 배웠어요.`,
  history: (word) => `${josa(word, "에")} 대해 역사 안내를 들었어요.`,
  nature: (word) => `${josa(word, "을/를")} 보면서 한국의 자연과 풍경을 느꼈어요.`,
  daily: (word) => `일상에서 ${josa(word, "을/를")} 만나며 한국어를 연습해요.`,
};

const categoryLabels = {
  food: "음식",
  place: "장소",
  tradition: "전통문화",
  history: "역사",
  nature: "자연",
  daily: "일상",
};

/** One clean learner sentence per Sejong vocabulary item (all categories). */
function buildPerVocabCultureSeeds(vocabulary) {
  return vocabulary.map((item) => {
    const quote =
      item.word.length <= 2
        ? shortWordSeedQuote(item.word, item.category)
        : (() => {
            const template = categoryTemplates[item.category] ?? categoryTemplates.daily;
            try {
              return template(item.word);
            } catch {
              return `${item.word}에 대해 배우고 있어요.`;
            }
          })();
    return {
      id: `seed-vocab-${item.id}`,
      author: "학습용 시드",
      quote,
      name: `K-culture · ${categoryLabels[item.category] ?? item.category}`,
      source: "seed",
      category: item.category,
    };
  });
}

function buildMultiWordCultureSeeds() {
  return multiWordCultureSeeds.map((item) => ({
    id: item.id,
    author: "학습용 시드",
    quote: item.quote,
    name: `K-culture · ${categoryLabels[item.category] ?? item.category}`,
    source: "seed",
    category: item.category,
  }));
}

/**
 * Match vocabulary inside quote text.
 * - Long words (3+): plain includes
 * - Short words (1–2 Hangul syllables): require non-Hangul boundaries OR a following josa,
 *   so "김을"/"떡을" match but random mid-word hits are reduced.
 */
function containsVocabWord(text, word) {
  if (!word) return false;
  if (word.length >= 3) return text.includes(word);

  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Allow common particles right after short nouns (김을, 밥이, 전에 …).
  const josa = "(?:은|는|이|가|을|를|의|에|에서|로|으로|와|과|도|만|께|한테|부터|까지)?";
  return new RegExp(`(?:^|[^가-힣])${escaped}${josa}(?:[^가-힣]|$)`, "u").test(text);
}

/** Safer per-vocab seed line for short syllables (avoid josa gluing without matchable form). */
function shortWordSeedQuote(word, category) {
  const examples = {
    김: "오늘 수업 주제는 김이에요. 바다에서 나는 해초죠.",
    떡: "명절 음식 중에서 떡을 가장 좋아해요.",
    밥: "한국 사람들은 밥과 반찬을 함께 먹어요.",
    벼: "논에서 벼가 자라고 있어요.",
    북: "무대 위에서 북을 두드려 장단을 맞춰요.",
    전: "기름에 부친 전이 노릇하게 익었어요.",
    징: "풍물패가 징을 치며 마을을 돌아요.",
  };
  if (examples[word]) return examples[word];
  const template = categoryTemplates[category] ?? categoryTemplates.daily;
  try {
    return template(word);
  } catch {
    return `${word}에 대해 배우고 있어요.`;
  }
}

function sanitizeQuote(item, index) {
  return {
    id: String(item.id ?? `quote-${index}`),
    author: String(item.author ?? "unknown"),
    quote: String(item.quote ?? "").trim(),
    name: String(item.name ?? item.movie ?? "unknown"),
    source: item.source === "seed" ? "seed" : "klassic-quote-api",
  };
}

/** Strip common josa endings for softer matching. */
function stemToken(token) {
  return token
    .replace(/(은|는|이|가|을|를|의|에|에서|로|으로|와|과|도|만|께|한테|부터|까지|야|아)$/u, "")
    .trim();
}

function keywordHints(quoteText, movieName = "") {
  const rawTokens = quoteText
    .replace(/[^\p{Script=Hangul}A-Za-z0-9\s]/gu, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

  const stems = rawTokens.map(stemToken).filter((token) => token.length >= 2);
  const movieTokens = String(movieName)
    .split(/\s+/)
    .filter((token) => token.length >= 2);

  return [...new Set([...rawTokens, ...stems, ...movieTokens])].slice(0, 12);
}

function loadVocabularyWords() {
  return fs
    .readFile(appDataPath, "utf8")
    .then((text) => {
      const window = {};
      const data = new Function("window", `${text}; return window.KCULTURE_DATA;`)(window);
      return (data?.vocabulary ?? []).map((item) => ({
        id: item.id,
        word: item.word,
        category: item.category,
        categoryLabel: item.categoryLabel,
        apiKeywords: item.apiKeywords ?? [],
      }));
    })
    .catch(() => []);
}

/**
 * Score how well a quote relates to a vocabulary item.
 * Prefer direct word hits; keywordHints/stems as secondary.
 */
function scoreQuoteForVocab(quote, vocab) {
  const word = vocab.word;
  const compact = word.replace(/\s+/g, "");
  const quoteText = quote.quote;
  let score = 0;
  const reasons = [];

  if (containsVocabWord(quoteText, word)) {
    score += 20;
    reasons.push("exact-word");
  } else if (compact !== word && compact.length >= 3 && containsVocabWord(quoteText, compact)) {
    score += 16;
    reasons.push("compact-word");
  }

  for (const keyword of vocab.apiKeywords ?? []) {
    if (keyword.length >= 3 && containsVocabWord(quoteText, keyword)) {
      score += 8;
      reasons.push(`api:${keyword}`);
      break;
    }
  }

  for (const hint of quote.keywordHints ?? []) {
    if (hint === word || hint === compact) {
      score += 10;
      reasons.push("hint-exact");
    } else if (word.length >= 3 && (hint.includes(word) || word.includes(hint))) {
      score += 4;
      reasons.push("hint-partial");
    }
  }

  // Theme boost only after a lexical hit (never alone).
  if (score >= 8 && vocab.category === "food" && /먹|밥|맛|김치|국|떡/.test(quoteText)) {
    score += 2;
    reasons.push("theme-food");
  }
  if (score >= 8 && vocab.category === "history" && /역사|왕|장군|궁|전쟁|독립|세종/.test(quoteText)) {
    score += 2;
    reasons.push("theme-history");
  }

  return { score, reasons: [...new Set(reasons)] };
}

function buildVocabMatches(quotes, vocabulary) {
  const byWord = {};
  for (const vocab of vocabulary) {
    const ranked = quotes
      .map((quote) => {
        const { score, reasons } = scoreQuoteForVocab(quote, vocab);
        return { quoteId: quote.id, score, reasons };
      })
      // Require a real lexical hit (score >= 4). Pure theme boosts (+2) alone are too weak.
      .filter((item) => item.score >= 4)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (ranked.length) {
      byWord[vocab.word] = ranked;
    }
  }
  return byWord;
}

async function fetchQuotes() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(apiUrl, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    const payload = await response.json();
    const list = Array.isArray(payload) ? payload : payload.quotes ?? [];
    return list.map(sanitizeQuote).filter((item) => item.quote);
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  let apiQuotes = [];
  let status = "ok";
  let error = null;

  const vocabulary = await loadVocabularyWords();
  const cultureSeeds = [
    ...movieSeedQuotes.map(sanitizeQuote),
    ...buildMultiWordCultureSeeds(),
    ...buildPerVocabCultureSeeds(vocabulary),
  ];

  try {
    apiQuotes = await fetchQuotes();
    if (!apiQuotes.length) {
      status = "empty";
    }
  } catch (err) {
    status = "fallback-seed";
    error = err instanceof Error ? err.message : String(err);
    apiQuotes = [];
    console.warn(`[build-klassic-quotes] API failed (${error}). Using culture seeds only.`);
  }

  // Seeds always first (never sliced away). API fills remaining capacity.
  const seenIds = new Set();
  const dedupedSeeds = [];
  for (const item of cultureSeeds) {
    if (seenIds.has(item.id)) continue;
    seenIds.add(item.id);
    dedupedSeeds.push(item);
  }
  const dedupedApi = [];
  for (const item of apiQuotes) {
    if (seenIds.has(item.id)) continue;
    seenIds.add(item.id);
    dedupedApi.push(item);
  }

  const combined = [...dedupedSeeds, ...dedupedApi.slice(0, limit)];

  const enriched = combined
    .map((item) => {
      const contentRating = rateQuoteText(item.quote);
      return {
        ...item,
        contentRating,
        contentRatingLabel: ratingLabel(contentRating),
        keywordHints: keywordHints(item.quote, item.name),
      };
    })
    .filter((item) => isRatingAllowed(item.contentRating, buildMaxRating));

  const vocabMatches = buildVocabMatches(enriched, vocabulary);

  const ratingSummary = enriched.reduce(
    (acc, item) => {
      acc[item.contentRating] = (acc[item.contentRating] ?? 0) + 1;
      return acc;
    },
    { clean: 0, mild: 0, mature: 0 },
  );

  const categoryCoverage = {};
  for (const category of Object.keys(categoryLabels)) {
    const words = vocabulary.filter((item) => item.category === category).map((item) => item.word);
    const matched = words.filter((word) => (vocabMatches[word] ?? []).length > 0);
    categoryCoverage[category] = {
      totalWords: words.length,
      matchedWords: matched.length,
      coverage: words.length ? Math.round((matched.length / words.length) * 100) : 0,
    };
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    source: {
      apiUrl,
      status,
      error,
      library: "https://github.com/GHGHGHKO/klassic-quote-api",
      buildMaxRating,
      cultureSeedCount: dedupedSeeds.length,
      apiQuoteCount: dedupedApi.slice(0, limit).length,
    },
    summary: {
      total: enriched.length,
      movies: [...new Set(enriched.map((item) => item.name))].length,
      ratings: ratingSummary,
      vocabWithMatches: Object.keys(vocabMatches).length,
      categoryCoverage,
    },
    /** word → [{ quoteId, score, reasons }] */
    vocabMatches,
    quotes: enriched,
  };

  const body = `window.KCULTURE_KLASSIC_QUOTES = ${JSON.stringify(payload, null, 2)};\n`;
  await fs.writeFile(outFile, body, "utf8");
  console.log(
    `Wrote ${path.relative(root, outFile)} (${enriched.length} quotes, seeds=${dedupedSeeds.length}, matchedWords=${Object.keys(vocabMatches).length}/${vocabulary.length}, ratings=${JSON.stringify(ratingSummary)}, status=${status})`,
  );
  console.log("categoryCoverage", JSON.stringify(categoryCoverage));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
