/**
 * Build static K-culture domain missions for the prototype.
 * Domains: K-food, K-beauty, K-drama, K-fashion, K-webtoon, K-game
 * (K-pop / K-movie stay in melon-chart + klassic-quotes; this file links them.)
 *
 * Usage: npm run build:domains
 * Output: prototype/data/kculture-domains.js
 */
import fs from "node:fs/promises";
import path from "node:path";
import { josa } from "es-hangul";

const root = process.cwd();
const outFile = path.join(root, "prototype", "data", "kculture-domains.js");
const appDataPath = path.join(root, "prototype", "data", "app-data.js");

const domains = [
  {
    id: "k-food",
    label: "K-food",
    labelKo: "한식·먹거리",
    emoji: "🍜",
    blurb: "주문·맵기·반찬 등 식탁 한국어 미션",
    categories: ["food", "daily"],
    interests: ["k-food", "food"],
    items: [
      {
        id: "kf-order",
        title: "시장·식당에서 주문하기",
        keywords: ["김치", "떡볶이", "국밥", "김밥", "비빔밥", "라면", "된장", "고추장", "닭갈비", "떡", "밥"],
        phrases: ["이거 하나 주세요.", "덜 맵게 해 주세요.", "포장해 주세요.", "추천 메뉴가 뭐예요?"],
        tip: "가격과 맵기를 먼저 확인하면 대화가 쉬워집니다.",
      },
      {
        id: "kf-banchan",
        title: "반찬·식탁 매너",
        keywords: ["김치", "된장찌개", "누룽지", "숭늉", "감귤", "한라봉"],
        phrases: ["반찬 더 주세요.", "이거 뭐예요?", "맛있어요!", "잘 먹겠습니다."],
        tip: "공용 반찬은 개인 젓가락으로 집지 않는 것이 좋습니다.",
      },
    ],
  },
  {
    id: "k-beauty",
    label: "K-beauty",
    labelKo: "뷰티·스킨케어",
    emoji: "💄",
    blurb: "올리브영·스킨케어 매장에서 쓰는 표현",
    categories: ["daily", "tradition"],
    interests: ["k-beauty"],
    items: [
      {
        id: "kb-skincare",
        title: "스킨케어 상담하기",
        keywords: ["다도", "한복", "시장", "일상"],
        phrases: ["건성 피부에 맞는 크림 있어요?", "샘플 받을 수 있나요?", "자극 없는 제품 추천해 주세요.", "용량이 얼마예요?"],
        tip: "피부 타입(건성/지성/민감)을 먼저 말하면 추천이 빨라집니다.",
      },
      {
        id: "kb-makeup",
        title: "메이크업·색조 고르기",
        keywords: ["달고나", "과일 빙수", "노래방"],
        phrases: ["이 색 발라 봐도 돼요?", "자연스러운 색으로 주세요.", "선크림 있어요?", "세트 할인이 있나요?"],
        tip: "테스터 사용 전 위생 스틱을 요청할 수 있습니다.",
      },
    ],
  },
  {
    id: "k-drama",
    label: "K-drama",
    labelKo: "드라마·콘텐츠",
    emoji: "📺",
    blurb: "드라마·시리즈 감상과 촬영지 표현",
    categories: ["daily", "history", "place"],
    interests: ["k-drama", "k-movie"],
    items: [
      {
        id: "kd-watch",
        title: "드라마 이야기하기",
        keywords: ["광화문", "경복궁", "덕수궁", "남산 서울 타워", "시장"],
        phrases: ["그 드라마 봤어요?", "촬영지가 어디예요?", "주인공이 누구예요?", "다음 회가 궁금해요."],
        tip: "스포일러 전에 ‘결말 말해도 돼요?’를 먼저 물어보세요.",
      },
      {
        id: "kd-setjang",
        title: "촬영지 방문하기",
        keywords: ["경복궁", "남산 서울 타워", "템플 스테이", "덕수궁 돌담길"],
        phrases: ["여기서 찍은 장면이에요.", "사진 한 장 찍어 주세요.", "입장료가 얼마예요?", "몇 시까지 해요?"],
        tip: "인기 촬영지는 주말에 사람이 많으니 이른 아침을 노려 보세요.",
      },
      {
        id: "kd-squid-game",
        title: "오징어 게임 이야기하기 (학습용)",
        keywords: ["달고나", "무궁화", "시장", "노래방", "대학 축제", "놀이", "친구", "밥", "김치"],
        phrases: [
          "오징어 게임 시즌 봤어요?",
          "달고나 만들어 봤어요?",
          "무궁화 꽃이 피었습니다 놀이 알아요?",
          "스포일러 없이 이야기해요.",
          "넷플릭스에서 한국 콘텐츠가 인기예요.",
        ],
        tip: "폭력 장면 스포일러는 피하고, 문화·놀이·달고나 같은 학습 포인트로 이야기해 보세요.",
        spotlight: { title: "Squid Game", year: "2021–", type: "series" },
      },
      {
        id: "kd-culture-lexemes",
        title: "문화어 연습 (깐부·달고나·놀이)",
        keywords: ["달고나", "친구", "놀이", "김치", "밥", "시장", "노래방"],
        phrases: [
          "우리 깐부 해요.",
          "달고나 만들어 봤어요?",
          "무궁화 꽃이 피었습니다 알아요?",
          "깍두기는 무 김치예요.",
          "초대장을 받았어요.",
          "우리 팀 짜요.",
          "규칙을 설명해 주세요.",
          "결말은 스포일러 없이요.",
        ],
        tip: "원문 대사가 아니라 교육용 짧은 연습 문장입니다. docs/culture-lexicon-learning-spec.md · subtitle-citation-policy.md",
        spotlight: {
          title: "Culture lexemes (clean)",
          type: "lexicon",
          lemmas: ["깐부", "달고나", "무궁화 꽃이 피었습니다", "깍두기", "초대장", "팀", "구슬치기", "뽑기"],
        },
      },
    ],
  },
  {
    id: "k-fashion",
    label: "K-fashion",
    labelKo: "패션·스트리트",
    emoji: "👕",
    blurb: "옷·사이즈·스타일 쇼핑 표현",
    categories: ["daily", "tradition"],
    interests: ["k-fashion"],
    items: [
      {
        id: "kfa-shop",
        title: "옷 가게에서 고르기",
        keywords: ["한복", "시장", "대학 축제", "노래방"],
        phrases: ["이 사이즈 있어요?", "피팅룸 어디예요?", "다른 색 있어요?", "환불되나요?"],
        tip: "사이즈는 브랜드마다 달라서 입어 보는 것이 안전합니다.",
      },
      {
        id: "kfa-hanbok",
        title: "한복 대여·체험",
        keywords: ["한복", "경복궁", "광화문", "태극기"],
        phrases: ["한복 대여하고 싶어요.", "몇 시간 빌려요?", "액세서리 포함인가요?", "사진 찍기 좋은 코스 알려 주세요."],
        tip: "궁궐 근처 대여점은 주말 예약이 빨리 찹니다.",
      },
    ],
  },
  {
    id: "k-webtoon",
    label: "K-webtoon",
    labelKo: "웹툰·스토리",
    emoji: "📚",
    blurb: "웹툰·캐릭터·스토리 나누기",
    categories: ["daily", "history"],
    interests: ["k-webtoon"],
    items: [
      {
        id: "kw-talk",
        title: "웹툰 추천하기",
        keywords: ["단군", "세종", "시장", "대학 축제"],
        phrases: ["이 웹툰 재미있어요.", "장르가 뭐예요?", "결말이 어떻게 돼요?", "다음 화가 언제 나와요?"],
        tip: "장르(로맨스, 판타지, 스릴러)를 말하면 추천이 쉬워집니다.",
      },
    ],
  },
  {
    id: "k-game",
    label: "K-game",
    labelKo: "게임·e스포츠",
    emoji: "🎮",
    blurb: "PC방·게임 대화 표현",
    categories: ["daily"],
    interests: ["k-game"],
    items: [
      {
        id: "kg-pcbang",
        title: "PC방에서 말하기",
        keywords: ["노래방", "대학 축제", "시장", "공항 철도"],
        phrases: ["빈자리 있어요?", "몇 시간 할 거예요?", "결제는 카드로 할게요.", "음료 무료인가요?"],
        tip: "피크 시간에는 대기할 수 있으니 여유 있게 방문하세요.",
      },
    ],
  },
  {
    id: "k-pop",
    label: "K-pop",
    labelKo: "케이팝",
    emoji: "🎤",
    blurb: "BTS·BLACKPINK 등 글로벌 아티스트와 차트 표현",
    categories: ["daily", "tradition"],
    interests: ["k-pop", "kpop"],
    linkPanel: "chart-list",
    items: [
      {
        id: "kp-talk",
        title: "좋아하는 노래 말하기",
        keywords: ["노래방", "대학 축제", "시장"],
        phrases: ["이 가수 알아요?", "최신 곡 들었어요?", "안무 따라 해 봤어요?", "콘서트 가고 싶어요."],
        tip: "차트 미션 섹션에서 이번 주 노래를 골라 말해 보세요.",
      },
      {
        id: "kp-bts",
        title: "BTS (방탄소년단) 이야기하기",
        keywords: ["노래방", "대학 축제", "시장", "공항 철도", "한복"],
        phrases: [
          "BTS 알아요? 방탄소년단이에요.",
          "Dynamite랑 Butter 들어 봤어요?",
          "Permission to Dance 안무가 신나요.",
          "콘서트 티켓이 정말 구하기 어려워요.",
          "한국어 가사로 따라 불러 볼래요?",
        ],
        tip: "학습용으로는 곡 제목·멤버 소개·감정 표현부터 연습해 보세요.",
        spotlight: { title: "BTS", type: "artist", hits: ["Dynamite", "Butter", "Permission to Dance"] },
      },
      {
        id: "kp-blackpink",
        title: "BLACKPINK 이야기하기",
        keywords: ["노래방", "대학 축제", "시장", "한복"],
        phrases: [
          "BLACKPINK 좋아해요?",
          "How You Like That 들어 봤어요?",
          "Pink Venom 뮤비 봤어요?",
          "멤버 중에 누구 스타일이 좋아요?",
          "안무 챌린지 해 봤어요?",
        ],
        tip: "좋아하는 멤버·곡·안무를 짧게 말하는 연습이 좋아요.",
        spotlight: { title: "BLACKPINK", type: "artist", hits: ["How You Like That", "Pink Venom", "Shut Down"] },
      },
      {
        id: "kp-4thgen",
        title: "4세대 아이돌 이야기하기",
        keywords: ["노래방", "대학 축제", "달고나"],
        phrases: [
          "NewJeans 노래 들었어요?",
          "aespa의 Next Level 알아요?",
          "IVE랑 LE SSERAFIM도 인기예요.",
          "최신 차트 1위가 누구예요?",
        ],
        tip: "Melon 차트 섹션과 함께 보면 ‘요즘’ 표현 연습이 됩니다.",
        spotlight: { title: "4th gen K-pop", type: "wave", hits: ["Hype Boy", "Next Level", "ANTIFRAGILE"] },
      },
    ],
  },
  {
    id: "k-movie",
    label: "K-movie",
    labelKo: "한국 영화",
    emoji: "🎬",
    blurb: "기생충 등 글로벌 히트 영화와 명대사 학습",
    categories: ["history", "daily", "food"],
    interests: ["k-movie", "kmovie"],
    linkPanel: "quote-list",
    items: [
      {
        id: "km-talk",
        title: "영화 감상 나누기",
        keywords: ["광화문", "경복궁", "역사", "독립"],
        phrases: ["그 영화 봤어요?", "명대사가 인상 깊었어요.", "장르가 뭐예요?", "다시 보고 싶어요."],
        tip: "명대사 섹션에서 수위 필터를 학습용으로 두고 따라 읽어 보세요.",
      },
      {
        id: "km-parasite",
        title: "기생충(Parasite) 이야기하기 (학습용)",
        keywords: ["밥", "김치", "시장", "집", "반지하", "계단"],
        phrases: [
          "기생충 영화 봤어요? 봉준호 감독 작품이에요.",
          "오스카를 받은 한국 영화예요.",
          "가족 이야기와 사회 이야기를 같이 담고 있어요.",
          "명대사를 천천히 따라 읽어 볼래요?",
          "스포일러 없이 느낌만 이야기해요.",
        ],
        tip: "학습용으로는 수위 높은 장면보다 ‘가족·집·음식·계급’ 같은 어휘로 이야기해 보세요.",
        spotlight: { title: "Parasite", year: "2019", type: "film", director: "Bong Joon-ho" },
      },
      {
        id: "km-global",
        title: "한국 영화 추천하기",
        keywords: ["역사", "광화문", "덕수궁", "한복"],
        phrases: [
          "한국 영화 추천해 주세요.",
          "부산행은 좀비 영화예요.",
          "미나리도 좋아요.",
          "자막으로 봐도 감정은 잘 전달돼요.",
        ],
        tip: "장르(스릴러, 코미디, 가족)를 먼저 말하면 추천이 쉬워집니다.",
        spotlight: { title: "Korean cinema hits", type: "list", hits: ["Parasite", "Train to Busan", "Minari"] },
      },
    ],
  },
];

