'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

interface PremiumPaywallProps {
  isLoggedIn: boolean;
  returnUrl?: string;
}

export default function PremiumPaywall({ isLoggedIn, returnUrl = '/' }: PremiumPaywallProps) {
  const benefits = [
    {
      title: '투자 대가 20인 AI 분석 시그널',
      desc: '워런 버핏, 피터 린치 등 전설적인 투자 대가 20인의 철학으로 진단한 종목별 매매 신호 및 적정가치 공개',
    },
    {
      title: '1,000대 글로벌 주식 정밀 분석 & 120주 차트',
      desc: '국내외 핵심 우량주 1,000종목의 재무 펀더멘털 지표, 밸류에이션 및 120주 주봉 캔들 차트 전면 해금',
    },
    {
      title: 'ETF & 주식 정밀 리서치 PDF 무제한 다운로드',
      desc: '자체 발행되는 전문 분석 리서치 보고서 고화질 원본 PDF 무제한 다운로드',
    },
    {
      title: 'VIP 거시경제 & 자산배분 모델',
      desc: '글로벌 매크로 나침반과 경기 국면별 최적화된 포트폴리오 자산배분 전략 제공',
    },
  ];

  const loginUrl = `/login?redirectTo=${encodeURIComponent(returnUrl)}`;
  const signupUrl = `/login?tab=signup&redirectTo=${encodeURIComponent(returnUrl)}`;

  return (
    <div className="relative overflow-hidden rounded-none bg-[#000000] border border-white/15 py-12 px-6 sm:px-12 lg:px-16 text-center shadow-2xl">
      {/* 백그라운드 빛 효과 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 h-75 sm:w-125 sm:h-125 rounded-full bg-coral/10 blur-[80px] -z-10 pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-50 h-50 rounded-full bg-sky-primary/10 blur-[60px] -z-10 pointer-events-none" />

      {/* 자물쇠 및 스파클 아이콘 영역 */}
      <div className="relative flex justify-center mb-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-tr from-gold/30 to-white/10 border border-gold/40 shadow-xl shadow-gold/20"
        >
          <Lock className="w-8 h-8 text-yellow-accent animate-pulse" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-gold/30 scale-110 pointer-events-none"
          />
        </motion.div>
        <div className="absolute top-0 right-1/3 text-sky-primary animate-bounce">
          <Sparkles className="w-5 h-5" />
        </div>
      </div>

      {/* 헤더 메시지 */}
      <h3 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight mb-3 select-none leading-tight">
        이 정보는 <span className="bg-linear-to-r from-gold via-yellow-accent to-pink-light bg-clip-text text-transparent">Premium 회원</span> 전용입니다.
      </h3>
      <p className="text-white/60 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
        전설적인 투자 대가 20인의 AI 매매 시그널과 1,000대 글로벌 주식의 상세 분석, 자체 발행되는 원본 리서치 보고서 PDF를 무제한으로 열람해 보세요.
      </p>

      {/* 핵심 혜택 리스트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-10 text-left">
        {benefits.map((b, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
            className="flex gap-3.5 p-4 rounded-none bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all group"
          >
            <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5 group-hover:text-yellow-accent transition-colors" />
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base mb-0.5 group-hover:text-yellow-accent transition-colors">
                {b.title}
              </h4>
              <p className="text-white/50 text-xs sm:text-sm leading-relaxed">
                {b.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 가입 / 로그인 액션 버튼 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-xl mx-auto">
        {!isLoggedIn ? (
          <>
            <Link
              href={`/login?redirectTo=${encodeURIComponent(`/subscribe?returnUrl=${encodeURIComponent(returnUrl)}`)}`}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-[#D4AF37] hover:bg-[#c29d2f] active:scale-95 text-black font-black rounded-none shadow-lg shadow-[#D4AF37]/10 transition-all cursor-pointer text-base whitespace-nowrap"
            >
              <Sparkles className="w-4.5 h-4.5 text-black" />
              <span>프리미엄 구독 시작하기</span>
              <ArrowRight className="w-4.5 h-4.5 text-black" />
            </Link>
            <Link
              href={loginUrl}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 border border-white/20 hover:bg-white/10 text-white font-bold rounded-none transition-all cursor-pointer text-sm whitespace-nowrap"
            >
              <span>기존 회원 로그인</span>
            </Link>
          </>
        ) : (
          <Link
            href={`/subscribe?returnUrl=${encodeURIComponent(returnUrl)}`}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-10 py-4 bg-linear-to-r from-gold to-yellow-accent hover:from-amber-600 hover:to-amber-500 active:scale-95 text-navy font-black rounded-none shadow-xl shadow-gold/20 transition-all cursor-pointer text-lg"
          >
            <Sparkles className="w-5 h-5 text-navy" />
            <span>프리미엄 멤버십 구독하기</span>
            <ArrowRight className="w-5 h-5 text-navy" />
          </Link>
        )}
      </div>

      {/* 푸터 안내 */}
      <p className="text-white/30 text-xs mt-8 flex items-center justify-center gap-1.5">
        <Mail className="w-3.5 h-3.5" />
        문의 및 지원: support@yourpb.com (이메일을 통한 수동 승인 후 가입 가능)
      </p>
    </div>
  );
}
