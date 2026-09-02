'use client';

import React from 'react';
import { Printer } from 'lucide-react';

interface PrintButtonProps {
  className?: string;
}

export default function PrintButton({ className = '' }: PrintButtonProps) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className={`print:hidden inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-black hover:bg-gray-800 active:scale-95 text-white text-xs font-bold rounded-none shadow-sm transition-all cursor-pointer select-none ${className}`}
      title="A4 용지 인쇄하기"
    >
      <Printer className="w-3.5 h-3.5 text-yellow-accent" />
      <span>인쇄하기</span>
    </button>
  );
}
