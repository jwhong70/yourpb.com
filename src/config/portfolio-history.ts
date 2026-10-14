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

export const PB_PORTFOLIO_HISTORY: RebalancingHistoryItem[] = [
  {
    id: 'rebalance-20261015',
    date: '2026.10.15',
    title: '중동발 지정학적 리스크 대응 포트폴리오 리밸런싱',
    summary: '중동발 지정학적 긴장 고조 및 글로벌 시장 변동성 확대에 선제적으로 대응하기 위해 시장 대표주(MAGS) 20%를 전량 매도하고 현금성 자산 비중을 30%로 대폭 확대하여 포트폴리오의 하방 안정성과 기동성을 강화했습니다.',
    trades: [
      {
        action: '전량매도',
        ticker: 'MAGS',
        name: 'Roundhill Magnificent Seven ETF',
        prevPct: 20,
        newPct: 0,
        country: '미국 상장 ETF',
      },
      {
        action: '비중확대',
        ticker: '',
        name: '현금 자산 (KRW/USD)',
        prevPct: 10,
        newPct: 30,
        country: '현금',
      },
    ],
    previousPortfolio: '[ 시장(MAGS):20, 섹터(XLE):50, 대체(UVXY):20, 현금:10 ]',
    newPortfolio: '[ 섹터(XLE):50, 대체(UVXY):20, 현금:30 ]',
  },
];

