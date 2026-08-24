'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogIn, LogOut, Award, Sparkles } from 'lucide-react';
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // UI 데모를 위한 Mocking용 유저 상태 토글
  const [isDemoMode, setIsDemoMode] = useState(false);

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 이메일이나 유저 세션이 바뀔 때 업데이트
  useEffect(() => {
    if (!isDemoMode) {
      setUser(initialUser);
    }
  }, [initialUser, isDemoMode]);

  const handleLogout = async () => {
    if (isDemoMode) {
      setUser(null);
      setIsDemoMode(false);
      return;
    }
    await signOut();
  };

  // 데모 로그인/비로그인 전환 기능
  const toggleDemoUser = () => {
    setIsDemoMode(true);
    if (!user) {
      setUser({
        id: 'demo-user-id',
        email: 'demo@yourpb.com',
        name: '홍길동 PB',
        membership_status: 'premium',
      });
    } else if (user.membership_status === 'premium') {
      setUser({
        ...user,
        membership_status: 'free',
      });
    } else {
      setUser(null);
      setIsDemoMode(false);
    }
  };

  const navLinks = [
    { name: '홈', href: '/' },
    { name: 'ETF', href: '/etf' },
    { name: '매크로', href: '/macro' },
    { name: '주식', href: '/stock' },
    { name: '찜 목록', href: '/wishlist' },
    { name: '당신의 PB는?', href: '/about' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled
        ? 'bg-navy/80 backdrop-blur-xl border-b border-white/10 shadow-lg py-3'
        : 'bg-transparent border-b border-transparent py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* 로고 영역 */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-extrabold tracking-widest font-sans select-none text-3d-premium animate-logo-glow">
                YOURPB.COM
              </span>
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
                    className={`text-base font-bold transition-colors duration-200 ${isHome
                        ? 'text-yellow-accent hover:text-yellow-accent/90'
                        : isEtf
                          ? 'hover:opacity-90'
                          : isActive
                            ? 'text-sky-primary'
                            : 'text-white/80 hover:text-white'
                      }`}
                    style={isEtf ? { color: '#F96D69' } : undefined}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* 오른쪽 로그인/로그아웃 및 데모 모드 버튼 */}
          <div className="hidden lg:flex items-center gap-4">
            {/* 데모 토글 버튼 */}
            <button
              onClick={toggleDemoUser}
              title="UI 상태 테스트용 토글 (데모)"
              className="flex items-center gap-1 text-[10px] px-2 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-md text-sky-primary transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>UI 토글</span>
            </button>

            {user ? (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 border-r border-white/10 pr-4">
                  <span className="text-base font-bold text-white">
                    {user.name}
                  </span>
                  {user.membership_status === 'premium' ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-white bg-gold border border-gold/40 px-3 py-1 rounded-full animate-badge-glow select-none">
                      <Award className="w-4 h-4 text-white" />
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
                  className="flex items-center gap-1.5 text-base font-bold text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <LogOut className="w-4.5 h-4.5" />
                  <span>로그아웃</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-6 py-2 bg-red-accent hover:bg-coral active:scale-95 text-white text-base font-extrabold rounded-xl shadow-md shadow-red-950/40 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>로그인</span>
              </Link>
            )}
          </div>

          {/* 모바일 햄버거 버튼 */}
          <div className="flex lg:hidden items-center gap-2">
            {/* 데모 토글 버튼 (모바일) */}
            <button
              onClick={toggleDemoUser}
              className="flex items-center gap-1 text-[10px] px-2 py-1 bg-white/10 border border-white/20 rounded-md text-sky-primary"
            >
              <Sparkles className="w-3 h-3" />
              <span>UI 토글</span>
            </button>

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
        <div className="lg:hidden bg-navy/95 backdrop-blur-2xl border-b border-white/10 transition-all duration-300">
          <div className="px-4 pt-3 pb-8 space-y-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const isHome = link.name === '홈';
              const isEtf = link.name === 'ETF';
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-lg font-bold transition-colors ${isHome
                      ? 'text-yellow-accent hover:bg-white/5'
                      : isEtf
                        ? 'hover:bg-white/5 hover:opacity-90'
                        : isActive
                          ? 'bg-sky-primary/20 text-sky-primary'
                          : 'text-white/80 hover:bg-white/5 hover:text-white'
                    }`}
                  style={isEtf ? { color: '#F96D69' } : undefined}
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
                    <span className="text-lg font-bold text-white">
                      {user.name}
                    </span>
                    {user.membership_status === 'premium' ? (
                      <span className="flex items-center gap-1 text-sm font-bold text-white bg-gold border border-gold/40 px-3 py-1 rounded-full animate-badge-glow">
                        <Award className="w-3.5 h-3.5 text-white" />
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
                    className="w-full flex items-center justify-center gap-2.5 px-5 py-3 border border-white/10 hover:bg-white/5 text-white rounded-xl text-base font-bold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                    <span>로그아웃</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3 bg-red-accent hover:bg-coral text-white rounded-xl text-base font-extrabold shadow-md transition-colors cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
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
