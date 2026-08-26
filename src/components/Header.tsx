'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  const [user, setUser] = useState(initialUser);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 이메일이나 유저 세션이 바뀔 때 업데이트
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const handleLogout = async () => {
    document.cookie = "demo_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "demo_membership_status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    await signOut();
  };

  const navLinks = [
    { name: 'HOME', href: '/' },
    { name: 'ETF', href: '/etf' },
    { name: '매크로', href: '/macro' },
    { name: '주식', href: '/stock' },
    { name: '찜 목록', href: '/wishlist' },
    { name: '당신의 PB는?', href: '/about' },
  ];

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 bg-[#000000] bg-linear-to-b from-white/12 via-[#000000] to-[#000000]/95 border-b border-white/15 py-3.5 transition-all duration-300 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.25),0_4px_16px_rgba(0,0,0,0.15)] backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* 로고 영역 */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <img
                src="/yourpb-final-logo.png"
                alt="YOURPB.COM"
                className="h-8 w-auto object-contain select-none"
              />
            </Link>

            {/* 데스크톱 네비게이션 */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const isHome = link.name === '홈';
                const isEtf = link.name === 'ETF';
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-base font-black transition-colors duration-200 px-3 h-14 flex items-center relative rounded-none ${isActive
                      ? 'text-white'
                      : 'text-[#9E9E9E] hover:text-white'
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
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 border-r border-white/10 pr-4">
                  <span className="text-base font-black text-white">
                    {user.name}
                  </span>
                  {user.membership_status === 'premium' ? (
                    <span className="flex items-center gap-1 text-xs font-black text-black bg-yellow-accent border border-yellow-accent/40 px-3 py-1 rounded-full animate-badge-glow select-none">
                      <Award className="w-4 h-4 text-black" />
                      Premium
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-white/50 bg-white/10 px-3 py-1 rounded-full select-none">
                      Free
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm font-black text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>로그아웃</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-4.5 py-1.5 bg-[#D4AF37] hover:opacity-90 active:scale-95 text-black text-sm font-black rounded-xl shadow-xs transition-all cursor-pointer"
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
              className="text-white hover:text-sky-primary p-2 focus:outline-none transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 드롭다운 */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#000000]/95 backdrop-blur-2xl border-b border-white/10 transition-all duration-300">
          <div className="px-4 pt-3 pb-8 space-y-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const isHome = link.name === '홈';
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-none text-base font-black transition-colors duration-200 ${isActive
                    ? 'text-white'
                    : 'text-[#9E9E9E] hover:bg-white/5 hover:text-white'
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* 모바일 사용자 계정 상태 */}
            <div className="pt-6 border-t border-white/10">
              {user ? (
                <div className="px-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-white">
                      {user.name}
                    </span>
                    {user.membership_status === 'premium' ? (
                      <span className="flex items-center gap-1 text-sm font-black text-black bg-yellow-accent border border-yellow-accent/40 px-3 py-1 rounded-full animate-badge-glow">
                        <Award className="w-3.5 h-3.5 text-black" />
                        Premium
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-white/50 bg-white/10 px-3 py-1 rounded-full">
                        Free
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-white/10 hover:bg-white/5 text-white rounded-xl text-sm font-black transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>로그아웃</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#D4AF37] hover:opacity-90 text-black rounded-xl text-sm font-black shadow-md transition-colors cursor-pointer"
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
