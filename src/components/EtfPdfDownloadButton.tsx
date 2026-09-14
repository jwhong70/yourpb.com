'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, Lock, Sparkles, X, ArrowRight, ShieldCheck, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EtfPdfDownloadButtonProps {
  ticker: string;
  reportUrl: string;
  isPremium: boolean;
  isLoggedIn: boolean;
  returnUrl?: string;
}

export default function EtfPdfDownloadButton({
  ticker,
  reportUrl,
  isPremium,
  isLoggedIn,
  returnUrl = '/',
}: EtfPdfDownloadButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownloadClick = (e: React.MouseEvent) => {
    if (!isPremium) {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  const loginUrl = `/login?redirectTo=${encodeURIComponent(returnUrl)}`;

  return (
    <>
      <div className="flex flex-col items-center justify-center py-4 w-full">
        {isPremium ? (
          <a
            href={reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-md flex items-center justify-center gap-2.5 px-6 py-4.5 bg-[#000000] hover:bg-gray-900 active:scale-95 text-white font-black rounded-none shadow-lg transition-all cursor-pointer text-base"
          >
            <Download className="w-5 h-5" />
            <span>보고서 PDF 다운로드</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={handleDownloadClick}
            className="w-full max-w-md flex items-center justify-center gap-2.5 px-6 py-4.5 bg-[#000000] hover:bg-gray-900 active:scale-95 text-white font-black rounded-none shadow-lg transition-all cursor-pointer text-base group relative overflow-hidden"
          >
            <Download className="w-5 h-5 text-yellow-accent" />
            <span>보고서 PDF 다운로드</span>
            <span className="ml-2 px-2 py-0.5 text-[11px] font-extrabold bg-[#D4AF37] text-black rounded-none uppercase">
              Premium
            </span>
          </button>
        )}
        <span className="text-xs text-gray-500 mt-2 font-medium">
          {isPremium ? '💡 PDF 형식의 2페이지 정밀 리포트를 다운로드합니다.' : '💡 정밀 2페이지 분석 PDF 다운로드는 프리미엄 회원 전용입니다.'}
        </span>
      </div>

      {/* 프리미엄 안내 모달 */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-[#000000] border border-white/20 p-6 sm:p-8 rounded-none shadow-2xl text-center font-sans text-white overflow-hidden"
            >
              {/* 닫기 버튼 */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* 자물쇠 아이콘 */}
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full bg-linear-to-tr from-gold/30 to-white/10 border border-gold/40 flex items-center justify-center shadow-lg shadow-gold/20">
                  <Lock className="w-7 h-7 text-yellow-accent" />
                </div>
              </div>

              {/* 모달 타이틀 */}
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
                리서치 보고서 PDF 다운로드
              </h3>
              <p className="text-xs font-bold text-yellow-accent uppercase tracking-widest mb-4">
                Premium 회원 전용 혜택
              </p>

              {/* 설명 */}
              <p className="text-sm text-gray-300 leading-relaxed mb-6 font-normal">
                <strong>{ticker}</strong>의 2페이지 심층 분석 원본 PDF 다운로드는 프리미엄 회원 전용입니다.
                <br className="hidden sm:inline" />
                프리미엄 구독 시 <strong className="text-white">투자 대가 20인의 AI 주식 분석 시그널</strong>과 <strong className="text-white">1,000대 글로벌 주식 정밀 분석</strong>, 그리고 <strong className="text-[#D4AF37]">모든 ETF/주식 리포트 PDF를 무제한 다운로드</strong>할 수 있습니다.
              </p>

              {/* 액션 버튼 */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                {!isLoggedIn ? (
                  <>
                    <Link
                      href={`/login?redirectTo=${encodeURIComponent(`/subscribe?returnUrl=${encodeURIComponent(returnUrl)}`)}`}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-[#D4AF37] hover:bg-[#c29d2f] active:scale-95 text-black font-black rounded-none text-sm transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-black" />
                      <span>프리미엄 구독하고 PDF 무제한 받기</span>
                      <ArrowRight className="w-4 h-4 text-black" />
                    </Link>
                    <Link
                      href={loginUrl}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 border border-white/20 hover:bg-white/10 text-white font-bold rounded-none text-sm transition-all cursor-pointer"
                    >
                      <span>기존 회원 로그인</span>
                    </Link>
                  </>
                ) : (
                  <Link
                    href={`/subscribe?returnUrl=${encodeURIComponent(returnUrl)}`}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-linear-to-r from-gold to-yellow-accent hover:from-amber-600 hover:to-amber-500 active:scale-95 text-navy font-black rounded-none text-sm shadow-md transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-navy" />
                    <span>프리미엄 구독하고 PDF 무제한 받기</span>
                    <ArrowRight className="w-4 h-4 text-navy" />
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
