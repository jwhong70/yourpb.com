import React from 'react';
import { unstable_cache } from 'next/cache';
import { supabase as publicSupabase } from '@/lib/supabase';
import { createClient } from '@/lib/supabase-server';
import EtfSearchClient from '@/components/EtfSearchClient';
import { getSessionUser } from '@/app/actions/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const getCachedEtfsData = unstable_cache(
  async () => {
    // 1. etf_list 조회
    const { data: etfs, error: etfError } = await publicSupabase
      .from('etf_list')
      .select('ticker, name, category, report, leverage')
      .order('ticker');

    if (etfError) {
      console.error('Error fetching etfs:', etfError);
      return [];
    }

    // 2. 가장 최근 날짜(max date) 구하기
    const { data: latestDateData, error: dateError } = await publicSupabase
      .from('etf_prices')
      .select('date')
      .order('date', { ascending: false })
      .limit(1);

    let pricesMap: Record<string, any> = {};

    if (!dateError && latestDateData && latestDateData.length > 0) {
      const maxDate = latestDateData[0].date;

      // 3. 해당 날짜의 etf_prices 조회
      const { data: prices, error: priceError } = await publicSupabase
        .from('etf_prices')
        .select('ticker, close, yield_1w, yield_5w, yield_20w, yield_60w, yield_120w')
        .eq('date', maxDate);

      if (!priceError && prices) {
        prices.forEach((p) => {
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
      };
    });
  },
  ['etf-page-data-cache'],
  { revalidate: 600 }
);

export default async function EtfPage() {
  const user = await getSessionUser();
  const mergedEtfs = await getCachedEtfsData();

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
            <EtfSearchClient initialEtfs={mergedEtfs} />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
