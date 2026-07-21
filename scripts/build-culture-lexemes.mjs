/**
 * Build dedicated culture-lexemes dataset for the prototype (P4).
 *
 * Source of truth: scripts/lib/culture-lexemes-seed.mjs
 * Output: prototype/data/culture-lexemes.js → window.KCULTURE_CULTURE_LEXEMES
 *
 * Usage: npm run build:culture-lexemes
 */
import fs from "node:fs/promises";
import path from "node:path";
import { cultureLexemeSeeds } from "./lib/culture-lexemes-seed.mjs";

const root = process.cwd();
const outFile = path.join(root, "prototype", "data", "culture-lexemes.js");
const appDataPath = path.join(root, "prototype", "data", "app-data.js");

function containsWord(text, word) {
  if (!word || !text) return false;
  if (word.length >= 3) return text.includes(word);
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const josa = "(?:은|는|이|가|을|를|의|에|에서|로|으로|와|과|도|만)?";
  return new RegExp(`(?:^|[^가-힣])${escaped}${josa}(?:[^가-힣]|$)`, "u").test(text);
}

async function loadVocabulary() {
  try {
    const text = await fs.readFile(appDataPath, "utf8");
    const window = {};
    const data = new Function("window", `${text}; return window.KCULTURE_DATA;`)(window);
    return data?.vocabulary ?? [];
  } catch {
    return [];
  }
}

function scoreLexemeForVocab(lexeme, vocab) {
  const word = vocab.word;
  let score = 0;
  const reasons = [];
  const blob = [
    lexeme.lemma,
    lexeme.glossKo,
    lexeme.situation,
    ...(lexeme.practiceLines ?? []).map((line) => line.text),
    ...(lexeme.sejeongAnchors ?? []),
    ...(lexeme.tags ?? []),
  ].join(" ");

  if (lexeme.sejeongAnchors?.includes(word)) {
    score += 25;
    reasons.push("anchor");
  }
  if (containsWord(blob, word)) {
    score += 12;
    reasons.push("text");
  }
  if (lexeme.lemma === word) {
    score += 20;
    reasons.push("lemma");
  }
  if (vocab.category === "food" && lexeme.tags?.includes("food")) {
    score += 4;
    reasons.push("cat-food");
  }
  if (vocab.category === "daily" && (lexeme.tags?.includes("play") || lexeme.axis === "context")) {
    score += 2;
    reasons.push("cat-daily");
  }
  return { score, reasons };
}

function buildVocabMatches(vocabulary) {
  const byWord = {};
  for (const vocab of vocabulary) {
    const ranked = cultureLexemeSeeds
      .map((lexeme) => {
        const { score, reasons } = scoreLexemeForVocab(lexeme, vocab);
        return { lexemeId: lexeme.id, score, reasons };
      })
      .filter((row) => row.score >= 4)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
    if (ranked.length) byWord[vocab.word] = ranked;
  }
  return byWord;
}

async function main() {
  const vocabulary = await loadVocabulary();
  const vocabMatches = buildVocabMatches(vocabulary);
  const axisCounts = cultureLexemeSeeds.reduce((acc, lexeme) => {
    acc[lexeme.axis] = (acc[lexeme.axis] ?? 0) + 1;
    return acc;
  }, {});

  const payload = {
    generatedAt: new Date().toISOString(),
    source: {
      note: "Dedicated culture-lexeme educational seeds (not transcript dialogue)",
      policy: "docs/subtitle-citation-policy.md",
      spec: "docs/culture-lexicon-learning-spec.md",
      seedModule: "scripts/lib/culture-lexemes-seed.mjs",
    },
    summary: {
      total: cultureLexemeSeeds.length,
      axes: axisCounts,
      vocabWithMatches: Object.keys(vocabMatches).length,
      totalVocabulary: vocabulary.length,
      cleanOnly: cultureLexemeSeeds.every((lexeme) => lexeme.contentRating === "clean"),
    },
    lexemes: cultureLexemeSeeds,
    vocabMatches,
  };

  const body = `window.KCULTURE_CULTURE_LEXEMES = ${JSON.stringify(payload, null, 2)};\n`;
  await fs.writeFile(outFile, body, "utf8");
  console.log(
    `Wrote ${path.relative(root, outFile)} lexemes=${payload.summary.total} matchedWords=${payload.summary.vocabWithMatches}/${payload.summary.totalVocabulary} axes=${JSON.stringify(axisCounts)}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
