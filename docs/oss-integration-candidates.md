# K-Culture OSS 통합 후보 리스트

> 조사일: 2026-07-20  
> 대상 앱: **korean-edu** (세종 문화 어휘 × TourAPI × 미션/퀴즈 정적 프로토타입)  
> 방법: GitHub Search API (`gh search repos`) + MCP `search_repositories` 다중 쿼리  
> 목적: **우리 앱에 통합 가능한** 오픈소스를 우선순위와 통합 방식으로 정리

## 우리 앱 통합 기준

| 점수 | 의미 |
|------|------|
| **A** | 바로 붙일 수 있음 (JS/브라우저 친화, 데이터/API 직접 매칭) |
| **B** | 콘텐츠·학습 레이어 확장 (K-pop/K-drama/K-movie/관광) |
| **C** | 백엔드·ML 확장 시 유리 (TTS/ASR/NLP) — 현재 정적 MVP엔 과함 |
| **D** | 참고·패턴·큐레이션만 (직접 코드 이식 가치 낮음) |
| **X** | 제외 (불법 스트리밍, 이름만 유사, 무관) |

현재 MVP 스택: 정적 `prototype/` + Node 스크립트 + TourAPI 정적 생성 데이터 + `localStorage` 진도.

---

## 1. 최우선 (A) — 이번 스프린트에 바로 검토

