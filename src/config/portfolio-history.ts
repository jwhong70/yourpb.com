export interface TradeItem {
  action: '매수' | '매도' | '신규편입' | '전량매도' | '비중확대' | '비중축소';
  ticker: string;
  name: string;
  prevPct: number;
  newPct: number;
  country: '미국 상장 ETF' | '한국 상장 ETF' | '현금' | string;
}

export interface RebalancingHistoryItem {
  id: string;
  date: string; // 예: '2026.10.09'
  title: string;
  summary: string;
  trades: TradeItem[];
  previousPortfolio: string;
  newPortfolio: string;
}

/**
 * 당신의 피비 모델 포트폴리오 리밸런싱 및 매매 집행 이력
 * (향후 리밸런싱 집행 시 일자별 매매 내역이 이곳에 누적 기록됩니다)
 */
export const PB_PORTFOLIO_HISTORY: RebalancingHistoryItem[] = [];

