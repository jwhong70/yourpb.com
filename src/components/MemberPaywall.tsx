'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, UserPlus, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

interface MemberPaywallProps {
  returnUrl?: string;
  title?: string;
  description?: string;
  compact?: boolean;
}

export default function MemberPaywall({
  returnUrl = '/',
  title = '이 정보는 무료 회원 전용입니다.',
  description = '무료 회원가입 및 로그인만으로 10~35년 매크로 시계열 차트, 글로벌 ETF X-Ray, 1,000여 개 우량주 심층 분석을 바로 열람하실 수 있습니다.',
  compact = false,
}: MemberPaywallProps) {
  const benefits = [
    {
      title: '10~35년 글로벌 매크로 시계열 차트',
      desc: '경기 사이클·금리·물가·유동성 핵심 지표의 장기 추이 인터랙티브 차트 전체 열람',
    },
    {
      title: '글로벌 ETF X-Ray 정밀 분석',
      desc: '국가·섹터 비중 파이차트, 상위 10대 편입 종목, 120주 주가 및 성과 추이 조회',
    },
    {
      title: '1,000대 우량주 기본 분석 & 차트',
      desc: '국내외 핵심 우량주의 산업 분류, 기업 개요, 120주 주봉 캔들 및 기간별 수익률 조회',
    },
    {
      title: '투자 대가 종합 의견 맛보기',
      desc: '전설적인 투자 대가들의 매수·중립·매도 의견 분포 및 대표 대가 시그널 선체험',
    },
  ];

  const loginUrl = `/login?redirectTo=${encodeURIComponent(returnUrl)}`;

  if (compact) {
    return (
      <div className="relative overflow-hidden rounded-none bg-[#000000] border border-white/15 py-8 px-4 sm:px-8 text-center shadow-lg">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-tr from-[#EA580C]/30 to-white/10 border border-[#EA580C]/40">
            <Lock className="w-5 h-5 text-[#EA580C]" />
          </div>
        </div>
        <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight mb-2 break-keep">
          {title}
        </h3>
        <p className="text-white/70 text-xs sm:text-sm max-w-xl mx-auto mb-6 leading-relaxed break-keep">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-md mx-auto">
          <Link
            href={loginUrl}
            className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 px-6 py-3 bg-[#EA580C] hover:bg-[#c2410c] active:scale-95 text-white font-extrabold rounded-none shadow-md transition-all text-sm whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4 text-white shrink-0" />
            <span>무료 회원가입 / 로그인</span>
            <ArrowRight className="w-4 h-4 text-white shrink-0" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-none bg-[#000000] border border-white/15 py-10 sm:py-12 px-5 sm:px-12 lg:px-16 text-center shadow-2xl">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 h-75 sm:w-125 sm:h-125 rounded-full bg-[#EA580C]/10 blur-[80px] -z-10 pointer-events-none" />

      <div className="relative flex justify-center mb-6">
        <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-linear-to-tr from-[#EA580C]/30 to-white/10 border border-[#EA580C]/40 shadow-xl shadow-[#EA580C]/20">
          <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-[#EA580C]" />
        </div>
      </div>

      <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-3 select-none leading-tight break-keep">
        {title}
      </h3>
      <p className="text-white/65 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed break-keep">
        {description}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-10 text-left">
        {benefits.map((b, idx) => (
          <div
            key={idx}
            className="flex gap-3.5 p-4 rounded-none bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all group"
          >
            <CheckCircle2 className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base mb-0.5 break-keep">
                {b.title}
              </h4>
              <p className="text-white/55 text-xs sm:text-sm leading-relaxed break-keep">
                {b.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-xl mx-auto">
        <Link
          href={loginUrl}
          className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 px-8 py-3.5 bg-[#EA580C] hover:bg-[#c2410c] active:scale-95 text-white font-black rounded-none shadow-lg shadow-[#EA580C]/20 transition-all text-sm sm:text-base whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4 text-white shrink-0" />
          <span>무료 회원가입 / 로그인하기</span>
          <ArrowRight className="w-4 h-4 text-white shrink-0" />
        </Link>
        <Link
          href={`/subscribe?returnUrl=${encodeURIComponent(returnUrl)}`}
          className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 px-6 py-3.5 border border-white/25 hover:bg-white/10 text-white font-bold rounded-none transition-all text-sm whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4 text-[#EA580C] shrink-0" />
          <span>프리미엄 멤버십 안내</span>
        </Link>
      </div>
    </div>
  );
}

