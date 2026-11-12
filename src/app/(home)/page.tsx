import React from 'react';
import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import dynamic from 'next/dynamic';
import { ArrowRight, Layers } from 'lucide-react';
import { supabase as publicSupabase } from '@/lib/supabase';
import { getSessionUser } from '@/app/actions/auth';
import PortfolioPieChart from '@/components/PortfolioPieChart';
import HomeQuickGuide from '@/components/HomeQuickGuide';
import { PB_MODEL_PORTFOLIO } from '@/config/portfolio';
import { getMonthlyBrief } from '@/lib/monthly-brief';

const PortfolioCalculator = dynamic(() => import('@/components/PortfolioCalculator'), {
  loading: () => (
    <div className="p-6 bg-white border border-black shadow-xs animate-pulse">
      <div className="h-6 w-48 bg-black/10 mb-4" />
      <div className="h-10 bg-black/5" />
    </div>
  ),
});

const PortfolioHistoryTimeline = dynamic(() => import('@/components/PortfolioHistoryTimeline'), {
  loading: () => (
    <div className="p-6 bg-white border border-black shadow-xs animate-pulse">
      <div className="h-6 w-56 bg-black/10 mb-4" />
      <div className="h-20 bg-black/5" />
    </div>
  ),
});

const getCachedPortfolioPrices = unstable_cache(
  async (tickers: string[]) => {
    if (!tickers || tickers.length === 0) return {};
    const priceMap: Record<string, { close: number; date: string }> = {};

    await Promise.all(
      tickers.map(async (ticker) => {
        const { data } = await publicSupabase
          .from('etf_prices')
          .select('ticker, date, close')
          .eq('ticker', ticker)
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          priceMap[data.ticker] = {
            close: Number(data.close) || 0,
            date: data.date ? String(data.date) : '',
          };
        }
      })
    );

    return priceMap;
  },
  ['home-portfolio-prices-cache-v2'],
  { revalidate: 3600, tags: ['home-page'] }
);

