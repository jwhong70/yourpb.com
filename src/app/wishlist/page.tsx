import React from 'react';
import { getSessionUser } from '@/app/actions/auth';
import { getWishlist } from '@/app/actions/wishlist';
import WishlistGrid from './WishlistGrid';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: '내 찜 목록 | YOURPB',
  description: '내가 찜한 ETF 목록을 한눈에 관리하고 모니터링합니다.',
};

export default async function WishlistPage() {
  const user = await getSessionUser();
  const wishlist = await getWishlist();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Header initialUser={user} />
      <main className="grow pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 mt-10">
          {/* 페이지 타이틀 헤더 */}
          <div className="border-b border-gray-100 pb-5">
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl select-none">
              내 찜 목록
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              관심 있는 ETF 상품들을 한눈에 확인하고 관리해 보세요.
            </p>
          </div>

          {/* 찜 그리드 영역 */}
          <section>
            <WishlistGrid
              wishlist={wishlist}
              isLoggedIn={!!user}
            />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
