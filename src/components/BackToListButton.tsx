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
      const cleanFallbackPath = fallbackUrl.split('?')[0]; // e.g. '/stock', '/etf', '/monthly'
      const savedListUrl = sessionStorage.getItem(`yourpb_last_list_url_${cleanFallbackPath}`);
      const lastListPath = sessionStorage.getItem('yourpb_last_list_path');

      // 1. 목록 화면에서 상세 화면으로 직접 들어온 직후인 경우:
      // 브라우저 history.back()을 호출하여 스크롤 위치 및 필터/검색어 상태를 원형 그대로 복원
      if (lastListPath === cleanFallbackPath && window.history.length > 1) {
        sessionStorage.removeItem('yourpb_last_list_path');
        router.back();
        return;
      }

      // 2. 로그인 페이지를 거쳤거나, 새로고침 등으로 브라우저 히스토리 스택이 분기된 경우:
      // 세션에 저장된 필터 파라미터가 포함된 전체 목록 URL로 안전하게 복귀 (로그인 창으로 튕김 방지)
      if (savedListUrl) {
        router.push(savedListUrl);
        return;
      }
    } catch {
      // 스토리지 접근 불가 등 예외 발생 시 안전하게 fallbackUrl로 이동
    }

    // 3. 그 외(외부 직접 링크 등)는 기본 목록 경로로 이동
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