| # | Repo | Stars | 언어 | 한 줄 설명 | 우리 앱 통합 포인트 |
|---|------|------:|------|-----------|-------------------|
| 1 | [toss/es-hangul](https://github.com/toss/es-hangul) | ~1.8k | TS | 현대적 한글 처리 라이브러리 | 자모 분리 퀴즈, 받침 판별, 검색 정규화 |
| 2 | [e-/Hangul.js](https://github.com/e-/Hangul.js) | ~714 | JS | 자음/모음 분리·조합·오토마타 | 어휘 카드 자모 활동, 타이핑 미션 |
| 3 | [738/inko](https://github.com/738/inko) | ~233 | JS | 영타↔한타 변환 | 검색창 “kimchi→김치” 교정 UX |
| 4 | [bluewings/korean-regexp](https://github.com/bluewings/korean-regexp) | ~231 | TS | 한글 초성/부분 검색 정규식 | 어휘·장소 검색 고도화 |
| 5 | [hmmhmmhm/hangul-search-js](https://github.com/hmmhmmhm/hangul-search-js) | ~25 | TS | 간단 한글 검색 모듈 | 카드 리스트 클라이언트 검색 |
| 6 | [Tyriar/hangul-romanization](https://github.com/Tyriar/hangul-romanization) | ~28 | TS | 로마자 표기 | 외국인 학습자용 로마자 병기 |
| 7 | [AaronO/kpop](https://github.com/AaronO/kpop) | ~25 | JS | 한국어 로마자 유틸 | 이름 그대로지만 **로마자 변환용** (K-pop 아님) |
| 8 | [victorteokw/kroman-js](https://github.com/victorteokw/kroman-js) | ~17 | JS | Hangul romanization | 병기 표기 대안 |
| 9 | [peecky/hangul-postposition](https://github.com/peecky/hangul-postposition) | ~25 | JS | 은/는/이/가 조사 선택 | 예문·미션 문장 자동 생성 품질 |
| 10 | [hyunwoongko/kss](https://github.com/hyunwoongko/kss) | ~471 | Python | 한국어 문장 분리 | 스토리/오디오 스크립트 문장 단위 퀴즈 생성 파이프라인 |
| 11 | [harimkang/mcp-korea-tourism-api](https://github.com/harimkang/mcp-korea-tourism-api) | ~9 | Python | **한국관광 API MCP 서버** | 기존 TourAPI 스크립트와 역할 겹침 → 패턴/엔드포인트 참고, 에이전트 연동 시 재사용 |
| 12 | [JoMingyu/TourAPI](https://github.com/JoMingyu/TourAPI) | ~3 | Python | TourAPI 파싱 라이브러리 (`pip install tourapi`) | `scripts/tourapi-*.mjs` 파서 개선 참고 |
| 13 | [sondeokhyeon/TourAPI](https://github.com/sondeokhyeon/TourAPI) | ~2 | HTML | TourAPI 3.0 활용 예제 | 레거시 필드 매핑 참고 |
| 14 | [spellcheck-ko/korean-dict-nikl](https://github.com/spellcheck-ko/korean-dict-nikl) | ~123 | Python | 국립국어원 사전 FOSS | 어휘 뜻풀이·예문 보강 데이터 소스 |
| 15 | [julienshim/combined_korean_vocabulary_list](https://github.com/julienshim/combined_korean_vocabulary_list) | ~24 | Python | 국립국어원 어휘 리스트 통합 | 세종 CSV 외 초급 어휘 확장 |
| 16 | [ryanbrainard/jjogaegi](https://github.com/ryanbrainard/jjogaegi) | ~47 | HTML | 한국어 어휘 파서/포매터 | Anki/카드 포맷 변환, 교재 어휘 파이프라인 |
| 17 | [dl0312/open-apis-korea](https://github.com/dl0312/open-apis-korea) | ~3.8k | Python | 한국 오픈 API 큐레이션 | 관광·문화·교통 API 발굴 목록 |
| 18 | [yybmion/public-apis-4Kr](https://github.com/yybmion/public-apis-4Kr) | ~2.9k | Python | 한국 서비스 Public API 모음 | 동일 — API 카탈로그 |
| 19 | [uyeong/NotoSans-subset](https://github.com/uyeong/NotoSans-subset) | ~169 | — | 경량 한글 웹폰트 | prototype 로딩 성능·타이포 |
| 20 | [lqez/awesome-hangul](https://github.com/lqez/awesome-hangul) | ~373 | Go | Hangul/Korean 라이브러리 큐레이션 | 추가 후보 메타 소스 |

---

## 2. 콘텐츠 확장 (B) — K-pop / K-drama / K-movie / 관광 문화

### 2.1 K-pop

| # | Repo | Stars | 언어 | 설명 | 통합 아이디어 |
|---|------|------:|------|------|--------------|
| 21 | [ko28/melon-api](https://github.com/ko28/melon-api) | ~42 | Python | 멜론 차트 API | “이번 주 차트 표현” 미션, 트렌드 어휘 |
| 22 | [love5757/music-api-kr](https://github.com/love5757/music-api-kr) | ~23 | — | Melon/Genie/Bugs/FLO/Hanteo/YouTube 차트 | 멀티 차트 스냅샷 데이터 생성 |
| 23 | [max-jang/korea-music-chart-api](https://github.com/max-jang/korea-music-chart-api) | ~14 | Java | 국내 음원 차트 API | 동일 |
| 24 | [DBraun/kpop_midi](https://github.com/DBraun/kpop_midi) | ~30 | — | K-pop MIDI(코드 진행) | 음악 미션·리듬 활동 (교육 목적) |
| 25 | [Brainicism/KMQ_Discord](https://github.com/Brainicism/KMQ_Discord) | ~47 | TS | K-pop 노래 맞히기 Discord 게임 | **게임 UX 패턴** (미리듣기→퀴즈) 벤치마킹 |
| 26 | [importdata/kpop-analysis](https://github.com/importdata/kpop-analysis) | ~22 | Jupyter | K-pop 데이터 분석 | 팬덤/연도 메타 참고 |
| 27 | [haebichan/kpopclassifier](https://github.com/haebichan/kpopclassifier) | ~34 | Jupyter | BTS 분류기 실험 | 연구용, 직접 통합 낮음 |
| 28 | [tapankarnik/Kpop-Idol-Face-Classifier](https://github.com/tapankarnik/Kpop-Idol-Face-Classifier) | ~33 | Python | 아이돌 얼굴 인식 | 비전 미션 실험용 |
| 29 | [Xetera/kiyomi](https://github.com/Xetera/kiyomi) | ~37 | TS | K-pop 이미지 수집기 | 라이선스 주의 — 참고만 |
| 30 | [dobestan/awesome-twice](https://github.com/dobestan/awesome-twice) | ~25 | — | TWICE 큐레이션 리스트 | 팬덤 링크·메타 구조 참고 |
| 31 | [LISTEN-moe/android-app](https://github.com/LISTEN-moe/android-app) | ~312 | Kotlin | LISTEN.moe 앱 (JP/KR 라디오) | 오디오 스트리밍 UX 참고 |
| 32 | [cutechan/cutechan](https://github.com/cutechan/cutechan) | ~28 | Go | K-pop 지향 이미지보드 | 커뮤니티 패턴만 |

> **주의:** 가사 전문 다운로드/무단 스트리밍 계열(`Slyyxp/rsack` 등)은 **통합 제외**. 차트 메타데이터·교육용 샘플만.

### 2.2 K-drama / K-movie

| # | Repo | Stars | 언어 | 설명 | 통합 아이디어 |
|---|------|------:|------|------|--------------|
| 33 | [GHGHGHKO/klassic-quote-api](https://github.com/GHGHGHKO/klassic-quote-api) | ~21 | Rust | **한국 영화 명대사 API** | 어휘×명대사 카드, 듣기/읽기 퀴즈 소스 |
| 34 | [Kaede-No-Ki/movie-rest-api](https://github.com/Kaede-No-Ki/movie-rest-api) | ~14 | JS | K-drama/영화 REST API | 작품 메타 + 학습 미션 연결 |
| 35 | [lyjacky11/kdrama](https://github.com/lyjacky11/kdrama) | ~12 | JS | 아시아 드라마 디스커버리 | UI/검색 UX 참고 |
| 36 | [dsherbini/kdrama-recommendations](https://github.com/dsherbini/kdrama-recommendations) | ~4 | Python | 드라마 추천 앱 | 추천 로직 참고 |
| 37 | [EricCHChang/kdrama](https://github.com/EricCHChang/kdrama) | ~0+ | Jupyter | IMDb 한국 드라마 데이터셋 탐색 | 데이터 스키마 참고 |
| 38 | [apoorvareddy612/Kdramas_Analysis](https://github.com/apoorvareddy612/Kdramas_Analysis) | ~10 | Jupyter | K-drama 분석 | 주제 태그 아이디어 |
| 39 | [feifang/New-Lipstick-Effect](https://github.com/feifang/New-Lipstick-Effect) | ~5 | CSS | 한드→립스틱 트렌드 데이터 스토리 | 문화 트렌드 스토리텔링 참고 |
| 40 | [wormwlrm/kwakcheolyong](https://github.com/wormwlrm/kwakcheolyong) | ~204 | Vue | 타짜 곽철용 짤 생성기 | 바이럴/재미 레이어 (브랜드 톤 맞을 때) |
| 41 | [adhadse/Deepdubpy](https://github.com/adhadse/Deepdubpy) | ~13 | Jupyter | 한드 더빙 TTS (WIP) | 장기: 드라마 대사 발음 연습 |

> **제외 (X):** `noelrohi/kd`, `reverbdesign/kdrama` 등 **광고 없는 무단 스트리밍** 계열 — 저작권 리스크로 통합 금지.

### 2.3 관광 / 로컬 문화 / 장소

| # | Repo | Stars | 언어 | 설명 | 통합 아이디어 |
|---|------|------:|------|------|--------------|
| 42 | [mtjin/NoMoneyTrip](https://github.com/mtjin/NoMoneyTrip) | ~33 | Kotlin | 스마트관광 공모전 ‘무전여행’ | 미션 설계·관광 데이터 UX 참고 |
| 43 | [TourKakao-Carping/Carping-Backend](https://github.com/TourKakao-Carping/Carping-Backend) | ~17 | Python | 관광데이터 경진대회 최우수 | 캠핑/로컬 데이터 스키마 참고 |
| 44 | [97arushisharma/Korean-Tourism](https://github.com/97arushisharma/Korean-Tourism) | ~4 | CSS | 한국관광 웹 클론(초보용) | 랜딩 구조 참고 |
| 45 | [seungwoodev/theklub](https://github.com/seungwoodev/theklub) | ~4 | JS | 한국 문화 메타버스 3D 플랫폼 | 장기 체험형 확장 |
| 46 | [hmmhmmhm/daiso-mcp](https://github.com/hmmhmmhm/daiso-mcp) | ~310 | TS | 로컬 리테일·영화관 MCP | “다이소/영화관 미션” 로컬 시그널 |
| 47 | [hyunbinseo/holidays-kr](https://github.com/hyunbinseo/holidays-kr) | ~488 | TS | 한국 공휴일 데이터 | 명절·연휴 문화 미션 스케줄 |
| 48 | [738/awesome-sushi](https://github.com/738/awesome-sushi) | ~2.5k | — | 국내 스시 오마카세 리스트 | 리스트 큐레이션 포맷 참고 (음식 미션) |

---

## 3. 학습 포털 / 도구 패턴 (B~C)

| # | Repo | Stars | 언어 | 설명 | 통합 아이디어 |
|---|------|------:|------|------|--------------|
| 49 | [tristcoil/hanabira.org](https://github.com/tristcoil/hanabira.org) | ~409 | TS | 일·한 학습 포털 (self-host, MIT) | **전체 UX/세션 구조 벤치마크** |
| 50 | [DaleSeo/korean-skills](https://github.com/DaleSeo/korean-skills) | ~112 | — | AI 에이전트용 한국어 스킬 | 콘텐츠 생성 에이전트 프롬프트 |
| 51 | [OuterSpaceHobo/ScanLingua](https://github.com/OuterSpaceHobo/ScanLingua) | ~26 | TS | 한·중·일 몰입 학습 크롬 확장 | 읽기 모드/하이라이트 UX |
| 52 | [Alaanor/kimchi-grammar](https://github.com/Alaanor/kimchi-grammar) | ~29 | — | Kimchi Reader 문법 정의 | 문법 태그·설명 스키마 |
| 53 | [Pi3-l22/TingJu](https://github.com/Pi3-l22/TingJu) | ~102 | Python | 문장별 번역·오디오 듣기 도구 (한 포함) | 듣기 퀴즈 파이프라인 참고 |
| 54 | [IBM/tensorflow-hangul-recognition](https://github.com/IBM/tensorflow-hangul-recognition) | ~250 | Python | 손글씨 한글 인식 | “쓰기 미션” 실험 |

---

## 4. 음성·NLP 인프라 (C) — 서버 붙일 때

| # | Repo | Stars | 용도 | 앱 연결 |
|---|------|------:|------|--------|
| 55 | [myshell-ai/MeloTTS](https://github.com/myshell-ai/MeloTTS) | ~7.5k | 다국어 TTS (한국어) | 예문 자동 음성 생성 |
| 56 | [TensorSpeech/TensorFlowTTS](https://github.com/TensorSpeech/TensorFlowTTS) | ~4.0k | TTS (korea-tts 토픽) | 동일 |
| 57 | [FunAudioLLM/SenseVoice](https://github.com/FunAudioLLM/SenseVoice) | ~8.9k | 한국어 ASR | 발음 평가·받아쓰기 |
| 58 | [FunAudioLLM/CosyVoice](https://github.com/FunAudioLLM/CosyVoice) | ~22k | 다국어 음성 생성 | 고급 TTS |
| 59 | [Kyubyong/g2pK](https://github.com/Kyubyong/g2pK) | ~271 | 한국어 G2P | 발음 기호/듣기 정답 키 |
| 60 | [homink/speech.ko](https://github.com/homink/speech.ko) | ~43 | 국립국어원 읽기 음성 코퍼스 | 학습 오디오 데이터셋 |
| 61 | [ttop32/coqui_tts_korea](https://github.com/ttop32/coqui_tts_korea) | ~66 | Coqui 기반 한국어 TTS | 로컬 TTS |
| 62 | [hccho2/Tacotron2-Wavenet-Korean-TTS](https://github.com/hccho2/Tacotron2-Wavenet-Korean-TTS) | ~165 | 한국어 Tacotron2 | 연구용 |
| 63 | [konlpy/konlpy](https://github.com/konlpy/konlpy) | ~1.5k | 한국어 NLP | 어휘 형태소/품사 라벨 |
| 64 | [bab2min/Kiwi](https://github.com/bab2min/Kiwi) | ~754 | 형태소 분석기 | 서버 토크나이저 |
| 65 | [ongjin/garu](https://github.com/ongjin/garu) | ~158 | **브라우저 WASM 형태소 분석** | 정적 앱에서도 경량 분석 가능 |
| 66 | [open-korean-text/open-korean-text](https://github.com/open-korean-text/open-korean-text) | ~667 | 한국어 텍스트 프로세서 | 토큰화 |
| 67 | [lovit/soynlp](https://github.com/lovit/soynlp) | ~986 | 비지도 한국어 NLP | 신조어/트렌드 어휘 |
| 68 | [SKTBrain/KoBERT](https://github.com/SKTBrain/KoBERT) | ~1.4k | 한국어 BERT | 유사 어휘 추천 |
| 69 | [Beomi/KoAlpaca](https://github.com/Beomi/KoAlpaca) | ~1.6k | 한국어 instruction LLM | 미션/퀴즈 생성 에이전트 |
| 70 | [ko-nlp/Korpora](https://github.com/ko-nlp/Korpora) | ~756 | 한국어 코퍼스 모음 | 예문 확장 |
| 71 | [HeegyuKim/open-korean-instructions](https://github.com/HeegyuKim/open-korean-instructions) | ~469 | 한국어 instruction 데이터 | AI 생성 품질 |
| 72 | [datanada/Awesome-Korean-NLP](https://github.com/datanada/Awesome-Korean-NLP) | ~661 | 한국어 NLP 큐레이션 | 메타 목록 |
| 73 | [NomaDamas/awesome-korean-llm](https://github.com/NomaDamas/awesome-korean-llm) | ~480 | 한국어 LLM 큐레이션 | 동일 |

---

## 5. 참고만 (D)

| Repo | 이유 |
|------|------|
| [netlify-templates/kpop-stack](https://github.com/netlify-templates/kpop-stack) | 이름만 K-pop — Remix+Netlify 스택 템플릿 |
| [agens-no/AGGeometryKit-POP](https://github.com/agens-no/AGGeometryKit-POP) | Facebook POP 애니메이션 — K-culture 무관 |
| Discord K-pop 봇들 (Robyul2, miso-bot, IreneBot 등) | 커뮤니티 봇, 학습 앱 코어와 거리 |
| [LISTEN-moe](https://github.com/LISTEN-moe/android-app) 외 라디오/팬덤 봇 | 미디어 소비 앱 — 학습 목표와 간접 연결만 |
| [SimmerChan/KG-demo-for-movie](https://github.com/SimmerChan/KG-demo-for-movie) | 영화 KG 데모지만 한국 콘텐츠 특화 아님 |
| 일반 TheMovieDB 클론들 | “k-movie”가 아니라 Kotlin MultiPlatform Movie |

---

## 6. 제외 (X)

| 유형 | 예시 | 사유 |
|------|------|------|
| 불법/그레이 스트리밍 | `noelrohi/kd`, 무단 K-drama 사이트 | 저작권 |
| 유료 음원 대량 다운로드 | `Slyyxp/rsack` 등 | 라이선스·약관 |
| 쿼리 노이즈 | POP 애니메이션, BTS(Bluetooth/Brain Tumor) | 키워드 충돌 |
| 회사 culture 문서 | `qualitymatters`, `cancel-culture` 등 | “culture” 동음이의 |

---

## 7. 우리 앱 모듈별 매핑 (추천 로드맵)

### Phase α — 프로토타입 즉시 (1~2주)

1. **검색 UX:** `es-hangul` 또는 `korean-regexp` + `inko`  
2. **로마자 병기:** `hangul-romanization` / `kroman-js`  
3. **조사 자동:** `hangul-postposition` → 미션 문장 생성 스크립트  
4. **폰트:** `NotoSans-subset`  
5. **TourAPI 보강:** `mcp-korea-tourism-api`, `JoMingyu/TourAPI`, `open-apis-korea` / `public-apis-4Kr` 에서 추가 공공 API 발굴

### Phase β — 콘텐츠 레이어 (K-culture 확장)

6. **영화 명대사:** `klassic-quote-api` → `prototype/data/movie-quotes.js` 생성  
7. **차트 트렌드:** `melon-api` / `music-api-kr` 주간 스냅샷 → “K-pop 표현 미션”  
8. **드라마 메타:** `movie-rest-api` 또는 공개 데이터셋 → 작품 태그 어휘 연결  
9. **공휴일·로컬:** `holidays-kr`, `daiso-mcp` 패턴

### Phase γ — 음성·AI

10. **TTS:** MeloTTS / TensorFlowTTS로 퀴즈 오디오 사전 생성 (API 키 없이 정적 mp3)  
11. **G2P:** g2pK로 발음 힌트  
12. **WASM 형태소:** `garu`로 브라우저 내 품사 힌트  
13. **학습 포털 UX:** `hanabira.org` 세션 플로우 벤치

---

## 8. 검색에 사용한 주요 쿼리

```text
kpop in:name,description stars:>5
topic:kpop stars:>3
"korean music" in:name,description
kdrama OR "korean drama" in:name,description
"korean film" OR "korean cinema" OR "korean movie"
hangul in:name,description stars:>10
topic:hangul / topic:korean-nlp / topic:korean-language / topic:korea
"learn korean" OR "korean learning" OR "korean language" stars:>20
"korean vocabulary" OR "korean vocab"
tourapi OR "korean tourism" OR "visit korea" OR "한국관광공사"
melon-api OR music chart korea
romanization korean / g2pk / hangul-romanization
tts korean / SenseVoice / MeloTTS
open-apis-korea / public-apis-4Kr
```

> “모두”는 기술적으로 무한에 가깝습니다. 본 문서는 **stars·설명·우리 MVP 접점** 기준으로 1차 필터링한 **통합 후보 풀(약 70개 + 제외 목록)** 입니다.  
> 재검색 시: `gh search repos '<query>' --limit 30 --json fullName,description,stargazersCount,language,url`

---

## 9. 다음 액션 제안

| 우선 | 액션 |
|------|------|
| 1 | A군 중 **es-hangul + hangul-romanization + hangul-postposition** 프로토타입 스파이크 |
| 2 | **klassic-quote-api** / **melon-api** 응답 shape 확인 후 `scripts/` 빌더 스케치 |
| 3 | **open-apis-korea**에서 문화·관광 관련 API 10개 추가 후보 추출 |
| 4 | (선택) OSS 스카우팅 전용 하네스 구축 → 주기적 재검색 자동화 |

---

## 부록: 앱 기능 ↔ 후보 빠른 표

| 앱 기능 | 1순위 후보 |
|---------|-----------|
| 어휘 카드/검색 | es-hangul, korean-regexp, inko, hangul-search-js |
| 로마자 병기 | hangul-romanization, kroman-js, AaronO/kpop |
| 예문·미션 문장 | hangul-postposition, kss, NIKL dict |
| TourAPI/장소 | mcp-korea-tourism-api, JoMingyu/TourAPI, open-apis-korea |
| 듣기 퀴즈 | MeloTTS, g2pK, speech.ko, SenseVoice |
| K-pop 미션 | melon-api, music-api-kr, KMQ_Discord(패턴) |
| K-movie 미션 | klassic-quote-api, kwakcheolyong(재미) |
| K-drama 메타 | movie-rest-api, kdrama 데이터셋들 |
| 진도/학습 UX | hanabira.org, ScanLingua, TingJu |
