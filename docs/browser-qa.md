# 브라우저 QA 기록

## 2026-07-20 (미매칭 7어휘 보강 + 수동 QA)

환경:

- Windows / Node.js v24.15.0 / Chrome headless

실행:

```powershell
npm run fetch:quotes
npm run qa:manual
npm run qa:browser
npm run qa:click-flow
```

### 미매칭 7어휘 보강

원인: 1글자 어휘(`김 떡 밥 벼 북 전 징`)가 `containsVocabWord`에서 길이 제한으로 탈락.

조치:

- 짧은 어휘 경계+조사 매칭 허용
- 전용 시드 7줄 + short-word 템플릿
- 결과: **114/114 매칭**, 전 카테고리 **100%**

| 어휘 | 대표 seed |
|------|-----------|
| 김 | seed-short-gim |
| 떡 | seed-short-tteok |
| 밥 | seed-short-bap / seed-short-gim |
| 벼 | seed-short-byeo |
| 북 | seed-short-buk |
| 전 | seed-short-jeon |
| 징 | seed-short-jing |

### 수동 QA (자동화 `npm run qa:manual`)

상세 JSON: [manual-qa-results.json](./manual-qa-results.json)

| 항목 | 결과 | 메모 |
|------|------|------|
| 수위 필터 학습용 | 통과 | clean 목록에 `수위 높음` 태그 없음 |
| 수위 필터 전체 | 통과 | meta `표시 212/212 · 필터 수위 높음`, 카드에 mature 태그 노출 |
| 모바일 375×812 | 통과 | overflowX=0, header/toolbar/search/filter viewport 내 |
| localStorage 복원 | 통과 | quotes/kpop/reading 복원, 김치 상세에 `명대사 완료` UI |
| 세션 단계 표시 | 통과 | 모바일에서도 명대사 확인 · K-pop 미션 텍스트 존재 |

### 회귀 QA

- `qa:browser` 통과
- `qa:click-flow` 통과 (명대사 → K-pop → 퀴즈 → 다음 어휘)

### 데이터 스냅샷

- quotes **212** (seeds 132 + API)
- ratings: clean 188 / mild 11 / mature 13
- vocabWithMatches **114/114**
- categoryCoverage 전부 **100%**

---

## 2026-07-20 (초기 스파이크)

환경:

- Windows
- Node.js v24.15.0
- Chrome headless
- 로컬 정적 서버: `http://127.0.0.1:4173/` (qa:browser), `4273` (qa:click-flow)

실행:

```powershell
npm run fetch:quotes
npm run qa:browser
npm run qa:click-flow
```

확인한 항목:

- 프로토타입 HTML 로드
- 데이터 JS 로드 (명대사 · Melon 차트 · hangul-utils 포함)
- 주요 섹션 렌더링 (`K-movie 명대사`, `K-pop 차트`, 수위 필터)
- 세션 플로우에 `명대사 확인` · `K-pop 미션` 단계 표시
- 읽기 완료 → 표현 확인 → **명대사 확인** → **K-pop 미션** → 퀴즈 정답 → 다음 어휘 CTA
- `progress.quotes` / `progress.kpop` localStorage 기록
- 수위 필터 change 이벤트 동작

결과:

- `qa:browser` 통과
- `qa:click-flow` 통과

명대사 데이터 (fetch:quotes, 보강 전):

- 총 205 quotes (culture seeds 125 + API)
- 어휘 매칭 107/114
- 카테고리 커버리지: food 94%, place 100%, tradition 100%, history 86%, nature 88%, daily 96%
- ratings: clean 181 / mild 11 / mature 13

완료 조건 (세션 complete):

1. 퀴즈 전량 정답
2. 듣기 또는 읽기 완료
3. 표현 확인 (표현이 있을 때)
4. **명대사 확인** (`progress.quotes[word].completed`)
5. **K-pop 미션** (차트 데이터가 있을 때)

남은 수동 QA: → 동일 일자 상단 섹션에서 완료

## 2026-05-13

환경:

- Windows
- Node.js v24.15.0
- Chrome headless
- 로컬 정적 서버: `http://127.0.0.1:4173/`

실행:

```powershell
npm run qa:browser
npm run qa:click-flow
```

확인한 항목:

- 프로토타입 HTML 로드
- 데이터 JS 로드
- 주요 섹션 렌더링
- 대표 어휘 `경복궁` 렌더링
- 정답률/복습/배지 영역 렌더링
- 배포 URL에서 `session-flow`와 `today-nudge` HTML 반영 확인
- 오디오가 없는 첫 어휘에서 `읽기 완료했어요` CTA 렌더링 확인
- 클릭 기반 QA로 읽기 완료, 정답 선택, 완료 후 다음 어휘 CTA 확인
- 다음 어휘 CTA가 오답/카테고리 추천 로직을 통과하는지 확인

결과:

- 통과

데이터 확장 확인:

- 전체 어휘 114개가 API 테스트 타깃으로 표시됨
- 국문 관광정보 매칭 63개, 장소 후보 206개 생성
- 대표 장소 상세 63개 생성
- 오디오가이드 이야기 81개, 재생 가능 오디오 65개 생성
- 학습 활동 114개, 핵심 표현 245개, 퀴즈 171개 생성

남은 수동 QA:

- 퀴즈 선택 후 정답/오답 표시 확인
- 새로고침 후 `localStorage` 진도 복원 확인
- 오디오 끝까지 재생 후 듣기 완료 상태 확인
- 학습 기록 초기화 확인
