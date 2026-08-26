'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

interface PremiumPaywallProps {
  isLoggedIn: boolean;
}

export default function PremiumPaywall({ isLoggedIn }: PremiumPaywallProps) {
  const benefits = [
    {
      title: '120주 주봉 캔들 차트',
      desc: '장기 추세와 가격 흐름을 한눈에 파악하는 주봉 캔들 차트 제공',
    },
    {
      title: '3차원 자산배분 비중(Allocation)',
      desc: '국가별, 섹터별, 종목별 실시간 비중 도넛 차트 및 데이터 제공',
    },
    {
      title: 'ETF 상세 재무 지표(Info Premium)',
      desc: 'PER, PBR, 분배율 및 만기수익률(YTM) 등 자산운용에 핵심적인 가치평가 지표 공개',
    },
    {
      title: 'ETF 및 종목 분석 PDF 다운로드',
      desc: '자체 발행되는 ETF 및 종목 분석 보고서 원본 PDF 즉시 제공',
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-none bg-[#000000] border border-white/15 py-16 px-6 sm:px-12 lg:px-20 text-center shadow-2xl">
      {/* 백그라운드 빛 효과 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 h-75 sm:w-125 sm:h-125 rounded-full bg-coral/10 blur-[80px] -z-10 pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-50 h-50 rounded-full bg-sky-primary/10 blur-[60px] -z-10 pointer-events-none" />

      {/* 자물쇠 및 스파클 아이콘 영역 */}
      <div className="relative flex justify-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative flex items-center justify-center w-24 h-24 rounded-full bg-linear-to-tr from-gold/30 to-white/10 border border-gold/40 shadow-xl shadow-gold/20"
        >
          <Lock className="w-10 h-10 text-yellow-accent animate-pulse" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-gold/30 scale-110 pointer-events-none"
          />
        </motion.div>
        <div className="absolute top-0 right-1/3 text-sky-primary animate-bounce">
          <Sparkles className="w-6 h-6" />
        </div>
      </div>

      {/* 헤더 메시지 */}
      <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 select-none leading-tight">
        이 정보는 <span className="bg-linear-to-r from-gold via-yellow-accent to-pink-light bg-clip-text text-transparent">Premium 회원</span> 전용입니다.
      </h3>
      <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
        당신의 피비의 자산 분석 솔루션으로 현명한 투자 결정을 내려보세요. 프리미엄 멤버십에 가입하시면 국내외 ETF 및 종목 조건 검색, 상세 자산비중, 장기 가격 차트, 리서치 PDF 다운로드를 제한 없이 이용하실 수 있습니다.
      </p>

      {/* 핵심 혜택 리스트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-14 text-left">
        {benefits.map((b, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
            className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all group"
          >
            <CheckCircle2 className="w-6 h-6 text-gold shrink-0 mt-0.5 group-hover:text-yellow-accent transition-colors" />
            <div>
              <h4 className="font-bold text-white text-base sm:text-lg mb-1 group-hover:text-yellow-accent transition-colors">
                {b.title}
              </h4>
              <p className="text-white/50 text-sm leading-relaxed">
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
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-[#D4AF37] hover:bg-[#c29d2f] active:scale-95 text-black font-black rounded-none shadow-lg shadow-[#D4AF37]/10 transition-all cursor-pointer text-lg whitespace-nowrap"
            >
              로그인하고 시작하기
              <ArrowRight className="w-5 h-5 text-black" />
            </Link>
            <span className="text-white/40 text-sm sm:text-base">또는</span>
            <button
              onClick={() => alert('프리미엄 멤버십 가입은 관리자에게 문의해 주세요. (support@yourpb.com)')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 border border-white/20 hover:bg-white/5 hover:text-white text-white/80 font-black rounded-none transition-all cursor-pointer text-base whitespace-nowrap"
            >
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
              <span>구독 신청 안내</span>
            </button>
          </>
        ) : (
          <Link
            href="/subscribe"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-10 py-4 bg-linear-to-r from-gold to-yellow-accent hover:from-amber-600 hover:to-amber-500 active:scale-95 text-navy font-black rounded-2xl shadow-xl shadow-gold/20 transition-all cursor-pointer text-lg"
          >
            <Sparkles className="w-5 h-5 text-navy" />
            <span>프리미엄 멤버십 구독하기</span>
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
