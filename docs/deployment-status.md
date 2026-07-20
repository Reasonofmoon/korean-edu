# GitHub Pages 배포 상태

확인일: **2026-07-20** KST

## 현재 상태 (요약)

| 항목 | 상태 |
|------|------|
| Pages 사이트 | **활성** (`build_type: workflow`) |
| 배포 URL | https://reasonofmoon.github.io/korean-edu/ |
| HTTP | **200** |
| 최신 성공 워크플로 | [25776961397](https://github.com/Reasonofmoon/korean-edu/actions/runs/25776961397) (2026-05-13) |
| 배포된 커밋 | `279e72a` — *Add click flow QA and smarter recommendations* |
| 로컬 미배포 작업 | **있음** (명대사/수위/Melon/hangul/QA 등 uncommitted) |

## 스모크 QA (배포 URL)

원시 결과: [pages-smoke-results.json](./pages-smoke-results.json)

### 통과 (배포된 MVP)

- 홈 HTML 로드, 타이틀 `K-Culture Korean Mission Map`
- 카피/섹션: 한국문화 어휘, 문화 어휘 카드, session-flow, today-nudge
- 정적 자산 200: `app.js`, `styles.css`, `data/app-data.js`, `learning-activities.js`, `tourapi-matches.js`
- 데이터에 `경복궁` 등 어휘 포함

### 미배포 (로컬에만 존재)

| 기능/파일 | Pages |
|-----------|--------|
| `lib/hangul-utils.js` | 404 |
| `data/klassic-quotes.js` | 404 |
| `data/melon-chart.js` | 404 |
| K-movie 명대사 · 수위 필터 | 없음 |
| K-pop 차트 · 세션 미션 | 없음 |
| 명대사 완료 게이트 | 없음 |

→ 판정: **`legacy-mvp-ok`** (5월 MVP는 살아 있음, 7월 스파이크는 아직 미배포)

## 배포 파이프라인

워크플로: `.github/workflows/pages.yml`

- 트리거: `main` push, `workflow_dispatch`
- artifact path: `prototype/`
- permissions: `pages: write`, `id-token: write`

## 새 기능을 Pages에 올리는 방법

로컬 변경이 커밋·푸시되지 않았습니다. 배포하려면:

```powershell
cd C:\Users\crescent\projects\korean-edu\korean-edu
# 1) node_modules 제외 확인 (.gitignore)
# 2) 관련 파일 스테이징 후 커밋
git add prototype scripts docs package.json package-lock.json
git status
git commit -m "feat: hangul search, quote matching, melon chart, session gates"
git push origin main
# 3) Actions 성공 확인
gh run list --repo Reasonofmoon/korean-edu --limit 3
# 4) 배포 후 스모크
# https://reasonofmoon.github.io/korean-edu/ 에 K-movie / K-pop / hangul-utils 등장 여부
```

또는 Actions에서 `Deploy prototype to GitHub Pages` → **Run workflow** (push 없이 현재 main만 재배포 — 로컬 uncommitted는 포함되지 않음).

## 이전 기록 (2026-05-13)

초기 Pages 미활성으로 `Resource not accessible by integration` 실패가 있었고, 이후 수동 설정으로 복구되어 위 성공 실행까지 이어졌습니다. 현재 API 기준 Pages는 정상 활성 상태입니다.
