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
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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

  // 3. DB 데이터 조회
  // - stock_list는 존재 여부 검사(404 판정)를 위해 로그인 상태에 관계없이 항시 조회
  const stockListRes = await supabase.from('stock_list').select('*').eq('ticker', ticker).single();

  // stock_list 정보가 없다면 유효하지 않은 티커이므로 404 처리
  if (stockListRes.error || !stockListRes.data) {
    return notFound();
  }

  const stock = stockListRes.data;

  let prices: any[] = [];
  let latestPrice: any = null;
  let closePrice: number | null = null;
  let yield_1w: number | null = null;
  let yield_5w: number | null = null;
  let yield_20w: number | null = null;
  let yield_60w: number | null = null;
  let yield_120w: number | null = null;

  if (isPremium) {
    // 4. 프리미엄 회원의 경우 실제 DB 주가 데이터 및 수익률 조회
    const pricesRes = await supabase
      .from('stock_prices')
      .select('date, open, high, low, close, yield_1w, yield_5w, yield_20w, yield_60w, yield_120w')
      .eq('ticker', ticker)
      .order('date', { ascending: false })
      .limit(120);

    prices = pricesRes.data || [];
    latestPrice = prices.length > 0 ? prices[0] : null;
    closePrice = latestPrice ? Number(latestPrice.close) : null;
    yield_1w = latestPrice ? Number(latestPrice.yield_1w) : null;
    yield_5w = latestPrice ? Number(latestPrice.yield_5w) : null;
    yield_20w = latestPrice ? Number(latestPrice.yield_20w) : null;
    yield_60w = latestPrice ? Number(latestPrice.yield_60w) : null;
    yield_120w = latestPrice ? Number(latestPrice.yield_120w) : null;
  } else {
    // 4. 일반 회원의 경우 120주 가상 Mock 주가 데이터 생성 및 Mock 수익률 지정 (서버 단에서 실제 중요 정보 가림)
    prices = Array.from({ length: 120 }).map((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - idx * 7);
      const dateStr = d.toISOString().split('T')[0];
      
      // 완만하게 파동 치며 변동하는 Mock 주가 캔들 형태 생성
      const base = 100 + Math.sin(idx * 0.15) * 8;
      return {
        date: dateStr,
        open: base,
        high: base + 2.5,
        low: base - 2.5,
        close: base + 1.1,
        yield_1w: 1.2,
        yield_5w: 3.5,
        yield_20w: 12.4,
        yield_60w: 24.8,
        yield_120w: 52.1,
      };
    });

    closePrice = 101.1;
    yield_1w = 1.2;
    yield_5w = 3.5;
    yield_20w = 12.4;
    yield_60w = 24.8;
    yield_120w = 52.1;
  }

  // 5. Storage Public URL 획득 (유료회원에게만 제공하고 일반 회원은 공백 처리하여 URL 접근 차단)
  const reportUrl = isPremium
    ? supabase.storage.from('upload').getPublicUrl(`report-stock/${ticker}.pdf`).data.publicUrl
    : '';

  // 포맷 헬퍼 함수
  const formatPrice = (val: number | null | undefined) => {
    if (val === null || val === undefined || isNaN(val)) return '-';
    return val % 1 === 0
      ? val.toLocaleString(undefined, { maximumFractionDigits: 0 })
      : val.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Header initialUser={user} />
      <main className="grow pt-20">
        <div className="pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 mt-10">
          {/* 상단 네비게이션 및 타이틀 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Link
                href="/stock"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#000000] hover:bg-gray-900 active:scale-95 text-white font-bold rounded-none shadow-md transition-all cursor-pointer group text-base"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span>목록으로 돌아가기</span>
              </Link>

              {isPremium && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-black bg-yellow-accent border border-yellow-accent/40 px-3 py-1 rounded-full shadow-lg select-none">
                  <Award className="w-4 h-4 text-black" />
                  Premium Access
                </span>
              )}
            </div>

            {/* 종목명과 티커 박스 */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-2.5 py-1 text-xs font-extrabold bg-[#000000] text-white rounded-none uppercase tracking-wider">
                  {stock.listed === 'us' ? 'US Stock' : 'KR Stock'}
                </span>
                <span className="px-2.5 py-1 text-xs font-bold bg-[#F1F1F1] text-gray-700 border border-black rounded-none">
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
            <section className="p-5 rounded-none bg-[#F1F1F1] border border-t-[#000000] border-b-[#000000] border-l-white border-r-white shadow-md flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-navy/20 blur-[60px] pointer-events-none" />
              <div>
                <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2.5">
                  <span>주식 기초 정보 (Basic Info)</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-none bg-[#F1F1F1] border border-t-[#000000] border-b-[#000000] border-l-white border-r-white">
                    <span className="text-[9px] text-gray-400 block mb-0.5">회사명(티커)</span>
                    <span className="text-xs font-bold text-gray-900 truncate block">
                      {stock.name} ({stock.ticker})
                    </span>
                  </div>
                  <div className="p-2.5 rounded-none bg-[#F1F1F1] border border-t-[#000000] border-b-[#000000] border-l-white border-r-white">
                    <span className="text-[9px] text-gray-400 block mb-0.5">대분류 (Sector)</span>
                    <span className="text-xs font-bold text-[#000000] truncate block">
                      {isPremium ? (stock.sector2 || '-') : '••••'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-none bg-[#F1F1F1] border border-t-[#000000] border-b-[#000000] border-l-white border-r-white">
                    <span className="text-[9px] text-gray-400 block mb-0.5">중분류 (Industry)</span>
                    <span className="text-xs font-bold text-gray-900 truncate block">
                      {isPremium ? (stock.industry2 || '-') : '••••'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-none bg-[#F1F1F1] border border-t-[#000000] border-b-[#000000] border-l-white border-r-white">
                    <span className="text-[9px] text-gray-400 block mb-0.5">부문 (Divisions)</span>
                    <span className="text-xs font-bold text-gray-900 truncate block whitespace-pre-line">
                      {isPremium ? (stock.divisions || '정보 없음') : '••••'}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* 2단: 개요 (Description) */}
            <div className="p-5 rounded-none bg-[#F1F1F1] border border-t-[#000000] border-b-[#000000] border-l-white border-r-white shadow-md flex flex-col justify-between">
              <div>
                <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2.5">
                  <span>기업 개요 (Overview)</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2.5">기업 소개 및 투자 가이드</h3>
                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans">
                  {isPremium 
                    ? (stock.description || '이 종목에 대한 상세 리서치 요약 정보가 아직 등록되지 않았습니다.') 
                    : '구독 회원에게만 공개되는 기업 개요 정보입니다. 프리미엄 멤버십을 통해 전체 기업 정보와 리포트 분석 자료를 확인해보세요.'}
                </p>
              </div>
            </div>
          </div>

          {/* 차트 영역 (반응형 2단 - 480px 분기) */}
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-8">
            <StockCandleChart prices={prices} />
            <StockPerformanceChart 
              yield_1w={yield_1w}
              yield_5w={yield_5w}
              yield_20w={yield_20w}
              yield_60w={yield_60w}
              yield_120w={yield_120w}
            />
          </div>

          {/* 리서치 보고서 PDF 다운로드 버튼 */}
          <div className="flex justify-center py-4">
            {isPremium ? (
              <a
                href={reportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full max-w-md flex items-center justify-center gap-2.5 px-6 py-4.5 bg-[#000000] hover:bg-gray-900 active:scale-95 text-white font-black rounded-none shadow-lg transition-all cursor-pointer text-base"
              >
                <Download className="w-5 h-5" />
                <span>기업 분석 리서치 보고서 PDF 다운로드</span>
              </a>
            ) : (
              <button
                disabled
                className="w-full max-w-md flex items-center justify-center gap-2.5 px-6 py-4.5 bg-gray-100 text-gray-400 font-extrabold rounded-none cursor-not-allowed text-base border border-gray-200"
              >
                <Download className="w-5 h-5" />
                <span>보고서 다운로드 (구독 회원 전용)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
      </main>
      <Footer />
    </div>
  );
}
