import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import Filter from '@/components/Filter';
import ModelCarousel from '@/components/ModelCarousel';
import { getSessionUser } from '@/app/actions/auth';
import { getWishlist } from '@/app/actions/wishlist';

export default async function Home() {
  const supabase = await createClient();
  const user = await getSessionUser();
  const wishlist = await getWishlist();
  const wishlistTickers = wishlist.map(etf => etf.ticker);

  const { data: etfs } = await supabase
    .from('etf_list')
    .select('ticker, name, category, report, leverage')
    .order('ticker');

  // 포트폴리오 비중 정의 (지정 브랜드 색상 반영)
  const portfolioData = [
    { type: '현금', pct: 10, ticker: '', name: '현금 자산(KRW)', color: '#007C1F' },
    { type: '채권', pct: 0, ticker: '', name: '미지정', color: '#00EE39' },
    { type: '시장', pct: 20, ticker: 'MAGS', name: 'Roundhill Magnificent Seven ETF', color: '#FF97A1' },
    { type: '섹터', pct: 50, ticker: 'XLE', name: 'Energy Select Sector SPDR Fund', color: '#FF3B4E' },
    { type: '테마', pct: 0, ticker: '', name: '미지정', color: '#D60016' },
    { type: '대체', pct: 20, ticker: 'UVXY', name: 'ProShares Ultra VIX Short-Term Futures ETF', color: '#000000' },
  ];

  // 그래프에 표시할 유효 비중 (0% 제외)
  const chartItems = portfolioData.filter(item => item.pct > 0);
  const totalPct = chartItems.reduce((sum, item) => sum + item.pct, 0);

  // SVG 파이차트 계산 변수 (전통적인 파이차트를 위해 strokeWidth = 2 * radius 설정)
  const radius = 80;
  const strokeWidth = 160;
  const circumference = 2 * Math.PI * radius; // 약 502.65

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

      {/* 1. 당신의 피비 포트폴리오 섹션 */}
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
            <div className="relative w-85 h-85">
              <svg className="w-full h-full" viewBox="0 0 360 360">
                {/* 배경 원 가이드 라인 (그래픽만 회전) */}
                <circle
                  cx="180"
                  cy="180"
                  r={radius}
                  className="stroke-white/5 fill-transparent"
                  strokeWidth={strokeWidth}
                  transform="rotate(-90 180 180)"
                />

                {/* 파이 조각들 렌더링 (그래픽만 회전) */}
                {(() => {
                  let accumulatedPercent = 0;
                  return chartItems.map((item) => {
                    const strokeDasharray = `${(item.pct / totalPct) * circumference} ${circumference}`;
                    const strokeDashoffset = -((accumulatedPercent / totalPct) * circumference);
                    accumulatedPercent += item.pct;

                    return (
                      <circle
                        key={item.type}
                        cx="180"
                        cy="180"
                        r={radius}
                        className="fill-transparent transition-all duration-300 hover:opacity-90 cursor-pointer"
                        stroke={item.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 180 180)"
                      />
                    );
                  });
                })()}

                {/* 파이 조각 내부의 자산유형 + 비중 텍스트 렌더링 (가로쓰기 유지) */}
                {(() => {
                  let accumulatedPercent = 0;
                  const cx = 180;
                  const cy = 180;
                  const textRadius = radius * 1.25; // 외경 160px인 조각 내부 한가운데인 100px 지점

                  return chartItems.map((item) => {
                    const itemAngle = (item.pct / totalPct) * 2 * Math.PI;
                    const middleAngle = -Math.PI / 2 + (accumulatedPercent / totalPct) * 2 * Math.PI + (itemAngle / 2);
                    accumulatedPercent += item.pct;

                    const x = cx + textRadius * Math.cos(middleAngle);
                    const y = cy + textRadius * Math.sin(middleAngle);

                    return (
                      <text
                        key={`text-${item.type}`}
                        x={x}
                        y={y}
                        fill="#ffffff"
                        fontSize="14"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="pointer-events-none select-none fill-white font-serif"
                      >
                        {item.type} {item.pct}%
                      </text>
                    );
                  });
                })()}
              </svg>
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

      {/* 2. 구성 ETF 캐러셀 섹션 */}
      <section>
        <ModelCarousel
          etfs={modelPortfolioEtfs}
          initialWishlistTickers={wishlistTickers}
          isLoggedIn={!!user}
        />
      </section>

      {/* 3. 관심 ETF 그리드 섹션 */}
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
