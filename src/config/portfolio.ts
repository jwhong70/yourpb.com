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
 */
export const PB_MODEL_PORTFOLIO: PortfolioAllocation[] = [
  { type: '현금', pct: 10, ticker: '', name: '현금 자산(KRW)', color: '#A8A29E' }, // 웜그레이
  { type: '채권', pct: 0, ticker: '', name: '미지정', color: '#E7E5E4' }, // 오트밀 베이지
  { type: '시장', pct: 20, ticker: 'MAGS', name: 'Roundhill Magnificent Seven ETF', color: '#2C4027' }, // 다크 올리브그린
  { type: '섹터', pct: 50, ticker: 'XLE', name: 'Energy Select Sector SPDR Fund', color: '#597350' }, // 미드 올리브그린
  { type: '테마', pct: 0, ticker: '', name: '미지정', color: '#94A68D' }, // 세이지 그린
  { type: '대체', pct: 20, ticker: 'UVXY', name: 'ProShares Ultra VIX Short-Term Futures ETF', color: '#9E533F' }, // 테라코타
];
