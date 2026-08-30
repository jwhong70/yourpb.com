'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartDataPoint,
  downloadSvgAsPng
} from './MacroCharts';

const MacroBarChart = dynamic(() => import('./MacroCharts').then(mod => mod.MacroBarChart), {
  ssr: false,
  loading: () => <div className="h-64 md:h-96 bg-black/5 animate-pulse rounded-md" />
});

const MacroLineChart = dynamic(() => import('./MacroCharts').then(mod => mod.MacroLineChart), {
  ssr: false,
  loading: () => <div className="h-64 md:h-96 bg-black/5 animate-pulse rounded-md" />
});

const MacroCandleChart = dynamic(() => import('./MacroCharts').then(mod => mod.MacroCandleChart), {
  ssr: false,
  loading: () => <div className="h-64 md:h-96 bg-black/5 animate-pulse rounded-md" />
});
import { ChevronDown, Download } from 'lucide-react';

interface SignalState {
  prev: number | null;
  yoy: number | null;
  rating?: string | null;
  score?: number | null;
  isText?: boolean;
}

interface SubCategoryItem {
  title: string;
  chartType: string;
  data: any;
  valKey?: string;
  signal?: SignalState;
  theme?: number;
  ticker?: string;
}

interface ClientPageProps {
  data: any; // page.tsx에서 내려주는 dashboardData의 타입 구조
}

// 신호등 컴포넌트 (Premium Pulse Glow 효과 탑재)
function TrafficLight({ value, label, isParentSelected = false }: { value: number | null; label: string; isParentSelected?: boolean }) {
  if (value === null) {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <div className="w-2.5 h-2.5 rounded-full bg-black/10 border border-black/15" />
        <span className={`text-[7px] font-bold tracking-tighter ${isParentSelected ? 'text-[#000000]/30' : 'text-white/30'}`}>{label}</span>
      </div>
    );
  }

  const isPositive = value === 1;
  const colorBg = isPositive 
    ? 'bg-[#007C1F]' 
    : 'bg-[#D60016]';
  const shadowGlow = isPositive 
    ? 'shadow-[0_0_6px_rgba(0,124,31,0.5)]' 
    : 'shadow-[0_0_6px_rgba(214,0,22,0.5)]';

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div 
        className={`relative w-2.5 h-2.5 rounded-full ${colorBg} ${shadowGlow} border border-white/10 transition-all duration-500`} 
      >
        {/* 3D 반사광 하이라이트 점 */}
        <div className="absolute top-0.5 left-0.5 w-0.75 h-0.5 rounded-full bg-white/70 filter blur-[0.2px]" />
      </div>
      <span className="text-[7px] font-bold tracking-tighter" style={{ color: isPositive ? '#007C1F' : '#D60016' }}>
        {label}
      </span>
    </div>
  );
}