/** Global-hit cards shown at top of the domain panel (educational). */
const contemporarySpotlights = [
  {
    id: "spot-bts",
    domainId: "k-pop",
    title: "BTS (방탄소년단)",
    subtitle: "Dynamite · Butter · Permission to Dance",
    blurb: "전 세계가 따라 부른 K-pop. 가사·응원법·콘서트 표현을 배워 보세요.",
    phrases: ["BTS 팬이에요.", "이 노래 제목이 뭐예요?", "한국어로 따라 부를래요."],
    tags: ["K-pop", "BTS", "글로벌"],
  },
  {
    id: "spot-bp",
    domainId: "k-pop",
    title: "BLACKPINK",
    subtitle: "How You Like That · Pink Venom",
    blurb: "퍼포먼스와 패션 아이콘. 스타일·안무·취향을 말해 보세요.",
    phrases: ["BLACKPINK 뮤비 봤어요?", "안무가 멋져요.", "최애 멤버가 누구예요?"],
    tags: ["K-pop", "BLACKPINK"],
  },
  {
    id: "spot-squid",
    domainId: "k-drama",
    title: "오징어 게임 (Squid Game)",
    subtitle: "문화어 · 달고나 · 깐부 · 놀이 (교육 시드)",
    blurb: "원문 대사 없이 깐부·달고나·무궁화 놀이 등 문화고유어로 한국어를 연습합니다.",
    phrases: [
      "오징어 게임 봤어요?",
      "우리 깐부 해요.",
      "달고나 만들어 봤어요?",
      "무궁화 꽃이 피었습니다 알아요?",
      "규칙을 설명해 주세요.",
      "결말은 스포일러 없이요.",
    ],
    tags: ["K-drama", "Squid Game", "문화어", "달고나", "깐부"],
  },
  {
    id: "spot-parasite",
    domainId: "k-movie",
    title: "기생충 (Parasite)",
    subtitle: "2019 · 봉준호",
    blurb: "오스카 작품상. 가족·집·음식 어휘로 영화 감상을 나눠 보세요.",
    phrases: ["기생충 봤어요?", "명대사가 인상 깊었어요.", "수위 필터를 학습용으로 두고 읽어 봐요."],
    tags: ["K-movie", "Parasite", "기생충"],
  },
  {
    id: "spot-newjeans",
    domainId: "k-pop",
    title: "NewJeans · aespa",
    subtitle: "4세대 대표 아티스트",
    blurb: "최신 차트와 연결해 ‘요즘 유행’ 표현을 연습합니다.",
    phrases: ["Hype Boy 들었어요?", "Next Level 안무 알아요?", "요즘 차트 1위가 궁금해요."],
    tags: ["K-pop", "4th gen"],
  },
];

