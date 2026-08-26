import React from 'react';
import { getSessionUser } from '@/app/actions/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SubscribeClient from './SubscribeClient';

export const metadata = {
  title: '프리미엄 멤버십 구독 플랜 | YOURPB',
  description: '당신의 피비 프리미엄 멤버십으로 ETF/주식 상세 리뷰 무제한 조회 및 리포트 무제한 다운로드 혜택을 이용해 보세요.',
};

export default async function SubscribePage() {
  const user = await getSessionUser();

  return (
    <div className="min-h-screen flex flex-col bg-[#000000] text-white font-sans">
      <Header initialUser={user} />
      
      <main className="grow pt-20 flex items-center justify-center">
        <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12 mt-10">
          
          {/* 상단 타이틀 영역 */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white select-none">
              프리미엄으로 업그레이드
            </h1>
            <p className="text-base sm:text-lg text-gray-400 font-medium">
              최고의 글로벌 자산배분 전략과 실시간 마이크로/매크로 ETF·주식 리포트 다운로드 혜택을 통해<br className="hidden sm:inline" />
              당신만의 견고한 자산 포트폴리오를 설계해 보세요.
            </p>
          </div>

          {/* 구독 플랜 카드 연동 (클라이언트 컴포넌트로 결제 팝업 연결) */}
          <SubscribeClient initialUser={user} />

        </div>
      </main>

      <Footer />
    </div>
  );
}
