import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Award,
  Download,
  Lock,
  Brain,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

import { createClient } from '@/lib/supabase-server';
import { getSessionUser } from '@/app/actions/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import PremiumPaywall from '@/components/PremiumPaywall';
import StockCandleChart from '@/components/StockCandleChart';
import StockPerformanceChart from '@/components/StockPerformanceChart';

interface PageProps {
  params: Promise<{ ticker: string }>;
}

export default async function StockDetailPage({ params }: PageProps) {
  const supabase = await createClient();

  // 1. URL 매개변수 디코딩 및 티커 대문자화
  const { ticker: rawTicker } = await params;
  const ticker = decodeURIComponent(rawTicker).toUpperCase();

  // 2. 로그인 세션 및 프리미엄 구독 상태 조회
  const user = await getSessionUser();
  const isLoggedIn = !!user;
  const isPremium = user?.membership_status === 'premium';

  // 3. DB 데이터 조회
  // - stock_list는 존재 여부 검사(404 판정)를 위해 로그인 상태에 관계없이 항시 조회
  const stockListRes = await supabase.from('stock_list').select('*').eq('ticker', ticker).single();

  // stock_list 정보가 없다면 유효하지 않은 티커이므로 404 처리
  if (stockListRes.error || !stockListRes.data) {
    return notFound();
  }

  const stock = stockListRes.data;

  let prices: any[] = [];
  let signals: any[] = [];
  let latestPrice: any = null;
  let closePrice: number | null = null;
  let yield_1w: number | null = null;
  let yield_5w: number | null = null;
  let yield_20w: number | null = null;
  let yield_60w: number | null = null;
  let yield_120w: number | null = null;

  if (isPremium) {
    // 4. 프리미엄 회원의 경우 실제 DB 주가 데이터 및 수익률 조회
    const pricesRes = await supabase
      .from('stock_prices')
      .select('date, open, high, low, close, yield_1w, yield_5w, yield_20w, yield_60w, yield_120w')
      .eq('ticker', ticker)
      .order('date', { ascending: false })
      .limit(120);

    prices = pricesRes.data || [];

    // 4-2. AI 투자 대가 시그널 조회
    const signalsRes = await supabase
      .from('stock_signals')
      .select('analyst_name, signal, confidence, reasoning')
      .eq('ticker', ticker);
    signals = signalsRes.data || [];
    latestPrice = prices.length > 0 ? prices[0] : null;
    closePrice = latestPrice ? Number(latestPrice.close) : null;
    yield_1w = latestPrice ? Number(latestPrice.yield_1w) : null;
    yield_5w = latestPrice ? Number(latestPrice.yield_5w) : null;
    yield_20w = latestPrice ? Number(latestPrice.yield_20w) : null;
    yield_60w = latestPrice ? Number(latestPrice.yield_60w) : null;
    yield_120w = latestPrice ? Number(latestPrice.yield_120w) : null;
  } else {
    // 4. 일반 회원의 경우 120주 가상 Mock 주가 데이터 생성 및 Mock 수익률 지정 (서버 단에서 실제 중요 정보 가림)
    prices = Array.from({ length: 120 }).map((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - idx * 7);
      const dateStr = d.toISOString().split('T')[0];

      // 완만하게 파동 치며 변동하는 Mock 주가 캔들 형태 생성
      const base = 100 + Math.sin(idx * 0.15) * 8;
      return {
        date: dateStr,
        open: base,
        high: base + 2.5,
        low: base - 2.5,
        close: base + 1.1,
        yield_1w: 1.2,
        yield_5w: 3.5,
        yield_20w: 12.4,
        yield_60w: 24.8,
        yield_120w: 52.1,
      };
    });

    closePrice = 101.1;
    yield_1w = 1.2;
    yield_5w = 3.5;
    yield_20w = 12.4;
    yield_60w = 24.8;
    yield_120w = 52.1;
  }

  // 5. Storage Public URL 획득 (유료회원에게만 제공하고 일반 회원은 공백 처리하여 URL 접근 차단)
  const reportUrl = isPremium
    ? supabase.storage.from('upload').getPublicUrl(`report-stock/${ticker}.pdf`).data.publicUrl
    : '';

  // 포맷 헬퍼 함수
  const formatPrice = (val: number | null | undefined) => {
    if (val === null || val === undefined || isNaN(val)) return '-';
    return val % 1 === 0
      ? val.toLocaleString(undefined, { maximumFractionDigits: 0 })
      : val.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Header initialUser={user} />
      <main className="grow pt-20">
        <div className="pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 mt-10">
          {/* 상단 네비게이션 및 타이틀 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Link
                href="/stock"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#000000] hover:bg-gray-900 active:scale-95 text-white font-bold rounded-none shadow-md transition-all cursor-pointer group text-base"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span>목록으로 복귀</span>
              </Link>

              {isPremium && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-black bg-yellow-accent border border-yellow-accent/40 px-3 py-1 rounded-full shadow-lg select-none">
                  <Award className="w-4 h-4 text-black" />
                  Premium Access
                </span>
              )}
            </div>

            {/* 종목명과 티커 박스 */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-2.5 py-1 text-xs font-extrabold bg-[#000000] text-white rounded-none uppercase tracking-wider">
                  {stock.listed === 'us' ? 'US Stock' : 'KR Stock'}
                </span>
                <span className="px-2.5 py-1 text-xs font-bold bg-box-bg text-gray-700 border border-black rounded-none">
                  현재가: {closePrice !== null ? formatPrice(closePrice) : '-'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-baseline gap-2">
                <span>{stock.name}</span>
                <span className="text-lg sm:text-xl font-bold uppercase text-gray-500">({ticker})</span>
              </h1>
            </div>
          </div>

          {/* 3. PREMIUM CONTENT AREA */}
          <div className="relative">

            {/* 일반 회원의 경우 블러 효과 및 자물쇠 가림막 적용 */}
            {!isPremium && (
              <div className="absolute inset-0 z-20 flex items-center justify-center p-4 sm:p-6 bg-background/20 backdrop-blur-md rounded-3xl overflow-hidden">
                <div className="w-full max-w-4xl mx-auto shadow-2xl">
                  <PremiumPaywall isLoggedIn={isLoggedIn} />
                </div>
              </div>
            )}

            {/* 프리미엄 전용 대시보드 뷰포트 (비구독자에게는 백그라운드 블러 및 고정 Mock 수치 노출) */}
            <div className={`space-y-8 select-none transition-all duration-500 ${!isPremium ? 'blur-md pointer-events-none opacity-40 select-none' : ''}`}>

              {/* 분류체계 박스, 개요를 반응형 2단 그리드로 가로/세로 배치 (480px 분기) */}
              <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-8">

                {/* 1단: 주식 기초 정보 */}
                <section className="p-5 rounded-none bg-box-bg border border-t-[#000000] border-b-[#000000] border-l-white border-r-white shadow-md flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-navy/20 blur-[60px] pointer-events-none" />
                  <div>
                    <div className="text-gray-500 text-sm uppercase tracking-wider mb-2.5">
                      <span>주식 기초 정보 (Basic Info)</span>
                    </div>
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-none bg-[#F9F8F6]">
                        <span className="text-base font-semibold text-gray-500 block mb-0.5">회사명(티커)</span>
                        <span className="text-base font-semibold text-gray-900 truncate block">
                          {stock.name} ({stock.ticker})
                        </span>
                      </div>
                      <div className="p-2.5 rounded-none bg-[#F9F8F6]">
                        <span className="text-base font-semibold text-gray-500 block mb-0.5">대분류 (Sector)</span>
                        <span className="text-base font-semibold text-gray-900 truncate block">
                          {isPremium ? (stock.sector2 || '-') : '••••'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-none bg-[#F9F8F6]">
                        <span className="text-base font-semibold text-gray-500 block mb-0.5">중분류 (Industry)</span>
                        <span className="text-base font-semibold text-gray-900 truncate block">
                          {isPremium ? (stock.industry2 || '-') : '••••'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-none bg-[#F9F8F6]">
                        <span className="text-base font-semibold text-gray-500 block mb-0.5">부문 (Divisions)</span>
                        <span className="text-base font-semibold text-gray-900 truncate block whitespace-pre-line">
                          {isPremium ? (stock.divisions || '정보 없음') : '••••'}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 2단: 개요 (Description) */}
                <div className="p-5 rounded-none bg-box-bg border border-t-[#000000] border-b-[#000000] border-l-white border-r-white shadow-md flex flex-col justify-between">
                  <div>
                    <div className="text-gray-500 text-sm uppercase tracking-wider mb-2.5">
                      <span>기업 개요 (Overview)</span>
                    </div>
                    <h3 className="text-xl font-extrabold text-gray-900 mb-2.5 select-none">기업 소개 및 투자 가이드</h3>
                    <p className="text-gray-900 text-base font-semibold leading-relaxed whitespace-pre-line font-sans">
                      {isPremium
                        ? (stock.description || '이 종목에 대한 상세 리서치 요약 정보가 아직 등록되지 않았습니다.')
                        : '구독 회원에게만 공개되는 기업 개요 정보입니다. 프리미엄 멤버십을 통해 전체 기업 정보와 리포트 분석 자료를 확인해보세요.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 차트 영역 (반응형 2단 - 480px 분기) */}
              <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-8">
                <StockCandleChart prices={prices} source="yfinance" />
                <StockPerformanceChart
                  yield_1w={yield_1w}
                  yield_5w={yield_5w}
                  yield_20w={yield_20w}
                  yield_60w={yield_60w}
                  yield_120w={yield_120w}
                  source="yfinance"
                />
              </div>

              {/* 리서치 보고서 PDF 다운로드 버튼 */}
              <div className="flex justify-center py-4">
                {isPremium ? (
                  <a
                    href={reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full max-w-md flex items-center justify-center gap-2.5 px-6 py-4.5 bg-[#000000] hover:bg-gray-900 active:scale-95 text-white font-black rounded-none shadow-lg transition-all cursor-pointer text-base"
                  >
                    <Download className="w-5 h-5" />
                    <span>보고서 PDF 다운로드</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="w-full max-w-md flex items-center justify-center gap-2.5 px-6 py-4.5 bg-gray-100 text-gray-400 font-extrabold rounded-none cursor-not-allowed text-base border border-gray-200"
                  >
                    <Download className="w-5 h-5" />
                    <span>보고서 다운로드 (구독 회원 전용)</span>
                  </button>
                )}
              </div>

              {/* 대가별 AI 투자 시그널 섹션 */}
              {isPremium && signals.length > 0 && (
                <section className="space-y-6 pt-4">
                  <div className="border-b-2 border-black pb-2">
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
                      <Brain className="w-6 h-6 text-black animate-pulse" />
                      <span>10대 투자 대가 및 AI 종합 분석</span>
                    </h2>
                    <p className="text-sm font-semibold text-gray-500 mt-1 leading-relaxed">
                      전설적인 투자 대가들의 투자원칙과 AI 모델의 투자전략을 적용한 이 종목에 대한 투자 의견 및 세부 판단입니다.<br />
                      <strong className="text-red-600 font-extrabold">※ 참고용으로만 활용하십시오. 제시되는 투자 의견은 수익률을 보장하는 것이 아닙니다.</strong>
                    </p>
                  </div>

                  {/* 상단: 종합 의견 게이지 바 */}
                  <div className="p-5 bg-box-bg border border-black rounded-none shadow-md space-y-4">
                    <h3 className="text-base font-extrabold text-gray-900">종합 투자 매력도 의견 분포</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Bullish */}
                      <div className="p-3 bg-green-50 border border-green-200 flex items-center justify-between rounded-none">
                        <div>
                          <span className="text-sm font-bold text-green-800 block">매수 우세 (Bullish)</span>
                          <span className="text-2xl font-black text-green-900">{signals.filter(s => s.signal === 'Bullish').length}명</span>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-600 opacity-80" />
                      </div>
                      {/* Neutral */}
                      <div className="p-3 bg-amber-50 border border-amber-200 flex items-center justify-between rounded-none">
                        <div>
                          <span className="text-sm font-bold text-amber-800 block">중립 관망 (Neutral)</span>
                          <span className="text-2xl font-black text-amber-900">{signals.filter(s => s.signal === 'Neutral').length}명</span>
                        </div>
                        <Minus className="w-8 h-8 text-amber-600 opacity-80" />
                      </div>
                      {/* Bearish */}
                      <div className="p-3 bg-red-50 border border-red-200 flex items-center justify-between rounded-none">
                        <div>
                          <span className="text-sm font-bold text-red-800 block">매도 경계 (Bearish)</span>
                          <span className="text-2xl font-black text-red-900">{signals.filter(s => s.signal === 'Bearish').length}명</span>
                        </div>
                        <TrendingDown className="w-8 h-8 text-red-600 opacity-80" />
                      </div>
                    </div>
                  </div>

                  {/* 하단: 카드 그리드 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {signals.map((sig, idx) => {
                      // 시그널별 뱃지 스타일 정의
                      let badgeBg = 'bg-gray-100 text-gray-800 border-gray-300';
                      let badgeText = '중립';
                      if (sig.signal === 'Bullish') {
                        badgeBg = 'bg-green-100 text-green-800 border-green-300';
                        badgeText = '매수';
                      } else if (sig.signal === 'Bearish') {
                        badgeBg = 'bg-red-100 text-red-800 border-red-300';
                        badgeText = '매도';
                      }

                      return (
                        <div key={idx} className="p-5 bg-box-bg border border-black rounded-none shadow-md flex flex-col justify-between hover:shadow-lg transition-all relative overflow-hidden group">
                          {/* 탑 헤더 영역 */}
                          <div>
                            <div className="flex items-center justify-between mb-3.5">
                              <span className="text-base font-extrabold text-gray-900 tracking-tight">
                                {sig.analyst_name}
                              </span>
                              <span className={`px-2.5 py-0.5 text-xs font-black border uppercase tracking-wider rounded-none ${badgeBg}`}>
                                {badgeText}
                              </span>
                            </div>
                            
                            {/* 신뢰도 게이지 바 */}
                            <div className="mb-4">
                              <div className="flex justify-between items-center text-xs font-bold text-gray-500 mb-1">
                                <span>AI 분석 신뢰도</span>
                                <span>{sig.confidence}%</span>
                              </div>
                              <div className="w-full bg-gray-200 h-1.5 rounded-none overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 ${
                                    sig.signal === 'Bullish' ? 'bg-green-600' : sig.signal === 'Bearish' ? 'bg-red-600' : 'bg-amber-500'
                                  }`} 
                                  style={{ width: `${sig.confidence}%` }}
                                />
                              </div>
                            </div>

                            {/* 분석 세부 내용 */}
                            <p className="text-gray-700 text-sm font-semibold leading-relaxed font-sans whitespace-pre-line italic">
                              "{sig.reasoning}"
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
