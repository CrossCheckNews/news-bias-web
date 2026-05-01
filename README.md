# CrossCheckNews — 뉴스 편향 비교 서비스

다국가 뉴스를 언론사와 정치적 성향 기준으로 비교하고, 뉴스 수집 파이프라인의 실행 상태를 실시간으로 모니터링하는 풀스택 프로젝트의 프론트엔드입니다.

본 프론트엔드는 Spring Boot 기반 백엔드 API와 연동되며, 뉴스 토픽 비교 화면과 관리자용 파이프라인 모니터링 대시보드를 제공합니다.

---

## 주요 기능

### 뉴스 비교

- 토픽별로 여러 언론사의 기사를 한 화면에서 비교
- 언론사의 국가 및 정치적 성향(진보 / 중도 / 보수)을 함께 표시
- 토픽 카테고리 필터 및 국가 탭으로 빠른 탐색

### 파이프라인 모니터링 대시보드 (핵심)

| 구성 요소                         | 설명                                                                                                                                      |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Active Pipeline Orchestration** | SSE(`/api/pipeline/stream`)로 파이프라인 실행 단계를 실시간 수신해 노드 그래프로 시각화. 각 단계를 구분하며, 진행률 바가 완료 비율을 표시 |
| **Metric Cards**                  | 날짜 선택기와 연동해 수집 기사 수, 토픽 수, 성공/실패 작업 수를 카드 형태로 요약                                                          |
| **Articles by Publisher**         | Recharts 기반 수평 바 차트로 언론사별 기사 수 비교                                                                                        |
| **Topics by Country**             | 도넛 차트로 국가별 토픽 분포 시각화                                                                                                       |
| **Pipeline Result Status**        | 도넛 차트로 파이프라인 실행 결과(SUCCESS / FAILED / PARTIAL) 비율 표시                                                                    |
| **Pipeline History Table**        | 최근 파이프라인 실행 이력을 테이블로 조회                                                                                                 |
| **Run Pipeline**                  | 버튼 클릭으로 파이프라인 수동 실행 트리거. 당일 이미 실행된 경우 재실행 확인 모달 표시                                                    |

### 관리자 기능

- 로그인 후 인증 토큰과 만료 시각을 `sessionStorage`에 저장
- 언론사 (목록 조회, 상세 조회)
- 기사 (목록 조회, 상세 조회)
- `VITE_ADMIN_SECRET_PATH` 환경 변수로 관리자 경로 보호

---

## 구현 의도

### 왜 파이프라인 모니터링을 프론트엔드에서 직접 시각화했는가

뉴스 수집 파이프라인은 외부 API 호출, AI 요약 생성, DB 저장 등 여러 단계를 순차적으로 처리합니다. 각 단계의 진행 여부를 관리자가 실시간으로 파악할 수 없으면, 실패 시 원인 파악이 어렵고 대응이 늦어집니다.

이 문제를 해결하기 위해 **SSE(Server-Sent Events)** 를 선택했습니다. WebSocket 대비 단방향 스트림으로 충분한 시나리오에서 구현 복잡도를 낮추면서, HTTP 기반이라 별도 인프라 없이 프록시를 그대로 활용할 수 있다는 장점이 있습니다. 파이프라인 단계별 상태(WAITING → RUNNING → SUCCESS / FAILED)를 노드 그래프로 표현해 진행 흐름을 한눈에 파악할 수 있도록 했습니다.

### 왜 TanStack Query를 서버 상태 관리에 사용했는가

대시보드는 메트릭 카드, 차트 3종, 히스토리 테이블 등 여러 API를 동시에 호출합니다. 각 요청의 로딩·에러·캐시 상태를 직접 관리하면 코드가 복잡해지고, 날짜 필터 변경 시 관련 쿼리만 선택적으로 재요청하기도 어렵습니다.

TanStack Query의 쿼리 키 기반 캐싱과 `invalidateQueries`를 활용해 날짜 변경이나 파이프라인 실행 후 관련 데이터만 정확하게 갱신되도록 구성했습니다.

### 왜 관리자 경로를 환경 변수로 보호했는가

별도의 관리자 전용 도메인이나 IP 제한을 구성하지 않은 과제 환경에서, 관리자 화면이 일반 경로에 직접 노출되지 않도록 `VITE_ADMIN_SECRET_PATH` 환경 변수로 관리자 경로를 분리했습니다. 로그인 인증과 함께 관리자 화면의 직접 노출을 줄이기 위한 보조적인 접근 제한으로 사용했습니다.

---

## 기술 스택

| 분류              | 기술                                    |
| ----------------- | --------------------------------------- |
| **프레임워크**    | React, TypeScript                       |
| **번들러**        | Vite                                    |
| **라우팅**        | React Router                            |
| **서버 상태**     | TanStack Query                          |
| **HTTP**          | Axios (Vite proxy → `localhost:8080`)   |
| **실시간 통신**   | SSE (Server-Sent Events)                |
| **차트**          | Recharts (바 차트, 도넛 차트)           |
| **스타일링**      | Tailwind CSS, shadcn/ui, tw-animate-css |
| **아이콘**        | Lucide React                            |
| **날짜**          | date-fns, react-day-picker              |
| **테스트**        | Vitest, Testing Library, Playwright     |
| **패키지 매니저** | pnpm                                    |

---

## 실행 방법

### 1. 백엔드 실행 (Spring Boot)

demo 프로파일로 실행하면 샘플 데이터가 자동 생성됩니다.

```bash
cd ../news-bias-api
./gradlew bootRun --args='--spring.profiles.active=demo'
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.example`을 복사해 `.env` 파일을 생성해주세요.

```bash
cp .env.example .env
```

### 3. 프론트엔드 실행

```bash
pnpm install
pnpm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 4. 관리자 로그인

- URL: `http://localhost:5173/admin/{VITE_ADMIN_SECRET_PATH}/dashboard`
- ID: `admin` / PW: `admin1234`

---

## 주요 화면 경로

| 경로                        | 화면                         |
| --------------------------- | ---------------------------- |
| `/`                         | 뉴스 토픽 목록               |
| `/topics/:id`               | 토픽별 언론사 비교 상세      |
| `/admin/:secret/dashboard`  | 파이프라인 모니터링 대시보드 |
| `/admin/:secret/publishers` | 언론사 관리                  |

---

## 검증 명령어

```bash
pnpm run test:run   # Vitest 단위 테스트
pnpm run test:e2e   # Playwright E2E 테스트
pnpm run check      # lint + test + build 전체 검증
```
