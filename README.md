# K-Culture Korean Learning MVP

세종한국문화 주요 어휘 CSV와 한국관광공사 공공데이터 API를 결합한 K-culture 기반 한국어 학습 MVP입니다.

프로토타입은 정적 웹앱으로 동작하며, 문화 어휘 카드, 대표 장소, 오디오가이드 이야기, 핵심 표현, 듣기 퀴즈, 복습/배지 기능을 제공합니다.

## 현재 기능

- 세종한국문화1/2 주요 어휘 114개 카드화
- 주요 어휘 10개 국문 관광정보 API 매칭
- 대표 장소 상세정보와 이미지 표시
- 관광지 오디오가이드 API 기반 문화 이야기 카드
- 오디오/대본 기반 핵심 표현과 듣기 퀴즈
- `localStorage` 기반 퀴즈 상태 저장
- 정답률, 복습 카드, 학습 완료 배지
- 오디오 완료 체크와 학습 기록 초기화

## 폴더 구조

```text
docs/                 기획, API 테스트, 검수 메모
prototype/            정적 웹 프로토타입
prototype/data/       생성된 프로토타입 데이터
scripts/              CSV/API 데이터 생성 및 QA 보조 스크립트
cache/                API 응답 캐시, Git 제외
.env                  API 키, Git 제외
```

## 로컬 실행

```powershell
npm run serve
```

브라우저에서 아래 주소를 엽니다.

```text
http://127.0.0.1:4173/
```

별도 의존성 설치 없이 Node.js만 있으면 정적 서버가 실행됩니다.

## 데이터 재생성

`.env`에 공공데이터포털 한국관광공사 TourAPI 키를 넣습니다.

```env
TOUR_API_KEY=일반_인증키
```

실행 순서:

```powershell
npm run build:data
npm run fetch:matches
npm run fetch:details
npm run fetch:odii
npm run build:activities
```

환경변수 로드 확인:

```powershell
npm run check:env
```

## 브라우저 QA

```powershell
npm run qa:browser
```

Chrome 또는 Edge가 설치된 Windows 환경에서 헤드리스 브라우저로 렌더링 스모크 테스트를 실행합니다.

## 배포

GitHub Pages 배포 워크플로가 포함되어 있습니다.

1. GitHub 저장소의 `Settings > Pages`로 이동
2. `Build and deployment`의 Source를 `GitHub Actions`로 설정
3. `main` 브랜치에 푸시하면 `.github/workflows/pages.yml`이 `prototype/` 폴더를 배포

배포 대상에는 `.env`와 `cache/`가 포함되지 않습니다.

최초 Pages 활성화가 안 되어 있으면 Actions가 실패할 수 있습니다. 이 경우 [배포 상태 문서](docs/deployment-status.md)의 수동 조치 순서를 따릅니다.

## 보안 메모

- `.env`는 Git에서 제외됩니다.
- API 키는 클라이언트 코드에 포함하지 않습니다.
- 현재 `prototype/data/*.js`는 API 응답에서 필요한 공개 데이터만 정적으로 생성한 파일입니다.

## 주요 문서

- [MVP 설계](docs/mvp-design.md)
- [API 테스트 계획](docs/api-test-plan.md)
- [대표 장소 검수](docs/representative-place-review.md)
- [오디오가이드 검수](docs/odii-story-review.md)
- [학습 활동 검수](docs/learning-activities-review.md)
- [진도 저장 구현 메모](docs/progress-review.md)
- [브라우저 QA 기록](docs/browser-qa.md)
- [배포 상태](docs/deployment-status.md)
- [수동 QA 체크리스트](docs/manual-qa-checklist.md)
- [다음 개발 계획](docs/next-development-plan.md)
