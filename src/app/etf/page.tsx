import React from 'react';
import { unstable_cache } from 'next/cache';
import { supabase as publicSupabase } from '@/lib/supabase';
import EtfSearchClient from '@/components/EtfSearchClient';
import { getSessionUser } from '@/app/actions/auth';
import { getWishlist } from '@/app/actions/wishlist';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const getCachedEtfsData = unstable_cache(
  async () => {
    // 1. etf_list 전체 종목 조회
    const { data: etfs, error: etfError } = await publicSupabase
      .from('etf_list')
      .select('ticker, name, category, report, leverage')
      .order('ticker')
      .limit(1000);

    if (etfError) {
      console.error('Error fetching etfs:', etfError);
      return [];
    }

    // 2. 벤치마크 SPY를 기준으로 최근 10주간의 기준일 목록(descending) 조회
    const { data: dateRows } = await publicSupabase
      .from('etf_prices')
      .select('date')
      .eq('ticker', 'SPY')
      .order('date', { ascending: false })
      .limit(10);

    const sparklineDates = (dateRows || []).map((r) => r.date);
    const pricesMap: Record<string, { close?: number | null; yield_1w?: number | null; yield_5w?: number | null; yield_20w?: number | null; yield_60w?: number | null; yield_120w?: number | null }> = {};
    const sparkMap: Record<string, number[]> = {};

    if (sparklineDates.length > 0) {
      // 3. 최근 10주간의 etf_prices 조회 (시간 오름차순으로 정렬하여 스파크라인 배열 및 최신 시세 맵 동시 생성)
      const { data: prices, error: priceError } = await publicSupabase
        .from('etf_prices')
        .select('ticker, date, close, yield_1w, yield_5w, yield_20w, yield_60w, yield_120w')
        .in('date', sparklineDates)
        .order('date', { ascending: true })
        .limit(5000);

      if (!priceError && prices) {
        prices.forEach((p) => {
          if (!sparkMap[p.ticker]) {
            sparkMap[p.ticker] = [];
          }
          if (p.close !== null && p.close !== undefined) {
            sparkMap[p.ticker].push(Number(p.close));
          }
          pricesMap[p.ticker] = p;
        });
      }
    }

    // 4. 데이터 병합
    return (etfs || []).map((etf) => {
      const priceInfo = pricesMap[etf.ticker] || {};
      return {
        ticker: etf.ticker,
        name: etf.name || '',
        category: etf.category || '',
        report: etf.report || '',
        leverage: etf.leverage,
        close: priceInfo.close !== undefined && priceInfo.close !== null ? Number(priceInfo.close) : null,
        yield_1w: priceInfo.yield_1w !== undefined && priceInfo.yield_1w !== null ? Number(priceInfo.yield_1w) : null,
        yield_5w: priceInfo.yield_5w !== undefined && priceInfo.yield_5w !== null ? Number(priceInfo.yield_5w) : null,
        yield_20w: priceInfo.yield_20w !== undefined && priceInfo.yield_20w !== null ? Number(priceInfo.yield_20w) : null,
        yield_60w: priceInfo.yield_60w !== undefined && priceInfo.yield_60w !== null ? Number(priceInfo.yield_60w) : null,
        yield_120w: priceInfo.yield_120w !== undefined && priceInfo.yield_120w !== null ? Number(priceInfo.yield_120w) : null,
        sparkline: sparkMap[etf.ticker] || [],
      };
    });
  },
  ['etf-page-data-cache-v3'],
  { revalidate: 3600, tags: ['etf-page'] }
);

export default async function EtfPage() {
  const [user, wishlist, mergedEtfs] = await Promise.all([
    getSessionUser(),
    getWishlist(),
    getCachedEtfsData(),
  ]);
  const wishlistTickers = wishlist.map((etf) => etf.ticker);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Header initialUser={user} />
      <main className="grow pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 mt-10">
          <section className="space-y-6">
            <div className="flex items-center">
              <h2 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl select-none">
                ETF 정보 조회
              </h2>
            </div>
            <EtfSearchClient
              initialEtfs={mergedEtfs}
              initialWishlistTickers={wishlistTickers}
              isLoggedIn={!!user}
            />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
