import React from 'react';
import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import { ArrowRight, Sparkles } from 'lucide-react';
import { supabase as publicSupabase } from '@/lib/supabase';
import Filter from '@/components/Filter';
import ModelCarousel from '@/components/ModelCarousel';
import { getSessionUser } from '@/app/actions/auth';
import { getWishlist } from '@/app/actions/wishlist';
import PortfolioPieChart from '@/components/PortfolioPieChart';
import { PB_MODEL_PORTFOLIO } from '@/config/portfolio';
import { getMonthlyBrief } from '@/lib/monthly-brief';

const getCachedEtfs = unstable_cache(
  async () => {
    const { data } = await publicSupabase
      .from('etf_list')
      .select('ticker, name, category, report, leverage')
      .order('ticker');
    return data || [];
  },
  ['home-etf-list-cache-v2'],
  { revalidate: 3600, tags: ['home-page'] }
);

export default async function Home() {
  const [user, wishlist, etfs] = await Promise.all([
    getSessionUser(),
    getWishlist(),
    getCachedEtfs(),
  ]);
  const wishlistTickers = wishlist.map(etf => etf.ticker);

  // 월간 브리프 데이터 로드 (monthly-brief.md 연동)
  const brief = getMonthlyBrief();

  // 포트폴리오 비중 정의 (공통 설정 모듈 참조)
  const portfolioData = PB_MODEL_PORTFOLIO;

  // 포트폴리오에 지정된 대표 ETF 티커 리스트 추출 (실시간 변경 반영)
  const modelPortfolioTickers = portfolioData
    .map(item => item.ticker)
    .filter(Boolean);

  // DB에서 가져온 최신 etfs 데이터와 매핑하여 캐러셀 구성
  const modelPortfolioEtfs = etfs
    ?.filter(etf => modelPortfolioTickers.includes(etf.ticker))
    .map(etf => ({
      ticker: etf.ticker,
      name: etf.name || '',
      category: etf.category || '',
      leverage: etf.leverage || null,
    })) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8 space-y-16">

      {/* 1. 당신의 피비 월간 금융시장 전망 섹션 (monthly 변경 시 자동 동기화) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl select-none">
              당신의 피비 월간 금융시장 전망
            </h2>
            <span className="text-xs font-bold text-white bg-black px-2.5 py-1 rounded-none font-mono">
              {brief.edition}
            </span>
          </div>
          <Link
            href="/monthly"
            className="group flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-600 hover:text-black transition-colors"
          >
            <span>월간 리포트 전문 보기</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 한줄 시장 테마 헤드라인 (제목 없이 삽입) */}
        <div className="p-5 sm:p-6 bg-linear-to-r from-gray-900 via-black to-gray-900 text-white border-l-4 border-[#D4AF37] shadow-md">
          <p className="text-base sm:text-lg lg:text-xl font-bold leading-relaxed tracking-tight text-white/95">
            {brief.headline}
          </p>
        </div>

        {/* 월간 금융시장 시황 총평 4대 항목 (제목 없이 내용 삽입) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* 1. 글로벌 매크로 & 경기/물가 사이클 */}
          <div className="p-6 bg-white border border-black shadow-xs space-y-3">
            <h3 className="text-base font-extrabold text-black flex items-center gap-2 border-b border-gray-100 pb-2.5">
              <span className="w-2 h-2 bg-[#D4AF37] rounded-full shrink-0" />
              1. 글로벌 매크로 & 경기/물가 사이클
            </h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
              * {brief.sections.macro}
            </p>
          </div>

          {/* 2. 금리·유동성 및 금융시장 리스크 */}
          <div className="p-6 bg-white border border-black shadow-xs space-y-3">
            <h3 className="text-base font-extrabold text-black flex items-center gap-2 border-b border-gray-100 pb-2.5">
              <span className="w-2 h-2 bg-[#D4AF37] rounded-full shrink-0" />
              2. 금리·유동성 및 금융시장 리스크
            </h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
              * {brief.sections.liquidity}
            </p>
          </div>

          {/* 3. 글로벌 자산군 및 주식·섹터·테마 모멘텀 */}
          <div className="p-6 bg-white border border-black shadow-xs space-y-3">
            <h3 className="text-base font-extrabold text-black flex items-center gap-2 border-b border-gray-100 pb-2.5">
              <span className="w-2 h-2 bg-[#D4AF37] rounded-full shrink-0" />
              3. 글로벌 자산군 및 주식·섹터·테마 모멘텀
            </h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
              * {brief.sections.momentum}
            </p>
          </div>

          {/* 4. 당신의 피비의 자산배분 전략 */}
          <div className="p-6 bg-white border border-black shadow-xs space-y-3">
            <h3 className="text-base font-extrabold text-black flex items-center gap-2 border-b border-gray-100 pb-2.5">
              <span className="w-2 h-2 bg-[#D4AF37] rounded-full shrink-0" />
              4. 당신의 피비의 자산배분 전략
            </h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
              * {brief.sections.strategy}
            </p>
          </div>

        </div>
      </section>

      {/* 2. 당신의 피비 포트폴리오 섹션 */}
      <section className="space-y-6">
        <div className="flex items-center">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl select-none">
            당신의 피비 포트폴리오
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
                        className="px-2 py-0.5 border border-black text-[#000000] text-xs font-bold font-mono rounded-none"
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
      </section>

      {/* 3. 구성 ETF 캐러셀 섹션 */}
      <section>
        <ModelCarousel
          etfs={modelPortfolioEtfs}
          initialWishlistTickers={wishlistTickers}
          isLoggedIn={!!user}
        />
      </section>

      {/* 4. 관심 ETF 그리드 섹션 */}
      <section className="space-y-6">
        <div className="flex items-center">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl select-none">
            관심 ETF
          </h2>
        </div>

        {/* 3단계 필터 및 목록 컴포넌트 마운트 */}
        <Filter
          initialEtfs={etfs || []}
          initialWishlistTickers={wishlistTickers}
          isLoggedIn={!!user}
        />
      </section>

    </div>
  );
}
