'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function AppSplashScreen() {
  const [showSplash, setShowSplash] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // 1. 스마트폰 홈 화면 앱(PWA Standalone)으로 실행된 경우:
    //    스마트폰 OS가 이미 자체 스플래시 화면을 띄웠으므로 2중 로딩 없이 즉시 홈 화면으로 0초 직행
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((window.navigator as unknown as { standalone?: boolean }).standalone);

    if (isStandalone) {
      return;
    }

    // 2. 일반 웹 브라우저 접속 시:
    //    첫 방문 시 "당신의 피비" 한글 골드 로고를 0.4초간 품격 있게 노출 후 페이드아웃
    setShowSplash(true);

    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 400);

    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 650);

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

