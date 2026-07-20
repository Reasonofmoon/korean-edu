const data = window.KCULTURE_DATA;
const tourApiMatches = window.KCULTURE_TOURAPI_MATCHES ?? {
  summary: { matchedTargets: 0, publicPlaces: 0 },
  matches: [],
  publicPlaces: [],
};
const tourApiDetails = window.KCULTURE_TOURAPI_DETAILS ?? {
  summary: { detailedPlaces: 0 },
  details: [],
};
const odiiStories = window.KCULTURE_ODII_STORIES ?? {
  summary: { matchedTargets: 0, stories: 0, storiesWithAudio: 0 },
  results: [],
};
const learningActivities = window.KCULTURE_LEARNING_ACTIVITIES ?? {
  summary: { expressions: 0, quizzes: 0 },
  activities: [],
};
const klassicQuotes = window.KCULTURE_KLASSIC_QUOTES ?? {
  summary: { total: 0 },
  quotes: [],
  vocabMatches: {},
  source: {},
};
const melonChart = window.KCULTURE_MELON_CHART ?? {
  summary: { total: 0 },
  chart: [],
  source: {},
};
const kcultureDomains = window.KCULTURE_DOMAINS ?? {
  summary: { domains: 0, items: 0 },
  domains: [],
  vocabMatches: {},
  wordMissions: {},
  source: {},
};

/** clean < mild < mature — UI filter max allowed rating. */
const RATING_ORDER = ["clean", "mild", "mature"];
const ratingLabels = {
  clean: "학습용",
  mild: "거친 말투",
  mature: "수위 높음",
};

function isRatingAllowed(quoteRating, maxRating) {
  const quoteIdx = RATING_ORDER.indexOf(quoteRating ?? "clean");
  const maxIdx = RATING_ORDER.indexOf(maxRating ?? "clean");
  if (quoteIdx < 0 || maxIdx < 0) return (quoteRating ?? "clean") === "clean";
  return quoteIdx <= maxIdx;
}

function hashString(value) {
  let hash = 0;
  const text = String(value ?? "");
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) % 1_000_003;
  }
  return hash;
}

/** A-group Hangul utilities (es-hangul + hangul-romanization + hangul-postposition). */
const Hangul = window.HangulUtils ?? {};
const romanizeWord = (text) => {
  try {
    return Hangul.romanize?.(text) || Hangul.romanizeEs?.(text) || "";
  } catch {
    return "";
  }
};
const attachJosa = (word, particle) => {
  try {
    return Hangul.attachJosa?.(word, particle) || Hangul.josa?.(word, particle) || word;
  } catch {
    return word;
  }
};
const missionLinesFor = (word) => {
  try {
    if (typeof Hangul.missionLinesFor === "function") return Hangul.missionLinesFor(word);
  } catch {
    /* fall through */
  }
  return [
    `${attachJosa(word, "이/가")} 뭐예요?`,
    `${attachJosa(word, "을/를")} 추천해 주세요.`,
    `${attachJosa(word, "은/는")} 어디에 있어요?`,
  ];
};
const matchesSearch = (fields, query) => {
  try {
    if (typeof Hangul.matchesHangulSearch === "function") {
      return Hangul.matchesHangulSearch(fields, query);
    }
  } catch {
    /* fall through */
  }
  const q = String(query ?? "").trim().toLowerCase();
  if (!q) return true;
  return fields.some((field) => String(field ?? "").toLowerCase().includes(q));
};

const prefsKey = "kculture-learner-prefs-v1";

/** Interest chips → vocabulary categories (+ optional K-culture domain) they boost. */
const INTEREST_OPTIONS = [
  { id: "k-food", label: "K-food", categories: ["food", "daily"], domains: ["k-food"] },
  { id: "k-beauty", label: "K-beauty", categories: ["daily", "tradition"], domains: ["k-beauty"] },
  { id: "k-pop", label: "K-pop", categories: ["daily", "tradition"], domains: ["k-pop"] },
  { id: "k-movie", label: "K-movie", categories: ["history", "daily"], domains: ["k-movie"] },
  { id: "k-drama", label: "K-drama", categories: ["daily", "history", "place"], domains: ["k-drama"] },
  { id: "k-fashion", label: "K-fashion", categories: ["daily", "tradition"], domains: ["k-fashion"] },
  { id: "k-webtoon", label: "K-webtoon", categories: ["daily", "history"], domains: ["k-webtoon"] },
  { id: "k-game", label: "K-game", categories: ["daily"], domains: ["k-game"] },
  { id: "place", label: "명소·궁궐", categories: ["place"], domains: ["k-drama"] },
  { id: "tradition", label: "전통 체험", categories: ["tradition"], domains: ["k-fashion"] },
  { id: "history", label: "역사·인물", categories: ["history"], domains: ["k-movie"] },
  { id: "nature", label: "자연·지역", categories: ["nature"], domains: [] },
  // legacy aliases still accepted via loadPrefs filter + map
  { id: "food", label: "한식·맛집", categories: ["food"], domains: ["k-food"] },
  { id: "daily", label: "일상·생활", categories: ["daily"], domains: ["k-beauty", "k-food"] },
  { id: "kpop", label: "K-pop (alias)", categories: ["daily", "tradition"], domains: ["k-pop"], hidden: true },
  { id: "kmovie", label: "K-movie (alias)", categories: ["history", "daily"], domains: ["k-movie"], hidden: true },
];

/** Travel purpose (single) → category weights for next-vocab ranking. */
const TRAVEL_PURPOSE_OPTIONS = [
  { id: "any", label: "아직 정하지 않음", categories: [], domains: [] },
  { id: "food_trip", label: "먹방·K-food", categories: ["food", "daily"], domains: ["k-food"] },
  { id: "beauty_shop", label: "뷰티·쇼핑", categories: ["daily", "tradition"], domains: ["k-beauty", "k-fashion"] },
  { id: "sightseeing", label: "명소·드라마 성지", categories: ["place", "history"], domains: ["k-drama"] },
  { id: "culture", label: "문화·전통 체험", categories: ["tradition", "history"], domains: ["k-fashion", "k-movie"] },
  { id: "nature", label: "자연·힐링", categories: ["nature", "place"], domains: [] },
  { id: "city_life", label: "도시 일상·K-pop", categories: ["daily", "food"], domains: ["k-pop", "k-game"] },
  { id: "content", label: "콘텐츠·웹툰", categories: ["daily", "history"], domains: ["k-webtoon", "k-drama", "k-movie"] },
];

function loadPrefs() {
  try {
    const raw = localStorage.getItem(prefsKey);
    const parsed = raw ? JSON.parse(raw) : {};
    const interests = Array.isArray(parsed.interests)
      ? parsed.interests.filter((id) => INTEREST_OPTIONS.some((option) => option.id === id))
      : [];
    const travelPurpose = TRAVEL_PURPOSE_OPTIONS.some((option) => option.id === parsed.travelPurpose)
      ? parsed.travelPurpose
      : "any";
    return { interests, travelPurpose };
  } catch {
    return { interests: [], travelPurpose: "any" };
  }
}

function savePrefs() {
  localStorage.setItem(
    prefsKey,
    JSON.stringify({
      interests: state.prefs.interests,
      travelPurpose: state.prefs.travelPurpose,
      updatedAt: new Date().toISOString(),
    }),
  );
}

const state = {
  query: "",
  category: "all",
  selectedId: data.vocabulary[0]?.id,
  /** Max content rating for movie quotes (default: learner-safe). */
  quoteMaxRating: "clean",
  prefs: loadPrefs(),
  /** Active domain filter — default spotlight so latest hits show first. */
  domainFilter: "spotlight",
};

const categoryOrder = ["all", "food", "place", "tradition", "history", "nature", "daily"];
const categoryLabels = {
  all: "전체",
  food: "음식",
  place: "장소",
  tradition: "전통문화",
  history: "역사",
  nature: "자연",
  daily: "일상",
};

const searchInput = document.querySelector("#search");
const searchHintEl = document.querySelector("#search-hint");
const filtersEl = document.querySelector("#filters");
const listEl = document.querySelector("#vocab-list");
const detailEl = document.querySelector("#detail");
const targetsEl = document.querySelector("#api-targets");
const apiStatusEl = document.querySelector("#api-status");
const placeListEl = document.querySelector("#place-list");
const storyListEl = document.querySelector("#story-list");
const activityListEl = document.querySelector("#activity-list");
const reviewListEl = document.querySelector("#review-list");
const quoteListEl = document.querySelector("#quote-list");
const chartListEl = document.querySelector("#chart-list");
const domainListEl = document.querySelector("#domain-list");
const domainFilterEl = document.querySelector("#domain-filter");
const nowTrendingEl = document.querySelector("#now-trending");
const quoteRatingFilterEl = document.querySelector("#quote-rating-filter");
const learnerPrefsEl = document.querySelector("#learner-prefs");
const todayNudgeEl = document.querySelector("#today-nudge");
const sessionFlowEl = document.querySelector("#session-flow");
const resultCountEl = document.querySelector("#result-count");
const accuracyRateEl = document.querySelector("#accuracy-rate");
const reviewCountEl = document.querySelector("#review-count");
const badgeCountEl = document.querySelector("#badge-count");

document.querySelector("#total-vocab").textContent = data.summary.totalVocabulary;
document.querySelector("#total-missions").textContent = data.missions.length;
document.querySelector("#total-targets").textContent = data.apiTestTargets.length;

const progressKey = "kculture-learning-progress-v1";
let progress = loadProgress();

function loadProgress() {
  try {
    const raw = localStorage.getItem(progressKey);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      answers: parsed.answers ?? {},
      audio: parsed.audio ?? {},
      expressions: parsed.expressions ?? {},
      reading: parsed.reading ?? {},
      kpop: parsed.kpop ?? {},
      quotes: parsed.quotes ?? {},
      domains: parsed.domains ?? {},
    };
  } catch {
    return { answers: {}, audio: {}, expressions: {}, reading: {}, kpop: {}, quotes: {}, domains: {} };
  }
}