function loadVocabulary() {
  return fs
    .readFile(appDataPath, "utf8")
    .then((text) => {
      const window = {};
      const data = new Function("window", `${text}; return window.KCULTURE_DATA;`)(window);
      return data?.vocabulary ?? [];
    })
    .catch(() => []);
}

function scoreItemForVocab(item, vocab) {
  const word = vocab.word;
  let score = 0;
  const reasons = [];
  for (const keyword of item.keywords ?? []) {
    if (keyword === word || word.includes(keyword) || keyword.includes(word)) {
      score += keyword === word ? 20 : 10;
      reasons.push(`kw:${keyword}`);
    }
  }
  if (item.phrases?.some((p) => p.includes(word))) {
    score += 8;
    reasons.push("phrase");
  }
  return { score, reasons };
}

function buildVocabDomainMatches(vocabulary) {
  const byWord = {};
  for (const vocab of vocabulary) {
    const ranked = [];
    for (const domain of domains) {
      for (const item of domain.items) {
        const { score, reasons } = scoreItemForVocab(item, vocab);
        let total = score;
        if (domain.categories.includes(vocab.category)) {
          total += 4;
          reasons.push("category");
        }
        if (total >= 4) {
          ranked.push({
            domainId: domain.id,
            itemId: item.id,
            score: total,
            reasons: [...new Set(reasons)],
          });
        }
      }
    }
    ranked.sort((a, b) => b.score - a.score);
    if (ranked.length) byWord[vocab.word] = ranked.slice(0, 4);
  }

  // Ensure every vocab has at least one domain via category fallback
  for (const vocab of vocabulary) {
    if (byWord[vocab.word]?.length) continue;
    const fallback =
      domains.find((d) => d.categories.includes(vocab.category)) ?? domains.find((d) => d.id === "k-food");
    const item = fallback.items[0];
    byWord[vocab.word] = [
      {
        domainId: fallback.id,
        itemId: item.id,
        score: 4,
        reasons: ["category-fallback"],
      },
    ];
  }
  return byWord;
}

