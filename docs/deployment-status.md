# GitHub Pages 배포 상태

확인일: **2026-07-20** KST

## 현재 상태 (요약)

| 항목 | 상태 |
|------|------|
| Pages 사이트 | **활성** (`build_type: workflow`) |
| 배포 URL | https://reasonofmoon.github.io/korean-edu/ |
| HTTP | **200** |
| 최신 성공 워크플로 | [29743182593](https://github.com/Reasonofmoon/korean-edu/actions/runs/29743182593) |
| 배포된 커밋 | `ff0fc7e` — *feat: add hangul utils, K-movie quotes, Melon chart, session gates* |
| 스모크 판정 | **`current-local-parity`** |

## 스모크 QA (배포 URL, 배포 직후)

원시 결과: [pages-smoke-results.json](./pages-smoke-results.json)

### 홈 HTML

- title, h1, **K-movie 명대사**, **K-pop**, **명대사 수위** 필터
- script: `hangul-utils`, `klassic-quotes`, `melon-chart`

### 자산 200

| path | status | notes |
|------|--------|--------|
| app.js | 200 | ~51KB |
| styles.css | 200 | |
| lib/hangul-utils.js | **200** | HangulUtils / romanize |
| data/klassic-quotes.js | **200** | vocabMatches 114, 김치 포함 |
| data/melon-chart.js | **200** | KCULTURE_MELON_CHART |
| data/app-data.js | 200 | |

## 배포 파이프라인

워크플로: `.github/workflows/pages.yml`

- 트리거: `main` push, `workflow_dispatch`
- artifact path: `prototype/`
- 이번 배포: push `279e72a..ff0fc7e` → success in ~16s

## 이전

- 2026-05-13: MVP `279e72a` 배포 (명대사/K-pop 없음)
- 초기 Pages 미활성 실패 후 수동 설정으로 복구
