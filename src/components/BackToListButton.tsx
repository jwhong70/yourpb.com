'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackToListButtonProps {
  fallbackUrl: string;
  label?: string;
  className?: string;
}

export default function BackToListButton({
  fallbackUrl,
  label = '목록으로 복귀',
  className = 'inline-flex items-center gap-2 px-5 py-2.5 bg-[#000000] hover:bg-gray-900 active:scale-95 text-white font-bold rounded-none shadow-md transition-all cursor-pointer group text-base',
}: BackToListButtonProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (typeof window === 'undefined') {
      router.push(fallbackUrl);
      return;
    }

    try {
      const referrer = document.referrer;
      const currentOrigin = window.location.origin;

      // 1. 이전 출처가 동일 도메인인지 검사
      if (referrer && referrer.startsWith(currentOrigin)) {
        const referrerUrl = new URL(referrer);
        const refPath = referrerUrl.pathname;
        const currentPath = window.location.pathname;

        // 2. 인증/로그인/결제 관련 페이지는 뒤로 가기로 복귀하지 않음 (로그인 화면으로 튕김 방지)
        const isAuthOrPaymentPage =
          refPath.includes('/login') ||
          refPath.includes('/signup') ||
          refPath.includes('/auth') ||
          refPath.includes('/subscribe');

        // 3. 동일한 상세 페이지이거나 새로고침인 경우 방지
        const isSamePage = refPath === currentPath;

        // 4. fallbackUrl 기준 목록 페이지에서 직접 진입했는지 확인
        // 목록 페이지에서 온 경우에만 router.back()을 호출하여 사용자의 검색/필터/스크롤 상태를 보존
        const cleanFallbackPath = fallbackUrl.split('?')[0];
        const isFromDirectList = refPath === cleanFallbackPath;

        if (!isAuthOrPaymentPage && !isSamePage && isFromDirectList && window.history.length > 1) {
          router.back();
          return;
        }
      }
    } catch {
      // referrer 파싱 등 예외 발생 시 안전하게 fallbackUrl로 이동
    }

    // 그 외(로그인 후 복귀, 외부 링크 유입, 직접 접속 등)는 안전하게 지정된 목록 페이지로 이동
    router.push(fallbackUrl);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      aria-label={label}
    >
      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
      <span>{label}</span>
    </button>
  );
}
