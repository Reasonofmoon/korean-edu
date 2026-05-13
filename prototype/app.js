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

const state = {
  query: "",
  category: "all",
  selectedId: data.vocabulary[0]?.id,
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
const filtersEl = document.querySelector("#filters");
const listEl = document.querySelector("#vocab-list");
const detailEl = document.querySelector("#detail");
const targetsEl = document.querySelector("#api-targets");
const apiStatusEl = document.querySelector("#api-status");
const placeListEl = document.querySelector("#place-list");
const storyListEl = document.querySelector("#story-list");
const activityListEl = document.querySelector("#activity-list");
const reviewListEl = document.querySelector("#review-list");
const todayNudgeEl = document.querySelector("#today-nudge");
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
    };
  } catch {
    return { answers: {}, audio: {} };
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

function statsForWord(word) {
  const activity = learningActivities.activities.find((item) => item.word === word);
  const quizzes = activity?.quizzes ?? [];
  const answered = quizzes.filter((quiz) => progress.answers[quiz.id]);
  const correct = answered.filter((quiz) => progress.answers[quiz.id]?.correct);
  const requiresAudio = Boolean(activity?.hasAudio && activity.audioUrl);
  const audioDone = !requiresAudio || Boolean(progress.audio[word]?.completed);
  return {
    total: quizzes.length,
    answered: answered.length,
    correct: correct.length,
    incorrectAttempts: quizzes.reduce((sum, quiz) => sum + (progress.answers[quiz.id]?.wrongCount ?? 0), 0),
    requiresAudio,
    audioDone,
    complete: quizzes.length > 0 && correct.length === quizzes.length && audioDone,
  };
}

function overallStats() {
  const quizzes = allQuizzes();
  const answered = quizzes.filter((quiz) => progress.answers[quiz.id]);
  const correct = answered.filter((quiz) => progress.answers[quiz.id]?.correct);
  const review = quizzes.filter((quiz) => {
    const answer = progress.answers[quiz.id];
    return !answer || !answer.correct;
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
  const pendingActivity = learningActivities.activities.find((activity) => !statsForWord(activity.word).complete);
  const selected = data.vocabulary.find((item) => item.id === state.selectedId);
  const pending = pendingActivity ? data.vocabulary.find((item) => item.word === pendingActivity.word) : null;
  return pending ?? selected ?? data.vocabulary[0];
}

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

function filteredVocabulary() {
  const query = state.query.trim().toLowerCase();
  return data.vocabulary.filter((item) => {
    const matchesCategory = state.category === "all" || item.category === state.category;
    const haystack = [item.word, item.categoryLabel, ...item.books, ...item.units].join(" ").toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    return matchesCategory && matchesQuery;
  });
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
  const item = data.vocabulary.find((candidate) => candidate.id === state.selectedId) ?? filteredVocabulary()[0];
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
  detailEl.innerHTML = `
    <div class="detail-hero">
      <div class="tag-row">
        <span class="tag">${item.categoryLabel}</span>
        <span class="tag">페이지 ${item.pages.join(", ") || "미정"}</span>
        ${
          wordStats.complete
            ? `<span class="tag success">학습 완료</span>`
            : `<span class="tag progress">퀴즈 ${wordStats.answered}/${wordStats.total}${wordStats.requiresAudio ? ` · 듣기 ${wordStats.audioDone ? "완료" : "필요"}` : ""}</span>`
        }
      </div>
      <h3>${item.word}</h3>
      <p class="body-copy">${item.easyKorean}</p>
      <div class="cta-row">
        ${odii?.stories?.some((story) => story.audioUrl) ? `<button type="button" class="primary-action" data-open-detail="story-step">듣고 시작</button>` : ""}
        ${firstQuiz ? `<button type="button" data-open-detail="quiz-step">퀴즈 풀기</button>` : ""}
        ${representative ? `<button type="button" data-open-detail="place-step">장소 보기</button>` : ""}
      </div>
    </div>

    <details class="detail-block" open>
      <summary>1. 뜻과 예문</summary>
      <h4>단원</h4>
      <ul class="plain-list">
        ${item.sourceRows.map((row) => `<li>${row.book} ${row.unitNo} · ${row.unitName}</li>`).join("")}
      </ul>
    </div>

    <div class="detail-block">
      <h4>예문</h4>
      <ul class="phrase-list">
        ${item.sampleSentences.map((sentence) => `<li>${sentence}</li>`).join("")}
      </ul>
    </details>

    <details class="detail-block" open>
      <summary>2. 현장 미션</summary>
      <h4>${mission.title}</h4>
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
    </details>

    <details class="detail-block" open>
      <summary>5. 핵심 표현</summary>
      ${
        activity?.expressions?.length
          ? `<ul class="expression-list">${activity.expressions
              .map((expression) => `<li><span>${expression.focus}</span>${expression.text}</li>`)
              .join("")}</ul>`
          : `<p class="body-copy">아직 추출된 핵심 표현이 없습니다.</p>`
      }
    </details>

    <details class="detail-block" id="quiz-step" open>
      <summary>6. 듣기 확인 퀴즈</summary>
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
  const item = nextLearningItem();
  const activity = item ? activityFor(item) : null;
  const wordStats = item ? statsForWord(item.word) : null;
  if (!item || !activity || !wordStats) {
    todayNudgeEl.innerHTML = "";
    return;
  }

  const actionLabel = wordStats.requiresAudio && !wordStats.audioDone ? "듣기부터 시작" : wordStats.answered < wordStats.total ? "퀴즈 이어 풀기" : "다음 어휘 고르기";
  todayNudgeEl.innerHTML = `
    <div>
      <p class="eyebrow">Today</p>
      <h2>${item.word}</h2>
      <p>${stats.review ? `복습 ${stats.review}개가 남아 있습니다.` : "짧게 한 장만 끝내도 진도가 저장됩니다."} 지금은 ${item.categoryLabel} 어휘 하나에 집중해 보세요.</p>
    </div>
    <div class="nudge-actions">
      <button type="button" class="primary-action" data-nudge-action="start">${actionLabel}</button>
      <button type="button" data-nudge-action="review">복습 카드 보기</button>
    </div>
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
  const answeredClass = saved ? (saved.correct ? "answered-correct" : "answered-incorrect") : "";
  return `
    <article class="quiz-card ${answeredClass}" data-quiz-id="${quiz.id}" data-word="${word}" data-answer="${quiz.answer}" data-explanation="${quiz.explanation}">
      <p class="meta">${word} · ${quiz.type === "cloze" ? "빈칸" : "선택"}</p>
      <h5>${quiz.prompt}</h5>
      <p>${quiz.passage}</p>
      <div class="quiz-options">
        ${quiz.options
          .map((option) => {
            const isCorrect = saved && option === quiz.answer;
            const isWrongSelection = saved && saved.selected === option && !saved.correct;
            const className = isCorrect ? "correct" : isWrongSelection ? "incorrect" : "";
            return `<button type="button" class="${className}" data-option="${option}">${option}</button>`;
          })
          .join("")}
      </div>
      <p class="quiz-feedback" ${saved ? "" : "hidden"}>${
        saved ? `${saved.correct ? "정답입니다." : `정답은 ${quiz.answer}입니다.`} ${quiz.explanation}` : quiz.explanation
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

function renderReview() {
  const stats = overallStats();
  accuracyRateEl.textContent = `${stats.accuracy}%`;
  reviewCountEl.textContent = stats.review;
  badgeCountEl.textContent = stats.completed;

  const quizzes = allQuizzes();
  const reviewItems = quizzes
    .filter((quiz) => {
      const answer = progress.answers[quiz.id];
      return !answer || !answer.correct;
    })
    .sort((a, b) => {
      const wrongA = progress.answers[a.id]?.wrongCount ?? 0;
      const wrongB = progress.answers[b.id]?.wrongCount ?? 0;
      if (wrongA !== wrongB) return wrongB - wrongA;
      const answeredA = progress.answers[a.id] ? 1 : 0;
      const answeredB = progress.answers[b.id] ? 1 : 0;
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
        ${completed.map((activity) => `<span class="badge">${activity.word}</span>`).join("")}
      </div>
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
    card.innerHTML = `
      <div class="tag-row">
        <span class="tag">${quiz.word}</span>
        <span class="tag ${answer ? "danger" : "progress"}">${answer ? "오답 복습" : "미풀이"}</span>
        ${(answer?.wrongCount ?? 0) ? `<span class="tag danger">오답 ${answer.wrongCount}회</span>` : ""}
      </div>
      <h3>${quiz.prompt}</h3>
      <p>${quiz.passage}</p>
      <button type="button" data-review-word="${quiz.word}">이 어휘로 이동</button>
    `;
    reviewListEl.append(card);
  }
}

function renderProgressSurfaces() {
  renderNudge();
  renderFilters();
  renderList();
  renderDetail();
  renderTargets();
  renderActivities();
  renderReview();
}

document.addEventListener("click", (event) => {
  if (event.target.closest("#reset-progress")) {
    const confirmed = window.confirm("학습 기록을 모두 초기화할까요?");
    if (!confirmed) return;
    progress = { answers: {}, audio: {} };
    saveProgress();
    renderProgressSurfaces();
    return;
  }

  const reviewButton = event.target.closest("[data-review-word]");
  if (reviewButton) {
    const word = reviewButton.dataset.reviewWord;
    const item = data.vocabulary.find((candidate) => candidate.word === word);
    if (item) {
      state.selectedId = item.id;
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return;
  }

  const nudgeButton = event.target.closest("[data-nudge-action]");
  if (nudgeButton) {
    if (nudgeButton.dataset.nudgeAction === "review") {
      reviewListEl.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const item = nextLearningItem();
    if (item) {
      state.selectedId = item.id;
      render();
      detailEl.scrollIntoView({ behavior: "smooth", block: "start" });
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
  renderFilters();
  renderList();
  renderDetail();
}

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});

renderTargets();
renderPlaces();
renderStories();
renderActivities();
renderReview();
renderNudge();
render();
