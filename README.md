# K-Culture Korean Learning MVP

세종한국문화 주요 어휘 CSV와 한국관광공사 공공데이터 API를 결합한 K-culture 기반 한국어 학습 MVP입니다.

**배포 URL:** [https://reasonofmoon.github.io/korean-edu/](https://reasonofmoon.github.io/korean-edu/)

프로토타입은 정적 웹앱으로 동작하며, 문화 어휘 카드, 대표 장소, 오디오가이드 이야기, 핵심 표현, 듣기 퀴즈, 복습/배지, K-movie 명대사, K-pop 차트 미션을 제공합니다.

## 현재 기능

- 세종한국문화1/2 주요 어휘 114개 카드화
- 한글 검색 고도화: 로마자·초성·영타 변환 (`es-hangul` 번들)
- 로마자 병기 · 조사 자동 미션 문장
- 국문 관광정보 API 매칭 장소·대표 장소 상세/이미지
- 관광지 오디오가이드 이야기 카드
- 핵심 표현 · 듣기/읽기 퀴즈 · localStorage 진도
- **세션 플로우:** 뜻 → 듣기/읽기 → 표현 → **명대사 확인** → **K-pop 미션** → 퀴즈 → 완료
- K-movie 명대사 (klassic-quote-api + 문화 시드, 수위 필터, 어휘 114/114 매칭)
- Melon 차트 스냅샷 기반 K-pop 표현 미션
- 복습 카드 **다시 풀기** · **어휘별 진도 초기화** · 전체 초기화
- **관심사 · 여행 목적** 기반 다음 어휘 / Today 추천
- **K-culture 도메인 확장:** K-food, K-beauty, K-drama, K-fashion, K-webtoon, K-game (+ K-pop/K-movie 연동)
- 정답률, 복습 카드, 학습 완료 배지

## 폴더 구조

```text
docs/                 기획, API 테스트, QA·배포 메모
prototype/            정적 웹 프로토타입
prototype/data/       생성된 프로토타입 데이터
prototype/lib/        번들된 클라이언트 유틸 (hangul-utils)
scripts/              CSV/API 데이터 생성 및 QA 스크립트
cache/                API 응답 캐시, Git 제외
.env                  API 키, Git 제외
```

## 로컬 실행

```powershell
npm install
npm run build:hangul   # hangul 유틸 번들 (최초/의존성 변경 시)
npm run serve
```

브라우저:

```text
http://127.0.0.1:4173/
```

## 데이터 재생성

`.env`에 공공데이터포털 한국관광공사 TourAPI 키를 넣습니다.

```env
TOUR_API_KEY=일반_인증키
```

```powershell
npm run build:data
npm run fetch:matches
npm run fetch:details
npm run fetch:odii
npm run build:activities
npm run fetch:quotes
npm run fetch:melon
# 또는
npm run build:spike
```

## 브라우저 QA

```powershell
npm run qa:browser
npm run qa:click-flow
npm run qa:manual
```

## 배포

- **Live:** https://reasonofmoon.github.io/korean-edu/
- `main` 푸시 시 `.github/workflows/pages.yml`이 `prototype/`을 GitHub Pages로 배포
- 상태: [docs/deployment-status.md](docs/deployment-status.md)

Netlify: `netlify.toml`로 `prototype/` 정적 배포 가능.

## 보안 · 출처

- `.env` / API 키는 클라이언트에 포함하지 않습니다.
- 자료: 세종학당재단 주요 어휘 CSV, 한국관광공사 개방데이터(TourAPI), klassic-quote-api, Melon 차트 스냅샷(교육용)
- `prototype/data/*.js`는 공개 가능한 정적 스냅샷입니다.

## 주요 문서

- [MVP 설계](docs/mvp-design.md)
- [첫 세션 플로우](docs/first-session-flow.md)
- [다음 개발 계획](docs/next-development-plan.md)
- [브라우저 QA](docs/browser-qa.md)
- [수동 QA 결과](docs/manual-qa-results.md)
- [배포 상태](docs/deployment-status.md)
- [OSS 통합 후보](docs/oss-integration-candidates.md)
