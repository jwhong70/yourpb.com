import React from 'react';
import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import { supabase as publicSupabase } from '@/lib/supabase';
import EtfSearchClient from '@/components/EtfSearchClient';
import { getSessionUser } from '@/app/actions/auth';
import { getWishlist } from '@/app/actions/wishlist';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HubFaqAccordion from '@/components/HubFaqAccordion';

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
  const user = await getSessionUser();
  const [wishlist, mergedEtfs] = await Promise.all([
    getWishlist(user),
    getCachedEtfsData(),
  ]);
  const wishlistTickers = wishlist.map((etf) => etf.ticker);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Header initialUser={user} />
      <main className="grow pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 mt-10">
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl select-none">
                ETF 정보 조회
              </h2>
              <span className="text-xs text-gray-500">
                미국 및 국내 상장 글로벌 핵심 ETF 엑스레이
              </span>
            </div>

            {/* 💡 피비의 안내: 1줄 접이식 펼침 메뉴 (기본 접힘으로 본문 검색 즉시 노출) */}
            <details className="group bg-white border border-black/10 shadow-xs transition-all">
              <summary className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none list-none hover:bg-black/5 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-[#9A3412] font-extrabold text-xs sm:text-sm">💡 피비의 안내</span>
                  <span className="text-xs text-gray-500 font-medium hidden sm:inline">
                    · 클릭하여 ETF 엑스레이 및 밸류에이션 조회 요령 확인
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
                    [ETF 엑스레이 5대 조회 혜택]
                  </span>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed break-keep">
                    원하시는 ETF를 클릭하시면{' '}
                    <strong className="text-gray-950 font-bold">① 상위 10대 편입 종목 엑스레이</strong>,{' '}
                    <strong className="text-gray-950 font-bold">② 밸류에이션(P/E, P/B)</strong>,{' '}
                    <strong className="text-gray-950 font-bold">③ 배당수익률</strong>,{' '}
                    <strong className="text-gray-950 font-bold">④ 주가 캔들 차트</strong>,{' '}
                    <strong className="text-gray-950 font-bold">⑤ 1주~120주 기간수익률 성과</strong>를 한눈에 확인하실 수 있습니다.
                  </p>
                </div>

                {/* 원클릭 추천 엑스레이 체험 태그 */}
                <div className="pt-3 border-t border-black/10 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
                  <span className="text-gray-600 font-bold shrink-0 text-[11px] sm:text-xs">원클릭 추천 엑스레이:</span>
                  {[
                    { ticker: 'SPY', label: 'SPY (S&P500 엑스레이)' },
                    { ticker: 'QQQ', label: 'QQQ (나스닥100)' },
                    { ticker: 'SOXX', label: 'SOXX (반도체)' },
                    { ticker: 'TLT', label: 'TLT (미국 장기채)' },
                    { ticker: 'GLD', label: 'GLD (금 대체자산)' },
                  ].map((item) => (
                    <Link
                      key={item.ticker}
                      href={`/etf/${item.ticker}`}
                      className="px-2.5 py-1 bg-white hover:bg-amber-50 border border-black/10 hover:border-[#EA580C] text-gray-800 hover:text-black transition-colors text-[11px] sm:text-xs whitespace-nowrap shadow-xs"
                    >
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </details>

            <EtfSearchClient
              initialEtfs={mergedEtfs}
              initialWishlistTickers={wishlistTickers}
              isLoggedIn={!!user}
            />

            {/* ETF 허브 릴스 연계 FAQ & 가입 유도 앵커 */}
            <HubFaqAccordion type="etf" isLoggedIn={!!user} />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
