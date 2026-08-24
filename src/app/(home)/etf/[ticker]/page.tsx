import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Award, 
  HelpCircle, 
  Download, 
  TrendingUp, 
  Info, 
  Database,
  PieChart,
  LayoutGrid,
  FileSpreadsheet,
  FileText,
  Lock
} from 'lucide-react';

import { createClient } from '@/lib/supabase-server';
import { getSessionUser } from '@/app/actions/auth';

import PremiumPaywall from '@/components/PremiumPaywall';
import EtfAllocationCharts from '@/components/EtfAllocationCharts';
import EtfCandleChart from '@/components/EtfCandleChart';
import EtfPerformanceChart from '@/components/EtfPerformanceChart';
import EtfPoster from '@/components/EtfPoster';

interface PageProps {
  params: Promise<{ ticker: string }>;
}

export default async function EtfDetailPage({ params }: PageProps) {
  const supabase = await createClient();
  
  // 1. URL 매개변수 디코딩 및 티커 대문자화
  const { ticker: rawTicker } = await params;
  const ticker = decodeURIComponent(rawTicker).toUpperCase();

  // 2. 로그인 세션 및 프리미엄 구독 상태 조회
  const user = await getSessionUser();
  const isLoggedIn = !!user;
  const isPremium = user?.membership_status === 'premium';

  // 3. DB 데이터 병렬 조회 (etf_list, etf_info, etf_allocations, etf_holdings, etf_prices)
  const [
    etfListRes,
    etfInfoRes,
    allocationsRes,
    holdingsRes,
    pricesRes
  ] = await Promise.all([
    supabase.from('etf_list').select('*').eq('ticker', ticker).single(),
    supabase.from('etf_info').select('*').eq('ticker', ticker).maybeSingle(),
    supabase.from('etf_allocations').select('*').eq('ticker', ticker),
    supabase.from('etf_holdings').select('*').eq('ticker', ticker).order('allocation_pct', { ascending: false }).limit(10),
    supabase.from('etf_prices').select('*').eq('ticker', ticker).order('date', { ascending: false }),
  ]);

  // etf_list 정보가 없다면 유효하지 않은 티커이므로 404 처리
  if (etfListRes.error || !etfListRes.data) {
    return notFound();
  }

  const etfList = etfListRes.data;
  const etfInfo = etfInfoRes.data || null;
  const allocations = allocationsRes.data || [];
  const holdings = holdingsRes.data || [];
  const prices = pricesRes.data || [];

  // 4. 성과 최근 지표 가공 (etf_prices의 최신 행)
  const latestPrice = prices.length > 0 ? prices[0] : null;
  const yield_1w = latestPrice ? Number(latestPrice.yield_1w) : null;
  const yield_5w = latestPrice ? Number(latestPrice.yield_5w) : null;
  const yield_20w = latestPrice ? Number(latestPrice.yield_20w) : null;
  const yield_60w = latestPrice ? Number(latestPrice.yield_60w) : null;
  const yield_120w = latestPrice ? Number(latestPrice.yield_120w) : null;

  // 5. Storage Public URL 획득 (poster-etf: png 이미지 포맷, report-etf: pdf 리포트 포맷)
  const posterUrl = supabase.storage.from('upload').getPublicUrl(`poster-etf/${ticker}.png`).data.publicUrl;
  const reportUrl = supabase.storage.from('upload').getPublicUrl(`report-etf/${ticker}.pdf`).data.publicUrl;

  // 포맷 헬퍼 함수
  const formatNum = (val: any, suffix = '') => {
    if (val === null || val === undefined || isNaN(Number(val))) return '-';
    return Number(val).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + suffix;
  };

  const formatPercent = (val: any) => formatNum(val, '%');

  return (
    <div className="min-h-screen pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* 상단 네비게이션 및 타이틀 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Link
            href="/etf"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-accent hover:bg-red-700 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer group text-base"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>목록으로 돌아가기</span>
          </Link>

          {isPremium && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-gold border border-gold/40 px-3 py-1 rounded-full shadow-lg shadow-gold/20 select-none">
              <Award className="w-4 h-4 text-white" />
              Premium Access
            </span>
          )}
        </div>

        {/* 펀드명과 티커 박스 외부 배치 */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-extrabold bg-yellow-accent/20 text-yellow-accent rounded-md uppercase tracking-wider">
              {etfList.category || 'ETF'}
            </span>
            <span className="px-2.5 py-1 text-xs font-bold bg-gray-100 text-gray-700 rounded-md">
              레버리지: {etfList.leverage || '1X'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight flex items-baseline gap-2">
            <span>{etfList.name}</span>
            <span className="text-lg sm:text-2xl font-bold uppercase">({ticker})</span>
          </h1>
        </div>
      </div>

      {/* 3. PREMIUM CONTENT AREA */}
      <div className="relative">
        
        {/* 일반 회원의 경우 블러 효과 및 자물쇠 가림막 적용 */}
        {!isPremium && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 sm:p-6 bg-background/20 backdrop-blur-md rounded-3xl overflow-hidden">
            <div className="w-full max-w-4xl mx-auto shadow-2xl">
              <PremiumPaywall isLoggedIn={isLoggedIn} />
            </div>
          </div>
        )}

        {/* 프리미엄 전용 대시보드 뷰포트 (비구독자에게는 백그라운드 블러 및 고정 Mock 수치 노출) */}
        <div className={`space-y-8 select-none transition-all duration-500 ${!isPremium ? 'blur-md pointer-events-none opacity-40 select-none' : ''}`}>
          
          {/* 분류체계 박스, 개요, 가치평가지표를 반응형 3단 그리드로 웹(가로)/앱(세로) 배치 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 1단: ETF 분류 체계 박스 (기존 BASIC INFO 영역) */}
            <section className="p-4 sm:p-5 rounded-2xl bg-red-accent/3 border border-red-accent/20 shadow-md flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-navy/20 blur-[60px] pointer-events-none" />
              <div>
                <div className="text-[#000000]/60 text-[10px] uppercase tracking-wider mb-2.5">
                  <span>ETF 분류 체계</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-white border border-red-accent/12">
                    <span className="text-[9px] text-[#000000]/45 block mb-0.5">대분류</span>
                    <span className="text-xs font-bold text-[#dc2626] truncate block">
                      {etfList.category || '-'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-red-accent/12">
                    <span className="text-[9px] text-[#000000]/45 block mb-0.5">중분류</span>
                    <span className="text-xs font-bold text-gray-900 truncate block">
                      {etfList.report || '-'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-red-accent/12">
                    <span className="text-[9px] text-[#000000]/45 block mb-0.5">세분류</span>
                    <span className="text-xs font-bold text-gray-900 truncate block">
                      {etfList.focus2 || '-'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-red-accent/12">
                    <span className="text-[9px] text-[#000000]/45 block mb-0.5">세세분류</span>
                    <span className="text-xs font-bold text-gray-900 truncate block">
                      {etfList.focus3 || '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 p-2 rounded-xl bg-white border border-red-accent/12 flex flex-col justify-between gap-0.5">
                <span className="text-[8px] text-[#000000]/45">벤치마크 지수 (Index Tracked)</span>
                <span className="text-[11px] font-bold text-gray-900 truncate">
                  {etfList.index_tracked || '해당사항 없음'}
                </span>
              </div>
            </section>

            {/* 2단: 개요 (Description) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-red-accent/3 border border-red-accent/20 shadow-md flex flex-col justify-between">
              <div>
                <div className="text-[#000000]/60 text-[10px] uppercase tracking-wider mb-2.5">
                  <span>ETF 개요 및 투자 포인트</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2.5">펀드 분석 요약</h3>
                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans">
                  {etfList.description || '이 펀드에 대한 상세 리서치 요약 정보가 아직 등록되지 않았습니다.'}
                </p>
              </div>
            </div>

            {/* 3단: Premium Info 수치 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-red-accent/3 border border-red-accent/20 shadow-md space-y-4">
              <div className="text-[#000000]/60 text-[10px] uppercase tracking-wider mb-2">
                <span>펀드 핵심 평가지표 (Premium)</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">가치 평가 & 분배 지표</h3>
              
              <div className="space-y-2.5 pt-1.5">
                <div className="flex items-center justify-between border-b border-red-accent/10 pb-1.5">
                  <span className="text-xs text-gray-600">PER (주가수익비율)</span>
                  <span className="text-sm font-extrabold text-gray-900">
                    {isPremium ? formatNum(etfInfo?.pe_ratio) : '**.*'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-red-accent/10 pb-1.5">
                  <span className="text-xs text-gray-600">PBR (주가순자산비율)</span>
                  <span className="text-sm font-extrabold text-gray-900">
                    {isPremium ? formatNum(etfInfo?.pb_ratio) : '**.*'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-red-accent/10 pb-1.5">
                  <span className="text-xs text-gray-600">분배율 (Distribution Yield)</span>
                  <span className="text-sm font-extrabold text-gray-900">
                    {isPremium ? formatPercent(etfInfo?.distribution_yield) : '**.*%'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">만기수익률 (YTM)</span>
                  <span className="text-sm font-extrabold text-gray-900">
                    {isPremium ? formatPercent(etfInfo?.yield_to_maturity) : '**.*%'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 리서치 보고서 PDF 다운로드 (포스터 제외 및 버튼 단독 노출) */}
          <div className="flex justify-center py-4">
            {isPremium ? (
              <a
                href={reportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full max-w-md flex items-center justify-center gap-2.5 px-6 py-4.5 bg-red-accent hover:opacity-90 active:scale-95 text-black font-black rounded-2xl shadow-lg transition-all cursor-pointer text-base"
              >
                <Download className="w-5 h-5" />
                <span>보고서 PDF 파일 다운로드</span>
              </a>
            ) : (
              <button
                disabled
                className="w-full max-w-md flex items-center justify-center gap-2.5 px-6 py-4.5 bg-gray-100 text-gray-400 font-extrabold rounded-2xl cursor-not-allowed text-base border border-gray-200"
              >
                <Download className="w-5 h-5" />
                <span>보고서 다운로드 (구독 회원 전용)</span>
              </button>
            )}
          </div>

          {/* 자산 비중 분석 및 보유 10종목 그리드 배치 */}
          <section className="pt-2">
            {/* 웹은 가로로 3박스 배치, 앱은 세로로 3박스 배치 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* 1열 & 2열: 자산배분 차트 (개발단계별 비중, 국가별 비중) */}
              <div className="lg:col-span-2 space-y-4">
                <EtfAllocationCharts 
                  allocations={isPremium ? allocations : [
                    { allocation_type: '개발단계', category_name: '선진국', allocation_pct: 70 },
                    { allocation_type: '개발단계', category_name: '신흥국', allocation_pct: 25 },
                    { allocation_type: '국가', category_name: '미국', allocation_pct: 65 },
                    { allocation_type: '국가', category_name: '한국', allocation_pct: 20 },
                  ]} 
                />
              </div>

              {/* 3열: 보유 비중 상위 10종목 (Table) */}
              <div className="p-6 sm:p-8 rounded-3xl bg-red-accent/3 border border-red-accent/20 shadow-md space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-red-accent/12 pb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 tracking-tight">보유 비중 상위 10종목</h3>
                    </div>
                  </div>

                  {holdings.length === 0 ? (
                    <div className="flex items-center justify-center h-30 text-gray-400 text-sm">
                      보유종목 편입 정보가 없습니다.
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-75 scrollbar-thin">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-red-accent/12 text-[#000000]/45 text-[10px] font-semibold uppercase">
                            <th className="py-2 px-2">순위</th>
                            <th className="py-2 px-2">티커</th>
                            <th className="py-2 px-2">종목명</th>
                            <th className="py-2 px-2 text-right">비중</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-red-accent/10 text-xs font-medium text-gray-700">
                          {(isPremium ? holdings : holdings.slice(0, 10).map((h, i) => ({ ...h, holding_symbol: '••••', holding_name: 'Premium Lock' }))).map((h, idx) => (
                            <tr 
                              key={idx}
                              className="hover:bg-red-accent/3 transition-colors"
                             >
                              <td className="py-2.5 px-2 font-bold text-gray-400">{idx + 1}</td>
                              <td className="py-2.5 px-2 text-gray-900 uppercase font-semibold">{h.holding_symbol}</td>
                              <td className="py-2.5 px-2 truncate max-w-20 sm:max-w-30">{h.holding_name || '-'}</td>
                              <td className="py-2.5 px-2 text-right font-extrabold text-gray-900">
                                {isPremium ? formatPercent(h.allocation_pct) : '•.••%'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                
                <div className="pt-2 text-[10px] text-gray-400 text-center">
                  기준: 순자산 대비 편입 비중
                </div>
              </div>

            </div>
          </section>

          {/* 주가 추이 및 수익률 성과 지표 반응형 그리드 배치 (웹: 가로, 앱: 세로) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <EtfCandleChart 
              prices={isPremium ? prices : prices.map((p) => ({
                ...p,
                open: 100,
                high: 105,
                low: 95,
                close: 102
              }))} 
            />
            <EtfPerformanceChart
              yield_1w={isPremium ? yield_1w : 1.2}
              yield_5w={isPremium ? yield_5w : 3.5}
              yield_20w={isPremium ? yield_20w : 12.4}
              yield_60w={isPremium ? yield_60w : 24.8}
              yield_120w={isPremium ? yield_120w : 52.1}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
