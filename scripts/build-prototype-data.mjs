import fs from "node:fs/promises";
import path from "node:path";
import { josa } from "es-hangul";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Hanp = require("hangul-postposition");

const root = process.cwd();

const sourceFiles = [
  "세종학당재단_교재_한국문화_세종한국문화1 주요 어휘_20260501.csv",
  "세종학당재단_교재_한국문화_세종한국문화2 주요 어휘_20260507.csv",
];

const categoryRules = [
  ["food", ["김치", "김밥", "국밥", "떡볶이", "비빔밥", "라면", "된장", "떡", "누룽지", "닭갈비", "감귤", "김장", "고추"]],
  ["place", ["경복궁", "남산 서울 타워", "갯벌", "템플 스테이"]],
  ["tradition", ["한복", "강강술래", "널뛰기", "그네뛰기", "판소리", "태권도", "태극기", "달 항아리"]],
  ["history", ["세종", "이순신", "장군", "역사", "궁"]],
  ["daily", ["노래방", "시장", "일상"]],
];

const categoryLabels = {
  food: "음식",
  place: "장소",
  tradition: "전통문화",
  history: "역사",
  nature: "자연",
  daily: "일상",
};

const categoryCopy = {
  food: {
    easyKorean: "한국 사람들이 자주 먹거나 특별한 날에 즐기는 음식과 관련된 말이에요.",
    missionTitle: "현지 음식 주문하기",
    phrases: ["이거 하나 주세요.", "많이 매워요?", "덜 맵게 해 주세요."],
    localTip: "처음 가는 식당에서는 대표 메뉴를 물어보면 자연스럽게 대화가 시작됩니다.",
    riskSignal: "가격표가 잘 보이지 않으면 주문 전에 가격을 먼저 확인하세요.",
  },
  place: {
    easyKorean: "한국의 여행지나 지역 문화를 이해할 때 자주 쓰는 말이에요.",
    missionTitle: "장소에서 질문하기",
    phrases: ["여기 어떻게 가요?", "사진 한 장 찍어 주실 수 있을까요?", "입장료가 얼마예요?"],
    localTip: "관광지에서는 짧고 공손한 질문이 가장 자연스럽습니다.",
    riskSignal: "운영 시간과 휴무일은 방문 전에 공식 정보를 한 번 더 확인하세요.",
  },
  tradition: {
    easyKorean: "한국의 전통문화, 놀이, 예술, 상징을 말할 때 쓰는 어휘예요.",
    missionTitle: "문화 체험에서 말하기",
    phrases: ["이건 어떻게 해요?", "한번 해 봐도 돼요?", "정말 아름다워요."],
    localTip: "전통문화 체험에서는 배우고 싶다는 표현을 먼저 하면 대화가 부드럽게 이어집니다.",
    riskSignal: "체험 비용과 포함 항목을 예약 전에 확인하세요.",
  },
  history: {
    easyKorean: "한국의 역사와 인물을 이야기할 때 필요한 말이에요.",
    missionTitle: "역사 이야기 듣고 묻기",
    phrases: ["이 사람은 누구예요?", "언제 만들어졌어요?", "무슨 뜻이에요?"],
    localTip: "역사 장소에서는 안내문에서 본 단어를 질문으로 바꾸면 좋은 연습이 됩니다.",
    riskSignal: "비공식 설명과 공식 안내가 다를 수 있으니 출처를 함께 확인하세요.",
  },
  daily: {
    easyKorean: "한국인의 생활과 일상 문화를 이해할 때 필요한 말이에요.",
    missionTitle: "일상 대화 시작하기",
    phrases: ["여기 자주 오세요?", "추천해 주세요.", "한국어를 연습하고 있어요."],
    localTip: "바쁜 시간보다 한가한 시간에 짧게 말하면 부담이 적습니다.",
    riskSignal: "상대가 바빠 보이면 대화를 길게 이어가지 않는 것이 좋습니다.",
  },
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const [headers, ...records] = rows;
  return records.map((record) =>
    Object.fromEntries(headers.map((header, index) => [header.trim(), (record[index] ?? "").trim()])),
  );
}

function slugify(word) {
  const encoded = Buffer.from(word, "utf8").toString("base64url");
  return encoded.toLowerCase();
}

