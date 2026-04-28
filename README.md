# CrossCheckNews Web

뉴스 비교 서비스와 파이프라인 모니터링 대시보드를 제공하는 React/Vite 프론트엔드입니다.

## 주요 화면

- `/` 파이프라인 대시보드
- `/topics` 뉴스 토픽 목록
- `/topics/:id` 토픽 상세 비교
- `/admin/:secret/publishers` 언론사 관리

## 대시보드 기능

- 요약 카드: 전체 기사 수, 전체 토픽 수, 오늘 수집 기사 수, 실패 작업 수, 마지막 수집 시간
- 최근 파이프라인 실행 이력 테이블
- Recharts 기반 언론사별 기사 수 차트
- 국가별 토픽 수, 파이프라인 결과 상태 도넛 차트
- `/api/pipeline/stream` SSE 이벤트 기반 실시간 파이프라인 단계 표시

## 로컬 실행

백엔드는 demo profile로 실행하면 대시보드 샘플 데이터가 자동 생성됩니다.

```bash
cd ../news-bias-api
./gradlew bootRun --args='--spring.profiles.active=demo'
```

프론트엔드는 Vite dev server를 사용합니다.

```bash
npm install
npm run dev
```

데모 관리자 계정:

```text
username: admin
password: admin1234
```

## 검증

```bash
npm run build
```
