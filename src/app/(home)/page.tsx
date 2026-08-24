import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import Filter from '@/components/Filter';
import ModelCarousel from '@/components/ModelCarousel';

export default async function Home() {
  const supabase = await createClient();
  const { data: etfs } = await supabase
    .from('etf_list')
    .select('ticker, name, category, report, leverage')
    .order('ticker');

  // 포트폴리오 비중 정의 (새로운 팝 컬러 테마 반영)
  const portfolioData = [
    { type: '현금', pct: 10, ticker: '', name: '현금 자산(KRW)', color: '#00F5D4' },
    { type: '채권', pct: 0, ticker: '', name: '미지정', color: '#00BBF9' },
    { type: '시장', pct: 20, ticker: 'MAGS', name: 'Roundhill Magnificent Seven ETF', color: '#9B5DE5' },
    { type: '섹터', pct: 50, ticker: 'XLE', name: 'Energy Select Sector SPDR Fund', color: '#F15BB5' },
    { type: '테마', pct: 0, ticker: '', name: '미지정', color: '#FEE440' },
    { type: '대체', pct: 20, ticker: 'UVXY', name: 'ProShares Ultra VIX Short-Term Futures ETF', color: '#FF9E00' },
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
    })) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8 space-y-16">

      {/* 1. 당신의 피비 포트폴리오 섹션 */}
      <section className="space-y-6">
        <div className="flex items-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl select-none">
            당신의 피비 포트폴리오
          </h2>
        </div>

        {/* 데스크톱: 가로 2열 / 모바일: 상하 1열 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-red-accent/3 p-6 sm:p-10 rounded-3xl border border-red-accent/25 shadow-2xl">

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
                        fill="#000000"
                        fontSize="14"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="pointer-events-none select-none fill-black font-sans"
                      >
                        {item.type} {item.pct}%
                      </text>
                    );
                  });
                })()}
              </svg>
            </div>
          </div>

          {/* 비중 테이블 영역 */}
          <div className="lg:col-span-7 overflow-hidden rounded-2xl border border-yellow-accent bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-yellow-accent/50 bg-yellow-accent/10 text-gray-900 font-semibold text-sm sm:text-base">
                  <th className="py-3.5 px-4 sm:px-6">자산유형</th>
                  <th className="py-3.5 px-4 text-center">비중</th>
                  <th className="py-3.5 px-4">티커</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">자산 세부 설명</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-yellow-accent/20 text-xs sm:text-sm">
                {portfolioData.map((row) => {
                  const isZero = row.pct === 0;
                  return (
                    <tr
                      key={row.type}
                      className={`transition-colors hover:bg-yellow-accent/5 border-b border-yellow-accent/10 ${isZero ? 'opacity-30' : ''
                        }`}
                    >
                      <td className="py-4 px-4 sm:px-6 font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                        <span>{row.type}</span>
                      </td>
                      <td className="py-4 px-4 text-center text-[#000000] font-extrabold font-mono">
                        {row.pct}%
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-800 hidden sm:table-cell">
                        {row.ticker ? (
                          <Link href={`/etf/${row.ticker}`} className="hover:underline text-sky-600 hover:text-sky-700">
                            {row.ticker}
                          </Link>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-600 truncate max-w-50 hidden sm:table-cell">
                        {row.name}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* 2. 구성 ETF 캐러셀 섹션 */}
      <section>
        <ModelCarousel etfs={modelPortfolioEtfs} />
      </section>

      {/* 3. 관심 ETF 그리드 섹션 */}
      <section className="space-y-6">
        <div className="flex items-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#000000] sm:text-3xl select-none">
            관심 ETF
          </h2>
        </div>

        {/* 3단계 필터 및 목록 컴포넌트 마운트 */}
        <Filter initialEtfs={etfs || []} />
      </section>

    </div>
  );
}
