import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Award, 
  Download, 
  Lock
} from 'lucide-react';

import { createClient } from '@/lib/supabase-server';
import { getSessionUser } from '@/app/actions/auth';

import PremiumPaywall from '@/components/PremiumPaywall';
import StockCandleChart from '@/components/StockCandleChart';
import StockPerformanceChart from '@/components/StockPerformanceChart';

interface PageProps {
  params: Promise<{ ticker: string }>;
}

export default async function StockDetailPage({ params }: PageProps) {
  const supabase = await createClient();
  
  // 1. URL 매개변수 디코딩 및 티커 대문자화
  const { ticker: rawTicker } = await params;
  const ticker = decodeURIComponent(rawTicker).toUpperCase();

  // 2. 로그인 세션 및 프리미엄 구독 상태 조회
  const user = await getSessionUser();
  const isLoggedIn = !!user;
  const isPremium = user?.membership_status === 'premium';

  // 3. DB 데이터 병렬 조회 (stock_list, stock_prices)
  const [stockListRes, pricesRes] = await Promise.all([
    supabase.from('stock_list').select('*').eq('ticker', ticker).single(),
    supabase.from('stock_prices').select('date, open, high, low, close, yield_1w, yield_5w, yield_20w, yield_60w, yield_120w').eq('ticker', ticker).order('date', { ascending: false }).limit(120),
  ]);

  // stock_list 정보가 없다면 유효하지 않은 티커이므로 404 처리
  if (stockListRes.error || !stockListRes.data) {
    return notFound();
  }

  const stock = stockListRes.data;
  const prices = pricesRes.data || [];

  // 4. 성과 최근 지표 가공 (stock_prices의 최신 행)
  const latestPrice = prices.length > 0 ? prices[0] : null;
  const closePrice = latestPrice ? Number(latestPrice.close) : null;
  const yield_1w = latestPrice ? Number(latestPrice.yield_1w) : null;
  const yield_5w = latestPrice ? Number(latestPrice.yield_5w) : null;
  const yield_20w = latestPrice ? Number(latestPrice.yield_20w) : null;
  const yield_60w = latestPrice ? Number(latestPrice.yield_60w) : null;
  const yield_120w = latestPrice ? Number(latestPrice.yield_120w) : null;

  // 5. Storage Public URL 획득 (report-stock: pdf 리포트 포맷)
  const reportUrl = supabase.storage.from('upload').getPublicUrl(`report-stock/${ticker}.pdf`).data.publicUrl;

  // 포맷 헬퍼 함수
  const formatPrice = (val: number | null | undefined) => {
    if (val === null || val === undefined || isNaN(val)) return '-';
    return val % 1 === 0
      ? val.toLocaleString(undefined, { maximumFractionDigits: 0 })
      : val.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* 상단 네비게이션 및 타이틀 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Link
            href="/stock"
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

        {/* 종목명과 티커 박스 */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-extrabold bg-yellow-accent/20 text-yellow-accent rounded-md uppercase tracking-wider">
              {stock.listed === 'us' ? 'US Stock' : 'KR Stock'}
            </span>
            <span className="px-2.5 py-1 text-xs font-bold bg-gray-100 text-gray-700 rounded-md">
              현재가: {closePrice !== null ? formatPrice(closePrice) : '-'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight flex items-baseline gap-2">
            <span>{stock.name}</span>
            <span className="text-lg sm:text-2xl font-bold uppercase text-gray-500">({ticker})</span>
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
          
          {/* 분류체계 박스, 개요를 반응형 2단 그리드로 가로/세로 배치 (480px 분기) */}
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-8">
            
            {/* 1단: 주식 기초 정보 */}
            <section className="p-5 rounded-2xl bg-yellow-accent/5 border border-yellow-accent shadow-md flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-navy/20 blur-[60px] pointer-events-none" />
              <div>
                <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2.5">
                  <span>주식 기초 정보 (Basic Info)</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-white border border-yellow-accent/40">
                    <span className="text-[9px] text-gray-400 block mb-0.5">회사명(티커)</span>
                    <span className="text-xs font-bold text-gray-900 truncate block">
                      {stock.name} ({stock.ticker})
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-yellow-accent/40">
                    <span className="text-[9px] text-gray-400 block mb-0.5">대분류 (Sector)</span>
                    <span className="text-xs font-bold text-yellow-accent truncate block">
                      {stock.sector2 || '-'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-yellow-accent/40">
                    <span className="text-[9px] text-gray-400 block mb-0.5">중분류 (Industry)</span>
                    <span className="text-xs font-bold text-gray-900 truncate block">
                      {stock.industry2 || '-'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-yellow-accent/40">
                    <span className="text-[9px] text-gray-400 block mb-0.5">부문 (Divisions)</span>
                    <span className="text-xs font-bold text-gray-900 truncate block whitespace-pre-line">
                      {stock.divisions || '정보 없음'}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* 2단: 개요 (Description) */}
            <div className="p-5 rounded-2xl bg-yellow-accent/5 border border-yellow-accent shadow-md flex flex-col justify-between">
              <div>
                <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2.5">
                  <span>기업 개요 (Overview)</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2.5">기업 소개 및 투자 가이드</h3>
                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans">
                  {stock.description || '이 종목에 대한 상세 리서치 요약 정보가 아직 등록되지 않았습니다.'}
                </p>
              </div>
            </div>
          </div>

          {/* 차트 영역 (반응형 2단 - 480px 분기) */}
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-8">
            <div className="w-full">
              <StockCandleChart prices={prices} />
            </div>
            <div className="w-full">
              <StockPerformanceChart 
                yield_1w={yield_1w}
                yield_5w={yield_5w}
                yield_20w={yield_20w}
                yield_60w={yield_60w}
                yield_120w={yield_120w}
              />
            </div>
          </div>

          {/* 리서치 보고서 PDF 다운로드 버튼 */}
          <div className="flex justify-center py-4">
            {isPremium ? (
              <a
                href={reportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full max-w-md flex items-center justify-center gap-2.5 px-6 py-4.5 bg-red-accent hover:opacity-90 active:scale-95 text-black font-black rounded-2xl shadow-lg transition-all cursor-pointer text-base"
              >
                <Download className="w-5 h-5" />
                <span>기업 분석 리서치 보고서 PDF 다운로드</span>
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
        </div>
      </div>
    </div>
  );
}
