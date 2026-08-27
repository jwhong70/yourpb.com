import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#000000] bg-linear-to-b from-white/8 via-[#000000] to-[#000000] py-12 border-t border-white/15 mt-auto shadow-[inset_0_1.5px_0_rgba(255,255,255,0.2),0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="flex items-center mb-2">
              <img
                src="/yourpb-final-logo.png"
                alt="YOURPB.COM"
                className="h-8 w-auto object-contain select-none"
              />
            </Link>
            <p className="text-xs text-white/80">
              © 2026 당신의 피비. All rights reserved. 대한민국 최고의 ETF 포트폴리오 자산관리 파트너.
            </p>
          </div>
          <nav className="flex flex-wrap gap-4 md:gap-6 justify-center md:justify-end">
            <Link href="/terms" className="text-xs text-white/80 hover:text-white transition-colors">
              이용약관
            </Link>
            <Link href="/privacy" className="text-xs text-white/80 hover:text-white transition-colors">
              개인정보처리방침
            </Link>
            <Link href="/refund" className="text-xs text-white/80 hover:text-white transition-colors">
              취소 및 환불정책
            </Link>
            <Link href="/support" className="text-xs text-white/80 hover:text-white transition-colors">
              고객센터
            </Link>
          </nav>
        </div>

        {/* 법적 필수 사업자 고지 정보 */}
        <div className="mt-8 pt-8 border-t border-white/10 text-[10px] text-white/40 leading-relaxed space-y-1.5 text-center md:text-left font-sans select-none">
          <p className="flex flex-wrap gap-x-3 gap-y-1 justify-center md:justify-start">
            <span><strong>상호명:</strong> 당신의 피비</span>
            <span className="hidden md:inline text-white/10">|</span>
            <span><strong>대표자:</strong> 홍정웅</span>
            <span className="hidden md:inline text-white/10">|</span>
            <span><strong>사업자등록번호:</strong> 390-26-02070</span>
            <span className="hidden md:inline text-white/10">|</span>
            <span><strong>통신판매업신고번호:</strong> 제 2026-고양일산동-1750 호</span>
          </p>
          <p className="flex flex-wrap gap-x-3 gap-y-1 justify-center md:justify-start">
            <span><strong>사업장 주소:</strong> 경기도 고양시 일산동구 위시티4로 80, 106동 602호(식사동, 위시티일산자이1단지)</span>
            <span className="hidden md:inline text-white/10">|</span>
            <span><strong>개인정보보호책임자:</strong> 홍정웅</span>
          </p>
          <p className="flex flex-wrap gap-x-3 gap-y-1 justify-center md:justify-start">
            <span><strong>고객센터:</strong> 070-4507-4460</span>
            <span className="hidden md:inline text-white/10">|</span>
            <span><strong>이메일:</strong> jwhong70@gmail.com</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
