'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MacroBarChart, 
  MacroLineChart, 
  MacroCandleChart,
  ChartDataPoint
} from './MacroCharts';
import { ChevronDown } from 'lucide-react';

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
}

interface ClientPageProps {
  data: any; // page.tsx에서 내려주는 dashboardData의 타입 구조
}

// 신호등 컴포넌트 (Premium Pulse Glow 효과 탑재)
function TrafficLight({ value, label }: { value: number | null; label: string }) {
  if (value === null) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="w-4 h-4 rounded-full bg-white/10 border border-white/15" />
        <span className="text-[8px] text-white/30 font-bold tracking-tighter">{label}</span>
      </div>
    );
  }

  const isPositive = value === 1;
  const colorBg = isPositive 
    ? 'bg-gradient-to-br from-[#53D78B] to-[#1E6B39]' 
    : 'bg-gradient-to-br from-[#FF7A75] to-[#991B1B]';
  const shadowGlow = isPositive 
    ? 'shadow-[0_0_12px_rgba(83,215,139,0.7),inset_0_1px_1px_rgba(255,255,255,0.4)]' 
    : 'shadow-[0_0_12px_rgba(255,122,117,0.7),inset_0_1px_1px_rgba(255,255,255,0.4)]';

  return (
    <div className="flex flex-col items-center gap-1">
      <div 
        className={`relative w-4.5 h-4.5 rounded-full ${colorBg} ${shadowGlow} border border-white/15 transition-all duration-500 animate-pulse`} 
      >
        {/* 3D 반사광 하이라이트 점 */}
        <div className="absolute top-0.5 left-0.5 w-1.25 h-0.75 rounded-full bg-white/70 filter blur-[0.2px]" />
      </div>
      <span className={`text-[8px] font-bold tracking-tighter ${isPositive ? 'text-green-accent' : 'text-red-accent'}`}>
        {label}
      </span>
    </div>
  );
}

// 2구 신호등 세트 컴포넌트
function SignalBadge({ signal }: { signal?: SignalState | null }) {
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
    let textColor = 'text-white/80';
    let borderColor = 'border-white/10';
    let bgColor = 'bg-white/5';

    if (ratingLower.includes('greed')) {
      textColor = 'text-green-accent';
      borderColor = 'border-[#53D78B]/20';
      bgColor = 'bg-[#53D78B]/5';
    } else if (ratingLower.includes('fear')) {
      textColor = 'text-red-accent';
      borderColor = 'border-[#FF7A75]/20';
      bgColor = 'bg-[#FF7A75]/5';
    } else if (ratingLower.includes('neutral')) {
      textColor = 'text-yellow-accent';
      borderColor = 'border-white/10';
      bgColor = 'bg-white/5';
    }

    return (
      <div className={`flex items-center gap-1.5 border py-0.5 md:py-1 px-2 md:px-3 rounded-lg md:rounded-xl backdrop-blur-md shrink-0 ${borderColor} ${bgColor}`}>
        <span className={`text-[10px] md:text-xs font-bold tracking-tight ${textColor}`}>
          {formattedRating}
        </span>
        <span className="text-[10px] md:text-xs text-white/50 font-bold font-mono">
          ({score})
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 md:gap-3.5 bg-black/40 border border-white/5 py-0.5 md:py-1 px-1.5 md:px-2.5 rounded-lg md:rounded-xl backdrop-blur-md shrink-0">
      <TrafficLight value={signal.prev} label="MOM" />
      <TrafficLight value={signal.yoy} label="YOY" />
    </div>
  );
}

