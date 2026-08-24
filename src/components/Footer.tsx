import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#1b2e54] py-12 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <span className="text-lg font-extrabold tracking-widest text-silver animate-logo-glow mb-2 select-none">
            YOURPB.COM
          </span>
          <p className="text-xs text-white/60">
            © 2026 YOURPB.COM. All rights reserved. 대한민국 최고의 ETF 포트폴리오 자산관리 파트너.
          </p>
        </div>
        <nav className="flex gap-6">
          <Link href="/terms" className="text-xs text-white/60 hover:text-white transition-colors">
            이용약관
          </Link>
          <Link href="/privacy" className="text-xs text-white/60 hover:text-white transition-colors">
            개인정보처리방침
          </Link>
          <Link href="/support" className="text-xs text-white/60 hover:text-white transition-colors">
            고객센터
          </Link>
        </nav>
      </div>
    </footer>
  );
}
