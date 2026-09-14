import React from 'react';
import { unstable_cache } from 'next/cache';
import { supabase as publicSupabase } from '@/lib/supabase';
import { createClient } from '@/lib/supabase-server';
import { getSessionUser } from '@/app/actions/auth';
import { getStockWishlist } from '@/app/actions/stock_wishlist';
import Filter from '@/app/components/Filter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: '주식 정보 조회 - YOURPB',
  description: '관심 주식 종목의 대분류, 중분류 실시간 필터 및 최근 주가와 기간별 수익률을 모니터링합니다.',
};

const getCachedStocksData = unstable_cache(
  async () => {
    // 1. stock_list 전체 종목 조회 (PostgREST 1000건 제한 방지를 위해 병렬 range 조회)
    const [page1, page2] = await Promise.all([
      publicSupabase
        .from('stock_list')
        .select('ticker, name, sector2, industry2, interest')
        .order('ticker')
        .range(0, 999),
      publicSupabase
        .from('stock_list')
        .select('ticker, name, sector2, industry2, interest')
        .order('ticker')
        .range(1000, 1999),
    ]);

    const stocks = [...(page1.data || []), ...(page2.data || [])];

    if (stocks.length === 0 && page1.error) {
      console.error('Error fetching stock list:', page1.error);
      return [];
    }

    // 2. stock_prices 에서 최신 주간 가격 및 수익률 데이터 병렬 조회 (최근 5,000건 확보로 모든 종목 최신가 보장)
    const [pricePage1, pricePage2, pricePage3, pricePage4, pricePage5] = await Promise.all([
      publicSupabase
        .from('stock_prices')
        .select('ticker, date, close, yield_1w, yield_5w, yield_20w, yield_60w, yield_120w')
        .order('date', { ascending: false })
        .range(0, 999),
      publicSupabase
        .from('stock_prices')
        .select('ticker, date, close, yield_1w, yield_5w, yield_20w, yield_60w, yield_120w')
        .order('date', { ascending: false })
        .range(1000, 1999),
      publicSupabase
        .from('stock_prices')
        .select('ticker, date, close, yield_1w, yield_5w, yield_20w, yield_60w, yield_120w')
        .order('date', { ascending: false })
        .range(2000, 2999),
      publicSupabase
        .from('stock_prices')
        .select('ticker, date, close, yield_1w, yield_5w, yield_20w, yield_60w, yield_120w')
        .order('date', { ascending: false })
        .range(3000, 3999),
      publicSupabase
        .from('stock_prices')
        .select('ticker, date, close, yield_1w, yield_5w, yield_20w, yield_60w, yield_120w')
        .order('date', { ascending: false })
        .range(4000, 4999),
    ]);

    const allPrices = [
      ...(pricePage1.data || []),
      ...(pricePage2.data || []),
      ...(pricePage3.data || []),
      ...(pricePage4.data || []),
      ...(pricePage5.data || []),
    ];

    const pricesMap: Record<string, any> = {};
    for (const p of allPrices) {
      if (!pricesMap[p.ticker]) {
        pricesMap[p.ticker] = p;
      }
    }

    // 3. 주식 정보와 가격 데이터 병합
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
  ['stock-page-data-cache-v3'],
  { revalidate: 60, tags: ['stock-page'] }
);

export default async function StockPage() {
  const user = await getSessionUser();
  const isPremium = user?.membership_status === 'premium';
  const stockWishlistTickers = await getStockWishlist();
  const mergedStocks = await getCachedStocksData();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Header initialUser={user} />
      <main className="grow pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 mt-10">
          <section className="space-y-6">
            <div className="flex items-center">
              <h2 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl select-none">
                주식 정보 조회
              </h2>
            </div>
            <Filter
              initialStocks={mergedStocks}
              initialWishlistTickers={stockWishlistTickers}
              isLoggedIn={!!user}
              isPremium={isPremium}
            />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
