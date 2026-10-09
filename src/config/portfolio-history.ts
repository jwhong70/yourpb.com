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
 * (/trading-cardnews 실행 시 자동으로 히스토리가 누적 관리됩니다)
 */
export const PB_PORTFOLIO_HISTORY: RebalancingHistoryItem[] = [
  {
    id: 'rebal-20261009',
    date: '2026.10.09',
    title: '시장 국면 변화에 따른 전략적 자산 재배분',
    summary: '에너지(XLE 50%) 및 변동성(UVXY 20%) 차익실현 및 전량 매도 후 한국 시장(EWY 30%), 글로벌 반도체(SOXX 20%), AI 전력 인프라(0117V0.KS 20%) 신규 편입으로 주도 성장 모멘텀 강화',
    trades: [
      { action: '전량매도', ticker: 'XLE', name: 'Energy Select Sector SPDR Fund', prevPct: 50, newPct: 0, country: '미국 상장 ETF' },
      { action: '전량매도', ticker: 'UVXY', name: 'ProShares Ultra VIX Short-Term Futures ETF', prevPct: 20, newPct: 0, country: '미국 상장 ETF' },
      { action: '신규편입', ticker: 'EWY', name: 'iShares MSCI South Korea ETF', prevPct: 0, newPct: 30, country: '미국 상장 ETF' },
      { action: '신규편입', ticker: 'SOXX', name: 'iShares Semiconductor ETF', prevPct: 0, newPct: 20, country: '미국 상장 ETF' },
      { action: '신규편입', ticker: '0117V0.KS', name: 'TIGER 코리아AI전력기기TOP3플러스', prevPct: 0, newPct: 20, country: '한국 상장 ETF' },
    ],
    previousPortfolio: '[ 시장(MAGS):20, 섹터(XLE):50, 대체(UVXY):20, 현금:10 ]',
    newPortfolio: '[ 시장1(MAGS):20, 시장2(EWY):30, 섹터1(SOXX):20, 테마(0117V0.KS):20, 현금:10 ]',
  }
];