function saveProgress() {
  localStorage.setItem(progressKey, JSON.stringify(progress));
}

function allQuizzes() {
  return learningActivities.activities.flatMap((activity) =>
    activity.quizzes.map((quiz) => ({
      ...quiz,
      word: activity.word,
      activity,
    })),
  );
}

function hasKpopChart() {
  return (melonChart.chart ?? []).length > 0;
}

/** Quotes are always required when dataset exists (seed + API). */
function hasQuoteDataset() {
  return (klassicQuotes.quotes ?? []).length > 0;
}

function hasDomainDataset() {
  return (kcultureDomains.domains ?? []).length > 0;
}

function domainMissionFor(item) {
  if (!item) return null;
  return kcultureDomains.wordMissions?.[item.word] ?? null;
}

function statsForWord(word) {
  const activity = learningActivities.activities.find((item) => item.word === word);
  const quizzes = activity?.quizzes ?? [];
  const answered = quizzes.filter((quiz) => {
    const answer = progress.answers[quiz.id];
    return answer && !answer.pendingRetry;
  });
  const correct = answered.filter((quiz) => progress.answers[quiz.id]?.correct);
  const requiresAudio = Boolean(activity?.hasAudio && activity.audioUrl);
  const audioDone = !requiresAudio || Boolean(progress.audio[word]?.completed);
  const requiresReading = Boolean(activity && !requiresAudio);
  const readingDone = !requiresReading || Boolean(progress.reading[word]?.completed);
  const expressionDone = !activity?.expressions?.length || Boolean(progress.expressions[word]?.checked);
  const requiresQuotes = hasQuoteDataset();
  const quoteDone = !requiresQuotes || Boolean(progress.quotes[word]?.completed);
  const requiresDomain = hasDomainDataset() && Boolean(kcultureDomains.wordMissions?.[word]);
  const domainDone = !requiresDomain || Boolean(progress.domains[word]?.completed);
  const requiresKpop = hasKpopChart();
  const kpopDone = !requiresKpop || Boolean(progress.kpop[word]?.completed);
  return {
    total: quizzes.length,
    answered: answered.length,
    correct: correct.length,
    incorrectAttempts: quizzes.reduce((sum, quiz) => sum + (progress.answers[quiz.id]?.wrongCount ?? 0), 0),
    requiresAudio,
    audioDone,
    requiresReading,
    readingDone,
    expressionDone,
    requiresQuotes,
    quoteDone,
    requiresDomain,
    domainDone,
    requiresKpop,
    kpopDone,
    complete:
      quizzes.length > 0 &&
      correct.length === quizzes.length &&
      audioDone &&
      readingDone &&
      expressionDone &&
      quoteDone &&
      domainDone &&
      kpopDone,
  };
}

function overallStats() {
  const quizzes = allQuizzes();
  const answered = quizzes.filter((quiz) => {
    const answer = progress.answers[quiz.id];
    return answer && !answer.pendingRetry;
  });
  const correct = answered.filter((quiz) => progress.answers[quiz.id]?.correct);
  const review = quizzes.filter((quiz) => {
    const answer = progress.answers[quiz.id];
    return !answer || !answer.correct || answer.pendingRetry;
  });
  const completed = learningActivities.activities.filter((activity) => statsForWord(activity.word).complete);
  const audioCompleted = learningActivities.activities.filter((activity) => progress.audio[activity.word]?.completed);
  return {
    total: quizzes.length,
    answered: answered.length,
    correct: correct.length,
    review: review.length,
    completed: completed.length,
    audioCompleted: audioCompleted.length,
    accuracy: answered.length ? Math.round((correct.length / answered.length) * 100) : 0,
  };
}

function nextLearningItem() {
  const selected = data.vocabulary.find((item) => item.id === state.selectedId) ?? data.vocabulary[0];
  return nextRecommendedItem(selected) ?? selected;
}

function wrongCountForWord(word) {
  return allQuizzes()
    .filter((quiz) => quiz.word === word)
    .reduce((sum, quiz) => sum + (progress.answers[quiz.id]?.wrongCount ?? 0), 0);
}

/** Weighted category scores from interests + travel purpose. */
function preferenceCategoryScores() {
  const scores = Object.create(null);
  for (const interestId of state.prefs.interests) {
    const interest = INTEREST_OPTIONS.find((option) => option.id === interestId);
    for (const category of interest?.categories ?? []) {
      scores[category] = (scores[category] ?? 0) + 2;
    }
  }
  const purpose = TRAVEL_PURPOSE_OPTIONS.find((option) => option.id === state.prefs.travelPurpose);
  for (const category of purpose?.categories ?? []) {
    scores[category] = (scores[category] ?? 0) + 3;
  }
  return scores;
}

/** Domain ids boosted by current prefs. */
function preferredDomainIds() {
  const ids = new Set();
  for (const interestId of state.prefs.interests) {
    const interest = INTEREST_OPTIONS.find((option) => option.id === interestId);
    for (const domainId of interest?.domains ?? []) ids.add(domainId);
  }
  const purpose = TRAVEL_PURPOSE_OPTIONS.find((option) => option.id === state.prefs.travelPurpose);
  for (const domainId of purpose?.domains ?? []) ids.add(domainId);
  return ids;
}

function preferenceScoreForItem(item) {
  const scores = preferenceCategoryScores();
  let score = scores[item?.category] ?? 0;
  const mission = domainMissionFor(item);
  if (mission && preferredDomainIds().has(mission.domainId)) {
    score += 4 + Math.min(mission.score ?? 0, 8) / 4;
  }
  return score;
}

function hasActivePreferences() {
  return state.prefs.interests.length > 0 || state.prefs.travelPurpose !== "any";
}

function preferenceSummaryLabel() {
  const parts = [];
  const purpose = TRAVEL_PURPOSE_OPTIONS.find((option) => option.id === state.prefs.travelPurpose);
  if (purpose && purpose.id !== "any") parts.push(purpose.label);
  for (const interestId of state.prefs.interests) {
    const interest = INTEREST_OPTIONS.find((option) => option.id === interestId);
    if (interest) parts.push(interest.label);
  }
  return parts.length ? parts.join(" · ") : "관심사 미설정";
}

function explainRecommendation(fromItem, nextItem) {
  if (!nextItem) return "";
  if (wrongCountForWord(nextItem.word) > 0) return "오답 복습 우선";
  const prefScore = preferenceScoreForItem(nextItem);
  if (prefScore > 0 && hasActivePreferences()) {
    return `관심사/여행 목적 맞춤 · ${categoryLabels[nextItem.category] ?? nextItem.category}`;
  }
  if (fromItem && nextItem.category === fromItem.category) {
    return `${fromItem.categoryLabel} 이어 학습`;
  }
  return "다음 미완료 어휘";
}

function nextRecommendedItem(item) {
  const selectedIndex = data.vocabulary.findIndex((candidate) => candidate.id === item?.id);
  const selectedCategory = item?.category ?? "";
  const candidates = data.vocabulary
    .map((candidate, index) => ({
      item: candidate,
      index,
      stats: statsForWord(candidate.word),
      wrongCount: wrongCountForWord(candidate.word),
      prefScore: preferenceScoreForItem(candidate),
    }))
    .filter((candidate) => candidate.item.id !== item?.id && !candidate.stats.complete);

  return (
    candidates
      .sort((a, b) => {
        // 1) Wrong answers first (always)
        if (a.wrongCount !== b.wrongCount) return b.wrongCount - a.wrongCount;
        // 2) Interest / travel-purpose score
        if (a.prefScore !== b.prefScore) return b.prefScore - a.prefScore;
        // 3) Same category continuity when prefs do not distinguish
        const sameCategoryA = a.item.category === selectedCategory ? 1 : 0;
        const sameCategoryB = b.item.category === selectedCategory ? 1 : 0;
        if (sameCategoryA !== sameCategoryB) return sameCategoryB - sameCategoryA;
        // 4) In-progress words before never-started
        const answeredA = a.stats.answered > 0 ? 1 : 0;
        const answeredB = b.stats.answered > 0 ? 1 : 0;
        if (answeredA !== answeredB) return answeredB - answeredA;
        // 5) Stable walk through the deck
        const distanceA = selectedIndex >= 0 ? (a.index - selectedIndex + data.vocabulary.length) % data.vocabulary.length : a.index;
        const distanceB = selectedIndex >= 0 ? (b.index - selectedIndex + data.vocabulary.length) % data.vocabulary.length : b.index;
        return distanceA - distanceB;
      })[0]?.item ?? null
  );
}

function renderLearnerPrefs() {
  if (!learnerPrefsEl) return;
  const purpose = TRAVEL_PURPOSE_OPTIONS.find((option) => option.id === state.prefs.travelPurpose);
  learnerPrefsEl.innerHTML = `
    <div class="prefs-copy">
      <p class="eyebrow">Learner prefs</p>
      <h2>관심사 · 여행 목적</h2>
      <p>선택하면 <strong>다음 어휘 추천</strong>과 오늘의 추천이 맞춰집니다. (오답 복습이 최우선)</p>
      <p class="meta">현재: ${preferenceSummaryLabel()}</p>
    </div>
    <div class="prefs-controls">
      <div class="prefs-group" aria-label="관심사 (복수 선택)">
        <span class="prefs-label">관심사</span>
        <div class="prefs-chips" id="interest-chips">
          ${INTEREST_OPTIONS.filter((option) => !option.hidden)
            .map(
              (option) =>
                `<button type="button" class="pref-chip ${state.prefs.interests.includes(option.id) ? "active" : ""}" data-interest="${option.id}">${option.label}</button>`,
            )
            .join("")}
        </div>
      </div>
      <div class="prefs-group" aria-label="여행 목적">
        <span class="prefs-label">여행 목적</span>
        <div class="prefs-chips" id="purpose-chips">
          ${TRAVEL_PURPOSE_OPTIONS.map(
            (option) =>
              `<button type="button" class="pref-chip ${state.prefs.travelPurpose === option.id ? "active" : ""}" data-purpose="${option.id}">${option.label}</button>`,
          ).join("")}
        </div>
      </div>
    </div>
  `;
}

