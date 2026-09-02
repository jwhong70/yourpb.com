import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  Compass,
  TrendingUp,
  PieChart as PieIcon,
  Shield,
  Layers,
  ArrowRight,
  MessageCircle,
  PhoneCall,
  ExternalLink,
  Calendar,
  Sparkles,
  Lock,
  CheckCircle2,
} from 'lucide-react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PortfolioPieChart from '@/components/PortfolioPieChart';
import PrintButton from '@/components/PrintButton';
import { getSessionUser } from '@/app/actions/auth';
import { supabase as publicSupabase } from '@/lib/supabase';
import { PB_MODEL_PORTFOLIO } from '@/config/portfolio';
import { getMonthlyBrief } from '@/lib/monthly-brief';

export async function generateMetadata(): Promise<Metadata> {
  const brief = getMonthlyBrief();
  return {
    title: `${brief.title} | ${brief.edition}`,
    description: `${brief.edition} - ${brief.headline}`,
    openGraph: {
      title: `${brief.title} | ${brief.edition}`,
      description: brief.headline,
      url: 'https://yourpb.vercel.app/monthly',
      siteName: '당신의 피비',
      images: [
        {
          url: '/icon-512x512.png',
          width: 512,
          height: 512,
          alt: '당신의 피비 월간 브리프',
        },
      ],
      locale: 'ko_KR',
      type: 'article',
    },
  };
}