function inferCategory(word, unitName) {
  for (const [category, terms] of categoryRules) {
    if (terms.some((term) => word.includes(term) || unitName.includes(term))) return category;
  }
  if (unitName.includes("자연")) return "nature";
  return "daily";
}

function splitPages(value) {
  return value
    .split(",")
    .map((page) => page.trim())
    .filter(Boolean);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

const allRows = [];
for (const file of sourceFiles) {
  const text = await fs.readFile(path.join(root, file), "utf8");
  allRows.push(...parseCsv(text));
}

const grouped = new Map();
for (const row of allRows) {
  const word = row["주요 어휘"];
  if (!word) continue;

  if (!grouped.has(word)) {
    grouped.set(word, {
      id: `vocab-${slugify(word)}`,
      word,
      category: inferCategory(word, row["단원명"] ?? ""),
      categoryLabel: "",
      books: [],
      units: [],
      pages: [],
      sourceRows: [],
    });
  }

  const item = grouped.get(word);
  item.books.push(row["교재명"]);
  item.units.push(row["단원명"]);
  item.pages.push(...splitPages(row["관련 페이지"] ?? ""));
  item.sourceRows.push({
    book: row["교재명"],
    unitNo: row["단원 연번"],
    unitName: row["단원명"],
    pages: splitPages(row["관련 페이지"] ?? ""),
  });
}

const vocabulary = [...grouped.values()]
  .map((item) => {
    const copy = categoryCopy[item.category] ?? categoryCopy.daily;
    const missionId = `mission-${item.category}`;
    return {
      ...item,
      categoryLabel: categoryLabels[item.category] ?? "일상",
      books: unique(item.books),
      units: unique(item.units),
      pages: unique(item.pages),
      // es-hangul josa for 은/는·을/를; hangul-postposition for 은(는) templates
      easyKorean: `${josa(item.word, "은/는")} ${copy.easyKorean}`,
      sampleSentences: [
        `저는 ${item.word}에 대해 배우고 있어요.`,
        Hanp.translatePostpositions(`${item.word}을(를) 한국어로 설명해 보고 싶어요.`),
        `${josa(item.word, "이/가")} 뭐예요?`,
      ],
      missionIds: [missionId],
      apiKeywords: unique([item.word, item.word.replace(/\s+/g, ""), ...item.units.slice(0, 1)]),
    };
  })
  .sort((a, b) => a.word.localeCompare(b.word, "ko"));

const missionCategories = unique(vocabulary.map((item) => item.category));
const missions = missionCategories.map((category) => {
  const copy = categoryCopy[category] ?? categoryCopy.daily;
  return {
    id: `mission-${category}`,
    category,
    categoryLabel: categoryLabels[category] ?? "일상",
    title: copy.missionTitle,
    difficulty: category === "history" ? "intermediate" : "beginner",
    phrases: copy.phrases,
    localTip: copy.localTip,
    riskSignal: copy.riskSignal,
  };
});

const apiTestTargets = vocabulary
  .map((item) => ({
    word: item.word,
    category: item.category,
    korTourApi: {
      searchKeyword: item.word,
      expectedUse: "장소/음식점/문화시설/행사/이미지 후보 수집",
    },
    odiiApi: {
      searchKeyword: item.word,
      expectedUse: "문화 이야기/오디오/대본 후보 수집",
    },
    bigDataApi: {
      expectedUse: "관련 지역 방문 트렌드 참고",
    },
    durunubiApi: {
      expectedUse: item.category === "place" || item.category === "nature" ? "걷기 코스/지역 미션 후보 수집" : "필요 시 보조 사용",
    },
  }));

const appData = {
  generatedAt: new Date().toISOString(),
  summary: {
    totalRows: allRows.length,
    totalVocabulary: vocabulary.length,
    categories: Object.fromEntries(
      Object.keys(categoryLabels).map((category) => [category, vocabulary.filter((item) => item.category === category).length]),
    ),
  },
  vocabulary,
  missions,
  apiTestTargets,
  sources: sourceFiles,
};

await fs.mkdir(path.join(root, "prototype", "data"), { recursive: true });
await fs.writeFile(
  path.join(root, "prototype", "data", "app-data.js"),
  `window.KCULTURE_DATA = ${JSON.stringify(appData, null, 2)};\n`,
  "utf8",
);

console.log(`Generated prototype/data/app-data.js with ${vocabulary.length} vocabulary items.`);
