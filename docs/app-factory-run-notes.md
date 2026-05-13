# app-factory CLI 실행 메모

확인일: 2026-05-13 KST

## 실행 결과

- `app-factory --help`: 성공
- `app-factory list modules`: 성공, 67개 runnable module 확인
- `app-factory studio scenarios`: 성공
- `app-factory plan`: 성공, `builder-mini-behavior` 추천
- `app-factory studio plan --scenario learning-content-app`: 성공
- `app-factory run jtbd`: 성공, schema valid envelope 생성
- `app-factory run persona --parent docs/01-jtbd.envelope.json`: 성공, schema valid envelope 생성
- `app-factory run bmap --parent docs/01-jtbd.envelope.json --parent docs/02-persona.envelope.json`: LLM 호출은 됐지만 JSON 파싱 실패

## 생성 파일

- `docs/app-factory-plan.json`
- `docs/app-factory-studio-learning-plan.json`
- `docs/01-jtbd.envelope.json`
- `docs/02-persona.envelope.json`
- `docs/app-factory-01-jtbd.envelope.json`

## B=MAP 실패 원인

`bmap` 모듈은 `jtbd_output`, `persona_output` 부모 산출물을 요구합니다. 부모 연결 후 실제 실행까지는 진행됐지만, 모델 응답이 fenced JSON 형식으로 반환되어 CLI가 JSON을 추출하지 못했습니다.

```text
Failed to extract JSON from LLM response. First 200 chars: ```json
```

이는 앱 코드 문제가 아니라 app-factory CLI의 응답 파서/모듈 실행 쪽 문제로 보입니다.

## 제품 방향에 반영할 점

- app-factory Studio는 이 앱을 `learning-content-app` 시나리오로 분류했습니다.
- 추천 경로는 `builder-mini-behavior`입니다.
- 첫 세션, 학습 루프, 진행 신호, 콘텐츠 단위를 명확히 만드는 것이 다음 설계 우선순위입니다.
- JTBD 결과는 K-culture 맥락, 짧은 세션, 장소/이야기 기반 의미 기억을 핵심으로 잡았습니다.
- Persona 결과는 학습자가 과부하 없이 한 번에 하나의 어휘 루프를 끝내는 흐름을 지지합니다.