function enrichPhrasesWithWord(item, word) {
  try {
    return [
      ...item.phrases,
      `${josa(word, "이/가")} 뭐랑 잘 어울려요?`,
      `${josa(word, "을/를")} 주제로 이야기해 볼래요.`,
    ];
  } catch {
    return item.phrases;
  }
}

async function main() {
  const vocabulary = await loadVocabulary();
  const vocabMatches = buildVocabDomainMatches(vocabulary);

  const payload = {
    generatedAt: new Date().toISOString(),
    source: {
      note: "Educational K-culture domain missions for Sejong vocabulary sessions (includes contemporary global hits)",
      domains: domains.map((d) => d.id),
      contemporary: contemporarySpotlights.map((s) => s.title),
    },
    summary: {
      domains: domains.length,
      items: domains.reduce((sum, d) => sum + d.items.length, 0),
      spotlights: contemporarySpotlights.length,
      vocabWithMatches: Object.keys(vocabMatches).length,
      totalVocabulary: vocabulary.length,
    },
    spotlights: contemporarySpotlights,
    domains: domains.map((domain) => ({
      id: domain.id,
      label: domain.label,
      labelKo: domain.labelKo,
      emoji: domain.emoji,
      blurb: domain.blurb,
      categories: domain.categories,
      interests: domain.interests,
      linkPanel: domain.linkPanel ?? null,
      items: domain.items.map((item) => ({
        id: item.id,
        title: item.title,
        keywords: item.keywords,
        phrases: item.phrases,
        tip: item.tip,
        spotlight: item.spotlight ?? null,
      })),
    })),
    vocabMatches,
  };

  // Attach sample word-aware phrase bundles for top matches (optional UI use)
  payload.wordMissions = {};
  for (const vocab of vocabulary) {
    const top = vocabMatches[vocab.word]?.[0];
    if (!top) continue;
    const domain = domains.find((d) => d.id === top.domainId);
    const item = domain?.items.find((i) => i.id === top.itemId);
    if (!domain || !item) continue;
    payload.wordMissions[vocab.word] = {
      domainId: domain.id,
      domainLabel: domain.label,
      domainLabelKo: domain.labelKo,
      emoji: domain.emoji,
      itemId: item.id,
      title: item.title,
      phrases: enrichPhrasesWithWord(item, vocab.word),
      tip: item.tip,
      score: top.score,
      reasons: top.reasons,
      linkPanel: domain.linkPanel ?? null,
    };
  }

  const body = `window.KCULTURE_DOMAINS = ${JSON.stringify(payload, null, 2)};\n`;
  await fs.writeFile(outFile, body, "utf8");
  console.log(
    `Wrote ${path.relative(root, outFile)} domains=${payload.summary.domains} items=${payload.summary.items} matched=${payload.summary.vocabWithMatches}/${payload.summary.totalVocabulary}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
