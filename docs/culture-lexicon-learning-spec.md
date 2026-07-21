# 문화어(Culture Lexicon) 학습 스펙 초안

기준일: 2026-07-21  
상태: **초안 (Draft)** — 구현 전 계약서  
정책: `docs/subtitle-citation-policy.md` (콘텐츠 허용 범위 **상위 규약**)  
연관 코드: `prototype/data/kculture-domains.js`, `klassic-quotes`, `app.js` 세션 단계 `quote` / domain

---

## 1. 한 줄 목표

> 유명 K-drama · K-movie **맥락**으로 학습자를 끌어들이되,  
> **문화고유어·상황 표현**을 짧고 안전한 교육 문장으로 익히게 한다.  
> (원문 대본·비공식 자막 재배포 없음)

---

## 2. 문제 정의

| 학습자 동기 | 제품 리스크 | 스펙이 막는 방법 |
|-------------|-------------|------------------|
| “오징어 게임 보고 한국말 배우고 싶음” | 대사·SRT 무단 사용 | 시드 = 설명·연습만 (`subtitle-citation-policy`) |
| 깐부·달고나 같은 말 알고 싶음 | 뜻만 외우고 상황 모름 | **상황 슬롯 + 연습 문장** 필수 |
| 자막 속도에 맞는 짧은 말 | 긴 설명 카드 | **자막 제약형 길이** 가이드 |
| 욕·폭력 장면 노출 불안 | mature 기본 노출 | 기본 `clean`, 4축 중 slang은 옵트인 |

---

## 3. 설계 근거 (참고, 콘텐츠 원천 아님)

학술 참고 예:

- 신상범·이재성 (2023). 드라마 「오징어 게임」의 자막번역 전략 연구. *통번역교육연구* 21(1). (KCI FI002973700)

논문에서 **제품에 가져올 것**은 예문 대사가 아니라 다음 프레임이다.

### 3.1 분석 4축 → 학습 태그

| 축 (논문) | 태그 `axis` | 학습 의도 | 기본 수위 |
|-----------|-------------|-----------|-----------|
| 언어유희 | `wordplay` | 관용·말장난의 **뜻과 비슷한 쉬운 말** | clean |
| 비속어 | `slang` | “작품에 거친 말이 많다” **메타 인지** 또는 순화 대체어 | mild+ 옵트인 |
| 맥락적 상황 | `context` | 장면 역할(설득, 거절, 팀 짜기)에 맞는 표현 | clean |
| 문화고유어 | `culture` | 한국 놀이·음식·사회 표현의 뜻·쓰임 | clean |

### 3.2 자막 형식 제약 → UX 가이드 (넷플릭스 지침을 논문이 요약한 값)

학습 **출력 문장** 작성 시 권장 (강제 검증은 2차):

| 항목 | 권장 값 | 제품 적용 |
|------|---------|-----------|
| 한 줄 길이 | ≤ **16자** (공백·영문·구두 0.5자 근사) | 핵심 연습 문장 1줄 |
| 최대 줄 수 | **2줄** | 카드 body 2줄 이내 권장 |
| 읽기 시간 | 약 **5–7초** | 오디오 없을 때 “읽기 완료” 타이머 힌트 |
| 성인 리딩 | ~12자/초 | 퀴즈 프롬프트 길이 상한 참고 |

> 이 숫자는 **학습 문장 길이 가이드**이다. 공식 가이드라인 전문 재배포가 아니다.

---

## 4. 용어

| 용어 | 정의 |
|------|------|
| **문화어 항목 (Culture Lexeme)** | 작품·현상과 연결해 가르치는 표현 단위 (단어·짧은 구) |
| **교육 시드 문장** | 팀이 작성한 설명·회화 문장. 원문 대사 복제 아님 |
| **작품 훅 (Title hook)** | 동기 유발용 작품명/에피소드 테마 라벨 (대본 아님) |
| **세종 앵커** | 기존 114 어휘 중 연결 가능한 단어 (`vocabMatches`) |

---

## 5. 데이터 모델 (초안)

### 5.1 Culture Lexeme

