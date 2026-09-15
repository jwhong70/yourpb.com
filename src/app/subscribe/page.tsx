import React from 'react';
import { getSessionUser } from '@/app/actions/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SubscribeClient from './SubscribeClient';

export const metadata = {
  title: '프리미엄 멤버십 구독 플랜 | YOURPB',
  description: '워런 버핏 등 투자 대가 20인의 AI 주식 분석 시그널, 1,000대 글로벌 주식 정밀 분석 및 ETF/주식 원본 리서치 PDF 무제한 다운로드 혜택을 이용해 보세요.',
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
            <p className="text-base sm:text-lg text-gray-400 font-medium leading-relaxed">
              워런 버핏 등 <strong className="text-white font-bold">투자 대가 20인의 AI 주식 시그널</strong>과 <strong className="text-white font-bold">1,000대 글로벌 주식 정밀 분석</strong>,<br className="hidden sm:inline" />
              그리고 <strong className="text-[#D4AF37] font-bold">ETF 및 주식 정밀 리서치 보고서 원본 PDF 다운로드</strong> 혜택을 무제한으로 누려보세요.
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