export default async function MonthlyBriefPage() {
  const user = await getSessionUser();
  const isPremium = user?.membership_status === 'premium';
  const brief = getMonthlyBrief();

  // 1. 포트폴리오에 편입된 ETF 티커 목록 추출
  const activeEtfTickers = PB_MODEL_PORTFOLIO.map((p) => p.ticker).filter(Boolean);

  // 2. 편입 ETF들의 기본 정보 및 최신 수익률 조회
  const [etfListRes, latestPriceDateRes] = await Promise.all([
    publicSupabase
      .from('etf_list')
      .select('ticker, name, category, report, leverage, description')
      .in('ticker', activeEtfTickers),
    publicSupabase
      .from('etf_prices')
      .select('date')
      .order('date', { ascending: false })
      .limit(1),
  ]);

  let priceMap: Record<string, any> = {};
  if (latestPriceDateRes.data && latestPriceDateRes.data.length > 0) {
    const latestDate = latestPriceDateRes.data[0].date;
    const { data: prices } = await publicSupabase
      .from('etf_prices')
      .select('ticker, close, yield_1w, yield_5w, yield_20w')
      .eq('date', latestDate)
      .in('ticker', activeEtfTickers);

    if (prices) {
      prices.forEach((p) => {
        priceMap[p.ticker] = p;
      });
    }
  }

  // ETF 정보 매핑
  const etfMap: Record<string, any> = {};
  if (etfListRes.data) {
    etfListRes.data.forEach((e) => {
      etfMap[e.ticker] = e;
    });
  }

  // 편입 ETF 상세 목록 데이터 구성
  const featuredEtfs = PB_MODEL_PORTFOLIO.filter((p) => p.ticker).map((p) => {
    const etf = etfMap[p.ticker] || {};
    const price = priceMap[p.ticker] || {};
    return {
      type: p.type,
      pct: p.pct,
      color: p.color,
      ticker: p.ticker,
      name: etf.name || p.name,
      category: etf.category || p.type,
      leverage: etf.leverage || null,
      yield_1w: price.yield_1w !== undefined && price.yield_1w !== null ? Number(price.yield_1w) : null,
      yield_5w: price.yield_5w !== undefined && price.yield_5w !== null ? Number(price.yield_5w) : null,
      description: etf.description || '',
    };
  });

  const formatYield = (val: number | null) => {
    if (val === null || val === undefined) return '-';
    return `${val > 0 ? '+' : ''}${val.toFixed(1)}%`;
  };

  const getYieldColor = (val: number | null) => {
    if (val === null || val === undefined || val === 0) return 'text-gray-500';
    return val > 0 ? 'text-[#007C1F] font-bold' : 'text-[#D60016] font-bold';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-black selection:text-white print:bg-white print:text-black">
      {/* ============================================================ */}
      {/* 인쇄 전용 정밀 스타일 시트 (A4 딱 2페이지 완성 규격) */}
      {/* ============================================================ */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @page {
              size: A4 portrait;
              margin: 12mm 15mm;
            }
            @media print {
              html, body {
                background: #ffffff !important;
                color: #000000 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .print-page-1 {
                page-break-after: always !important;
                break-after: page !important;
                min-height: 96vh !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
              }
              .print-page-2 {
                page-break-before: always !important;
                break-before: page !important;
                min-height: 96vh !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
              }
            }
          `,
        }}
      />

      <div className="print:hidden">
        <Header initialUser={user} />
      </div>

      <main className="grow pt-24 pb-20 print:pt-0 print:pb-0 print:m-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 print:max-w-full print:p-0 print:space-y-0">
          
          {/* ============================================================ */}
          {/* [PAGE 1] 헤더 + 1섹션: 월간 금융시장 시황 총평 (A4 1장 꽉 채움) */}
          {/* ============================================================ */}
          <div className="print-page-1 space-y-8 print:space-y-0">
            <div>
              {/* 1. 상단 타이틀 배너 & 호수 */}
              <header className="space-y-6 text-center sm:text-left pt-4 print:pt-0 print:space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#000000] pb-4 print:pb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs print:text-[11px] font-black uppercase tracking-widest px-3 py-1 print:px-2.5 print:py-1 bg-[#000000] text-white">
                    <Compass className="w-3.5 h-3.5 text-yellow-accent" />
                    월간 자산배분 브리프
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs print:text-[11px] font-bold text-gray-600 print:text-black">
                      <Calendar className="w-3.5 h-3.5 text-black" />
                      <span>발행일: {brief.published_date}</span>
                      <span className="text-gray-300 print:text-gray-400">|</span>
                      <span className="text-black font-extrabold">{brief.edition}</span>
                    </div>
                    <PrintButton />
                  </div>
                </div>

                <div className="space-y-2 print:space-y-1">
                  <h1 className="text-2xl sm:text-4xl print:text-2xl font-black text-gray-900 tracking-tight leading-tight">
                    {brief.title}
                  </h1>
                  <p className="text-sm sm:text-base print:text-xs font-bold text-gray-500 print:text-gray-700">
                    {brief.edition} 정기 프라이빗 자산관리 나침반
                  </p>
                </div>

                {/* 핵심 헤드라인 콜아웃 박스 */}
                <div className="p-5 sm:p-6 print:p-3.5 bg-box-bg border border-t-[#000000] border-b-[#000000] border-l-white border-r-white shadow-xs space-y-2 print:space-y-1">
                  <span className="text-[11px] print:text-[10px] font-extrabold text-gray-400 print:text-gray-600 uppercase tracking-wider block">
                    한줄 시장 테마
                  </span>
                  <p className="text-base sm:text-lg print:text-sm font-black text-gray-900 leading-snug">
                    &ldquo;{brief.headline}&rdquo;
                  </p>
                </div>
              </header>

              {/* 2. 섹션 1: 월간 금융시장 시황 총평 (4단 프레임워크) */}
              <section className="space-y-6 print:space-y-3 print:mt-4">
                <div className="flex items-center gap-2.5 border-b border-[#000000] pb-3 print:pb-1.5">
                  <span className="w-6 h-6 print:w-5 print:h-5 rounded-full bg-black text-white text-xs print:text-[10px] font-bold flex items-center justify-center">
                    1
                  </span>
                  <h2 className="text-lg sm:text-xl print:text-base font-extrabold text-gray-900 tracking-tight">
                    월간 금융시장 시황 총평
                  </h2>
                </div>

                <div className="space-y-4 print:space-y-2.5">
                  {/* 1) 매크로 경기 & 물가 */}
                  <article className="p-5 print:p-3 bg-white border border-[#000000] rounded-none shadow-xs space-y-2 print:space-y-1">
                    <div className="flex items-center gap-2 text-sm print:text-[11.5px] font-extrabold text-gray-900">
                      <span className="w-2 h-2 rounded-full bg-blue-primary" />
                      <h3>1. 글로벌 매크로 & 경기/물가 사이클 진단</h3>
                    </div>
                    <p className="text-sm sm:text-base print:text-[10.5px] text-gray-700 print:text-black leading-relaxed print:leading-[1.6] font-normal whitespace-pre-line pl-4 print:pl-2.5 border-l-2 border-blue-primary/30">
                      {brief.sections.macro}
                    </p>
                  </article>

                  {/* 2) 금리 & 유동성 리스크 */}
                  <article className="p-5 print:p-3 bg-white border border-[#000000] rounded-none shadow-xs space-y-2 print:space-y-1">
                    <div className="flex items-center gap-2 text-sm print:text-[11.5px] font-extrabold text-gray-900">
                      <span className="w-2 h-2 rounded-full bg-yellow-accent" />
                      <h3>2. 금리·유동성 및 금융시장 리스크 지형</h3>
                    </div>
                    <p className="text-sm sm:text-base print:text-[10.5px] text-gray-700 print:text-black leading-relaxed print:leading-[1.6] font-normal whitespace-pre-line pl-4 print:pl-2.5 border-l-2 border-yellow-accent/30">
                      {brief.sections.liquidity}
                    </p>
                  </article>

                  {/* 3) 글로벌 자산군 및 주식 모멘텀 */}
                  <article className="p-5 print:p-3 bg-white border border-[#000000] rounded-none shadow-xs space-y-2 print:space-y-1">
                    <div className="flex items-center gap-2 text-sm print:text-[11.5px] font-extrabold text-gray-900">
                      <span className="w-2 h-2 rounded-full bg-coral" />
                      <h3>3. 글로벌 자산군 및 주식·섹터·테마 모멘텀</h3>
                    </div>
                    <p className="text-sm sm:text-base print:text-[10.5px] text-gray-700 print:text-black leading-relaxed print:leading-[1.6] font-normal whitespace-pre-line pl-4 print:pl-2.5 border-l-2 border-coral/30">
                      {brief.sections.momentum}
                    </p>
                  </article>

                  {/* 4) 이달의 자산배분 전략 총평 */}
                  <article className="p-5 print:p-3 bg-box-bg print:bg-gray-50 border border-[#000000] rounded-none shadow-xs space-y-2 print:space-y-1">
                    <div className="flex items-center gap-2 text-sm print:text-[11.5px] font-extrabold text-gray-900">
                      <span className="w-2 h-2 rounded-full bg-green-accent" />
                      <h3>4. 이달의 당신의 피비 자산배분 전략 총평</h3>
                    </div>
                    <p className="text-sm sm:text-base print:text-[10.5px] text-gray-900 font-semibold leading-relaxed print:leading-[1.6] whitespace-pre-line pl-4 print:pl-2.5 border-l-2 border-green-accent">
                      {brief.sections.strategy}
                    </p>
                  </article>
                </div>
              </section>
            </div>

            {/* 1페이지 하단 인쇄 푸터 */}
            <div className="hidden print:flex items-center justify-between pt-2 border-t border-gray-300 text-[9px] text-gray-500">
              <span>당신의 피비 | 월간 자산배분 브리프 - {brief.edition}</span>
              <span>1 / 2 페이지</span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* [PAGE 2] 2섹션: 당신의 피비 추천 포트폴리오 (A4 2장째 꽉 채움) */}
          {/* ============================================================ */}
          <div className="print-page-2 space-y-8 print:space-y-0 print:pt-2">
            <div className="space-y-6 print:space-y-4">
              
              {/* 2페이지 상단 헤더 */}
              <div className="hidden print:flex items-center justify-between border-b border-[#000000] pb-2">
                <span className="text-xs font-black uppercase tracking-widest text-black">
                  당신의 피비 포트폴리오 전략 | {brief.edition}
                </span>
                <span className="text-[10px] font-bold text-gray-600">
                  {brief.published_date} 기준
                </span>
              </div>

              {/* 섹션 2 타이틀 */}
              <div className="flex items-center gap-2.5 border-b border-[#000000] pb-3 print:pb-1.5">
                <span className="w-6 h-6 print:w-5 print:h-5 rounded-full bg-black text-white text-xs print:text-[10px] font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="text-lg sm:text-xl print:text-base font-extrabold text-gray-900 tracking-tight">
                  당신의 피비 추천 포트폴리오 비중
                </h2>
              </div>

              {/* 포트폴리오 메인 대시보드 (차트 + 비중 표) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 print:gap-5 items-center p-6 print:p-5 bg-white border border-[#000000] rounded-none shadow-xs">
                {/* 원형 차트 */}
                <div className="md:col-span-5 flex flex-col items-center justify-center">
                  <div className="w-full max-w-65 print:max-w-52">
                    <PortfolioPieChart data={PB_MODEL_PORTFOLIO} />
                  </div>
                </div>

                {/* 비중 리스트 */}
                <div className="md:col-span-7 flex flex-col gap-2.5 print:gap-2">
                  {PB_MODEL_PORTFOLIO.map((row) => {
                    const isZero = row.pct === 0;
                    return (
                      <div
                        key={row.type}
                        className={`flex items-center justify-between p-3 print:p-2.5 border border-[#000000] rounded-none transition-all ${
                          isZero ? 'opacity-30 bg-gray-50' : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 print:gap-2">
                          <span
                            className="w-3.5 h-3.5 print:w-3 print:h-3 rounded-full shrink-0"
                            style={{ backgroundColor: row.color }}
                          />
                          <span className="font-bold text-sm print:text-xs text-black min-w-10 print:min-w-8">
                            {row.type}
                          </span>
                          <span className="text-gray-300 font-normal">|</span>
                          <span className="text-xs print:text-[11px] font-semibold text-gray-700 truncate max-w-36 sm:max-w-48 print:max-w-56">
                            {row.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 print:gap-2">
                          {row.ticker && (
                            <span className="px-1.5 py-0.5 border border-black text-[11px] print:text-[10px] font-mono font-bold">
                              {row.ticker}
                            </span>
                          )}
                          <span className="text-base print:text-sm font-extrabold font-mono text-black min-w-10 print:min-w-8 text-right">
                            {row.pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 포트폴리오 핵심 설계 원칙 콜아웃 박스 */}
              <div className="p-5 print:p-4 bg-box-bg border border-[#000000] rounded-none space-y-3 print:space-y-2">
                <div className="flex items-center gap-2 text-sm print:text-xs font-extrabold text-gray-900">
                  <Shield className="w-4 h-4 text-black shrink-0" />
                  <h3>당신의 피비 3단 방패 자산배분 설계 원칙</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:gap-2 text-xs print:text-[10.5px] text-gray-800">
                  <div className="p-3 print:p-2 bg-white border border-gray-300 space-y-1">
                    <strong className="block text-black font-extrabold">1. 핵심 자산 (MAGS 20%)</strong>
                    <p className="text-gray-600 print:text-gray-700 leading-snug">
                      글로벌 시장을 주도하는 메가캡 성장주를 편입하여 장기 자산 증식 동력을 확보합니다.
                    </p>
                  </div>
                  <div className="p-3 print:p-2 bg-white border border-gray-300 space-y-1">
                    <strong className="block text-black font-extrabold">2. 위성 자산 (XLE 50%)</strong>
                    <p className="text-gray-600 print:text-gray-700 leading-snug">
                      실물 매크로 국면과 원자재 강세 사이클의 직접 수혜 섹터에 과감히 비중을 확대합니다.
                    </p>
                  </div>
                  <div className="p-3 print:p-2 bg-white border border-gray-300 space-y-1">
                    <strong className="block text-black font-extrabold">3. 안전 자산 (UVXY 20% + 현금 10%)</strong>
                    <p className="text-gray-600 print:text-gray-700 leading-snug">
                      VIX 레버리지 헤지와 유동성 버퍼로 돌발 금융 충격 시 하방 위험을 선제 방어합니다.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* 2페이지 하단 공식 리서치 서명 푸터 */}
            <div className="hidden print:flex flex-col gap-1 pt-4 border-t border-black text-xs text-gray-700">
              <div className="flex items-center justify-between font-extrabold text-black text-xs">
                <span>당신의 피비 | 글로벌 ETF 자산배분 플랫폼</span>
                <span>웹사이트: https://yourpb.vercel.app | 문의: jwhong70@gmail.com</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-500">
                <span>본 자료는 투자 판단을 위한 참고용 브리프이며, 최종 투자 판단과 손익에 대한 책임은 투자자 본인에게 있습니다.</span>
                <span>2 / 2 페이지</span>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* [WEB ONLY] 섹션 3: 이달의 편입 ETF 스포트라이트 (웹 전용) */}
          {/* ============================================================ */}
          <section className="print:hidden space-y-6">
            <div className="flex items-center justify-between border-b border-[#000000] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                  이달의 핵심 편입 ETF 스포트라이트
                </h2>
              </div>
              <Link
                href="/etf"
                className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1"
              >
                전체 유니버스 시세 <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEtfs.map((item) => {
                const storageUrl = `https://vypehsjeufupmrpgcsbd.supabase.co/storage/v1/object/public/upload/poster-etf/${item.ticker}.png`;

                return (
                  <div
                    key={item.ticker}
                    className="flex flex-col justify-between bg-white border border-[#000000] rounded-none shadow-xs hover:shadow-xl transition-all group overflow-hidden"
                  >
                    <div>
                      {/* 포스터 이미지 & 비중 뱃지 */}
                      <Link
                        href={`/etf/${item.ticker}`}
                        className="block relative aspect-2/3 w-full bg-navy/60 overflow-hidden"
                      >
                        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 text-xs font-extrabold bg-black text-white">
                            {item.type} {item.pct}%
                          </span>
                        </div>
                        <Image
                          src={storageUrl}
                          alt={`${item.ticker} 포스터`}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* 정보 영역 */}
                      <div className="p-4 space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-1">
                            <span>{item.category}</span>
                            {item.leverage && (
                              <span className="text-[10px] px-1 bg-red-accent/80 text-white font-bold">
                                {item.leverage}
                              </span>
                            )}
                          </div>
                          <Link href={`/etf/${item.ticker}`}>
                            <h3 className="text-base font-extrabold text-black group-hover:text-blue-primary transition-colors line-clamp-1">
                              {item.name} ({item.ticker})
                            </h3>
                          </Link>
                        </div>

                        {/* 최근 수익률 지표 */}
                        <div className="grid grid-cols-2 gap-2 p-2.5 bg-box-bg text-xs border border-gray-200">
                          <div>
                            <span className="text-gray-500 text-[11px] block">1주 수익률</span>
                            <span className={getYieldColor(item.yield_1w)}>
                              {formatYield(item.yield_1w)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 text-[11px] block">5주 수익률</span>
                            <span className={getYieldColor(item.yield_5w)}>
                              {formatYield(item.yield_5w)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 상세 리포트 열람 버튼 */}
                    <div className="p-4 pt-0">
                      <Link
                        href={`/etf/${item.ticker}`}
                        className="w-full py-2.5 px-3 bg-black hover:bg-gray-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <span>정밀 리포트 분석 열람</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-gray-500 text-center font-medium">
              💡 편입 ETF의 실시간 보유종목 비중과 2페이지 정밀 PDF 리포트는 YOURPB 플랫폼에서 열람하실 수 있습니다.
            </p>
          </section>

          {/* ============================================================ */}
          {/* [WEB ONLY] 섹션 4: Contact Us & 1:1 자산관리 상담 (웹 전용) */}
          {/* ============================================================ */}
          <section className="print:hidden p-6 sm:p-8 bg-[#000000] text-white rounded-none space-y-6 shadow-xl">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-xs font-bold text-yellow-accent uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                당신의 피비 VIP 자산관리
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                나만의 맞춤형 자산배분 솔루션이 필요하신가요?
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl font-normal">
                글로벌 거시경제 지형과 ETF 자산배분 모델을 기반으로 고객님의 투자 성향에 최적화된 포트폴리오를 설계해 드립니다.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                href="/support"
                className="w-full sm:w-auto px-6 py-3.5 bg-yellow-accent hover:bg-yellow-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 rounded-none transition-all shadow-md cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>1:1 상담 및 문의하기</span>
              </Link>
              <Link
                href="/etf"
                className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 rounded-none border border-white/20 transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>전체 ETF 유니버스 둘러보기</span>
              </Link>
            </div>
          </section>

        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