```ts
type ContentRating = "clean" | "mild" | "mature";
type CultureAxis = "wordplay" | "slang" | "context" | "culture";

interface CultureLexeme {
  id: string;                    // e.g. "cl-kkanbu"
  lemma: string;                 // 표제어: "깐부"
  lemmaRomaja?: string;          // "kkanbu"
  axis: CultureAxis;             // 주 축 (1개). 보조는 tags
  tags: string[];                // e.g. ["k-drama", "squid-game", "friendship"]
  titleHooks: string[];          // 작품 맥락 라벨만. e.g. ["오징어 게임"]
  glossKo: string;               // 쉬운 한국어 뜻
  glossEn: string;               // 영어 뜻 (제품화 시 노출)
  situation: string;             // 언제 쓰나 (1–2문장, clean)
  practiceLines: PracticeLine[]; // 1–4개, 길이 가이드 준수
  avoidNotes?: string;           // 오용·수위 주의 (학습자/강사)
  sejeongAnchors: string[];      // 세종 어휘 연결 e.g. ["친구", "게임"]
  contentRating: ContentRating;
  sourceType: "seed-culture";    // policy 코드
  sourceNote?: string;           // "educational paraphrase; not a transcript line"
}
```

### 5.2 PracticeLine

```ts
interface PracticeLine {
  id: string;
  text: string;           // 권장 ≤16자 또는 2줄
  role?: string;          // "learner" | "friend" | "narration"
  focus?: string;         // 강조 표현
}
```

### 5.3 기존 데이터와의 매핑

| 기존 구조 | 문화어 연결 방식 |
|-----------|------------------|
| `kculture-domains.spotlights` | 작품 훅 + blurb/phrases를 lexeme 묶음으로 점진 이관 |
| `klassic-quotes` seed | `name`=작품, `quote`=교육 문장, `source=seed` 유지; 문화어는 `keywordHints`에 lemma |
| `learning-activities` | lexeme.practiceLines → cloze/선택 퀴즈 자동 생성 (후속) |
| `progress.quotes` / domains | 완료 게이트: “문화어 N개 확인” 옵션 추가 가능 |

**1차 구현은 신규 JSON/JS 파일 없이**  
`build-klassic-quotes` 시드 + `build-kculture-domains` 아이템 확장으로도 가능.  
2차에 `prototype/data/culture-lexemes.js` 분리 권장.

---

## 6. 학습 루프 (세션)

기존 first-session에 **문화어 슬롯**을 끼운다 (파괴적 변경 최소화).

```text
pick → context → listen/read → expressions
  → [culture-lexicon]  문화어 1장 (신규, 선택 강화)
  → quote (명대사/시드 확인)
  → kpop → quiz focus → complete
```

### 6.1 문화어 1장 마이크로 플로우

1. **훅** — 작품명 배지 + “이 표현, 드라마에서 화제였어요” (대사 재생 없음)  
2. **뜻** — glossKo + glossEn  
3. **상황** — situation 1문장  
4. **따라 말하기/읽기** — practiceLines (자막 길이)  
5. **확인** — `progress.cultureLexemes[id].completed = true`  
6. **퀴즈 연결** — 같은 lemma로 cloze 1문항 (있으면)

### 6.2 완료 조건 (제안)

| 모드 | 조건 |
|------|------|
| MVP 유지 | 기존 quote + kpop + quiz 유지. 문화어는 **보너스** |
| 강화 모드 | domain/drama 관심사 선택 시 문화어 1개 확인 필수 |

기본은 **보너스**로 두고, 관심사 `k-drama` / `k-movie`일 때만 강화 모드를 켠다 (구현 시 플래그).

---

## 7. UI 스펙 (프로토타입)

### 7.1 카드

- 배지: `CULTURE` + axis 라벨 (예: 문화고유어)  
- HOT 작품 훅이 있으면 기존 `hot-tag` 스타일 재사용  
- 본문: lemma (큰 글씨) → romaja → gloss → situation → practice list  
- CTA: `이 표현 확인했어요` / `집중 모드에서 퀴즈`

### 7.2 목록·필터

- 도메인 필터: 기존 `k-drama` / `k-movie` + **축 필터** (culture 기본 추천)  
- 검색: lemma, romaja, titleHooks, sejeongAnchors (hangul-utils 재사용)

### 7.3 금지 UX

- “SRT 불러와 대사 학습”을 **기본 홈 경로**에 두지 않음  
- 로컬 SRT는 policy §8 게이트 통과 후에만, 설정/실험 메뉴

---

