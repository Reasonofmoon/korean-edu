# 한국관광공사 API 연동 테스트 계획

## 1. 전제

개발계정 서비스키는 로컬 환경변수로만 관리합니다.

권장 환경변수:

```text
TOUR_API_KEY=공공데이터포털_일반인증키
TOUR_API_KEY_DECODED=디코딩된_키가_따로_필요할_때만_사용
```

서비스키는 저장소에 커밋하지 않습니다. `.env.example`에는 변수명만 둡니다.

## 2. 테스트 순서

### 2.1 국문 관광정보 서비스

목표:
- CSV 어휘가 실제 관광정보 검색 결과와 얼마나 잘 연결되는지 확인합니다.

테스트 키워드:
- 경복궁
- 남산 서울 타워
- 김치
- 한복
- 태권도
- 판소리
- 갯벌
- 감귤

확인 항목:
- 응답 성공 여부
- `contentid`, `contenttypeid`, `title`, `addr1`, `mapx`, `mapy`, `firstimage` 존재 여부
- 같은 키워드 검색 결과 중 학습 콘텐츠로 적합한 항목이 있는지
- `detailCommon`, `detailIntro`, `detailImage` 추가 조회 가능 여부

초기 저장 대상:
- `cache/kto/kor-search-{keyword}.json`
- `cache/kto/kor-detail-{contentid}.json`

### 2.2 관광지 오디오 가이드

목표:
- 어휘와 연결 가능한 오디오/스토리 콘텐츠를 찾습니다.

테스트 키워드:
- 경복궁
- 세종대왕
- 강강술래
- 판소리
- 남산

확인 항목:
- 이야기 제목
- 대본/설명
- 음성 URL
- 이미지 URL
- 언어 정보
- 관광지 위치/키워드 매칭 가능 여부

초기 저장 대상:
- `cache/kto/odii-search-{keyword}.json`

### 2.3 관광빅데이터

목표:
- 지역 방문자수 데이터를 학습 추천 보조 지표로 쓸 수 있는지 확인합니다.

테스트 지역:
- 서울특별시
- 종로구
- 중구
- 제주특별자치도
- 서귀포시

확인 항목:
- 광역/기초 지자체 코드 체계
- 조회 가능 기간
- 내국인/외국인 분리 가능 여부
- 월별/일별 데이터 단위
- 특정 장소가 아니라 지역 트렌드로만 해석해야 하는 제한점

초기 저장 대상:
- `cache/kto/bigdata-region-{regionCode}.json`

### 2.4 두루누비

목표:
- 자연/걷기 기반 한국어 미션을 만들 수 있는 코스 정보를 수집합니다.

테스트 키워드/지역:
- 제주
- 서울
- 갯벌
- 남해
- 둘레길

확인 항목:
- 코스명
- 길명
- 지역
- 난이도/거리/소요시간
- 경로 데이터 제공 형태
- 주변 관광정보 연결 가능 여부

초기 저장 대상:
- `cache/kto/durunubi-course.json`
- `cache/kto/durunubi-route.json`

## 3. 성공 기준

1차 성공:
- 주요 어휘 10개 중 7개 이상이 국문 관광정보 검색 결과와 연결됩니다.
- 주요 어휘 10개 중 3개 이상이 오디오/스토리 또는 두루누비/방문트렌드 데이터와 연결됩니다.
- 장소 데이터에서 제목, 주소, 이미지, 좌표 중 3개 이상 필드를 안정적으로 가져옵니다.

2차 성공:
- 어휘 상세 화면에서 관련 장소 3개 이상을 표시합니다.
- 장소 상세 화면에서 추천 한국어 표현 3개와 미션 1개를 자동 생성하거나 매칭합니다.
- 지역 방문 트렌드를 “혼잡도 단정”이 아니라 “방문 트렌드 참고”로 표시합니다.

## 4. 주의사항

- 위치기반 기능은 초기에는 사용하지 않습니다.
- 사용자의 현재 GPS 좌표를 수집하지 않는 방향으로 먼저 개발합니다.
- 특정 음식점이나 장소를 “피해야 한다”고 단정하지 않고, 가격표/호객/정보 부족 같은 주의 신호로 표현합니다.
- 공공데이터 출처와 이용 조건을 화면 하단과 데이터 상세에 표시합니다.
- 이미지 사용 조건은 API별 공공누리 유형을 확인한 뒤 노출합니다.

## 5. 구현 단계

1. `.env`에 `TOUR_API_KEY` 입력
2. `scripts/build-prototype-data.mjs`로 CSV 기반 프로토타입 데이터 생성
3. 국문 관광정보 키워드 검색 스모크 테스트 작성 및 실행
4. 응답 샘플을 `cache/`에 저장
5. `prototype/data/app-data.js`에 실제 매칭 결과 일부 반영
6. 장소 상세/미션 상세 화면 확장

## 6. 현재 구현된 실행 명령

CSV에서 프로토타입 기본 데이터를 다시 생성합니다.

```bash
node scripts/build-prototype-data.mjs
```

API 키가 현재 작업 폴더에서 읽히는지 확인합니다. 키 값은 출력하지 않고 존재 여부만 표시합니다.

```bash
node scripts/check-tourapi-env.mjs
```

국문 관광정보 API 스모크 테스트를 실행합니다. `.env`에 `TOUR_API_KEY`가 있어야 합니다.

```bash
node scripts/tourapi-kor-smoke-test.mjs 경복궁 한복 김치 "남산 서울 타워" 태권도
```

주요 어휘 10개를 국문 관광정보 API 검색 결과와 매칭하고, 프로토타입용 데이터를 생성합니다.

```bash
node scripts/tourapi-build-matches.mjs
```

대표 장소 10개의 `detailCommon2`/`detailImage2` 상세정보를 수집합니다.

```bash
node scripts/tourapi-build-details.mjs
```

관광지 오디오가이드 API에서 주요 어휘와 관련된 이야기/오디오 대본을 수집합니다.

```bash
node scripts/tourapi-build-odii.mjs
```

오디오/대본/대표 장소 설명에서 핵심 표현과 듣기 퀴즈를 생성합니다.

```bash
node scripts/build-learning-activities.mjs
```

생성 파일:

```text
cache/kto/kor-search-{keyword}.json
cache/kto/detail-common-{contentId}.json
cache/kto/detail-image-{contentId}.json
prototype/data/tourapi-matches.js
prototype/data/tourapi-place-details.js
prototype/data/odii-stories.js
prototype/data/learning-activities.js
```

`.env`가 없거나 `TOUR_API_KEY`가 비어 있으면 API 호출은 하지 않고, 기존 캐시가 있을 때만 매칭 데이터를 생성합니다.
