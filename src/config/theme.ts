/**
 * 당신의 피비 (YOURPB) 공식 디자인 토큰 체계 (Single Source of Truth)
 * 규칙 13: 공식 브랜드 컬러 시스템 (에르메스 앰버 오렌지 & 웜 화이트)
 * 
 * 색상 변경 시 이 파일과 globals.css만 수정하면 전체 웹 및 차트가 일괄 반영됩니다.
 */

export const THEME_COLORS = {
  // 1. 브랜드 시그니처 악센트 (에르메스 앰버 오렌지)
  brand: '#EA580C',          // 메인 브랜드 액센트, 핵심 버튼, 활성 탭
  brandHover: '#C2410C',     // 호버/액티브 시 짙은 오렌지
  brandDark: '#9A3412',      // 텍스트/뱃지 글자용 딥 번트 오렌지
  brandLight: '#FED7AA',     // 연한 테두리용
  brandSurface: '#FFF7ED',   // 뱃지 배경, 연한 하이라이트 박스 (orange-50)

  // 2. 캔버스 & 텍스트
  canvas: '#F9F8F6',         // 기본 배경 웜 화이트
  bodyDark: '#1F1F1F',       // 본문 텍스트, 보조 버튼
  bodyMuted: '#6B7280',      // 보조 설명문 그레이 (gray-500)

  // 3. 차트 시그니처 컬러
  chartUp: '#EA580C',        // 차트 상승: 에르메스 오렌지
  chartUpBorder: '#C2410C',  // 차트 상승 테두리: 딥 오렌지
  chartDown: '#222222',      // 차트 하락: 럭셔리 다크 블랙
  chartDownBorder: '#111111',// 차트 하락 테두리
  chartMa20: '#EA580C',      // 20일 이동평균선
  chartMa60: '#9A3412',      // 60일 이동평균선
} as const;

export type ThemeColors = typeof THEME_COLORS;