## 8. 콘텐츠 작성 가이드 (시더용)

### 8.1 좋은 시드

- 표제어 1개 + 뜻 + **상황** + 연습 1–2문장  
- 연습 문장은 학습자가 **지금 말할 수 있는** 말 (역할극)  
- 작품명은 훅일 뿐, 문장이 대본처럼 들리지 않게  

예시 (오징어 게임 맥락, **교육용**):

| lemma | axis | practice (clean) |
|-------|------|------------------|
| 달고나 | culture | 달고나 만들어 봤어요? |
| 깐부 | culture | 우리 깐부 해요. |
| 무궁화 꽃이 피었습니다 | culture | 그 놀이 이름 알아요? |
| 초대 | context | 초대장을 받았어요. |

### 8.2 나쁜 시드

- 에피소드 대사를 기억 나는 대로 길게 적기  
- 욕설 원문을 clean 카드에 넣기  
- 논문 ST 줄을 복사해 `quote`에 넣기  

### 8.3 시드 배치 우선순위 (초기 백로그)

1. **culture** 축: 놀이·음식·호칭 (달고나, 깐부, 깍두기*설명만)  
2. **context** 축: 팀/초대/규칙 설명 회화  
3. **wordplay** 축: 관용어를 **쉬운 말**로 풀어 쓴 카드 (원문 유희 대사 복제 금지)  
4. **slang** 축: “거친 말은 등급 밖” 메타 카드 1–2장 또는 mild 전용  

\*깍두기 등 다의어는 **문화 은유 뜻**과 **음식 뜻**을 분리 표기.

---

## 9. 세종 어휘 매칭

- `sejeongAnchors`로 114 어휘와 연결 → 기존 `vocabMatches` 파이프 확장  
- 매칭 실패 시에도 문화어 카드는 독립 표시 가능  
- 랭킹: 관심사 k-drama/k-movie > culture 축 > 미완료  

---

## 10. 분석·성공 지표 (프로토타입)

| 지표 | 정의 | 목표 (초안) |
|------|------|-------------|
| Culture open rate | 문화어 카드 노출 후 확인 클릭 | 세션 내 ≥ 40% (drama 관심사) |
| Anchor lift | 문화어 확인 후 연결 세종 어휘 퀴즈 정답률 | 대조군 대비 관찰 |
| Policy incidents | 금지 콘텐츠 PR 유입 | 0 |
| Rating complaints | clean 기본에서 mature 노출 신고 | 0 |

정량 계측 전에도 **PR 체크리스트**(policy §9)로 품질을 본다.

---

## 11. 구현 단계

| Phase | 내용 | 산출 |
|-------|------|------|
| **P0** | 본 스펙 + policy 합의 | docs |
| **P1** | 교육 시드 12개 (culture/context, clean) | `seed-cl-*` in `build-klassic-quotes` + `kd-culture-lexemes` / spot-squid |
| **P2** | UI: 문화어 카드 + 확인 진도 키 | `#culture-step`, `progress.cultureLexemes`, 보너스/필수 게이트 |
| **P3** | axis 필터 · 세종 앵커 하이라이트 | 필터 칩 |
| **P4** | (옵션) cultureLexemes 전용 데이터 파일 | `culture-lexemes.js` |
| **P5** | (게이트 후) 로컬 SRT 실험 메뉴 | policy §8 |

---

## 12. 비범위 (Out of scope)

- 넷플릭스·상업 OTT 자막 동기 재생  
- 에피소드 단위 대본 뷰어  
- 자동 크롤 자막 검색  
- 더빙 립싱크 학습  
- 논문 PDF를 앱 콘텐츠로 서빙  

---

## 13. 결정 로그 (초안)

| 결정 | 선택 | 이유 |
|------|------|------|
| 콘텐츠 원천 | 교육 시드 우선 | 저작권·배포 안전 |
| 4축 태그 | 채택 | 학습 유형 분리·필터 |
| 자막 길이 | 가이드로만 | 강제 파서 전 작성 규율 |
| slang | 기본 제외 | 학습 안전 |
| 세션 위치 | quote 직전 보너스 | 기존 게이트 최소 파괴 |

---

## 14. 개정 이력

| 날짜 | 변경 |
|------|------|
| 2026-07-21 | 초안. 4축·데이터 모델·세션·시더 가이드·구현 phase |