// 2구 신호등 세트 컴포넌트
function SignalBadge({ signal, isParentSelected = false }: { signal?: SignalState | null; isParentSelected?: boolean }) {
  if (!signal) return null;

  if (signal.isText) {
    const rating = signal.rating || 'neutral';
    const score = signal.score !== undefined && signal.score !== null ? signal.score : 50;

    // rating 단어별 첫 글자 대문자화 포맷팅
    const formattedRating = rating
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

    const ratingLower = rating.toLowerCase();
    let textColor = isParentSelected ? 'text-[#000000]/80' : 'text-white/80';
    let borderColor = isParentSelected ? 'border-[#000000]/10' : 'border-white/10';
    let bgColor = 'bg-transparent';

    if (ratingLower.includes('greed')) {
      textColor = 'text-[#007C1F]';
      borderColor = 'border-[#007C1F]/20';
      bgColor = 'bg-transparent';
    } else if (ratingLower.includes('fear')) {
      textColor = 'text-[#D60016]';
      borderColor = 'border-[#D60016]/20';
      bgColor = 'bg-transparent';
    } else if (ratingLower.includes('neutral')) {
      textColor = 'text-yellow-accent';
      borderColor = isParentSelected ? 'border-[#000000]/10' : 'border-white/10';
      bgColor = 'bg-transparent';
    }

    return (
      <div className={`flex items-center gap-1 py-0.5 px-1.5 md:px-2 rounded-none backdrop-blur-md shrink-0 ${bgColor}`}>
        <span className={`text-[8px] md:text-[10px] font-bold tracking-tight ${textColor}`}>
          {formattedRating}
        </span>
        <span className={`text-[8px] md:text-[10px] font-bold font-mono ${isParentSelected ? 'text-[#000000]/50' : 'text-white/50'}`}>
          ({score})
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 md:gap-1.5 bg-transparent py-0.5 px-1 md:px-1.5 rounded-none backdrop-blur-md shrink-0">
      <TrafficLight value={signal.prev} label="MOM" isParentSelected={isParentSelected} />
      <TrafficLight value={signal.yoy} label="YOY" isParentSelected={isParentSelected} />
    </div>
  );
}

export default function MacroClientPage({ data }: ClientPageProps) {
  const [mounted, setMounted] = useState(false);

  // 1. 대분류 상태 관리 (1 ~ 4)
  const [activeMain, setActiveMain] = useState<number | null>(null);

  // 2. 중분류 상태 관리 (key format: "mainIndex-subIndex")
  const [activeSub, setActiveSub] = useState<string | null>(null);

  // 3. 소분류 아이템 상태 관리 (key format: "mainIndex-subIndex-itemIndex") - 여러 개 개별 토글 가능하도록 Set 구조 사용
  const [openCharts, setOpenCharts] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-gray-500">글로벌 거시경제 분석 로딩 중...</span>
        </div>
      </div>
    );
  }

  const toggleChart = (key: string) => {
    const next = new Set(openCharts);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setOpenCharts(next);
  };

  // 대분류 리스트 정의
  const mainCategories = [
    { id: 1, title: '경제사이클', signal: data.economic.signal },
    { id: 2, title: '경기조절자', signal: data.regulator.signal },
    { id: 3, title: '리스크에 대한 태도', signal: data.risk_attitude.signal },
    { id: 4, title: '마켓사이클', signal: data.market.signal },
  ];

  // 대분류 클릭 이벤트
  const handleMainClick = (id: number) => {
    if (activeMain === id) {
      setActiveMain(null);
      setActiveSub(null);
    } else {
      setActiveMain(id);
      setActiveSub(null);
    }
  };

  // 대분류별 중분류 구성 정의
  const getSubCategories = (mainId: number) => {
    switch (mainId) {
      case 1:
        return [
          { id: '1-1', title: '1.1. GDP', signal: data.economic.gdp.signal },
          { id: '1-2', title: '1.2. 소비', signal: data.economic.consumption.signal },
          { id: '1-3', title: '1.3. 생산', signal: data.economic.production.signal },
        ];
      case 2:
        return [
          { id: '2-1', title: '2.1. 금리', signal: data.regulator.rates.signal },
          { id: '2-2', title: '2.2. 유동성', signal: data.regulator.liquidity.signal },
          { id: '2-3', title: '2.3. 물가', signal: data.regulator.prices.signal },
        ];
      case 3:
        return [
          { id: '3-1', title: '3.1. 리스크', signal: data.risk_attitude.risk.signal },
          { id: '3-2', title: '3.2. 통화', signal: data.risk_attitude.currency.signal },
          { id: '3-3', title: '3.3. 상품', signal: data.risk_attitude.commodities.signal },
        ];
      case 4:
        return [
          { id: '4-1', title: '4.1. 주식사이클', signal: data.market.stocks.signal },
          { id: '4-2', title: '4.2. 신용사이클', signal: data.market.credit.signal },
          { id: '4-3', title: '4.3. 부동산사이클', signal: data.market.real_estate.signal },
        ];
      default:
        return [];
    }
  };

  // 소분류 지표 정의 함수
  const getItemsForSub = (subId: string): SubCategoryItem[] => {
    switch (subId) {
      // 1.1. GDP 하위 카테고리
      case '1-1':
        return [
          { title: '1.1.1. 세계 GDP - 실질 GDP성장률(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.world_gdp.imf, theme: 0, ticker: 'g001_ngdp_rpch_a' },
          { title: '1.1.1. 세계 GDP - OECD 경기선행지수', chartType: 'line', data: data.economic.gdp.world_gdp.oecd, theme: 1, ticker: 'g20' },
          { title: '1.1.2. 미국 GDP - 실질 GDP성장률(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.us_gdp.imf, theme: 0, ticker: 'usa_ngdp_rpch_a' },
          { title: '1.1.2. 미국 GDP - 실질 GDP성장률(분기)', chartType: 'bar', data: data.economic.gdp.us_gdp.gdp_q, valKey: 'yoy_pct', theme: 2, ticker: 'gdpc1' },
          { title: '1.1.2. 미국 GDP - 실질 개인소비지출(분기)', chartType: 'bar', data: data.economic.gdp.us_gdp.pce_q, valKey: 'yoy_pct', theme: 3, ticker: 'pcecc96' },
          { title: '1.1.2. 미국 GDP - 실질 민간 총국내투자(분기)', chartType: 'bar', data: data.economic.gdp.us_gdp.gpdi_q, valKey: 'yoy_pct', theme: 4, ticker: 'gpdic1' },
          { title: '1.1.2. 미국 GDP - 실질 민간 비주거 고정투자(분기)', chartType: 'bar', data: data.economic.gdp.us_gdp.pnfi_q, valKey: 'yoy_pct', theme: 5, ticker: 'pnfic1' },
          { title: '1.1.2. 미국 GDP - 실질 민간 주거 고정투자(분기)', chartType: 'bar', data: data.economic.gdp.us_gdp.prfi_q, valKey: 'yoy_pct', theme: 0, ticker: 'prfic1' },
          { title: '1.1.2. 미국 GDP - 실질 재화/서비스 수출(분기)', chartType: 'bar', data: data.economic.gdp.us_gdp.exp_q, valKey: 'yoy_pct', theme: 1, ticker: 'expgsc1' },
          { title: '1.1.2. 미국 GDP - 실질 재화/서비스 수입(분기)', chartType: 'bar', data: data.economic.gdp.us_gdp.imp_q, valKey: 'yoy_pct', theme: 2, ticker: 'impgsc1' },
          { title: '1.1.2. 미국 GDP - 실질 정부 소비지출/총투자(분기)', chartType: 'bar', data: data.economic.gdp.us_gdp.gov_q, valKey: 'yoy_pct', theme: 3, ticker: 'gcec1' },
          { title: '1.1.2. 미국 GDP - 비농업 부문 시간당 노동생산성', chartType: 'bar', data: data.economic.gdp.us_gdp.prod_q, valKey: 'yoy_pct', theme: 4, ticker: 'ophnfb' },
          { title: '1.1.2. 미국 GDP - OECD 경기선행지수', chartType: 'line', data: data.economic.gdp.us_gdp.oecd, theme: 1, ticker: 'united_states' },
          { title: '1.1.2. 미국 GDP - GDPNow 실질 GDP 추정치', chartType: 'line', data: data.economic.gdp.us_gdp.gdpnow.data, signal: data.economic.gdp.us_gdp.gdpnow.signal, theme: 5, ticker: 'gdpnow' },
          
          { title: '1.1.3. 한국 GDP - 실질 GDP성장률(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.kr_gdp.imf, theme: 0, ticker: 'kor_ngdp_rpch_a' },
          { title: '1.1.3. 한국 GDP - 총투자비율(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.kr_gdp.inv, theme: 1, ticker: 'kor_nid_ngdp_a' },
          { title: '1.1.3. 한국 GDP - 소비자물가상승률(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.kr_gdp.cpi, theme: 2, ticker: 'kor_pcpipch_a' },
          { title: '1.1.3. 한국 GDP - 재정수지(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.kr_gdp.bal, theme: 3, ticker: 'kor_ggxcnl_ngdp_a' },
          { title: '1.1.3. 한국 GDP - 정부총채무(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.kr_gdp.debt, theme: 4, ticker: 'kor_ggxwdg_ngdp_a' },
          { title: '1.1.3. 한국 GDP - 경상수지비율(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.kr_gdp.ca, theme: 5, ticker: 'kor_bca_ngdpd_a' },
          { title: '1.1.3. 한국 GDP - OECD 경기선행지수', chartType: 'line', data: data.economic.gdp.kr_gdp.oecd, theme: 1, ticker: 'korea' },

          { title: '1.1.4. 중국 GDP - 실질 GDP성장률(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.cn_gdp.imf, theme: 0, ticker: 'chn_ngdp_rpch_a' },
          { title: '1.1.4. 중국 GDP - 총투자비율(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.cn_gdp.inv, theme: 1, ticker: 'chn_nid_ngdp_a' },
          { title: '1.1.4. 중국 GDP - 소비자물가상승률(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.cn_gdp.cpi, theme: 2, ticker: 'chn_pcpipch_a' },
          { title: '1.1.4. 중국 GDP - 재정수지(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.cn_gdp.bal, theme: 3, ticker: 'chn_ggxcnl_ngdp_a' },
          { title: '1.1.4. 중국 GDP - 정부총채무(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.cn_gdp.debt, theme: 4, ticker: 'chn_ggxwdg_ngdp_a' },
          { title: '1.1.4. 중국 GDP - 경상수지비율(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.cn_gdp.ca, theme: 5, ticker: 'chn_bca_ngdpd_a' },
          { title: '1.1.4. 중국 GDP - OECD 경기선행지수', chartType: 'line', data: data.economic.gdp.cn_gdp.oecd, theme: 1, ticker: 'china' },
        ];

      // 1.2. 소비 하위 지표들
      case '1-2':
        return [
          { title: '1.2.1. 신규 실업수당 청구건수(4주평균)', chartType: 'line', data: data.economic.consumption.ic4wsa.data, signal: data.economic.consumption.ic4wsa.signal, theme: 5, ticker: 'ic4wsa' },
          { title: '1.2.2. 구인건수(JOLTS)', chartType: 'line', data: data.economic.consumption.jtsjol.data, signal: data.economic.consumption.jtsjol.signal, theme: 1, ticker: 'jtsjol' },
          { title: '1.2.3. 비농업 부문 고용자수', chartType: 'bar', data: data.economic.consumption.payems.data, valKey: 'mom', signal: data.economic.consumption.payems.signal, theme: 0, ticker: 'payems' },
          { title: '1.2.4. 실업률', chartType: 'line', data: data.economic.consumption.unrate.data, signal: data.economic.consumption.unrate.signal, theme: 5, ticker: 'unrate' },
          { title: '1.2.5. 총 소비자신용', chartType: 'bar', data: data.economic.consumption.totalsl.data, valKey: 'yoy_pct', signal: data.economic.consumption.totalsl.signal, theme: 2, ticker: 'totalsl' },
          { title: '1.2.6. 소매판매', chartType: 'bar', data: data.economic.consumption.rsafs.data, valKey: 'yoy_pct', signal: data.economic.consumption.rsafs.signal, theme: 3, ticker: 'rsafs' },
          { title: '1.2.7. 개인 소비지출', chartType: 'bar', data: data.economic.consumption.pce.data, valKey: 'yoy_pct', signal: data.economic.consumption.pce.signal, theme: 4, ticker: 'pce' },
        ];

      // 1.3. 생산 하위 지표들
      case '1-3':
        return [
          { title: '1.3.1. 산업생산지수', chartType: 'bar', data: data.economic.production.indpro.data, valKey: 'yoy_pct', signal: data.economic.production.indpro.signal, theme: 0, ticker: 'indpro' },
          { title: '1.3.2. 전체 산업가동률', chartType: 'line', data: data.economic.production.tcu.data, signal: data.economic.production.tcu.signal, theme: 1, ticker: 'tcu' },
          { title: '1.3.3. 내구재 신규주문', chartType: 'bar', data: data.economic.production.dgorder.data, valKey: 'yoy_pct', signal: data.economic.production.dgorder.signal, theme: 3, ticker: 'dgorder' },
        ];

      // 2.1. 금리 하위 지표들
      case '2-1':
        return [
          { title: '2.1.1. 미국 연방기금금리 목표범위 상단', chartType: 'line', data: data.regulator.rates.dfedtaru.data, signal: data.regulator.rates.dfedtaru.signal, theme: 5, ticker: 'dfedtaru' },
          { title: '2.1.2. 미국 3개월 단기 국채수익률', chartType: 'candle', data: data.regulator.rates.irx.data, signal: data.regulator.rates.irx.signal, ticker: '^IRX' },
          { title: '2.1.3. 미국 10년물 국채수익률', chartType: 'candle', data: data.regulator.rates.tnx.data, signal: data.regulator.rates.tnx.signal, ticker: '^TNX' },
          { title: '2.1.4. 미국 30년물 국채수익률', chartType: 'candle', data: data.regulator.rates.tyx.data, signal: data.regulator.rates.tyx.signal, ticker: '^TYX' },
          { title: '2.1.5. 미국 국채 10년물 - 2년물 금리차', chartType: 'bar', data: data.regulator.rates.t10y2y.data, theme: 2, ticker: 't10y2y' },
          { title: '2.1.6. 미국 국채 10년물 - 3개월물 금리차', chartType: 'bar', data: data.regulator.rates.t10y3m.data, theme: 3, ticker: 't10y3m' },
        ];

      // 2.2. 유동성 하위 지표들
      case '2-2':
        return [
          { title: '2.2.1. 연방준비제도 총자산', chartType: 'bar', data: data.regulator.liquidity.treast.data, valKey: 'wow', signal: data.regulator.liquidity.treast.signal, theme: 0, ticker: 'treast' },
          { title: '2.2.2. 연준 보유 MBS', chartType: 'bar', data: data.regulator.liquidity.wshomcb.data, valKey: 'wow', signal: data.regulator.liquidity.wshomcb.signal, theme: 1, ticker: 'wshomcb' },
          { title: '2.2.3. 화폐발행액(유통화폐)', chartType: 'bar', data: data.regulator.liquidity.wcurcir.data, valKey: 'wow', signal: data.regulator.liquidity.wcurcir.signal, theme: 2, ticker: 'wcurcir' },
          { title: '2.2.4. 역레포 거래총액', chartType: 'bar', data: data.regulator.liquidity.rrpontsyd.data, valKey: 'wow', signal: data.regulator.liquidity.rrpontsyd.signal, theme: 3, ticker: 'rrpontsyd' },
          { title: '2.2.5. 재무부 일반계정잔액(TGA)', chartType: 'bar', data: data.regulator.liquidity.wtregen.data, valKey: 'wow', signal: data.regulator.liquidity.wtregen.signal, theme: 4, ticker: 'wtregen' },
        ];

      // 2.3. 물가 하위 지표들
      case '2-3':
        return [
          { title: '2.3.1. 헤드라인 CPI', chartType: 'bar', data: data.regulator.prices.cpiaucsl.data, valKey: 'yoy_pct', signal: data.regulator.prices.cpiaucsl.signal, theme: 0, ticker: 'cpiaucsl' },
          { title: '2.3.2. Core CPI', chartType: 'bar', data: data.regulator.prices.cpilfesl.data, valKey: 'yoy_pct', signal: data.regulator.prices.cpilfesl.signal, theme: 2, ticker: 'cpilfesl' },
          { title: '2.3.3. PCE 물가지수', chartType: 'bar', data: data.regulator.prices.pcepi.data, valKey: 'yoy_pct', signal: data.regulator.prices.pcepi.signal, theme: 3, ticker: 'pcepi' },
          { title: '2.3.4. Core PCE', chartType: 'bar', data: data.regulator.prices.pcepilfe.data, valKey: 'yoy_pct', signal: data.regulator.prices.pcepilfe.signal, theme: 4, ticker: 'pcepilfe' },
          { title: '2.3.5. 최종 수요 PPI', chartType: 'bar', data: data.regulator.prices.ppifis.data, valKey: 'yoy_pct', signal: data.regulator.prices.ppifis.signal, theme: 5, ticker: 'ppifis' },
          { title: '2.3.6. Core PPI', chartType: 'bar', data: data.regulator.prices.wpsfd.data, valKey: 'yoy_pct', signal: data.regulator.prices.wpsfd.signal, theme: 2, ticker: 'wpsfd49116' },
        ];

      // 3.1. 리스크 하위 지표들
      case '3-1':
        return [
          { title: '3.1.1. CNN 공포/탐욕지수', chartType: 'line', data: data.risk_attitude.risk.fear_greed.data, valKey: 'score', signal: data.risk_attitude.risk.fear_greed.signal, theme: 1, ticker: 'score' },
          { title: '3.1.2. CBOE 변동성 지수(VIX)', chartType: 'candle', data: data.risk_attitude.risk.vix.data, signal: data.risk_attitude.risk.vix.signal, ticker: '^VIX' },
        ];

      // 3.2. 통화 하위 지표들
      case '3-2':
        return [
          { title: '3.2.1. 달러 인덱스(DXY)', chartType: 'candle', data: data.risk_attitude.currency.dxy.data, signal: data.risk_attitude.currency.dxy.signal, ticker: 'DX-Y.NYB' },
          { title: '3.2.2. 미국 국채 10년물 - 3개월물 금리차', chartType: 'line', data: data.risk_attitude.currency.t10y3m.data, theme: 1, ticker: 't10y3m' },
          { title: '3.2.3. 유로/달러 환율', chartType: 'candle', data: data.risk_attitude.currency.eurusd.data, signal: data.risk_attitude.currency.eurusd.signal, ticker: 'EURUSD=X' },
          { title: '3.2.4. 달러/엔 환율', chartType: 'candle', data: data.risk_attitude.currency.usdjpy.data, signal: data.risk_attitude.currency.usdjpy.signal, ticker: 'JPY=X' },
          { title: '3.2.5. 달러/위안 환율', chartType: 'candle', data: data.risk_attitude.currency.usdchn.data, signal: data.risk_attitude.currency.usdchn.signal, ticker: 'CNY=X' },
          { title: '3.2.6. 달러/원 환율', chartType: 'candle', data: data.risk_attitude.currency.usdkrw.data, signal: data.risk_attitude.currency.usdkrw.signal, ticker: 'KRW=X' },
          { title: '3.2.7. 달러/대만달러 환율', chartType: 'candle', data: data.risk_attitude.currency.usdtwd.data, signal: data.risk_attitude.currency.usdtwd.signal, ticker: 'TWD=X' },
        ];

      // 3.3. 상품 하위 지표들
      case '3-3':
        return [
          { title: '3.3.1. 금 선물', chartType: 'candle', data: data.risk_attitude.commodities.gold.data, signal: data.risk_attitude.commodities.gold.signal, ticker: 'GC=F' },
          { title: '3.3.2. WTI 원유 선물', chartType: 'candle', data: data.risk_attitude.commodities.wti.data, signal: data.risk_attitude.commodities.wti.signal, ticker: 'CL=F' },
          { title: '3.3.3. 구리 선물', chartType: 'candle', data: data.risk_attitude.commodities.copper.data, signal: data.risk_attitude.commodities.copper.signal, ticker: 'HG=F' },
          { title: '3.3.4. 밀 선물', chartType: 'candle', data: data.risk_attitude.commodities.wheat.data, signal: data.risk_attitude.commodities.wheat.signal, ticker: 'ZW=F' },
          { title: '3.3.5. 옥수수 선물', chartType: 'candle', data: data.risk_attitude.commodities.corn.data, signal: data.risk_attitude.commodities.corn.signal, ticker: 'ZC=F' },
        ];

      // 4.1. 주식사이클 하위 지표들
      case '4-1':
        return [
          { title: '4.1.1. S&P 500 지수', chartType: 'candle', data: data.market.stocks.spx.data, signal: data.market.stocks.spx.signal, ticker: '^GSPC' },
          { title: '4.1.2. 나스닥 종합 지수', chartType: 'candle', data: data.market.stocks.ixic.data, signal: data.market.stocks.ixic.signal, ticker: '^IXIC' },
          { title: '4.1.3. 러셀 2000 지수', chartType: 'candle', data: data.market.stocks.rut.data, signal: data.market.stocks.rut.signal, ticker: '^RUT' },
          { title: '4.1.4. 유로 스톡스 50 지수', chartType: 'candle', data: data.market.stocks.stoxx.data, signal: data.market.stocks.stoxx.signal, ticker: '^STOXX50E' },
          { title: '4.1.5. 닛케이 225 지수', chartType: 'candle', data: data.market.stocks.n225.data, signal: data.market.stocks.n225.signal, ticker: '^N225' },
          { title: '4.1.6. 코스피 지수', chartType: 'candle', data: data.market.stocks.kospi.data, signal: data.market.stocks.kospi.signal, ticker: '^KS11' },
          { title: '4.1.7. 상하이 종합 지수', chartType: 'candle', data: data.market.stocks.ssec.data, signal: data.market.stocks.ssec.signal, ticker: '000001.SS' },
          { title: '4.1.8. 항셍 지수', chartType: 'candle', data: data.market.stocks.hsi.data, signal: data.market.stocks.hsi.signal, ticker: '^HSI' },
        ];

      // 4.2. 신용사이클 하위 지표들
      case '4-2':
        return [
          { title: '4.2.1. Baa 회사채 - 10년물 국채 스프레드', chartType: 'line', data: data.market.credit.baa10y.data, signal: data.market.credit.baa10y.signal, theme: 5, ticker: 'baa10y' },
          { title: '4.2.2. ICE BofA 미국 하이일드 채권 실효수익률', chartType: 'line', data: data.market.credit.hy.data, signal: data.market.credit.hy.signal, theme: 5, ticker: 'bamlh0a0hym2ey' },
          { title: '4.2.3. 기업어음(CP) 발행 잔액', chartType: 'line', data: data.market.credit.cp.data, signal: data.market.credit.cp.signal, theme: 1, ticker: 'compout' },
          { title: '4.2.4. 통화량(M2)', chartType: 'bar', data: data.market.credit.m2.data, valKey: 'yoy_pct', signal: data.market.credit.m2.signal, theme: 2, ticker: 'wm2ns' },
        ];

      // 4.3. 부동산사이클 하위 지표들
      case '4-3':
        return [
          { title: '4.3.1. 총 건설지출액', chartType: 'bar', data: data.market.real_estate.ttlcons.data, valKey: 'yoy_pct', signal: data.market.real_estate.ttlcons.signal, theme: 0, ticker: 'ttlcons' },
          { title: '4.3.2. 신규주택 건축허가건수', chartType: 'bar', data: data.market.real_estate.permit.data, valKey: 'yoy_pct', signal: data.market.real_estate.permit.signal, theme: 2, ticker: 'permit' },
          { title: '4.3.3. 신규주택 착공건수', chartType: 'bar', data: data.market.real_estate.houst.data, valKey: 'yoy_pct', signal: data.market.real_estate.houst.signal, theme: 3, ticker: 'houst' },
          { title: '4.3.4. 기존주택 매매건수', chartType: 'bar', data: data.market.real_estate.exhos.data, valKey: 'value', signal: data.market.real_estate.exhos.signal, theme: 4, ticker: 'exhoslusm495s' },
          { title: '4.3.5. 신규단독주택 판매건수', chartType: 'bar', data: data.market.real_estate.hsn1f.data, valKey: 'yoy_pct', signal: data.market.real_estate.hsn1f.signal, theme: 5, ticker: 'hsn1f' },
          { title: '4.3.6. S&P 케이스-실러 주택가격지수', chartType: 'bar', data: data.market.real_estate.spcs.data, valKey: 'yoy_pct', signal: data.market.real_estate.spcs.signal, theme: 2, ticker: 'spcs20rsa' },
        ];

      default:
        return [];
    }
  };


  return (
    <div className="flex flex-col gap-6">
      {/* 1단계: 대분류 상자 (가로 나란히 배치) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        {mainCategories.map((cat) => {
          const isSelected = activeMain === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleMainClick(cat.id)}
              className={`flex flex-col justify-between p-3.5 md:p-5 rounded-none border border-[#000000] text-left transition-all duration-300 relative overflow-hidden group ${
                isSelected
                  ? 'bg-box-bg text-[#000000] shadow-2xl scale-[1.02]'
                  : 'bg-[#000000] text-white hover:bg-black/80 hover:scale-[1.01]'
              }`}
            >
              <div className="flex justify-between items-start gap-2 w-full">
                <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest font-mono ${
                  isSelected ? 'text-[#000000]/60' : 'text-white/60'
                }`}>
                  Category 0{cat.id}
                </span>
                {/* 대분류 신호등 표시 */}
                <SignalBadge signal={cat.signal} isParentSelected={isSelected} />
              </div>

              <div className="mt-6 md:mt-8 flex items-center justify-between gap-1 w-full">
                <h3 className={`text-lg font-bold tracking-tight md:text-xl ${
                  isSelected ? 'text-[#000000]' : 'text-white'
                }`}>
                  {cat.title}
                </h3>
                <ChevronDown 
                  className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 shrink-0 ${
                    isSelected ? 'transform rotate-180 text-[#000000]' : 'text-white/60'
                  }`} 
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* 2단계: 중분류 & 소분류 아코디언 컨테이너 */}
      <AnimatePresence mode="wait">
        {activeMain !== null && (
          <motion.div
            key={activeMain}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-box-bg border-t border-b border-[#000000] rounded-none p-2 sm:p-6 shadow-md"
          >
            <div className="flex flex-col gap-4">
               {/* 중분류 목록 출력 */}
              {getSubCategories(activeMain).map((sub) => {
                const isSubSelected = activeSub === sub.id;
                return (
                  <div key={sub.id} className="flex flex-col border-t border-b border-[#000000] rounded-none overflow-hidden bg-[#9E9E9E]">
                    <button
                      onClick={() => setActiveSub(isSubSelected ? null : sub.id)}
                      className={`flex justify-between items-center p-4 text-left transition-colors duration-200 ${
                        isSubSelected ? 'bg-black/10' : 'hover:bg-black/5'
                      }`}
                    >
                      <h4 
                        className="text-base font-extrabold tracking-tight flex items-center gap-2 select-none"
                        style={{ color: '#000000' }}
                      >
                        {sub.title}
                      </h4>
                      <div className="flex items-center gap-4">
                        {/* 중분류 신호등 표시 */}
                        <SignalBadge signal={sub.signal} />
                        <ChevronDown 
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isSubSelected ? 'transform rotate-180' : ''
                          }`} 
                          style={{ color: '#000000' }}
                        />
                      </div>
                    </button>

                    {/* 3단계: 소분류 아이템 리스트 아코디언 */}
                    <AnimatePresence>
                      {isSubSelected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden border-t border-[#000000] bg-black/5"
                        >
                          <div className="p-4 flex flex-col gap-3">
                            {getItemsForSub(sub.id).map((item, itemIdx) => {
                              const chartKey = `${sub.id}-${itemIdx}`;
                              const isChartOpen = openCharts.has(chartKey);
                              const hasData = item.data && item.data.length > 0;

                              // 신호값 결정 (개별 신호등이 명세된 경우 적용, 없는 경우 상위 연동 혹은 null)
                              const itemSignal = item.signal || { prev: null, yoy: null };

                              // 신호값에 따른 배경색 결정
                              let subItemBg = "bg-[#4B5056]"; // 기본: 신호가 다르거나 없을 때
                              if (itemSignal.isText) {
                                const ratingLower = (itemSignal.rating || 'neutral').toLowerCase();
                                if (ratingLower.includes('greed')) {
                                  subItemBg = "bg-[#3F6C5B]";
                                } else if (ratingLower.includes('fear')) {
                                  subItemBg = "bg-[#C85A48]";
                                }
                              } else {
                                if (itemSignal.prev === 1 && itemSignal.yoy === 1) {
                                  subItemBg = "bg-[#3F6C5B]";
                                } else if (itemSignal.prev === -1 && itemSignal.yoy === -1) {
                                  subItemBg = "bg-[#C85A48]";
                                }
                              }

                              // 소분류 숫자(1.1.1. 등) 제거
                              const cleanTitle = item.title.replace(/^\d+(\.\d+)*\.?\s*/, "");

                              return (
                                <div 
                                  key={chartKey} 
                                  className={`flex flex-col border-t border-b border-[#000000] rounded-none overflow-hidden transition-all duration-200 ${subItemBg}`}
                                >
                                  {/* 소분류 헤더 */}
                                  <div
                                    onClick={() => toggleChart(chartKey)}
                                    className={`flex justify-between items-center px-4 py-3 text-left transition-colors duration-150 cursor-pointer select-none ${
                                      isChartOpen ? 'bg-white/15' : 'hover:bg-white/5'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0 grow">
                                      <span className="text-xs font-extrabold text-white tracking-tight truncate">
                                        {cleanTitle}
                                      </span>
                                      {isChartOpen && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const svg = document.getElementById(`chart-svg-${chartKey}`) as SVGSVGElement | null;
                                            if (svg) {
                                              downloadSvgAsPng(svg, cleanTitle);
                                            }
                                          }}
                                          title="이미지 저장 (PNG)"
                                          className="p-1 hover:bg-white/10 rounded-none active:scale-90 transition-all cursor-pointer shrink-0 text-white/70 hover:text-white"
                                        >
                                          <Download className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                      {/* 신호등 제거 */}
                                      <ChevronDown 
                                        className={`w-3.5 h-3.5 text-white transition-transform duration-200 ${
                                          isChartOpen ? 'transform rotate-180 text-white' : ''
                                        }`} 
                                      />
                                    </div>
                                  </div>

                                  {/* 소분류 차트 렌더링 영역 */}
                                  <AnimatePresence>
                                    {isChartOpen && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden bg-[#F9F8F6] border-t border-[#000000]"
                                      >
                                        <div className="p-1 sm:p-4">
                                          {!hasData ? (
                                            <div className="flex items-center justify-center h-48 rounded-none bg-black/5 border border-black/10 text-gray-400 text-sm italic">
                                              데이터 수집 중입니다. (Null)
                                            </div>
                                          ) : (
                                            <>
                                              {item.chartType === 'bar' && (
                                                <MacroBarChart 
                                                  data={item.data} 
                                                  themeIndex={item.theme ?? 0} 
                                                  valueKey={item.valKey ?? 'value'} 
                                                  title={item.title}
                                                  chartKey={`chart-svg-${chartKey}`}
                                                  barSize={sub.id === '1-1' ? 64 : 32}
                                                  source={item.ticker ? data.sources?.[item.ticker] : undefined}
                                                />
                                              )}
                                              {item.chartType === 'line' && (
                                                <MacroLineChart 
                                                  data={item.data} 
                                                  themeIndex={item.theme ?? 0} 
                                                  valueKey={item.valKey ?? 'value'} 
                                                  title={item.title}
                                                  chartKey={`chart-svg-${chartKey}`}
                                                  source={item.ticker ? data.sources?.[item.ticker] : undefined}
                                                />
                                              )}
                                              {item.chartType === 'candle' && (
                                                <MacroCandleChart 
                                                  data={item.data} 
                                                  themeIndex={item.theme ?? 0} 
                                                  title={item.title}
                                                  chartKey={`chart-svg-${chartKey}`}
                                                  source={item.ticker ? data.sources?.[item.ticker] : undefined}
                                                />
                                              )}
                                            </>
                                          )}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
