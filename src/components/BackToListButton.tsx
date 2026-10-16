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
    // 브라우저 방문 기록이 있으면 뒤로 가기로 이전 필터 상태 유지, 없으면 fallbackUrl로 이동
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
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
