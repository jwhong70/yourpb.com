'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 350px 이상 스크롤되었을 때 버튼 노출
      if (window.scrollY > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="최상단으로 이동"
      title="맨 위로 이동"
      className={`fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-40 p-2.5 sm:p-3 rounded-full bg-black/85 hover:bg-black text-[#D4AF37] border border-[#D4AF37]/50 shadow-xl backdrop-blur-md transition-all duration-300 cursor-pointer group active:scale-95 ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
    </button>
  );
}