export default function MacroClientPage({ data }: ClientPageProps) {
  // 1. 대분류 상태 관리 (1 ~ 4)
  const [activeMain, setActiveMain] = useState<number | null>(null);

  // 2. 중분류 상태 관리 (key format: "mainIndex-subIndex")
  const [activeSub, setActiveSub] = useState<string | null>(null);

  // 3. 소분류 아이템 상태 관리 (key format: "mainIndex-subIndex-itemIndex") - 여러 개 개별 토글 가능하도록 Set 구조 사용
  const [openCharts, setOpenCharts] = useState<Set<string>>(new Set());

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
          { title: '1.1.1. 세계 GDP - 실질 GDP성장률(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.world_gdp.imf, theme: 0 },
          { title: '1.1.1. 세계 GDP - OECD 경기선행지수', chartType: 'line', data: data.economic.gdp.world_gdp.oecd, theme: 1 },
          { title: '1.1.2. 미국 GDP - 실질 GDP성장률(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.us_gdp.imf, theme: 0 },
          { title: '1.1.2. 미국 GDP - 실질 GDP성장률(분기)', chartType: 'bar', data: data.economic.gdp.us_gdp.gdp_q, valKey: 'yoy_pct', theme: 2 },
          { title: '1.1.2. 미국 GDP - 실질 개인소비지출(분기)', chartType: 'bar', data: data.economic.gdp.us_gdp.pce_q, valKey: 'yoy_pct', theme: 3 },
          { title: '1.1.2. 미국 GDP - 실질 민간 총국내투자(분기)', chartType: 'bar', data: data.economic.gdp.us_gdp.gpdi_q, valKey: 'yoy_pct', theme: 4 },
          { title: '1.1.2. 미국 GDP - 실질 민간 비주거 고정투자(분기)', chartType: 'bar', data: data.economic.gdp.us_gdp.pnfi_q, valKey: 'yoy_pct', theme: 5 },
          { title: '1.1.2. 미국 GDP - 실질 민간 주거 고정투자(분기)', chartType: 'bar', data: data.economic.gdp.us_gdp.prfi_q, valKey: 'yoy_pct', theme: 0 },
          { title: '1.1.2. 미국 GDP - 실질 재화/서비스 수출(분기)', chartType: 'bar', data: data.economic.gdp.us_gdp.exp_q, valKey: 'yoy_pct', theme: 1 },
          { title: '1.1.2. 미국 GDP - 실질 재화/서비스 수입(분기)', chartType: 'bar', data: data.economic.gdp.us_gdp.imp_q, valKey: 'yoy_pct', theme: 2 },
          { title: '1.1.2. 미국 GDP - 실질 정부 소비지출/총투자(분기)', chartType: 'bar', data: data.economic.gdp.us_gdp.gov_q, valKey: 'yoy_pct', theme: 3 },
          { title: '1.1.2. 미국 GDP - 비농업 부문 시간당 노동생산성', chartType: 'bar', data: data.economic.gdp.us_gdp.prod_q, valKey: 'yoy_pct', theme: 4 },
          { title: '1.1.2. 미국 GDP - OECD 경기선행지수', chartType: 'line', data: data.economic.gdp.us_gdp.oecd, theme: 1 },
          { title: '1.1.2. 미국 GDP - GDPNow 실질 GDP 추정치', chartType: 'line', data: data.economic.gdp.us_gdp.gdpnow.data, signal: data.economic.gdp.us_gdp.gdpnow.signal, theme: 5 },
          
          { title: '1.1.3. 한국 GDP - 실질 GDP성장률(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.kr_gdp.imf, theme: 0 },
          { title: '1.1.3. 한국 GDP - 총투자비율(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.kr_gdp.inv, theme: 1 },
          { title: '1.1.3. 한국 GDP - 소비자물가상승률(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.kr_gdp.cpi, theme: 2 },
          { title: '1.1.3. 한국 GDP - 재정수지(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.kr_gdp.bal, theme: 3 },
          { title: '1.1.3. 한국 GDP - 정부총채무(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.kr_gdp.debt, theme: 4 },
          { title: '1.1.3. 한국 GDP - 경상수지비율(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.kr_gdp.ca, theme: 5 },
          { title: '1.1.3. 한국 GDP - OECD 경기선행지수', chartType: 'line', data: data.economic.gdp.kr_gdp.oecd, theme: 1 },

          { title: '1.1.4. 중국 GDP - 실질 GDP성장률(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.cn_gdp.imf, theme: 0 },
          { title: '1.1.4. 중국 GDP - 총투자비율(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.cn_gdp.inv, theme: 1 },
          { title: '1.1.4. 중국 GDP - 소비자물가상승률(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.cn_gdp.cpi, theme: 2 },
          { title: '1.1.4. 중국 GDP - 재정수지(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.cn_gdp.bal, theme: 3 },
          { title: '1.1.4. 중국 GDP - 정부총채무(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.cn_gdp.debt, theme: 4 },
          { title: '1.1.4. 중국 GDP - 경상수지비율(IMF, 연간)', chartType: 'bar', data: data.economic.gdp.cn_gdp.ca, theme: 5 },
          { title: '1.1.4. 중국 GDP - OECD 경기선행지수', chartType: 'line', data: data.economic.gdp.cn_gdp.oecd, theme: 1 },
        ];

      // 1.2. 소비 하위 지표들
      case '1-2':
        return [
          { title: '1.2.1. 신규 실업수당 청구건수(4주평균)', chartType: 'line', data: data.economic.consumption.ic4wsa.data, signal: data.economic.consumption.ic4wsa.signal, theme: 5 },
          { title: '1.2.2. 구인건수(JOLTS)', chartType: 'line', data: data.economic.consumption.jtsjol.data, signal: data.economic.consumption.jtsjol.signal, theme: 1 },
          { title: '1.2.3. 비농업 부문 고용자수', chartType: 'bar', data: data.economic.consumption.payems.data, signal: data.economic.consumption.payems.signal, theme: 0 },
          { title: '1.2.4. 실업률', chartType: 'line', data: data.economic.consumption.unrate.data, signal: data.economic.consumption.unrate.signal, theme: 5 },
          { title: '1.2.5. 총 소비자신용', chartType: 'bar', data: data.economic.consumption.totalsl.data, valKey: 'yoy_pct', signal: data.economic.consumption.totalsl.signal, theme: 2 },
          { title: '1.2.6. 소매판매', chartType: 'bar', data: data.economic.consumption.rsafs.data, valKey: 'yoy_pct', signal: data.economic.consumption.rsafs.signal, theme: 3 },
          { title: '1.2.7. 개인 소비지출', chartType: 'bar', data: data.economic.consumption.pce.data, valKey: 'yoy_pct', signal: data.economic.consumption.pce.signal, theme: 4 },
        ];

      // 1.3. 생산 하위 지표들
      case '1-3':
        return [
          { title: '1.3.1. 산업생산지수', chartType: 'bar', data: data.economic.production.indpro.data, valKey: 'yoy_pct', signal: data.economic.production.indpro.signal, theme: 0 },
          { title: '1.3.2. 전체 산업가동률', chartType: 'line', data: data.economic.production.tcu.data, signal: data.economic.production.tcu.signal, theme: 1 },
          { title: '1.3.3. 내구재 신규주문', chartType: 'bar', data: data.economic.production.dgorder.data, valKey: 'yoy_pct', signal: data.economic.production.dgorder.signal, theme: 3 },
        ];

      // 2.1. 금리 하위 지표들
      case '2-1':
        return [
          { title: '2.1.1. 미국 연방기금금리 목표범위 상단', chartType: 'line', data: data.regulator.rates.dfedtaru.data, signal: data.regulator.rates.dfedtaru.signal, theme: 5 },
          { title: '2.1.2. 미국 3개월 단기 국채수익률', chartType: 'candle', data: data.regulator.rates.irx.data, signal: data.regulator.rates.irx.signal },
          { title: '2.1.3. 미국 10년물 국채수익률', chartType: 'candle', data: data.regulator.rates.tnx.data, signal: data.regulator.rates.tnx.signal },
          { title: '2.1.4. 미국 30년물 국채수익률', chartType: 'candle', data: data.regulator.rates.tyx.data, signal: data.regulator.rates.tyx.signal },
          { title: '2.1.5. 미국 국채 10년물 - 2년물 금리차', chartType: 'bar', data: data.regulator.rates.t10y2y.data, theme: 2 },
          { title: '2.1.6. 미국 국채 10년물 - 3개월물 금리차', chartType: 'bar', data: data.regulator.rates.t10y3m.data, theme: 3 },
        ];

      // 2.2. 유동성 하위 지표들
      case '2-2':
        return [
          { title: '2.2.1. 연방준비제도 총자산', chartType: 'bar', data: data.regulator.liquidity.treast.data, signal: data.regulator.liquidity.treast.signal, theme: 0 },
          { title: '2.2.2. 연준 보유 MBS', chartType: 'bar', data: data.regulator.liquidity.mbs.data, signal: data.regulator.liquidity.mbs.signal, theme: 1 },
          { title: '2.2.3. 화폐발행액(유통화폐)', chartType: 'bar', data: data.regulator.liquidity.wcurcir.data, signal: data.regulator.liquidity.wcurcir.signal, theme: 2 },
          { title: '2.2.4. 역레포 거래총액', chartType: 'bar', data: data.regulator.liquidity.rrpontsyd.data, signal: data.regulator.liquidity.rrpontsyd.signal, theme: 3 },
          { title: '2.2.5. 역레포 응찰금리', chartType: 'line', data: data.regulator.liquidity.rrpontsyaward.data, theme: 1 },
          { title: '2.2.6. SOFR', chartType: 'line', data: data.regulator.liquidity.sofr.data, theme: 5 },
          { title: '2.2.7. 재무부 일반계정잔액(TGA)', chartType: 'bar', data: data.regulator.liquidity.wtregen.data, signal: data.regulator.liquidity.wtregen.signal, theme: 4 },
          { title: '2.2.8. 연준 예치 지급준비금', chartType: 'bar', data: data.regulator.liquidity.wrbwfrbl.data, signal: data.regulator.liquidity.wrbwfrbl.signal, theme: 0 },
          { title: '2.2.9. 미국 연방정부 재정수지', chartType: 'bar', data: data.regulator.liquidity.mtsds.data, valKey: 'mom', signal: data.regulator.liquidity.mtsds.signal, theme: 2 },
        ];

      // 2.3. 물가 하위 지표들
      case '2-3':
        return [
          { title: '2.3.1. 헤드라인 CPI', chartType: 'bar', data: data.regulator.prices.cpiaucsl.data, valKey: 'yoy_pct', signal: data.regulator.prices.cpiaucsl.signal, theme: 0 },
          { title: '2.3.2. Core CPI', chartType: 'bar', data: data.regulator.prices.cpilfesl.data, valKey: 'yoy_pct', signal: data.regulator.prices.cpilfesl.signal, theme: 2 },
          { title: '2.3.3. PCE 물가지수', chartType: 'bar', data: data.regulator.prices.pcepi.data, valKey: 'yoy_pct', signal: data.regulator.prices.pcepi.signal, theme: 3 },
          { title: '2.3.4. Core PCE', chartType: 'bar', data: data.regulator.prices.pcepilfe.data, valKey: 'yoy_pct', signal: data.regulator.prices.pcepilfe.signal, theme: 4 },
          { title: '2.3.5. 최종 수요 PPI', chartType: 'bar', data: data.regulator.prices.ppifis.data, valKey: 'yoy_pct', signal: data.regulator.prices.ppifis.signal, theme: 5 },
          { title: '2.3.6. Core PPI', chartType: 'bar', data: data.regulator.prices.wpsfd.data, valKey: 'yoy_pct', signal: data.regulator.prices.wpsfd.signal, theme: 2 },
        ];

      // 3.1. 리스크 하위 지표들
      case '3-1':
        return [
          { title: '3.1.1. CNN 공포/탐욕지수', chartType: 'line', data: data.risk_attitude.risk.fear_greed.data, valKey: 'score', signal: data.risk_attitude.risk.fear_greed.signal, theme: 1 },
          { title: '3.1.2. CBOE 변동성 지수(VIX)', chartType: 'candle', data: data.risk_attitude.risk.vix.data, signal: data.risk_attitude.risk.vix.signal },
        ];

      // 3.2. 통화 하위 지표들
      case '3-2':
        return [
          { title: '3.2.1. 달러 인덱스(DXY)', chartType: 'candle', data: data.risk_attitude.currency.dxy.data, signal: data.risk_attitude.currency.dxy.signal },
          { title: '3.2.2. 미국 국채 10년물 - 3개월물 금리차', chartType: 'line', data: data.risk_attitude.currency.t10y3m.data, theme: 1 },
          { title: '3.2.3. 유로/달러 환율', chartType: 'candle', data: data.risk_attitude.currency.eurusd.data, signal: data.risk_attitude.currency.eurusd.signal },
          { title: '3.2.4. 달러/엔 환율', chartType: 'candle', data: data.risk_attitude.currency.usdjpy.data, signal: data.risk_attitude.currency.usdjpy.signal },
          { title: '3.2.5. 달러/위안 환율', chartType: 'candle', data: data.risk_attitude.currency.usdchn.data, signal: data.risk_attitude.currency.usdchn.signal },
          { title: '3.2.6. 달러/원 환율', chartType: 'candle', data: data.risk_attitude.currency.usdkrw.data, signal: data.risk_attitude.currency.usdkrw.signal },
          { title: '3.2.7. 달러/대만달러 환율', chartType: 'candle', data: data.risk_attitude.currency.usdtwd.data, signal: data.risk_attitude.currency.usdtwd.signal },
        ];

      // 3.3. 상품 하위 지표들
      case '3-3':
        return [
          { title: '3.3.1. 금 선물', chartType: 'candle', data: data.risk_attitude.commodities.gold.data, signal: data.risk_attitude.commodities.gold.signal },
          { title: '3.3.2. WTI 원유 선물', chartType: 'candle', data: data.risk_attitude.commodities.wti.data, signal: data.risk_attitude.commodities.wti.signal },
          { title: '3.3.3. 구리 선물', chartType: 'candle', data: data.risk_attitude.commodities.copper.data, signal: data.risk_attitude.commodities.copper.signal },
          { title: '3.3.4. 밀 선물', chartType: 'candle', data: data.risk_attitude.commodities.wheat.data, signal: data.risk_attitude.commodities.wheat.signal },
          { title: '3.3.5. 옥수수 선물', chartType: 'candle', data: data.risk_attitude.commodities.corn.data, signal: data.risk_attitude.commodities.corn.signal },
        ];

      // 4.1. 주식사이클 하위 지표들
      case '4-1':
        return [
          { title: '4.1.1. S&P 500 지수', chartType: 'candle', data: data.market.stocks.spx.data, signal: data.market.stocks.spx.signal },
          { title: '4.1.2. 나스닥 종합 지수', chartType: 'candle', data: data.market.stocks.ixic.data, signal: data.market.stocks.ixic.signal },
          { title: '4.1.3. 러셀 2000 지수', chartType: 'candle', data: data.market.stocks.rut.data, signal: data.market.stocks.rut.signal },
          { title: '4.1.4. 유로 스톡스 50 지수', chartType: 'candle', data: data.market.stocks.stoxx.data, signal: data.market.stocks.stoxx.signal },
          { title: '4.1.5. 닛케이 225 지수', chartType: 'candle', data: data.market.stocks.n225.data, signal: data.market.stocks.n225.signal },
          { title: '4.1.6. 코스피 지수', chartType: 'candle', data: data.market.stocks.kospi.data, signal: data.market.stocks.kospi.signal },
          { title: '4.1.7. 상하이 종합 지수', chartType: 'candle', data: data.market.stocks.ssec.data, signal: data.market.stocks.ssec.signal },
          { title: '4.1.8. 항셍 지수', chartType: 'candle', data: data.market.stocks.hsi.data, signal: data.market.stocks.hsi.signal },
        ];

      // 4.2. 신용사이클 하위 지표들
      case '4-2':
        return [
          { title: '4.2.1. Baa 회사채 - 10년물 국채 스프레드', chartType: 'line', data: data.market.credit.baa10y.data, signal: data.market.credit.baa10y.signal, theme: 5 },
          { title: '4.2.2. ICE BofA 미국 하이일드 채권 실효수익률', chartType: 'line', data: data.market.credit.hy.data, signal: data.market.credit.hy.signal, theme: 5 },
          { title: '4.2.3. 기업어음(CP) 발행 잔액', chartType: 'line', data: data.market.credit.cp.data, signal: data.market.credit.cp.signal, theme: 1 },
          { title: '4.2.4. 통화량(M2)', chartType: 'bar', data: data.market.credit.m2.data, valKey: 'yoy_pct', signal: data.market.credit.m2.signal, theme: 2 },
        ];

      // 4.3. 부동산사이클 하위 지표들
      case '4-3':
        return [
          { title: '4.3.1. 총 건설지출액', chartType: 'bar', data: data.market.real_estate.ttlcons.data, valKey: 'yoy_pct', signal: data.market.real_estate.ttlcons.signal, theme: 0 },
          { title: '4.3.2. 신규주택 건축허가건수', chartType: 'bar', data: data.market.real_estate.permit.data, valKey: 'yoy_pct', signal: data.market.real_estate.permit.signal, theme: 2 },
          { title: '4.3.3. 신규주택 착공건수', chartType: 'bar', data: data.market.real_estate.houst.data, valKey: 'yoy_pct', signal: data.market.real_estate.houst.signal, theme: 3 },
          { title: '4.3.4. 기존주택 매매건수', chartType: 'bar', data: data.market.real_estate.exhos.data, valKey: 'yoy_pct', signal: data.market.real_estate.exhos.signal, theme: 4 },
          { title: '4.3.5. 신규단독주택 판매건수', chartType: 'bar', data: data.market.real_estate.hsn1f.data, valKey: 'yoy_pct', signal: data.market.real_estate.hsn1f.signal, theme: 5 },
          { title: '4.3.6. S&P 케이스-실러 주택가격지수', chartType: 'bar', data: data.market.real_estate.spcs.data, valKey: 'yoy_pct', signal: data.market.real_estate.spcs.signal, theme: 2 },
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
              className={`flex flex-col justify-between p-3.5 md:p-5 rounded-xl md:rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                isSelected
                  ? 'bg-red-accent/15 border-red-accent/45 shadow-[0_4px_24px_rgba(51,255,0,0.18)] scale-[1.02]'
                  : 'bg-gray-50 border-red-accent/20 hover:bg-red-accent/5 hover:border-red-accent/30 hover:scale-[1.01]'
              }`}
            >
              {/* 은은한 배경 글로우 효과 */}
              <div 
                className="absolute -right-16 -top-16 w-36 h-36 rounded-full opacity-10 group-hover:opacity-20 transition-all duration-500 blur-2xl"
                style={{
                  backgroundColor: cat.signal?.yoy === 1 ? 'var(--color-green-accent)' : 'var(--color-red-accent)'
                }}
              />

              <div className="flex justify-between items-start gap-2 w-full">
                <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest font-mono">
                  Category 0{cat.id}
                </span>
                {/* 대분류 신호등 표시 */}
                <SignalBadge signal={cat.signal} />
              </div>

              <div className="mt-6 md:mt-8 flex items-center justify-between gap-1 w-full">
                <h3 className="text-sm md:text-lg font-bold text-gray-900 tracking-tight">
                  {cat.title}
                </h3>
                <ChevronDown 
                  className={`w-4 h-4 md:w-5 md:h-5 text-gray-400 transition-transform duration-300 shrink-0 ${
                    isSelected ? 'transform rotate-180 text-gray-800' : ''
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
            className="overflow-hidden bg-red-accent/2 border border-red-accent/18 rounded-3xl p-6 backdrop-blur-md"
          >
            <div className="flex flex-col gap-4">
              {/* 중분류 목록 출력 */}
              {getSubCategories(activeMain).map((sub) => {
                const isSubSelected = activeSub === sub.id;
                return (
                  <div key={sub.id} className="flex flex-col border border-red-accent/12 rounded-2xl overflow-hidden bg-white shadow-sm">
                    <button
                      onClick={() => setActiveSub(isSubSelected ? null : sub.id)}
                      className={`flex justify-between items-center p-4 text-left transition-colors duration-200 ${
                        isSubSelected ? 'bg-red-accent/8' : 'hover:bg-red-accent/3'
                      }`}
                    >
                      <h4 className="text-sm font-bold text-gray-800 tracking-tight flex items-center gap-2">
                        {sub.title}
                      </h4>
                      <div className="flex items-center gap-4">
                        {/* 중분류 신호등 표시 */}
                        <SignalBadge signal={sub.signal} />
                        <ChevronDown 
                          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                            isSubSelected ? 'transform rotate-180 text-gray-800' : ''
                          }`} 
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
                          className="overflow-hidden border-t border-red-accent/12 bg-red-accent/1"
                        >
                          <div className="p-4 flex flex-col gap-3">
                            {getItemsForSub(sub.id).map((item, itemIdx) => {
                              const chartKey = `${sub.id}-${itemIdx}`;
                              const isChartOpen = openCharts.has(chartKey);
                              const hasData = item.data && item.data.length > 0;

                              // 신호값 결정 (개별 신호등이 명세된 경우 적용, 없는 경우 상위 연동 혹은 null)
                              const itemSignal = item.signal || { prev: null, yoy: null };

                              return (
                                <div 
                                  key={chartKey} 
                                  className="flex flex-col border border-red-accent/12 rounded-xl overflow-hidden transition-all duration-200 bg-white"
                                >
                                  {/* 소분류 헤더 */}
                                  <button
                                    onClick={() => toggleChart(chartKey)}
                                    className={`flex justify-between items-center px-4 py-3 text-left transition-colors duration-150 ${
                                      isChartOpen ? 'bg-red-accent/8' : 'hover:bg-red-accent/3'
                                    }`}
                                  >
                                    <span className="text-xs font-semibold text-gray-700 tracking-tight">
                                      {item.title}
                                    </span>
                                    <div className="flex items-center gap-4">
                                      {/* 소분류 신호등 표시 */}
                                      <SignalBadge signal={itemSignal} />
                                      <ChevronDown 
                                        className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                                          isChartOpen ? 'transform rotate-180 text-gray-800' : ''
                                        }`} 
                                      />
                                    </div>
                                  </button>

                                  {/* 소분류 차트 렌더링 영역 */}
                                  <AnimatePresence>
                                    {isChartOpen && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden bg-white border-t border-red-accent/12"
                                      >
                                        <div className="p-4">
                                          {!hasData ? (
                                            <div className="flex items-center justify-center h-48 rounded-xl bg-red-accent/2 border border-red-accent/10 text-gray-400 text-xs italic">
                                              데이터 수집 중입니다. (Null)
                                            </div>
                                          ) : (
                                            <>
                                              {item.chartType === 'bar' && (
                                                <MacroBarChart 
                                                  data={item.data} 
                                                  themeIndex={item.theme ?? 0} 
                                                  valueKey={item.valKey ?? 'value'} 
                                                />
                                              )}
                                              {item.chartType === 'line' && (
                                                <MacroLineChart 
                                                  data={item.data} 
                                                  themeIndex={item.theme ?? 0} 
                                                  valueKey={item.valKey ?? 'value'} 
                                                />
                                              )}
                                              {item.chartType === 'candle' && (
                                                <MacroCandleChart 
                                                  data={item.data} 
                                                  themeIndex={item.theme ?? 0} 
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
