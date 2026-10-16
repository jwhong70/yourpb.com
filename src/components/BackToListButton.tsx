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

      // 세션에 저장된 필터 파라미터가 포함된 전체 목록 URL이 있다면 해당 URL로 직접 이동하여 필터 상태 100% 복원
      if (savedListUrl) {
        sessionStorage.removeItem('yourpb_last_list_path');
        router.push(savedListUrl);
        return;
      }
    } catch {
      // 스토리지 접근 불가 등 예외 발생 시 안전하게 fallbackUrl로 이동
    }

    // 기본 목록 경로로 이동
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
