# 🏛️ 당신의 피비 (Your Wealth Partner)

> **308개 글로벌 ETF 투시(X-Ray) & HRP 자산배분 인텔리전스**
> 공식 웹 서비스: [https://yourpb.vercel.app](https://yourpb.vercel.app)

본 레포지토리는 글로벌 ETF 및 우량주 자산배분 인텔리전스 플랫폼 **`당신의 피비`**의 프로덕션 웹 프론트엔드 및 서버리스 애플리케이션 소스코드입니다.

---

## 💎 핵심 서비스 특징 (Core Features)

1. **308개 글로벌 ETF 엑스레이 (Hero)**:
   - 미국 및 국내 상장 주요 308개 ETF의 실시간 가격, 기간별 수익률(1주/5주/20주/60주/120주), 10대 보유종목 분산 투시
   - 블룸버그 터미널 스타일 초경량 2단 미니 스파크라인 (`MiniSparkline`) 탑재
2. **1,025개 개별 우량주 심층 리서치 (Enabler)**:
   - ETF 속 종목을 투시하는 정밀 도구로서의 1,000여 개 개별 우량주 펀더멘털 및 가치평가 리서치
   - `Fuse.js` 초고속 퍼지 검색 엔진(티커/종목명 이중 가중치 및 오타 자동 보정) 및 모바일 2줄 수직 스택 최적화
3. **TradingView Lightweight Charts (60fps 인터랙티브 차트)**:
   - 120주 포커스 및 우측 자석 앵커링, 모바일 최적화 여백, `[전체 보기]` ⟷ `[최근 120주]` 심플 원터치 토글
4. **스마트폰 홈 화면 추가 PWA 1초 설치 배너 (`InstallPrompt`)**:
   - 모바일 접속 시 1.5초 후 자연스러운 슬라이드업 노출
   - **카카오톡 웹뷰 탈출**: 안드로이드 카카오톡 원클릭 크롬 브라우저 자동 호출 Intent, 아이폰 사파리 3단계 모달 안내
   - 독립 앱(`display-mode: standalone`) 모드 감지 시 배너 자동 숨김 및 닫기 7일 쿨다운
5. **무손실 네비게이션 가드 (`recordListNav` + `BackToListButton`)**:
   - `nuqs` URL 쿼리 파라미터 양방향 동기화 및 `sessionStorage` 기반 목록 복귀 시 필터/검색어 100% 무손실 보존
6. **토스페이먼츠 SDK v2 결제 & Supabase RLS 보안**:
   - 2단계 클라이언트-서버 교차 검증 트랜잭션 및 `auth.uid()` 기반 엄격한 행 수준 보안(Row Level Security)

---

## 🛠️ 기술 스택 (Tech Stack)

| 구분 | 채택 기술 | 선정 사유 |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16.3 (Turbopack)** | App Router, 서버 컴포넌트(RSC), `unstable_cache` 3600초 캐싱 |
| **Library** | **React 19** | 자동 배칭(Automatic Batching), 지연 로딩 컴포넌트 청크 분리 |
| **Language** | **TypeScript 5.x** | 정적 타입 안전성, DTO 인터페이스 모델링 |
| **Styling** | **Tailwind CSS v4** | 최신 선형 그라데이션(`bg-linear-to-*`) 및 하이엔드 블랙/골드 테마 토큰 |
| **Database** | **Supabase (PostgreSQL)** | 관계형 DB 스키마, 원자적 RPC 저장 프로시저, RLS 보안 |
| **Charts** | **TradingView lightweight-charts** | Canvas 하드웨어 가속 60fps 차트 |
| **UX/UI** | **nuqs, Sonner, Fuse.js** | Type-safe URL Query, 글로벌 토스트 알림, 제로-딜레이 퍼지 검색 |
| **Deploy** | **Vercel (icn1 서울 리전)** | 초저지연 서버리스 엣지 네트워크, 무중단 CI/CD 배포 |

---

## 🚀 로컬 개발 환경 실행 (Getting Started)

### 1. 패키지 설치
```bash
npm install
```

### 2. 로컬 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000`으로 접속하여 결과를 확인합니다.

### 3. 프로덕션 빌드 검증
```bash
npm run build
```
- 전체 23개 정적/동적 라우트 컴파일 및 TypeScript 타입 검사를 수행합니다.
- 파비콘 및 앱 아이콘은 Next.js Turbopack 규격인 **표준 32비트 RGBA** 포맷을 준수합니다.

---

## 📂 프로젝트 구조 (Project Structure)

```text
src/
├── app/                  # Next.js App Router (페이지 라우트 & 레이아웃)
│   ├── (home)/           # 메인 대시보드
│   ├── etf/              # ETF 308종 목록 및 [ticker] 상세
│   ├── stock/            # 글로벌 주식 1,025종 목록 및 [ticker] 상세
│   ├── macro/            # 76개 거시경제 지표 및 인터랙티브 차트
│   ├── layout.tsx        # 루트 레이아웃 (폰트, 탑로더, 토스터, PWA 배너)
│   └── favicon.ico       # 32비트 RGBA 표준 규격 파비콘
├── components/           # 정예 재사용 컴포넌트
│   ├── InstallPrompt.tsx # PWA 1초 설치 배너 & 카톡 탈출
│   ├── BackToListButton.tsx # 세션스토리지 무손실 복귀 가드
│   ├── ScrollToTopButton.tsx # 원터치 최상단 점프
│   ├── MiniSparkline.tsx # 10주 추세선 인라인 SVG
│   └── MacroCharts.tsx   # TradingView 매크로 차트 캔버스
├── lib/                  # Supabase 클라이언트 및 유틸리티
└── types/                # TypeScript 전역 타입 정의
```

---

## 📜 라이선스 및 운영 원칙

- 서비스 브랜드명: **`당신의 피비`**
- 공식 서비스 URL: **`https://yourpb.vercel.app`**
- 운영 매뉴얼 & 관제탑: [`monitors/monitor-main.md`](file:///c:/coding/YOURPB/monitors/monitor-main.md)
- 통합 복습 허브: [`review/README.md`](file:///c:/coding/YOURPB/review/README.md)