function selectedItem() {
  return data.vocabulary.find((candidate) => candidate.id === state.selectedId) ?? filteredVocabulary()[0] ?? data.vocabulary[0];
}

function sessionStageFor(item) {
  const activity = activityFor(item);
  const stats = statsForWord(item.word);
  const hasAudioStory = Boolean(activity?.hasAudio && activity.audioUrl);
  if (stats.complete) return "complete";
  if (hasAudioStory && !stats.audioDone) return "listen";
  if (!hasAudioStory && stats.requiresReading && !stats.readingDone) return "listen";
  if (!stats.expressionDone) return "expressions";
  if (stats.requiresDomain && !stats.domainDone) return "domain";
  if (stats.requiresQuotes && !stats.quoteDone) return "quote";
  if (stats.requiresKpop && !stats.kpopDone) return "kpop";
  if (stats.answered < stats.total || stats.correct < stats.total) return "quiz";
  // pending retries also keep the learner on quiz
  const hasPendingRetry = (activityFor(item)?.quizzes ?? []).some((quiz) => progress.answers[quiz.id]?.pendingRetry);
  if (hasPendingRetry) return "quiz";
  return "complete";
}

const sessionSteps = [
  { id: "pick", label: "어휘 선택", target: "#vocab-list" },
  { id: "context", label: "뜻과 미션", target: "#detail" },
  { id: "listen", label: "듣기/읽기", target: "#story-step" },
  { id: "expressions", label: "표현 확인", target: "#expression-step" },
  { id: "domain", label: "K-culture", target: "#domain-step" },
  { id: "quote", label: "명대사 확인", target: "#quote-step" },
  { id: "kpop", label: "K-pop 미션", target: "#kpop-step" },
  { id: "quiz", label: "퀴즈", target: "#quiz-step" },
  { id: "complete", label: "완료", target: "#review-list" },
];

function missionFor(item) {
  return data.missions.find((mission) => item.missionIds.includes(mission.id)) ?? data.missions[0];
}

function tourMatchFor(item) {
  return tourApiMatches.matches.find((match) => match.vocabularyId === item.id);
}

function tourDetailFor(item) {
  return tourApiDetails.details.find((detail) => detail.vocabularyId === item.id);
}

function odiiFor(item) {
  return odiiStories.results.find((result) => result.vocabularyId === item.id);
}

function activityFor(item) {
  return learningActivities.activities.find((activity) => activity.vocabularyId === item.id);
}

/** Deterministic chart track for this vocab word (session K-pop mission). */
function chartMissionFor(item) {
  const chart = melonChart.chart ?? [];
  if (!chart.length || !item) return null;
  return chart[hashString(item.word) % chart.length];
}

/**
 * Quotes matched to vocab via build-time vocabMatches + keywordHints.
 * Falls back to ambient clean quotes so the section is never empty when data exists.
 */
function quotesFor(item) {
  if (!item) return [];
  const allQuotes = klassicQuotes.quotes ?? [];
  const byId = new Map(allQuotes.map((quote) => [String(quote.id), quote]));
  const ranked = (klassicQuotes.vocabMatches?.[item.word] ?? [])
    .filter((match) => (match.score ?? 0) >= 4)
    .map((match) => {
      const quote = byId.get(String(match.quoteId));
      if (!quote) return null;
      return {
        ...quote,
        matchScore: match.score ?? 0,
        matchReasons: match.reasons ?? [],
        matchKind: "keyword",
      };
    })
    .filter(Boolean);

  let list = ranked.filter((quote) => isRatingAllowed(quote.contentRating ?? "clean", state.quoteMaxRating));

  if (!list.length && allQuotes.length) {
    const ambientPool = allQuotes.filter((quote) =>
      isRatingAllowed(quote.contentRating ?? "clean", state.quoteMaxRating),
    );
    if (ambientPool.length) {
      const start = hashString(item.word) % ambientPool.length;
      list = [0, 1]
        .map((offset) => ambientPool[(start + offset) % ambientPool.length])
        .filter(Boolean)
        .map((quote) => ({
          ...quote,
          matchScore: 0,
          matchReasons: ["ambient"],
          matchKind: "ambient",
        }));
    }
  }

  return list.slice(0, 3);
}

function renderQuoteCardsHtml(quotes, word) {
  if (!quotes.length) {
    return `<p class="body-copy">현재 수위 필터(${ratingLabels[state.quoteMaxRating] ?? state.quoteMaxRating})에서 표시할 명대사가 없습니다. 필터를 완화해 보세요.</p>`;
  }
  return `<div class="story-stack">${quotes
    .map((quote) => {
      const rating = quote.contentRating ?? "clean";
      const seen = Boolean(progress.quotes[word]?.seenIds?.includes(String(quote.id)));
      return `<article class="quote-card compact ${seen ? "complete" : ""}" data-quote-id="${quote.id}">
        <div class="tag-row">
          <span class="tag">${quote.name}</span>
          <span class="tag ${rating === "clean" ? "success" : rating === "mild" ? "progress" : "danger"}">${quote.contentRatingLabel ?? ratingLabels[rating]}</span>
          ${quote.matchKind === "keyword" ? `<span class="tag">매칭 ${quote.matchScore}</span>` : `<span class="tag">추천</span>`}
        </div>
        <blockquote>${quote.quote}</blockquote>
        <p class="meta">— ${quote.author}${quote.matchReasons?.length ? ` · ${quote.matchReasons.slice(0, 2).join(", ")}` : ""}</p>
        ${(quote.keywordHints ?? []).length ? `<p class="meta">hints: ${(quote.keywordHints ?? []).slice(0, 6).join(", ")}</p>` : ""}
      </article>`;
    })
    .join("")}</div>`;
}

function searchFieldsFor(item) {
  const roman = romanizeWord(item.word);
  const choseong = Hangul.choseong?.(item.word) ?? "";
  return [
    item.word,
    item.easyKorean,
    item.categoryLabel,
    roman,
    choseong,
    ...(item.books ?? []),
    ...(item.units ?? []),
    ...(item.apiKeywords ?? []),
    ...(item.sampleSentences ?? []),
  ];
}

function filteredVocabulary() {
  const query = state.query.trim();
  return data.vocabulary.filter((item) => {
    const matchesCategory = state.category === "all" || item.category === state.category;
    const matchesQuery = !query || matchesSearch(searchFieldsFor(item), query);
    return matchesCategory && matchesQuery;
  });
}

