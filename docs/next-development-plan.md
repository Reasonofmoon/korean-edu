# 다음 기능 개발 계획

## 우선순위 1. 배포 안정화

- [x] public 저장소 전환 후 GitHub Pages 배포 성공 확인
- [x] 배포 URL 기준 스모크 QA (`current-local-parity`, ff0fc7e+)
- [x] README에 실제 배포 URL 반영
- [ ] 공공데이터 출처/라이선스 표기 영역 강화 (푸터 일부 반영)
- [x] 자막·인용 정책 초안 (`docs/subtitle-citation-policy.md`)
- [x] 문화어 학습 스펙 초안 (`docs/culture-lexicon-learning-spec.md`)

## 우선순위 2. 학습 UX 개선

- [x] 핵심 표현 확인 체크
- [x] 완료 조건 확장 (듣기/읽기 + 표현 + **명대사** + **K-pop** + 퀴즈)
- [x] 복습 카드 **다시 풀기**
- [x] 학습 기록 초기화 **전체 / 어휘별** 분리
- [x] 완료 후 다음 어휘 추천에 관심사/여행 목적 추가
- [x] Today 추천에 맞춤 라벨·이유 표시
- [x] K-culture 도메인 확장 (K-food/beauty/drama/fashion/webtoon/game + pop/movie)
- [ ] B=MAP 기반 오늘의 추천 고도화 (더 세분 행동 설계)
- [x] 퀴즈 풀이 전용 포커스 모드
- [ ] 접힌 섹션 기본 오픈 상태 사용 로그 기반 조정

## 우선순위 3. 로컬 미션 강화

- 대표 장소별 실제 한국어 미션 추가
- 음식점 후보는 `맛집 추천`이 아니라 `주문 연습 장소 후보`로 표현
- 장소별 주의 신호와 로컬 팁 구조화
- 현지인 멘토 노트 입력/검수 데이터 구조 설계

## 우선순위 4. 두루누비 API 연결

- 걷기 코스/길 목록 API 연동
- 자연/지역문화 어휘와 코스 매칭
- 걷기 미션 카드 추가
- 지역별 자연 표현, 날씨 표현, 길 묻기 표현 연결

## 우선순위 5. 데이터 품질 관리

- 전체 어휘 114개 중 관광정보 미매칭 51개의 대체 콘텐츠 전략 수립
- 자동 매칭 결과에 수동 큐레이션 레이어 추가
- 퀴즈 문항과 오답 선택지 검수 파일 분리
- 대표 장소 교체 이력 관리
- API 응답 캐시와 공개 데이터 파일 생성 과정을 문서화
- [x] 문화어(Culture Lexeme) P1 시드 12개 — 스펙 `docs/culture-lexicon-learning-spec.md` (원문 대사 금지, policy 준수)
- [x] 문화어 P2 UI + `progress.cultureLexemes` (quote 직전 보너스, drama/movie 관심 시 필수)
- [x] 문화어 P3 axis 필터 + 세종 어휘 앵커 하이라이트
- [x] 문화어 P4 전용 데이터 (`culture-lexemes.js`, 시드 단일 소스)
- [x] 시각 폴리시 (토큰·카드 호버·문화어 패널·모바일·reduced-motion)

## 콘텐츠 정책 (상시)

- 자막·인용: `docs/subtitle-citation-policy.md` — 비공식 SRT·대본 덤프 금지, 교육 시드·공개 API만 배포
- 문화어 학습: `docs/culture-lexicon-learning-spec.md` — 4축 태그, 세션 슬롯, 구현 phase

## 우선순위 6. 제품화

- 정적 프로토타입에서 앱 구조로 전환
- 사용자 계정/진도 저장
- 다국어 설명: 영어 우선
- 관리자 검수 페이지
- 배포 파이프라인과 데이터 재생성 파이프라인 분리
