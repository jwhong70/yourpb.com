export interface PortfolioAllocation {
  type: string;
  pct: number;
  ticker: string;
  name: string;
  color: string;
}

/**
 * 당신의 피비 추천 모델 포트폴리오 기본 비중 설정
 * (홈 화면 및 월간 자산배분 브로셔에서 공통 참조)
 * 
 * [자산군별 1개 이상 복수 ETF 편입 가이드]
 * 1. 항목 분할(Row 추가): 특정 자산군(시장, 섹터, 테마 등)에 2개 이상의 ETF를 편입할 경우 객체를 행 단위로 추가합니다.
 *    예: { type: '시장1', pct: 15, ticker: 'MAGS', ... }, { type: '시장2', pct: 10, ticker: 'SPY', ... }
 * 2. type 고유 명칭 권장: React Key 중복 및 차트 렌더링을 위해 '시장1', '시장2' 또는 '섹터(에너지)', '섹터(금융)'처럼 고유하게 지정합니다.
 * 3. pct 총합: 모든 항목의 pct(비중) 합계는 반드시 100이 되도록 설정합니다.
 * 4. 자동 연동: ticker가 지정된 모든 종목은 메인 홈 추천 그리드 및 /monthly 브리프에 자동 매핑됩니다.
 */
export const PB_MODEL_PORTFOLIO: PortfolioAllocation[] = [
  { type: '현금', pct: 10, ticker: '', name: '현금 자산(KRW)', color: '#A8A29E' }, // 웜그레이
  { type: '채권', pct: 0, ticker: '', name: '미지정', color: '#E7E5E4' }, // 오트밀 베이지
  { type: '시장', pct: 20, ticker: 'MAGS', name: 'Roundhill Magnificent Seven ETF', color: '#2C4027' }, // 다크 올리브그린
  { type: '섹터', pct: 50, ticker: 'XLE', name: 'Energy Select Sector SPDR Fund', color: '#597350' }, // 미드 올리브그린
  { type: '테마', pct: 0, ticker: '', name: '미지정', color: '#94A68D' }, // 세이지 그린
  { type: '대체', pct: 20, ticker: 'UVXY', name: 'ProShares Ultra VIX Short-Term Futures ETF', color: '#9E533F' }, // 테라코타
];