function renderSearchHint() {
  if (!searchHintEl) return;
  const query = state.query.trim();
  if (!query) {
    searchHintEl.textContent = Hangul.matchesHangulSearch
      ? "한글 · 로마자 · 초성 · 영타(rlacl→김치) 검색 지원"
      : "";
    return;
  }

  const parts = [];
  const asHangul = Hangul.qwertyToHangul?.(query) || Hangul.convertQwertyToHangul?.(query) || "";
  if (asHangul && asHangul !== query) parts.push(`영타 변환: ${asHangul}`);
  if (/^[ㄱ-ㅎ]+$/.test(query)) parts.push(`초성 검색: ${query}`);
  if (/^[a-zA-Z\s'-]+$/.test(query)) parts.push(`로마자 검색: ${query.toLowerCase()}`);
  const count = filteredVocabulary().length;
  parts.push(`${count}개 결과`);
  searchHintEl.textContent = parts.join(" · ");
}

function renderFilters() {
  filtersEl.innerHTML = "";
  for (const category of categoryOrder) {
    const count = category === "all" ? data.vocabulary.length : data.vocabulary.filter((item) => item.category === category).length;
    if (count === 0) continue;

    const button = document.createElement("button");
    button.type = "button";
    button.className = category === state.category ? "active" : "";
    button.textContent = `${categoryLabels[category]} ${count}`;
    button.addEventListener("click", () => {
      state.category = category;
      render();
    });
    filtersEl.append(button);
  }
}

function renderList() {
  const items = filteredVocabulary();
  resultCountEl.textContent = `${items.length}개 표시 중`;
  listEl.innerHTML = "";

  for (const item of items) {
    const mission = missionFor(item);
    const wordStats = statsForWord(item.word);
    const card = document.createElement("button");
    card.type = "button";
    card.className = `vocab-card ${item.id === state.selectedId ? "selected" : ""} ${wordStats.complete ? "complete" : ""}`;
    const roman = romanizeWord(item.word);
    card.innerHTML = `
      <div class="tag-row">
        <span class="tag">${item.categoryLabel}</span>
        <span class="tag">${item.books.join(", ")}</span>
        ${
          wordStats.complete
            ? `<span class="tag success">완료</span>`
            : wordStats.answered
              ? `<span class="tag progress">${wordStats.correct}/${wordStats.total}${wordStats.requiresAudio ? ` · 듣기 ${wordStats.audioDone ? "완료" : "필요"}` : ""}</span>`
              : ""
        }
      </div>
      <h3 class="word">${item.word}</h3>
      ${roman ? `<p class="romanization">${roman}</p>` : ""}
      <p class="body-copy">${item.easyKorean}</p>
      <p class="meta">${mission.title}</p>
    `;
    card.addEventListener("click", () => {
      state.selectedId = item.id;
      render();
    });
    listEl.append(card);
  }

  if (!items.some((item) => item.id === state.selectedId) && items[0]) {
    state.selectedId = items[0].id;
  }
}

function renderDetail() {
  const item = selectedItem();
  if (!item) {
    detailEl.innerHTML = "<p>표시할 어휘가 없습니다.</p>";
    return;
  }

  const mission = missionFor(item);
  const tourMatch = tourMatchFor(item);
  const tourDetail = tourDetailFor(item);
  const odii = odiiFor(item);
  const activity = activityFor(item);
  const places = tourMatch?.places ?? [];
  const representative = tourDetail?.place;
  const heroImage = representative?.firstImage || tourDetail?.images?.[0]?.originUrl || "";
  const wordStats = statsForWord(item.word);
  const firstQuiz = activity?.quizzes?.[0];
  const stage = sessionStageFor(item);
  const nextItem = nextRecommendedItem(item);
  const hasAudioStory = Boolean(activity?.hasAudio && activity.audioUrl);
  const readingSource = representative?.overview || activity?.storySnippet || mission.localTip || item.easyKorean;
  const nextReason = explainRecommendation(item, nextItem);
  const roman = romanizeWord(item.word);
  const particleMissions = missionLinesFor(item.word);
  const matchedQuotes = quotesFor(item);
  const kpopTrack = chartMissionFor(item);
  const domainMission = domainMissionFor(item);
  const kpopDone = Boolean(progress.kpop[item.word]?.completed);
  const domainDone = Boolean(progress.domains[item.word]?.completed);
  detailEl.innerHTML = `
    <div class="detail-hero">
      <div class="tag-row">
        <span class="tag">${item.categoryLabel}</span>
        <span class="tag">페이지 ${item.pages.join(", ") || "미정"}</span>
        ${domainMission ? `<span class="tag">${domainMission.emoji ?? ""} ${domainMission.domainLabel}</span>` : ""}
        ${
          wordStats.complete
            ? `<span class="tag success">학습 완료</span>`
            : `<span class="tag progress">퀴즈 ${wordStats.answered}/${wordStats.total}${wordStats.requiresAudio ? ` · 듣기 ${wordStats.audioDone ? "완료" : "필요"}` : ""}${wordStats.requiresDomain ? ` · K-culture ${wordStats.domainDone ? "완료" : "필요"}` : ""}${wordStats.requiresQuotes ? ` · 명대사 ${wordStats.quoteDone ? "완료" : "필요"}` : ""}${wordStats.requiresKpop ? ` · K-pop ${wordStats.kpopDone ? "완료" : "필요"}` : ""}</span>`
        }
      </div>
      <h3>${item.word}</h3>
      ${roman ? `<p class="romanization" title="hangul-romanization / es-hangul">${roman}</p>` : ""}
      <p class="body-copy">${item.easyKorean}</p>
      <p class="session-hint">${stage === "complete" ? "이 어휘 루프를 완료했습니다. 복습 카드에서 다음 어휘로 이어갈 수 있어요." : `현재 단계: ${sessionSteps.find((step) => step.id === stage)?.label ?? "학습"}`}</p>
      <div class="cta-row">
        <button type="button" class="primary-action" data-session-action="${stage}">${stage === "complete" ? "복습으로 이동" : `${hasAudioStory || stage !== "listen" ? sessionSteps.find((step) => step.id === stage)?.label ?? "학습" : "읽기"} 시작`}</button>
        ${stage === "complete" && nextItem ? `<button type="button" class="primary-action" data-next-word="${nextItem.word}">다음 어휘: ${nextItem.word}</button><span class="cta-note">${nextReason}</span>` : ""}
        ${odii?.stories?.some((story) => story.audioUrl) ? `<button type="button" data-open-detail="story-step">듣기 열기</button>` : ""}
        ${domainMission ? `<button type="button" data-open-detail="domain-step">${domainMission.domainLabel} 미션</button>` : ""}
        ${kpopTrack ? `<button type="button" data-open-detail="kpop-step">K-pop 미션</button>` : ""}
        ${matchedQuotes.length ? `<button type="button" data-open-detail="quote-step">명대사</button>` : ""}
        ${firstQuiz ? `<button type="button" data-open-detail="quiz-step">퀴즈 풀기</button>` : ""}
        ${representative ? `<button type="button" data-open-detail="place-step">장소 보기</button>` : ""}
        <button type="button" class="danger-action" data-reset-word="${item.word}">이 어휘 진도만 초기화</button>
      </div>
    </div>

    <details class="detail-block" open>
      <summary>1. 뜻과 예문</summary>
      <h4>단원</h4>
      <ul class="plain-list">
        ${item.sourceRows.map((row) => `<li>${row.book} ${row.unitNo} · ${row.unitName}</li>`).join("")}
      </ul>
      <h4>예문</h4>
      <ul class="phrase-list">
        ${item.sampleSentences.map((sentence) => `<li>${sentence}</li>`).join("")}
      </ul>
    </details>

    <details class="detail-block" open>
      <summary>2. 현장 미션</summary>
      <h4>${mission.title}</h4>
      <p class="meta">어휘 맞춤 문장 (조사 자동: es-hangul josa · hangul-postposition)</p>
      <ul class="phrase-list mission-phrase-list">
        ${particleMissions.map((phrase) => `<li><strong>${item.word}</strong> → ${phrase}</li>`).join("")}
      </ul>
      <h4>상황 표현</h4>
      <ul class="phrase-list">
        ${mission.phrases.map((phrase) => `<li>${phrase}</li>`).join("")}
      </ul>
      <div class="signal">${mission.localTip}</div>
      <div class="signal risk">${mission.riskSignal}</div>
    </details>

    ${
      representative
        ? `<details class="detail-block representative" id="place-step">
            <summary>3. 대표 장소</summary>
            ${heroImage ? `<img src="${heroImage}" alt="">` : ""}
            <h4>대표 장소 · ${representative.title}</h4>
            <p class="body-copy">${representative.contentTypeLabel} · ${representative.address || "주소 정보 없음"}</p>
            ${representative.overview ? `<p class="overview">${representative.overview.slice(0, 420)}${representative.overview.length > 420 ? "..." : ""}</p>` : ""}
            <p class="meta">선정 방식 ${representative.curationReason} · contentId ${representative.contentId}</p>
          </details>`
        : ""
    }

    <details class="detail-block" id="story-step" ${odii?.stories?.length ? "open" : ""}>
      <summary>4. 문화 이야기 듣기</summary>
      ${
        odii?.stories?.length
          ? `<div class="story-stack">${odii.stories
              .map(
                (story) => `<article class="story-card compact">
                  ${story.imageUrl ? `<img src="${story.imageUrl}" alt="">` : ""}
                  <div>
                    <p class="meta">${story.playTime ? `${story.playTime}초` : "재생시간 미상"} · 검색어 ${story.query} · score ${story.score}</p>
                    <h5>${story.audioTitle || story.title}</h5>
                    ${story.audioUrl ? `<audio controls src="${story.audioUrl}" data-audio-word="${item.word}" data-audio-id="${story.id}"></audio>` : `<p class="meta">오디오 URL 없음 · 대본 학습 카드로 활용</p>`}
                    <p>${story.scriptSnippet}</p>
                  </div>
                </article>`,
              )
              .join("")}</div>`
          : `<p class="body-copy">관련 오디오가이드 이야기가 아직 없습니다. 이 어휘는 장소 설명과 상황 표현 중심으로 학습합니다.</p>`
      }
      ${
        !hasAudioStory
          ? `<div class="reading-card ${wordStats.readingDone ? "complete" : ""}">
              <p class="meta">읽기 단계 · 오디오가 없는 어휘</p>
              <p>${readingSource.slice(0, 360)}${readingSource.length > 360 ? "..." : ""}</p>
              <button type="button" class="${wordStats.readingDone ? "" : "primary-action"}" data-reading-word="${item.word}">
                ${wordStats.readingDone ? "읽기 완료됨" : "읽기 완료했어요"}
              </button>
            </div>`
          : ""
      }
    </details>

    <details class="detail-block" id="expression-step" open>
      <summary>5. 핵심 표현</summary>
      ${
        activity?.expressions?.length
          ? `<ul class="expression-list">${activity.expressions
              .map((expression) => `<li><span>${expression.focus}</span>${expression.text}</li>`)
              .join("")}</ul>
            <button type="button" class="${wordStats.expressionDone ? "" : "primary-action"}" data-expression-word="${item.word}">
              ${wordStats.expressionDone ? "표현 확인 완료" : "표현 확인했어요"}
            </button>`
          : `<p class="body-copy">아직 추출된 핵심 표현이 없습니다.</p>`
      }
    </details>

    <details class="detail-block" id="domain-step" ${domainMission ? "open" : ""}>
      <summary>6. K-culture 미션 (${domainMission ? `${domainMission.emoji ?? ""} ${domainMission.domainLabel}` : "도메인"})</summary>
      ${
        domainMission
          ? `<div class="chart-card inline ${domainDone ? "complete" : ""}">
              <div class="tag-row">
                <span class="tag">${domainMission.domainLabel}</span>
                <span class="tag">${domainMission.domainLabelKo}</span>
                <span class="tag progress">score ${domainMission.score}</span>
              </div>
              <h4>${domainMission.title}</h4>
              <ul class="phrase-list">
                ${(domainMission.phrases ?? []).map((phrase) => `<li>${phrase}</li>`).join("")}
              </ul>
              <div class="signal">${domainMission.tip ?? ""}</div>
              <p class="meta">관심사·카테고리·키워드로 짝지은 K-culture 미션입니다. (${(domainMission.reasons ?? []).join(", ")})</p>
              <button type="button" class="${domainDone ? "" : "primary-action"}" data-domain-word="${item.word}" data-domain-id="${domainMission.domainId}">
                ${domainDone ? "K-culture 미션 완료" : "이 표현으로 말해 봤어요"}
              </button>
              ${
                domainMission.linkPanel
                  ? `<button type="button" data-scroll-panel="${domainMission.linkPanel}">관련 섹션 열기</button>`
                  : ""
              }
            </div>`
          : `<p class="body-copy">도메인 데이터가 없습니다. <code>npm run build:domains</code>를 실행하세요.</p>`
      }
    </details>

    <details class="detail-block" id="quote-step" ${wordStats.requiresQuotes ? "open" : ""}>
      <summary>7. K-movie 명대사 (keywordHints 매칭)</summary>
      <p class="meta">수위 필터: ${ratingLabels[state.quoteMaxRating]} · ${
        matchedQuotes.some((quote) => quote.matchKind === "keyword")
          ? "어휘·keywordHints 직접 매칭"
          : "직접 매칭 없음 → 학습용 추천 대사"
      } · 완료 조건 ${wordStats.requiresQuotes ? (wordStats.quoteDone ? "충족" : "필요") : "해당 없음"}</p>
      ${renderQuoteCardsHtml(matchedQuotes, item.word)}
      ${
        wordStats.requiresQuotes
          ? `<button type="button" class="${wordStats.quoteDone ? "" : "primary-action"}" data-quote-word="${item.word}">
              ${wordStats.quoteDone ? "명대사 확인 완료" : "명대사 확인했어요"}
            </button>`
          : ""
      }
    </details>

    <details class="detail-block" id="kpop-step" ${kpopTrack ? "open" : ""}>
      <summary>8. K-pop 차트 미션</summary>
      ${
        kpopTrack
          ? `<div class="chart-card inline ${kpopDone ? "complete" : ""}">
              <div class="tag-row">
                <span class="tag">#${kpopTrack.ranking}</span>
                <span class="tag">${kpopTrack.artists}</span>
                <span class="tag ${melonChart.source?.status?.startsWith("ok") ? "success" : "progress"}">${melonChart.source?.status ?? "seed"}</span>
              </div>
              <h4>${kpopTrack.mission?.title ?? "차트 표현 말하기"}</h4>
              <p class="body-copy"><strong>${kpopTrack.name}</strong> — ${kpopTrack.artists}</p>
              <ul class="phrase-list">
                ${(kpopTrack.mission?.phrases ?? []).map((phrase) => `<li>${phrase}</li>`).join("")}
              </ul>
              <p class="meta">이 어휘와 짝지은 차트 트랙(해시 배정). 말해 본 뒤 완료를 눌러 주세요.</p>
              <button type="button" class="${kpopDone ? "" : "primary-action"}" data-kpop-word="${item.word}" data-kpop-track="${kpopTrack.ranking}">
                ${kpopDone ? "K-pop 미션 완료" : "이 표현으로 말해 봤어요"}
              </button>
            </div>`
          : `<p class="body-copy">차트 데이터가 없습니다. <code>npm run fetch:melon</code>으로 실차트를 받아 오세요.</p>`
      }
    </details>

    <details class="detail-block" id="quiz-step" open>
      <summary>9. 듣기 확인 퀴즈</summary>
      ${
        activity?.quizzes?.length
          ? activity.quizzes
              .map((quiz) => renderQuizHtml(quiz, item.word))
              .join("")
          : `<p class="body-copy">아직 생성된 퀴즈가 없습니다.</p>`
      }
    </details>

    <details class="detail-block">
      <summary>API 검색 키워드</summary>
      <ul class="plain-list">
        ${item.apiKeywords.map((keyword) => `<li>${keyword}</li>`).join("")}
      </ul>
    </details>

    <details class="detail-block">
      <summary>관광정보 매칭 장소</summary>
      ${
        places.length
          ? `<ul class="plain-list">${places
              .map(
                (place) =>
                  `<li><strong>${place.title}</strong><br>${place.contentTypeLabel} · ${place.address || "주소 정보 없음"}<br>검색어 ${place.searchKeyword} · contentId ${place.contentId}</li>`,
              )
              .join("")}</ul>`
          : `<p class="body-copy">아직 매칭된 장소가 없습니다. TOUR_API_KEY로 매칭 스크립트를 실행하면 여기에 표시됩니다.</p>`
      }
    </details>
  `;
}

function renderNudge() {
  const stats = overallStats();
  const current = selectedItem();
  const item = nextLearningItem();
  const activity = item ? activityFor(item) : null;
  const wordStats = item ? statsForWord(item.word) : null;
  if (!item || !activity || !wordStats) {
    todayNudgeEl.innerHTML = "";
    return;
  }

  const stage = sessionStageFor(item);
  const actionLabel = {
    listen: wordStats.requiresAudio ? "듣기부터 시작" : "읽기부터 시작",
    expressions: "표현 확인하기",
    domain: "K-culture 미션",
    quote: "명대사 확인하기",
    kpop: "K-pop 미션 하기",
    quiz: "퀴즈 이어 풀기",
    complete: "다음 어휘 시작",
  }[stage] ?? "학습 시작";
  const why = explainRecommendation(current, item);
  const prefHint = hasActivePreferences()
    ? `맞춤: ${preferenceSummaryLabel()}`
    : "관심사·여행 목적을 고르면 추천이 바뀝니다.";
  todayNudgeEl.innerHTML = `
    <div>
      <p class="eyebrow">Today · ${prefHint}</p>
      <h2>${item.word}</h2>
      <p>${stats.review ? `복습 ${stats.review}개가 남아 있습니다.` : "짧게 한 장만 끝내도 진도가 저장됩니다."} 지금은 <strong>${item.categoryLabel}</strong> 어휘에 집중해 보세요. <span class="cta-note">${why}</span></p>
    </div>
    <div class="nudge-actions">
      <button type="button" class="primary-action" data-nudge-action="start">${actionLabel}</button>
      <button type="button" data-nudge-action="review">복습 카드 보기</button>
    </div>
  `;
}

function renderSessionFlow() {
  const item = selectedItem();
  if (!item) {
    sessionFlowEl.innerHTML = "";
    return;
  }

  const stats = statsForWord(item.word);
  const currentStage = sessionStageFor(item);
  const currentIndex = sessionSteps.findIndex((step) => step.id === currentStage);
  sessionFlowEl.innerHTML = `
    <div>
      <p class="eyebrow">First Session Flow</p>
      <h2>${item.word} 한 장 끝내기</h2>
      <p>${stats.complete ? "완료된 어휘입니다. 다음에는 오답 복습이나 새 어휘를 이어가세요." : "뜻 → 듣기/읽기 → 표현 → K-culture → 명대사 → K-pop → 퀴즈 순으로 한 장을 마칩니다."}</p>
    </div>
    <ol class="flow-steps">
      ${sessionSteps
        .map((step, index) => {
          const done = step.id === "pick" || step.id === "context" || index < currentIndex || currentStage === "complete";
          const current = step.id === currentStage;
          return `<li class="${done ? "done" : ""} ${current ? "current" : ""}">
            <button type="button" data-flow-target="${step.target}" data-flow-step="${step.id}">
              <span>${index + 1}</span>${step.label}
            </button>
          </li>`;
        })
        .join("")}
    </ol>
  `;
}

function renderTargets() {
  const summary = tourApiMatches.summary ?? {};
  apiStatusEl.innerHTML = `
    <div>
      <strong>${tourApiMatches.hasApiKey ? "API 키 감지됨" : "API 키 없음"}</strong>
      <span>실행 상태</span>
    </div>
    <div>
      <strong>${summary.matchedTargets ?? 0}/${summary.targets ?? 0}</strong>
      <span>어휘 매칭</span>
    </div>
    <div>
      <strong>${summary.publicPlaces ?? 0}</strong>
      <span>장소 후보</span>
    </div>
    <div>
      <strong>${tourApiDetails.summary?.detailedPlaces ?? 0}</strong>
      <span>상세 장소</span>
    </div>
    <div>
      <strong>${odiiStories.summary?.matchedTargets ?? 0}/${odiiStories.summary?.targets ?? 0}</strong>
      <span>오디오 매칭</span>
    </div>
    <div>
      <strong>${odiiStories.summary?.storiesWithAudio ?? 0}</strong>
      <span>재생 가능</span>
    </div>
    <div>
      <strong>${overallStats().audioCompleted}</strong>
      <span>듣기 완료</span>
    </div>
    <div>
      <strong>${learningActivities.summary?.quizzes ?? 0}</strong>
      <span>퀴즈</span>
    </div>
    <div>
      <strong>${overallStats().accuracy}%</strong>
      <span>정답률</span>
    </div>
    <div>
      <strong>${summary.errors ?? 0}</strong>
      <span>오류</span>
    </div>
  `;

  targetsEl.innerHTML = "";
  for (const target of data.apiTestTargets) {
    const vocabulary = data.vocabulary.find((item) => item.word === target.word);
    const match = vocabulary ? tourMatchFor(vocabulary) : null;
    const detail = vocabulary ? tourDetailFor(vocabulary) : null;
    const odii = vocabulary ? odiiFor(vocabulary) : null;
    const activity = vocabulary ? activityFor(vocabulary) : null;
    const matchText = match?.places?.length ? `${match.places.length}개 장소` : match?.status ?? "대기";
    const card = document.createElement("article");
    card.className = "target-card";
    card.innerHTML = `
      <h3>${target.word}</h3>
      <p><strong>매칭 상태</strong>: ${matchText}</p>
      <p><strong>대표 장소</strong>: ${detail?.place?.title ?? "상세 수집 전"}</p>
      <p><strong>오디오 이야기</strong>: ${odii?.stories?.length ? `${odii.stories.length}개` : odii?.status ?? "대기"}</p>
      <p><strong>학습 활동</strong>: 표현 ${activity?.expressions?.length ?? 0}개 · 퀴즈 ${activity?.quizzes?.length ?? 0}개</p>
      <p><strong>국문 관광정보</strong>: ${target.korTourApi.expectedUse}</p>
      <p><strong>오디오 가이드</strong>: ${target.odiiApi.expectedUse}</p>
      <p><strong>관광빅데이터</strong>: ${target.bigDataApi.expectedUse}</p>
      <p><strong>두루누비</strong>: ${target.durunubiApi.expectedUse}</p>
    `;
    targetsEl.append(card);
  }
}

function renderQuizHtml(quiz, word) {
  const saved = progress.answers[quiz.id];
  const isPending = Boolean(saved?.pendingRetry);
  const isSettled = Boolean(saved && !isPending);
  const answeredClass = isSettled ? (saved.correct ? "answered-correct" : "answered-incorrect") : isPending ? "retry-pending" : "";
  return `
    <article class="quiz-card ${answeredClass}" data-quiz-id="${quiz.id}" data-word="${word}" data-answer="${quiz.answer}" data-explanation="${quiz.explanation}">
      <p class="meta">${word} · ${quiz.type === "cloze" ? "빈칸" : "선택"}${isPending ? " · 다시 풀기" : ""}</p>
      <h5>${quiz.prompt}</h5>
      <p>${quiz.passage}</p>
      <div class="quiz-options">
        ${quiz.options
          .map((option) => {
            const isCorrect = isSettled && option === quiz.answer;
            const isWrongSelection = isSettled && saved.selected === option && !saved.correct;
            const className = isCorrect ? "correct" : isWrongSelection ? "incorrect" : "";
            return `<button type="button" class="${className}" data-option="${option}">${option}</button>`;
          })
          .join("")}
      </div>
      <p class="quiz-feedback" ${isSettled ? "" : "hidden"}>${
        isSettled ? `${saved.correct ? "정답입니다." : `정답은 ${quiz.answer}입니다.`} ${quiz.explanation}` : quiz.explanation
      }</p>
    </article>
  `;
}

function renderStories() {
  const stories = odiiStories.results.flatMap((result) =>
    result.stories.map((story) => ({
      ...story,
      word: result.word,
    })),
  );
  storyListEl.innerHTML = "";

  if (!stories.length) {
    storyListEl.innerHTML = `
      <p class="empty-state">아직 매칭된 오디오가이드 이야기가 없습니다. <code>node scripts/tourapi-build-odii.mjs</code>를 실행하면 이 영역이 채워집니다.</p>
    `;
    return;
  }

  for (const story of stories) {
    const card = document.createElement("article");
    card.className = "story-card";
    card.innerHTML = `
      ${story.imageUrl ? `<img src="${story.imageUrl}" alt="">` : `<div class="image-placeholder">이미지 없음</div>`}
      <div>
        <div class="tag-row">
          <span class="tag">${story.word}</span>
          <span class="tag">${story.audioUrl ? "오디오" : "대본"}</span>
        </div>
        <h3>${story.audioTitle || story.title}</h3>
        ${story.audioUrl ? `<audio controls src="${story.audioUrl}" data-audio-word="${story.word}" data-audio-id="${story.id}"></audio>` : ""}
        <p>${story.scriptSnippet}</p>
        <p class="meta">${story.playTime ? `${story.playTime}초` : "재생시간 미상"} · 검색어 ${story.query} · score ${story.score}</p>
      </div>
    `;
    storyListEl.append(card);
  }
}

function renderActivities() {
  activityListEl.innerHTML = "";

  if (!learningActivities.activities.length) {
    activityListEl.innerHTML = `
      <p class="empty-state">아직 생성된 학습 활동이 없습니다. <code>node scripts/build-learning-activities.mjs</code>를 실행하면 이 영역이 채워집니다.</p>
    `;
    return;
  }

  for (const activity of learningActivities.activities) {
    const card = document.createElement("article");
    card.className = "activity-card";
    card.innerHTML = `
      <div class="tag-row">
        <span class="tag">${activity.word}</span>
        <span class="tag">${activity.hasAudio ? "오디오 기반" : "대본/장소 기반"}</span>
        ${statsForWord(activity.word).complete ? `<span class="tag success">완료</span>` : ""}
        ${activity.hasAudio ? `<span class="tag ${progress.audio[activity.word]?.completed ? "success" : "progress"}">듣기 ${progress.audio[activity.word]?.completed ? "완료" : "대기"}</span>` : ""}
      </div>
      <h3>${activity.storyTitle || "장소 설명 기반 학습"}</h3>
      <ul class="expression-list">
        ${activity.expressions.map((expression) => `<li><span>${expression.focus}</span>${expression.text}</li>`).join("")}
      </ul>
      ${activity.quizzes.map((quiz) => renderQuizHtml(quiz, activity.word)).join("")}
    `;
    activityListEl.append(card);
  }
}

/** Clear quiz answer so the learner can retry (keeps wrongCount for ranking). */
function prepareQuizRetry(quizId) {
  const previous = progress.answers[quizId];
  if (!previous) return;
  progress.answers[quizId] = {
    selected: "",
    correct: false,
    word: previous.word,
    wrongCount: previous.wrongCount ?? 0,
    retriedAt: new Date().toISOString(),
    pendingRetry: true,
  };
}

/** Reset all progress keys for one vocabulary word. */
function clearWordProgress(word) {
  for (const quiz of allQuizzes().filter((quiz) => quiz.word === word)) {
    delete progress.answers[quiz.id];
  }
  delete progress.audio[word];
  delete progress.expressions[word];
  delete progress.reading[word];
  delete progress.kpop[word];
  delete progress.quotes[word];
  delete progress.domains[word];
}

function emptyProgress() {
  return { answers: {}, audio: {}, expressions: {}, reading: {}, kpop: {}, quotes: {}, domains: {} };
}

function renderReview() {
  const stats = overallStats();
  accuracyRateEl.textContent = `${stats.accuracy}%`;
  reviewCountEl.textContent = stats.review;
  badgeCountEl.textContent = stats.completed;

  const quizzes = allQuizzes();
  const reviewItems = quizzes
    .filter((quiz) => {
      const answer = progress.answers[quiz.id];
      return !answer || !answer.correct || answer.pendingRetry;
    })
    .sort((a, b) => {
      const wrongA = progress.answers[a.id]?.wrongCount ?? 0;
      const wrongB = progress.answers[b.id]?.wrongCount ?? 0;
      if (wrongA !== wrongB) return wrongB - wrongA;
      const answeredA = progress.answers[a.id] && !progress.answers[a.id].pendingRetry ? 1 : 0;
      const answeredB = progress.answers[b.id] && !progress.answers[b.id].pendingRetry ? 1 : 0;
      return answeredB - answeredA;
    });
  const completed = learningActivities.activities.filter((activity) => statsForWord(activity.word).complete);

  reviewListEl.innerHTML = "";

  if (completed.length) {
    const badges = document.createElement("article");
    badges.className = "review-card badges";
    badges.innerHTML = `
      <h3>완료 배지</h3>
      <div class="badge-row">
        ${completed.map((activity) => `<span class="badge" title="클릭하면 해당 어휘로 이동" data-review-word="${activity.word}">${activity.word}</span>`).join("")}
      </div>
      <p class="meta">배지를 누르면 해당 어휘 상세로 이동합니다.</p>
    `;
    reviewListEl.append(badges);
  }

  if (!reviewItems.length) {
    const empty = document.createElement("article");
    empty.className = "review-card";
    empty.innerHTML = `<h3>복습할 퀴즈가 없습니다</h3><p>현재 생성된 퀴즈를 모두 맞혔습니다.</p>`;
    reviewListEl.append(empty);
    return;
  }

  for (const quiz of reviewItems) {
    const answer = progress.answers[quiz.id];
    const card = document.createElement("article");
    card.className = "review-card";
    const statusLabel = answer?.pendingRetry ? "다시 풀기" : answer ? "오답 복습" : "미풀이";
    card.innerHTML = `
      <div class="tag-row">
        <span class="tag">${quiz.word}</span>
        <span class="tag ${answer && !answer.pendingRetry ? "danger" : "progress"}">${statusLabel}</span>
        ${(answer?.wrongCount ?? 0) ? `<span class="tag danger">오답 ${answer.wrongCount}회</span>` : ""}
      </div>
      <h3>${quiz.prompt}</h3>
      <p>${quiz.passage}</p>
      <div class="cta-row">
        <button type="button" class="primary-action" data-retry-quiz="${quiz.id}" data-review-word="${quiz.word}">다시 풀기</button>
        <button type="button" data-review-word="${quiz.word}">어휘로 이동</button>
        <button type="button" class="danger-action" data-reset-word="${quiz.word}">이 어휘 진도 초기화</button>
      </div>
    `;
    reviewListEl.append(card);
  }
}

function renderProgressSurfaces() {
  renderNowTrending();
  renderLearnerPrefs();
  renderNudge();
  renderSessionFlow();
  renderFilters();
  renderList();
  renderDetail();
  renderTargets();
  renderActivities();
  renderReview();
  renderQuotes();
  renderChart();
  renderDomains();
}

function interestIdForDomain(domainId) {
  const map = {
    "k-pop": "k-pop",
    "k-movie": "k-movie",
    "k-drama": "k-drama",
    "k-food": "k-food",
    "k-beauty": "k-beauty",
    "k-fashion": "k-fashion",
    "k-webtoon": "k-webtoon",
    "k-game": "k-game",
  };
  return map[domainId] ?? null;
}

function renderNowTrending() {
  if (!nowTrendingEl) return;
  const spotlights = kcultureDomains.spotlights ?? [];
  if (!spotlights.length) {
    nowTrendingEl.innerHTML = "";
    return;
  }

  nowTrendingEl.innerHTML = `
    <div class="trending-hero">
      <div class="trending-copy">
        <p class="hot-badge pulse">🔥 NOW TRENDING</p>
        <h2>지금 세계가 보는 한국</h2>
        <p>BTS · BLACKPINK · 오징어게임 · 기생충을 <strong>맨 위</strong>에서 고르고, 관심사로 저장한 뒤 어휘 미션으로 이어가세요.</p>
      </div>
      <div class="trending-rail" role="list">
        ${spotlights
          .map(
            (spot, index) => `
          <button type="button" class="trending-card" role="listitem" data-spotlight-id="${spot.id}" data-spotlight-domain="${spot.domainId ?? ""}">
            <span class="trending-rank">#${index + 1}</span>
            <span class="trending-title">${spot.title}</span>
            <span class="trending-sub">${spot.subtitle ?? ""}</span>
            <span class="trending-cta">관심사로 고르기 →</span>
          </button>`,
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderDomains() {
  if (!domainListEl) return;
  domainListEl.innerHTML = "";
  const domains = kcultureDomains.domains ?? [];
  const spotlights = kcultureDomains.spotlights ?? [];
  if (!domains.length) {
    domainListEl.innerHTML = `<p class="empty-state">도메인 데이터가 없습니다. <code>npm run build:domains</code></p>`;
    return;
  }

  if (domainFilterEl) {
    domainFilterEl.innerHTML = `
      <button type="button" class="pref-chip hot-chip ${state.domainFilter === "spotlight" ? "active" : ""}" data-domain-filter="spotlight">🔥 최신 글로벌</button>
      <button type="button" class="pref-chip ${state.domainFilter === "all" ? "active" : ""}" data-domain-filter="all">전체 도메인</button>
      ${domains
        .map(
          (domain) =>
            `<button type="button" class="pref-chip ${state.domainFilter === domain.id ? "active" : ""}" data-domain-filter="${domain.id}">${domain.emoji ?? ""} ${domain.label}</button>`,
        )
        .join("")}
    `;
  }

  const intro = document.createElement("p");
  intro.className = "meta";
  intro.textContent =
    state.domainFilter === "spotlight"
      ? `최신 글로벌 히트 ${spotlights.length}개 · 카드 클릭 시 관심사에 반영됩니다`
      : `K-culture 도메인 ${domains.length}개 · 글로벌 히트 ${spotlights.length}개 · 어휘 매칭 ${kcultureDomains.summary?.vocabWithMatches ?? 0}개`;
  domainListEl.append(intro);

  const showSpotlights = state.domainFilter === "all" || state.domainFilter === "spotlight";
  if (showSpotlights && spotlights.length) {
    // Spotlights first, larger cards
    for (const spot of spotlights) {
      if (state.domainFilter !== "all" && state.domainFilter !== "spotlight" && state.domainFilter !== spot.domainId) {
        continue;
      }
      const card = document.createElement("article");
      card.className = "chart-card domain-card spotlight-card featured-spotlight";
      card.innerHTML = `
        <div class="tag-row">
          <span class="tag hot-tag">HOT</span>
          <span class="tag success">최신 글로벌</span>
          ${(spot.tags ?? []).map((tag) => `<span class="tag">${tag}</span>`).join("")}
        </div>
        <h3>${spot.title}</h3>
        <p class="meta spotlight-sub">${spot.subtitle ?? ""}</p>
        <p class="body-copy">${spot.blurb ?? ""}</p>
        <ul class="phrase-list">
          ${(spot.phrases ?? []).map((phrase) => `<li>${phrase}</li>`).join("")}
        </ul>
        <button type="button" class="primary-action" data-spotlight-id="${spot.id}" data-spotlight-domain="${spot.domainId ?? ""}">이 히트로 관심사 설정</button>
      `;
      domainListEl.append(card);
    }
  }

  if (state.domainFilter === "spotlight") {
    renderNowTrending();
    return;
  }

  // Featured domain items with spotlight metadata next, then the rest
  const visible = domains.filter((domain) => state.domainFilter === "all" || domain.id === state.domainFilter);
  const featuredItems = [];
  const regularItems = [];
  for (const domain of visible) {
    for (const item of domain.items ?? []) {
      const row = { domain, item };
      if (item.spotlight) featuredItems.push(row);
      else regularItems.push(row);
    }
  }

  for (const { domain, item } of [...featuredItems, ...regularItems]) {
    const card = document.createElement("article");
    card.className = `chart-card domain-card ${item.spotlight ? "spotlight-card" : ""}`;
    const spotlightLabel = item.spotlight?.title ? `<span class="tag hot-tag">${item.spotlight.title}</span>` : "";
    card.innerHTML = `
      <div class="tag-row">
        <span class="tag">${domain.emoji ?? ""} ${domain.label}</span>
        <span class="tag">${domain.labelKo}</span>
        ${spotlightLabel}
      </div>
      <h3>${item.title}</h3>
      <p class="body-copy">${domain.blurb}</p>
      <ul class="phrase-list">
        ${(item.phrases ?? []).slice(0, 5).map((phrase) => `<li>${phrase}</li>`).join("")}
      </ul>
      <p class="meta">keywords: ${(item.keywords ?? []).slice(0, 6).join(", ")}</p>
      <div class="signal">${item.tip ?? ""}</div>
    `;
    domainListEl.append(card);
  }
  renderNowTrending();
}

document.addEventListener("click", (event) => {
  const interestChip = event.target.closest("[data-interest]");
  if (interestChip) {
    const id = interestChip.dataset.interest;
    const set = new Set(state.prefs.interests);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    state.prefs.interests = [...set];
    savePrefs();
    renderProgressSurfaces();
    return;
  }

  const purposeChip = event.target.closest("[data-purpose]");
  if (purposeChip) {
    state.prefs.travelPurpose = purposeChip.dataset.purpose || "any";
    savePrefs();
    renderProgressSurfaces();
    return;
  }

  if (event.target.closest("#reset-progress")) {
    const confirmed = window.confirm("학습 기록을 모두 초기화할까요? (모든 어휘의 퀴즈·듣기·명대사·K-pop 진도가 삭제됩니다)");
    if (!confirmed) return;
    progress = emptyProgress();
    saveProgress();
    renderProgressSurfaces();
    return;
  }

  const retryButton = event.target.closest("[data-retry-quiz]");
  if (retryButton) {
    const quizId = retryButton.dataset.retryQuiz;
    const word = retryButton.dataset.reviewWord;
    if (quizId) prepareQuizRetry(quizId);
    const item = data.vocabulary.find((candidate) => candidate.word === word);
    if (item) state.selectedId = item.id;
    saveProgress();
    renderProgressSurfaces();
    const quizStep = document.querySelector("#quiz-step");
    if (quizStep) quizStep.open = true;
    const targetCard = document.querySelector(`.quiz-card[data-quiz-id="${quizId}"]`);
    (targetCard ?? quizStep ?? detailEl).scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const resetWordButton = event.target.closest("[data-reset-word]");
  if (resetWordButton) {
    const word = resetWordButton.dataset.resetWord;
    if (!word) return;
    const confirmed = window.confirm(`「${word}」 학습 진도만 초기화할까요?`);
    if (!confirmed) return;
    clearWordProgress(word);
    const item = data.vocabulary.find((candidate) => candidate.word === word);
    if (item) state.selectedId = item.id;
    saveProgress();
    renderProgressSurfaces();
    detailEl.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const reviewButton = event.target.closest("[data-review-word]");
  if (reviewButton) {
    // Prefer retry handler when both attributes exist (already handled above).
    if (reviewButton.dataset.retryQuiz) return;
    const word = reviewButton.dataset.reviewWord;
    const item = data.vocabulary.find((candidate) => candidate.word === word);
    if (item) {
      state.selectedId = item.id;
      render();
      detailEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return;
  }

  const expressionButton = event.target.closest("[data-expression-word]");
  if (expressionButton) {
    const word = expressionButton.dataset.expressionWord;
    progress.expressions[word] = {
      checked: true,
      checkedAt: new Date().toISOString(),
    };
    saveProgress();
    renderProgressSurfaces();
    const nextTarget = hasDomainDataset()
      ? document.querySelector("#domain-step")
      : hasQuoteDataset()
        ? document.querySelector("#quote-step")
        : hasKpopChart()
          ? document.querySelector("#kpop-step")
          : document.querySelector("#quiz-step");
    if (nextTarget) nextTarget.open = true;
    nextTarget?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const domainButton = event.target.closest("[data-domain-word]");
  if (domainButton) {
    const word = domainButton.dataset.domainWord;
    progress.domains[word] = {
      completed: true,
      domainId: domainButton.dataset.domainId ?? "",
      completedAt: new Date().toISOString(),
    };
    saveProgress();
    renderProgressSurfaces();
    const nextTarget = hasQuoteDataset()
      ? document.querySelector("#quote-step")
      : hasKpopChart()
        ? document.querySelector("#kpop-step")
        : document.querySelector("#quiz-step");
    if (nextTarget) nextTarget.open = true;
    nextTarget?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const scrollPanel = event.target.closest("[data-scroll-panel]");
  if (scrollPanel) {
    const id = scrollPanel.dataset.scrollPanel;
    const panel = document.getElementById(id)?.closest("details") ?? document.getElementById(id);
    if (panel) {
      if ("open" in panel) panel.open = true;
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return;
  }

  const domainFilterBtn = event.target.closest("[data-domain-filter]");
  if (domainFilterBtn) {
    state.domainFilter = domainFilterBtn.dataset.domainFilter || "spotlight";
    renderDomains();
    document.getElementById("kculture-spotlight-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const spotlightBtn = event.target.closest("[data-spotlight-domain]");
  if (spotlightBtn) {
    const domainId = spotlightBtn.dataset.spotlightDomain;
    const interestId = interestIdForDomain(domainId);
    if (interestId && !state.prefs.interests.includes(interestId)) {
      state.prefs.interests = [...state.prefs.interests, interestId];
      savePrefs();
    }
    state.domainFilter = domainId || "spotlight";
    renderProgressSurfaces();
    document.getElementById("kculture-spotlight-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const kpopButton = event.target.closest("[data-kpop-word]");
  if (kpopButton) {
    const word = kpopButton.dataset.kpopWord;
    progress.kpop[word] = {
      completed: true,
      trackRanking: kpopButton.dataset.kpopTrack ?? "",
      completedAt: new Date().toISOString(),
    };
    saveProgress();
    renderProgressSurfaces();
    const quizStep = document.querySelector("#quiz-step");
    if (quizStep) quizStep.open = true;
    quizStep?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const quoteDoneButton = event.target.closest("[data-quote-word]");
  if (quoteDoneButton) {
    const word = quoteDoneButton.dataset.quoteWord;
    const related = quotesFor(data.vocabulary.find((item) => item.word === word) ?? { word });
    progress.quotes[word] = {
      completed: true,
      seenIds: related.map((quote) => String(quote.id)),
      completedAt: new Date().toISOString(),
    };
    saveProgress();
    renderProgressSurfaces();
    const nextTarget = hasKpopChart()
      ? document.querySelector("#kpop-step")
      : document.querySelector("#quiz-step");
    if (nextTarget) nextTarget.open = true;
    nextTarget?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const readingButton = event.target.closest("[data-reading-word]");
  if (readingButton) {
    const word = readingButton.dataset.readingWord;
    progress.reading[word] = {
      completed: true,
      completedAt: new Date().toISOString(),
    };
    saveProgress();
    renderProgressSurfaces();
    document.querySelector("#expression-step")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const nextWordButton = event.target.closest("[data-next-word]");
  if (nextWordButton) {
    const item = data.vocabulary.find((candidate) => candidate.word === nextWordButton.dataset.nextWord);
    if (item) {
      state.selectedId = item.id;
      renderProgressSurfaces();
      detailEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return;
  }

  const flowButton = event.target.closest("[data-flow-target]");
  if (flowButton) {
    const target = document.querySelector(flowButton.dataset.flowTarget);
    if (target) {
      target.open = true;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return;
  }

  const nudgeButton = event.target.closest("[data-nudge-action]");
  if (nudgeButton) {
    if (nudgeButton.dataset.nudgeAction === "review") {
      reviewListEl.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const current = selectedItem();
    const item = sessionStageFor(current) === "complete" ? nextRecommendedItem(current) ?? nextLearningItem() : nextLearningItem();
    if (item) {
      state.selectedId = item.id;
      render();
      const stage = sessionStageFor(item);
      const target = document.querySelector(sessionSteps.find((step) => step.id === stage)?.target ?? "#detail");
      if (target) target.open = true;
      (target ?? detailEl).scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return;
  }

  const sessionButton = event.target.closest("[data-session-action]");
  if (sessionButton) {
    const target = document.querySelector(sessionSteps.find((step) => step.id === sessionButton.dataset.sessionAction)?.target ?? "#detail");
    if (target) {
      target.open = true;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return;
  }

  const detailButton = event.target.closest("[data-open-detail]");
  if (detailButton) {
    const target = document.querySelector(`#${detailButton.dataset.openDetail}`);
    if (target) {
      target.open = true;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return;
  }

  const option = event.target.closest("[data-option]");
  if (!option) return;

  const quiz = option.closest(".quiz-card");
  const quizId = quiz?.dataset.quizId;
  const word = quiz?.dataset.word;
  const answer = quiz?.dataset.answer;
  const explanation = quiz?.dataset.explanation ?? "";
  if (!quiz || !quizId || !word || !answer) return;
  const selected = option.dataset.option;
  const correct = selected === answer;

  const previous = progress.answers[quizId] ?? {};
  progress.answers[quizId] = {
    selected,
    correct,
    word,
    wrongCount: correct ? previous.wrongCount ?? 0 : (previous.wrongCount ?? 0) + 1,
    answeredAt: new Date().toISOString(),
    pendingRetry: false,
  };
  saveProgress();

  for (const button of quiz.querySelectorAll("[data-option]")) {
    button.classList.remove("correct", "incorrect");
    if (button.dataset.option === answer) button.classList.add("correct");
  }

  if (!correct) {
    option.classList.add("incorrect");
  }

  const feedback = quiz.querySelector(".quiz-feedback");
  if (feedback) {
    feedback.hidden = false;
    feedback.textContent = correct ? `정답입니다. ${explanation}` : `정답은 ${answer}입니다. ${explanation}`;
  }

  renderProgressSurfaces();
});

document.addEventListener("ended", (event) => {
  const audio = event.target.closest?.("[data-audio-word]");
  if (!audio) return;

  const word = audio.dataset.audioWord;
  progress.audio[word] = {
    completed: true,
    audioId: audio.dataset.audioId ?? "",
    completedAt: new Date().toISOString(),
  };
  saveProgress();
  renderProgressSurfaces();
}, true);

function renderQuotes() {
  if (!quoteListEl) return;
  quoteListEl.innerHTML = "";
  const hotTitleScore = (name) => {
    const n = String(name ?? "");
    if (/기생충|Parasite/i.test(n)) return 100;
    if (/오징어|Squid/i.test(n)) return 90;
    if (/미나리|Minari/i.test(n)) return 70;
    if (/부산행/i.test(n)) return 60;
    return 0;
  };
  const quotes = (klassicQuotes.quotes ?? [])
    .filter((quote) => isRatingAllowed(quote.contentRating ?? "clean", state.quoteMaxRating))
    .slice()
    .sort((a, b) => {
      const hot = hotTitleScore(b.name) - hotTitleScore(a.name);
      if (hot !== 0) return hot;
      // When filter is open, surface higher-rating items next.
      if (state.quoteMaxRating === "clean") return 0;
      const rank = (rating) => RATING_ORDER.indexOf(rating ?? "clean");
      return rank(b.contentRating) - rank(a.contentRating);
    });
  if (!(klassicQuotes.quotes ?? []).length) {
    quoteListEl.innerHTML = `
      <p class="empty-state">명대사 데이터가 없습니다. <code>npm run fetch:quotes</code>를 실행하세요.</p>
    `;
    return;
  }

  const status = klassicQuotes.source?.status ?? "unknown";
  const ratings = klassicQuotes.summary?.ratings ?? {};
  const matchedWords = klassicQuotes.summary?.vocabWithMatches ?? Object.keys(klassicQuotes.vocabMatches ?? {}).length;
  const intro = document.createElement("p");
  intro.className = "meta";
  intro.textContent = `출처: klassic-quote-api · 표시 ${quotes.length}/${klassicQuotes.quotes.length} · 필터 ${ratingLabels[state.quoteMaxRating]} · 어휘 매칭 ${matchedWords}개 · status=${status} · clean ${ratings.clean ?? 0} / mild ${ratings.mild ?? 0} / mature ${ratings.mature ?? 0}`;
  quoteListEl.append(intro);

  if (!quotes.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "이 수위 필터에서는 표시할 명대사가 없습니다. 필터를 ‘거친 말투’ 또는 ‘전체’로 바꿔 보세요.";
    quoteListEl.append(empty);
    return;
  }

  for (const item of quotes.slice(0, 12)) {
    const rating = item.contentRating ?? "clean";
    const isHot = hotTitleScore(item.name) > 0;
    const card = document.createElement("article");
    card.className = `quote-card ${isHot ? "spotlight-card" : ""}`;
    card.innerHTML = `
      <div class="tag-row">
        ${isHot ? `<span class="tag hot-tag">HOT</span>` : ""}
        <span class="tag">${item.name}</span>
        <span class="tag ${rating === "clean" ? "success" : rating === "mild" ? "progress" : "danger"}">${item.contentRatingLabel ?? ratingLabels[rating]}</span>
        ${item.source === "seed" ? `<span class="tag progress">seed</span>` : ""}
      </div>
      <blockquote>${item.quote}</blockquote>
      <p class="meta">— ${item.author}</p>
      ${(item.keywordHints ?? []).length ? `<p class="meta">hints: ${item.keywordHints.slice(0, 6).join(", ")}</p>` : ""}
    `;
    quoteListEl.append(card);
  }
}

function renderChart() {
  if (!chartListEl) return;
  chartListEl.innerHTML = "";
  const chart = melonChart.chart ?? [];
  if (!chart.length) {
    chartListEl.innerHTML = `
      <p class="empty-state">차트 데이터가 없습니다. <code>npm run fetch:melon</code>를 실행하세요.</p>
    `;
    return;
  }

  const status = melonChart.source?.status ?? "unknown";
  const intro = document.createElement("p");
  intro.className = "meta";
  intro.textContent = `Melon 차트 · ${chart.length}곡 · status=${status}${
    melonChart.source?.sourceUrl ? ` · ${melonChart.source.sourceUrl}` : ""
  }${melonChart.source?.note ? ` · ${melonChart.source.note}` : ""}`;
  chartListEl.append(intro);

  for (const entry of chart.slice(0, 12)) {
    const isGlobal =
      /방탄소년단|BTS|BLACKPINK|블랙핑크/i.test(entry.artists) ||
      /Dynamite|Butter|Permission to Dance|How You Like That|Pink Venom/i.test(entry.name);
    const card = document.createElement("article");
    card.className = `chart-card ${isGlobal ? "spotlight-card" : ""}`;
    const phrases = entry.mission?.phrases ?? [];
    card.innerHTML = `
      <div class="tag-row">
        ${isGlobal ? `<span class="tag hot-tag">GLOBAL</span>` : ""}
        <span class="tag">#${entry.ranking}</span>
        <span class="tag">${entry.artists}</span>
      </div>
      <h3>${entry.name}</h3>
      <ul class="phrase-list">
        ${phrases.map((phrase) => `<li>${phrase}</li>`).join("")}
      </ul>
    `;
    chartListEl.append(card);
  }
}

function renderPlaces() {
  const places = tourApiMatches.publicPlaces ?? [];
  placeListEl.innerHTML = "";

  if (!places.length) {
    placeListEl.innerHTML = `
      <p class="empty-state">아직 매칭된 관광정보 장소가 없습니다. .env에 TOUR_API_KEY를 넣고 <code>node scripts/tourapi-build-matches.mjs</code>를 실행하면 이 영역이 채워집니다.</p>
    `;
    return;
  }

  for (const place of places) {
    const card = document.createElement("article");
    card.className = "place-card";
    card.innerHTML = `
      ${place.imageUrl ? `<img src="${place.imageUrl}" alt="">` : `<div class="image-placeholder">이미지 없음</div>`}
      <div>
        <div class="tag-row">
          ${place.matchedVocabulary.map((word) => `<span class="tag">${word}</span>`).join("")}
        </div>
        <h3>${place.title}</h3>
        <p>${place.address || "주소 정보 없음"}</p>
        <p class="meta">${place.contentTypeLabel} · 검색어 ${place.searchKeyword} · score ${place.score}</p>
      </div>
    `;
    placeListEl.append(card);
  }
}

function render() {
  renderSearchHint();
  renderLearnerPrefs();
  renderNudge();
  renderSessionFlow();
  renderFilters();
  renderList();
  renderDetail();
}

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});

if (quoteRatingFilterEl) {
  quoteRatingFilterEl.value = state.quoteMaxRating;
  quoteRatingFilterEl.addEventListener("change", (event) => {
    state.quoteMaxRating = event.target.value || "clean";
    renderQuotes();
    renderDetail();
  });
}

renderNowTrending();
renderTargets();
renderPlaces();
renderStories();
renderActivities();
renderReview();
renderQuotes();
renderChart();
renderDomains();
renderNudge();
renderSessionFlow();
render();
