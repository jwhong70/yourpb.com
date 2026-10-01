import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MyPageClient from '@/app/mypage/MyPageClient';
import { getSessionUser } from '@/app/actions/auth';

export const metadata: Metadata = {
  title: '내 정보 및 멤버십 관리 | 당신의 피비',
  description: '회원 정보 조회, 프리미엄 멤버십 유료 전환 및 구독 해지, 회원 탈퇴를 관리할 수 있는 페이지입니다.',
};

export default async function MyPage() {
  const sessionUser = await getSessionUser();

  // 비로그인 상태인 경우 로그인 페이지로 안내
  if (!sessionUser) {
    redirect('/login?redirectTo=/mypage');
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-black selection:text-white">
      <Header initialUser={sessionUser} />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <MyPageClient initialUser={sessionUser} />
      </main>
      <Footer />
    </div>
  );
}
