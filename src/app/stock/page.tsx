import React from 'react';
import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import { supabase as publicSupabase } from '@/lib/supabase';
import { getSessionUser } from '@/app/actions/auth';
import { getStockWishlist } from '@/app/actions/stock_wishlist';
import Filter from '@/app/components/Filter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HubFaqAccordion from '@/components/HubFaqAccordion';

export const metadata = {
  title: '주식 정보 조회 - 당신의 피비',
  description: '관심 주식 종목의 대분류, 중분류 실시간 필터 및 최근 주가와 기간별 수익률을 모니터링합니다.',
};

const getCachedStocksData = unstable_cache(
  async () => {
    // 1. stock_list 전체 종목 단일 조회 (Supabase 3,000건 한도로 단 1회 쿼리 완결)
    const { data: stocks, error: stockError } = await publicSupabase
      .from('stock_list')
      .select('ticker, name, sector2, industry2, interest')
      .order('ticker')
      .limit(3000);

    if (stockError || !stocks || stocks.length === 0) {
      console.error('Error fetching stock list:', stockError);
      throw new Error(`Failed to fetch stock list: ${stockError?.message || 'Empty'}`);
    }

    // 2. 가장 최신 시세 기준일(latest date) 1건 초고속 조회
    const { data: latestDateRow } = await publicSupabase
      .from('stock_prices')
      .select('date')
      .order('date', { ascending: false })
      .limit(1);

    const latestDate = latestDateRow?.[0]?.date;
    const pricesMap: Record<string, { close?: number | null; yield_1w?: number | null; yield_5w?: number | null; yield_20w?: number | null; yield_60w?: number | null; yield_120w?: number | null }> = {};

    if (latestDate) {
      // 3. 해당 최신 기준일의 stock_prices 단일 쿼리 조회 (3,000건 한도로 1,017건 전건 단번에 수집)
      const { data: latestPrices, error: priceError } = await publicSupabase
        .from('stock_prices')
        .select('ticker, close, yield_1w, yield_5w, yield_20w, yield_60w, yield_120w')
        .eq('date', latestDate)
        .limit(3000);

      // Fail-Safe 방어벽: 최신 날짜 시세가 정상 수치(최소 500건 이상)로 수집된 경우에만 매핑
      if (!priceError && latestPrices && latestPrices.length >= 500) {
        latestPrices.forEach((p) => {
          pricesMap[p.ticker] = p;
        });
      } else {
        console.error('Warning: stock_prices incomplete or failed for date:', latestDate, priceError);
        throw new Error(`Incomplete stock prices fetched (${latestPrices?.length || 0} rows).`);
      }
    }

    // 4. 주식 정보와 최신 주간/월간 수익률 결합
    return stocks.map((stock) => {
      const priceInfo = pricesMap[stock.ticker] || {};
      return {
        ticker: stock.ticker,
        name: stock.name || '',
        sector2: stock.sector2 || '',
        industry2: stock.industry2 || '',
        interest: stock.interest || 'n',
        close: priceInfo.close !== undefined && priceInfo.close !== null ? Number(priceInfo.close) : null,
        yield_1w: priceInfo.yield_1w !== undefined && priceInfo.yield_1w !== null ? Number(priceInfo.yield_1w) : null,
        yield_5w: priceInfo.yield_5w !== undefined && priceInfo.yield_5w !== null ? Number(priceInfo.yield_5w) : null,
        yield_20w: priceInfo.yield_20w !== undefined && priceInfo.yield_20w !== null ? Number(priceInfo.yield_20w) : null,
        yield_60w: priceInfo.yield_60w !== undefined && priceInfo.yield_60w !== null ? Number(priceInfo.yield_60w) : null,
        yield_120w: priceInfo.yield_120w !== undefined && priceInfo.yield_120w !== null ? Number(priceInfo.yield_120w) : null,
      };
    });
  },
  ['stock-page-data-cache-v5'],
  { revalidate: 3600, tags: ['stock-page'] }
);

export default async function StockPage() {
  const user = await getSessionUser();
  const [stockWishlistTickers, mergedStocks] = await Promise.all([
    getStockWishlist(user),
    getCachedStocksData(),
  ]);
  const isPremium = user?.membership_status === 'premium';

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Header initialUser={user} />
      <main className="grow pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 mt-10">
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl select-none">
                주식 정보 조회
              </h2>
              <span className="text-xs text-gray-500">
                글로벌 1,000여 개 대형 우량주 펀더멘털 진단
              </span>
            </div>

            {/* 💡 피비의 안내: 1줄 접이식 펼침 메뉴 (기본 접힘으로 본문 검색 즉시 노출) */}
            <details className="group bg-white border border-black/10 shadow-xs transition-all">
              <summary className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none list-none hover:bg-black/5 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-[#9A3412] font-extrabold text-xs sm:text-sm">💡 피비의 안내</span>
                  <span className="text-xs text-gray-500 font-medium hidden sm:inline">
                    · 클릭하여 21인 대가 관점 및 펀더멘털 조회 요령 확인
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-gray-600">
                  <span className="group-open:hidden">펼쳐보기 ▼</span>
                  <span className="hidden group-open:inline">가이드 접기 ▲</span>
                </div>
              </summary>

              <div className="p-4 sm:p-5 border-t border-black/10 bg-[#FAF9F5] space-y-3.5 animate-in fade-in duration-150">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-gray-900 block">
                    [우량주 펀더멘털 4대 진단 혜택]
                  </span>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed break-keep">
                    관심 있는 종목을 클릭하시면{' '}
                    <strong className="text-gray-950 font-bold">① 밸류에이션(P/E, P/B)</strong>,{' '}
                    <strong className="text-gray-950 font-bold">② 21인 대가들의 AI 투자 관점 & 신뢰도</strong>,{' '}
                    <strong className="text-gray-950 font-bold">③ 주가 캔들 차트</strong>,{' '}
                    <strong className="text-gray-950 font-bold">④ 1주~120주 기간수익률 성과</strong>를 한눈에 확인하실 수 있습니다.
                  </p>
                </div>

                {/* 원클릭 추천 종목 체험 태그 */}
                <div className="pt-3 border-t border-black/10 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
                  <span className="text-gray-600 font-bold shrink-0 text-[11px] sm:text-xs">원클릭 추천 진단:</span>
                  {[
                    { ticker: 'AAPL', label: 'AAPL (애플 21인 대가)' },
                    { ticker: 'NVDA', label: 'NVDA (엔비디아 성과)' },
                    { ticker: 'MSFT', label: 'MSFT (MS 안전마진)' },
                    { ticker: 'AMZN', label: 'AMZN (아마존 펀더멘털)' },
                    { ticker: 'GOOGL', label: 'GOOGL (구글 밸류에이션)' },
                  ].map((item) => (
                    <Link
                      key={item.ticker}
                      href={`/stock/${item.ticker}`}
                      className="px-2.5 py-1 bg-white hover:bg-amber-50 border border-black/10 hover:border-[#EA580C] text-gray-800 hover:text-black transition-colors text-[11px] sm:text-xs whitespace-nowrap shadow-xs"
                    >
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </details>

            <Filter
              initialStocks={mergedStocks}
              initialWishlistTickers={stockWishlistTickers}
              isLoggedIn={!!user}
              isPremium={isPremium}
            />

            {/* 주식 허브 릴스 연계 FAQ & 가입 유도 앵커 */}
            <HubFaqAccordion type="stock" isLoggedIn={!!user} />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
