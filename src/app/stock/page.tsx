import React from 'react';
import { createClient } from '@/lib/supabase-server';
import { getSessionUser } from '@/app/actions/auth';
import Filter from '@/app/components/Filter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: '주식 정보 조회 - YOURPB',
  description: '관심 주식 종목의 대분류, 중분류 실시간 필터 및 최근 주가와 기간별 수익률을 모니터링합니다.',
};

export default async function StockPage() {
  const supabase = await createClient();
  const user = await getSessionUser();
  const isPremium = user?.membership_status === 'premium';

  // 1. stock_list 전체 종목 조회
  const { data: stocks, error: stockError } = await supabase
    .from('stock_list')
    .select('ticker, name, sector2, industry2, interest')
    .order('ticker');

  if (stockError) {
    console.error('Error fetching stock list:', stockError);
  }

  // 2. stock_prices 에서 가장 최근의 날짜(max date) 구하기
  const { data: latestDateData, error: dateError } = await supabase
    .from('stock_prices')
    .select('date')
    .order('date', { ascending: false })
    .limit(1);

  let pricesMap: Record<string, any> = {};

  if (dateError) {
    console.error('Error fetching latest stock date:', dateError);
  } else if (latestDateData && latestDateData.length > 0) {
    const maxDate = latestDateData[0].date;

    // 3. 해당 최근 날짜의 stock_prices 데이터 조회
    const { data: prices, error: priceError } = await supabase
      .from('stock_prices')
      .select('ticker, close, yield_1w, yield_5w, yield_20w, yield_60w, yield_120w')
      .eq('date', maxDate);

    if (!priceError && prices) {
      prices.forEach((p) => {
        pricesMap[p.ticker] = p;
      });
    } else if (priceError) {
      console.error('Error fetching stock prices:', priceError);
    }
  } else {
    console.warn('No price data found in stock_prices table.');
  }

  // 4. 주식 정보와 가격 데이터 병합
  const mergedStocks = (stocks || []).map((stock) => {
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
            <Filter initialStocks={mergedStocks} isPremium={isPremium} />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
