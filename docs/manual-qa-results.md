# 수동 QA 결과 (2026-07-20)

자동화 스크립트: `npm run qa:manual` → [manual-qa-results.json](./manual-qa-results.json)

## 요약

| 영역 | 상태 |
|------|------|
| 미매칭 7어휘 시드 보강 | 완료 → **114/114** |
| 수위 필터 (학습용/전체) | 통과 |
| 모바일 375×812 | 통과 (overflowX 0) |
| localStorage 복원 | 통과 |
| qa:browser / qa:click-flow | 통과 |

## 1. 미매칭 7어휘

| 어휘 | 카테고리 | 조치 |
|------|----------|------|
| 김 | nature | `seed-short-gim` + 1글자 매칭 규칙 |
| 떡 | food | `seed-short-tteok` |
| 밥 | history | `seed-short-bap` |
| 벼 | history | `seed-short-byeo` |
| 북 | daily | `seed-short-buk` |
| 전 | history | `seed-short-jeon` |
| 징 | daily | `seed-short-jing` |

근본 원인: `containsVocabWord`가 `word.length < 2`를 전부 제외해 1음절 어휘가 매칭 불가.

수정:

- 1–2음절: 비한글 경계 **또는** 조사 접미(`을/를/이/가…`) 허용
- 짧은 어휘 전용 시드 문장 + per-vocab short template

## 2. 수위 필터

| 필터 | 표시 수(meta) | 카드 영역 |
|------|----------------|-----------|
| 학습용 (clean) | clean만 | `수위 높음` 태그 **없음** |
| 전체 (mature max) | **212/212** | mature 우선 정렬 → **`수위 높음` 태그 표시** |

옵션: `clean` / `mild` / `mature` (UI 라벨: 학습용만 / + 거친 말투 / 전체)

## 3. 모바일 (375×812)

- `scrollWidth === clientWidth` (overflowX = 0)
- app-header, toolbar, session-flow, search, quote-rating-filter 모두 viewport 내부
- 세션 플로우에 `명대사 확인`, `K-pop 미션` 문구 노출

## 4. localStorage 복원

시드 진도:

```json
{
  "reading": { "김치": { "completed": true } },
  "quotes": { "김치": { "completed": true } },
  "kpop": { "김치": { "completed": true } }
}
```

재로드 후:

- storage 키 복원: answers, audio, expressions, reading, kpop, quotes
- 김치 상세 UI: `명대사 완료` · `K-pop 완료` 배지 문구 확인

## 5. 재실행 명령

```powershell
cd C:\Users\crescent\projects\korean-edu\korean-edu
npm run fetch:quotes
npm run qa:manual
npm run qa:browser
npm run qa:click-flow
```
