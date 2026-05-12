import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const appDataPath = path.join(root, "prototype", "data", "app-data.js");
const odiiPath = path.join(root, "prototype", "data", "odii-stories.js");
const placeDetailsPath = path.join(root, "prototype", "data", "tourapi-place-details.js");
const outputPath = path.join(root, "prototype", "data", "learning-activities.js");

function readJsData(text, globalName) {
  const prefix = `window.${globalName} = `;
  const trimmed = text.trim();
  if (!trimmed.startsWith(prefix)) throw new Error(`Unexpected ${globalName} format.`);
  return JSON.parse(trimmed.slice(prefix.length).replace(/;$/, ""));
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSentences(text) {
  const cleaned = cleanText(text);
  const matches = cleaned.match(/[^.!?。！？]*[.!?。！？]|[^.!?。！？]+$/g) ?? [];
  return matches
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 18 && sentence.length <= 180);
}

function pickExpressions(word, sourceText, fallbackText) {
  const sentences = splitSentences(sourceText);
  const fallbackSentences = splitSentences(fallbackText);
  const direct = sentences.filter((sentence) => sentence.includes(word));
  const cultural = sentences.filter((sentence) => /(문화|전통|역사|체험|대표|음식|관광|배울|곳|거리|박물관)/.test(sentence));
  const picked = [...direct, ...cultural, ...sentences, ...fallbackSentences];
  return [...new Set(picked)].slice(0, 4).map((text, index) => ({
    id: `expr-${index + 1}`,
    text,
    focus: index === 0 ? "핵심 이해" : "문화 맥락",
  }));
}

function chooseOptions(answer, vocabulary, category) {
  const sameCategory = vocabulary
    .filter((item) => item.word !== answer && item.category === category)
    .map((item) => item.word);
  const any = vocabulary
    .filter((item) => item.word !== answer)
    .map((item) => item.word);
  return [...new Set([answer, ...sameCategory, ...any])].slice(0, 4).sort((a, b) => a.localeCompare(b, "ko"));
}

function makeQuiz(word, vocab, story, representative, expressions, vocabulary) {
  const source = story?.scriptSnippet || expressions[0]?.text || representative?.place?.overview || "";
  const options = chooseOptions(word, vocabulary, vocab.category);
  const quizzes = [
    {
      id: `quiz-${vocab.id}-meaning`,
      type: "choice",
      prompt: "다음 설명과 가장 관련 있는 한국문화 어휘는 무엇인가요?",
      passage: cleanText(source).slice(0, 180),
      answer: word,
      options,
      explanation: `${word}은/는 이 문화 이야기의 중심 어휘입니다.`,
    },
  ];

  const clozeSource = expressions.find((expression) => expression.text.includes(word))?.text;
  if (clozeSource) {
    quizzes.push({
      id: `quiz-${vocab.id}-cloze`,
      type: "cloze",
      prompt: "빈칸에 들어갈 알맞은 말을 고르세요.",
      passage: clozeSource.replaceAll(word, "_____"),
      answer: word,
      options,
      explanation: `문장 속 핵심 어휘는 ${word}입니다.`,
    });
  }

  return quizzes;
}

const appData = readJsData(await fs.readFile(appDataPath, "utf8"), "KCULTURE_DATA");
const odiiData = readJsData(await fs.readFile(odiiPath, "utf8"), "KCULTURE_ODII_STORIES");
const placeDetails = readJsData(await fs.readFile(placeDetailsPath, "utf8"), "KCULTURE_TOURAPI_DETAILS");

const activities = appData.apiTestTargets.map((target) => {
  const vocab = appData.vocabulary.find((item) => item.word === target.word);
  const odii = odiiData.results.find((result) => result.word === target.word);
  const representative = placeDetails.details.find((detail) => detail.word === target.word);
  const primaryStory = odii?.stories?.find((story) => story.audioUrl) ?? odii?.stories?.[0] ?? null;
  const sourceText = primaryStory?.script || "";
  const fallbackText = representative?.place?.overview || "";
  const expressions = pickExpressions(target.word, sourceText, fallbackText);
  const quizzes = makeQuiz(target.word, vocab, primaryStory, representative, expressions, appData.vocabulary);

  return {
    vocabularyId: vocab.id,
    word: target.word,
    source: primaryStory ? "odii-story" : "tourapi-place-overview",
    storyId: primaryStory?.id ?? "",
    storyTitle: primaryStory?.audioTitle ?? primaryStory?.title ?? "",
    hasAudio: Boolean(primaryStory?.audioUrl),
    audioUrl: primaryStory?.audioUrl ?? "",
    expressions,
    quizzes,
  };
});

const output = {
  generatedAt: new Date().toISOString(),
  summary: {
    targets: activities.length,
    withAudio: activities.filter((activity) => activity.hasAudio).length,
    expressions: activities.reduce((sum, activity) => sum + activity.expressions.length, 0),
    quizzes: activities.reduce((sum, activity) => sum + activity.quizzes.length, 0),
  },
  activities,
};

await fs.writeFile(outputPath, `window.KCULTURE_LEARNING_ACTIVITIES = ${JSON.stringify(output, null, 2)};\n`, "utf8");
console.log(JSON.stringify(output.summary, null, 2));
