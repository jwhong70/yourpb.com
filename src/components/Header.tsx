'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, LogIn, LogOut, Award } from 'lucide-react';
import { signOut } from '@/app/actions/auth';

interface HeaderProps {
  initialUser: {
    id: string;
    email: string | null;
    name: string;
    membership_status: string;
  } | null;
}

export default function Header({ initialUser }: HeaderProps) {
  const pathname = usePathname();
  const user = initialUser;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    document.cookie = "demo_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "demo_membership_status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    await signOut();
  };

  const navLinks = [
    { name: 'HOME', href: '/' },
    { name: '매크로', href: '/macro' },
    { name: 'ETF', href: '/etf' },
    { name: '주식', href: '/stock' },
    { name: '선행학습실', href: '/learning' },
    { name: '진단', href: '/diagnosis' },
    { name: '당신의 피비는?', href: '/about' },
  ];

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 bg-[#F9F8F6]/95 backdrop-blur-md border-b border-black/10 py-3.5 transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* 로고 영역 */}
          <div className="flex items-center gap-4 xl:gap-8">
            <Link href="/" className="flex items-center shrink-0 group">
              <Image
                src="/logo-luxury-gold.png"
                alt="당신의 피비"
                width={132}
                height={33}
                className="h-7.5 xl:h-8.5 w-auto object-contain select-none drop-shadow-[0_1px_3px_rgba(212,175,55,0.3)] transition-transform group-hover:scale-105"
                priority
              />
            </Link>

            {/* 데스크톱 네비게이션 */}
            <nav className="hidden lg:flex items-center gap-1.5 xl:gap-5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    prefetch={true}
                    className={`text-sm xl:text-base font-bold xl:font-black transition-colors duration-200 px-2 xl:px-3 h-14 flex items-center relative rounded-none shrink-0 whitespace-nowrap ${isActive
                      ? 'text-black'
                      : 'text-gray-600 hover:text-black'
                      }`}
                  >
                    <span>{link.name}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-1 bg-[#D4AF37]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* 오른쪽 로그인/로그아웃 버튼 */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/mypage"
                  className="flex items-center gap-3 border-r border-black/10 pr-4 hover:opacity-80 transition-opacity cursor-pointer group"
                  title="내 정보 및 멤버십 관리"
                >
                  <span className="text-base font-black text-gray-900 group-hover:text-[#D4AF37] transition-colors">
                    {user.name}
                  </span>
                  {user.membership_status === 'premium' ? (
                    <span className="flex items-center gap-1 text-xs font-black text-black bg-[#D4AF37] border border-[#D4AF37]/50 px-3 py-1 rounded-full animate-badge-glow select-none">
                      <Award className="w-4 h-4 text-black" />
                      Premium
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 border border-black/10 px-3 py-1 rounded-full select-none group-hover:border-black/30 transition-colors">
                      Free
                    </span>
                  )}
                </Link>
                <Link
                  href="/mypage"
                  className="text-xs font-bold text-gray-700 hover:text-black bg-black/5 hover:bg-black/10 border border-black/10 px-2.5 py-1.5 transition-colors"
                >
                  내 정보
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm font-black text-gray-600 hover:text-black transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>로그아웃</span>
                </button>
              </div>
            ) : (
              <Link
                href={`/login?redirectTo=${encodeURIComponent(pathname)}`}
                className="flex items-center gap-1.5 px-4.5 py-1.5 bg-[#D4AF37] hover:bg-[#c29f2f] active:scale-95 text-black text-sm font-black rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>로그인</span>
              </Link>
            )}
          </div>

          {/* 모바일 햄버거 버튼 */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-900 hover:text-black p-2 focus:outline-none transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 드롭다운 */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#F9F8F6]/98 backdrop-blur-2xl border-b border-black/10 transition-all duration-300">
          <div className="px-4 pt-3 pb-8 space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  prefetch={true}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-none text-base font-black transition-colors duration-200 ${isActive
                    ? 'text-black bg-[#D4AF37]/15 border-l-4 border-[#D4AF37]'
                    : 'text-gray-700 hover:bg-black/5 hover:text-black'
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* 모바일 사용자 계정 상태 */}
            <div className="pt-6 border-t border-black/10">
              {user ? (
                <div className="px-4 space-y-4">
                  <Link
                    href="/mypage"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 bg-white border border-black/10 hover:border-[#D4AF37] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-gray-900">
                        {user.name}
                      </span>
                      {user.membership_status === 'premium' ? (
                        <span className="flex items-center gap-1 text-xs font-black text-black bg-[#D4AF37] border border-[#D4AF37]/50 px-2.5 py-0.5 rounded-full animate-badge-glow">
                          <Award className="w-3 h-3 text-black" />
                          Premium
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-gray-600 bg-gray-100 border border-black/10 px-2.5 py-0.5 rounded-full">
                          Free
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-[#D4AF37]">내 정보 관리 &gt;</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-black/15 hover:bg-black/5 text-gray-900 rounded-xl text-sm font-black transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>로그아웃</span>
                  </button>
                </div>
              ) : (
                <Link
                  href={`/login?redirectTo=${encodeURIComponent(pathname)}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#c29f2f] text-black rounded-xl text-sm font-black shadow-md transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>로그인</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
