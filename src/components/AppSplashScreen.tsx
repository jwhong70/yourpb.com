'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function AppSplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // 0.45초 노출 후 0.25초 페이드아웃 ➔ 0.7초 후 DOM 완전 제거
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 450);

    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 700);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!showSplash) return null;

  return (
    <div
      className={`fixed inset-0 z-9999 flex flex-col items-center justify-center bg-[#F9F8F6] transition-opacity duration-300 ease-out select-none ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-3 px-6 animate-in fade-in zoom-in-95 duration-200">
        {/* 헤더의 샴페인 골드 "당신의 피비" 한글 브랜드 로고 대형 노출 */}
        <div className="relative w-64 sm:w-80 h-16 sm:h-20">
          <Image
            src="/logo-luxury-gold.png"
            alt="당신의 피비"
            fill
            priority
            className="object-contain"
          />
        </div>
        <p className="text-xs sm:text-sm font-semibold tracking-widest text-[#8B6508] opacity-80 uppercase">
          Wealth Intelligence Platform
        </p>
      </div>
    </div>
  );
}