export default async function Home() {
  const portfolioData = PB_MODEL_PORTFOLIO;
  const modelPortfolioTickers = portfolioData
    .map(item => item.ticker)
    .filter(Boolean);

  const portfolioPrices = await getCachedPortfolioPrices(modelPortfolioTickers);

  // 월간 브리프 데이터 로드 (monthly-brief.md 연동)
  const brief = getMonthlyBrief();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 space-y-16">

      {/* 0. 3단계 탑다운 퀵 스타트 가이드 (초보자 & 첫 방문 고객용 나침반) */}
      <HomeQuickGuide />

      {/* 1. 당신의 피비 월간 자산배분 전략 섹션 */}
      <section className="space-y-6">
        <div className="space-y-2.5 border-b border-black/10 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl select-none">
              당신의 피비 월간 자산배분 전략
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              거시 경제 국면과 HRP 분산 모델에 기반한 이달의 핵심 포트폴리오 가이드
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="font-bold text-gray-900 bg-gray-100 px-2.5 py-0.5 border border-black/10 font-mono shrink-0">
              {brief.edition}
            </span>
            <span className="text-gray-300 shrink-0">|</span>
            <Link
              href="/monthly"
              className="group inline-flex items-center gap-1 font-bold text-gray-700 hover:text-black transition-colors whitespace-nowrap"
            >
              <span>월간 리포트 전문 보기</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* 한줄 시장 테마 헤드라인 (그라데이션 없이 차분하고 품격 있는 웜 크림 & 딥 앰버 골드 톤) */}
        <div className="p-4 sm:p-5 bg-white border border-black/10 border-l-4 border-l-[#D4AF37] shadow-xs">
          <p className="text-base sm:text-lg font-bold leading-relaxed tracking-tight text-[#8B6508] break-keep">
            &ldquo;{brief.headline}&rdquo;
          </p>
        </div>

        {/* 자산배분 핵심 처방: 불릿/좌우배치 제거 및 1줄 접이식 아코디언 전환 */}
        <details className="group bg-white border border-black/10 shadow-xs transition-all">
          <summary className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none list-none hover:bg-black/5 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <h3 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight break-keep">
                자산배분 핵심 처방
              </h3>
              <span className="text-[11px] font-bold text-[#8B6508] bg-[#D4AF37]/15 px-2 py-0.5 border border-[#D4AF37]/30 w-fit">
                Top-Down 포트폴리오
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-gray-600 shrink-0 ml-3">
              <span className="group-open:hidden">펼쳐보기 ▼</span>
              <span className="group-not-open:hidden">접기 ▲</span>
            </div>
          </summary>

          <div className="p-5 sm:p-6 border-t border-black/10 bg-[#FAF9F5] space-y-4 animate-in fade-in duration-150">
            <p className="text-sm sm:text-base text-gray-800 leading-relaxed font-normal whitespace-pre-line break-keep">
              {brief.sections.strategy}
            </p>
            <div className="pt-3 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500">
              <span className="break-keep">* 거시 사이클 및 금리/유동성 팩트 세부 지표는 상단 매크로 메뉴에서 심층 분석하실 수 있습니다.</span>
              <Link
                href="/macro"
                className="font-bold text-gray-900 hover:text-[#8B6508] transition-colors inline-flex items-center gap-1 shrink-0"
              >
                <span>매크로 4대 팩트 진단하러 가기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </details>
      </section>

      {/* 2. 당신의 피비 포트폴리오 섹션 */}
      <section className="space-y-6">
        <div className="flex items-center">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl select-none">
            당신의 피비 모델 포트폴리오
          </h2>
        </div>

        {/* 데스크톱: 가로 2열 / 모바일: 상하 1열 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 rounded-none shadow-none bg-transparent">

          {/* 원형 그래프 영역 */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-[320px] flex items-center justify-center">
              <PortfolioPieChart data={portfolioData} />
            </div>
          </div>

          {/* 비중 카드 스태킹 영역 */}
          <div className="lg:col-span-7 flex flex-col gap-3 font-serif">
            {portfolioData.map((row) => {
              const isZero = row.pct === 0;
              return (
                <div
                  key={row.type}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-[#000000] rounded-none transition-all duration-200 ${isZero ? 'opacity-30' : 'hover:bg-gray-50'}`}
                >
                  {/* 좌측: 컬러칩 + 자산 유형 + 자산 설명 */}
                  <div className="flex items-center gap-3.5 text-base font-bold text-[#000000]">
                    <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                    <span className="min-w-10">{row.type}</span>
                    <span className="text-gray-300 font-normal hidden sm:inline">|</span>
                    <span className="text-sm font-semibold text-[#000000] truncate max-w-45 sm:max-w-70">
                      {row.name}
                    </span>
                  </div>

                  {/* 우측: 티커 링크 + 비중 퍼센트 */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 mt-2 sm:mt-0 border-t border-[#000000]/10 pt-2 sm:pt-0 sm:border-0">
                    {row.ticker ? (
                      <Link
                        href={`/etf/${row.ticker}`}
                        className="px-2 py-0.5 border border-black text-[#000000] text-xs font-bold font-mono rounded-none hover:bg-black hover:text-white transition-colors"
                      >
                        {row.ticker}
                      </Link>
                    ) : (
                      <span className="text-[10px] text-[#000000]/30 select-none uppercase tracking-wider">no ticker</span>
                    )}
                    <span className="text-lg font-extrabold font-mono text-[#000000] min-w-10 text-right">
                      {row.pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
        
        {/* 2-1. 당신의 피비 모델 포트폴리오 1초 배분 계산기 */}
        <div className="pt-2">
          <PortfolioCalculator
            portfolioData={portfolioData}
            prices={portfolioPrices}
          />
        </div>

        {/* 포트폴리오 리밸런싱 및 매매 집행 히스토리 타임라인 */}
        <div className="pt-2">
          <PortfolioHistoryTimeline />
        </div>
      </section>

      {/* 3. 다음 단계 안내: 글로벌 ETF 탐색 및 속 종목 엑스레이 연결 배너 */}
      <section className="bg-white border border-black/10 p-6 sm:p-8 text-gray-900 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-none bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-[#8B6508]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                포트폴리오 비중을 정하셨나요?
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                미국 및 국내 상장 글로벌 대표 ETF를 둘러보고, 상위 10대 편입 종목을 1초 만에 엑스레이 해보세요.
              </p>
            </div>
          </div>
          <Link
            href="/etf"
            className="w-full sm:w-auto px-5 py-3 bg-[#D4AF37] hover:bg-[#c29f2f] text-black font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shrink-0 text-center shadow-xs"
          >
            <span>글로벌 ETF 목록 전체보기</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 원클릭 추천 엑스레이 칩 (우리 DB에 실제 존재하는 5대 핵심 ETF) */}
        <div className="pt-4 border-t border-black/10 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-500 font-bold shrink-0">대표 ETF 엑스레이:</span>
          {[
            { ticker: 'SPY', name: 'S&P 500 대표지수' },
            { ticker: 'QQQ', name: '나스닥 100 성장' },
            { ticker: 'SOXX', name: '필라델피아 반도체' },
            { ticker: 'TLT', name: '미국 20년 장기국채' },
            { ticker: 'GLD', name: '글로벌 금(Gold) 대체자산' },
          ].map((item) => (
            <Link
              key={item.ticker}
              href={`/etf/${item.ticker}`}
              className="px-2.5 py-1 bg-[#F9F8F6] hover:bg-[#D4AF37]/15 border border-black/10 hover:border-[#D4AF37] text-gray-800 hover:text-black transition-colors font-mono"
            >
              <strong>{item.ticker}</strong> <span className="text-[11px] text-gray-500 font-sans">({item.name})</span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
