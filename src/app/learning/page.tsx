import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LearningHubClient from './LearningHubClient';
import { getSessionUser } from '@/app/actions/auth';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '자산관리 선행학습 | 당신의 피비',
    description: '3인 패밀리와 함께하는 50주 자산관리 완성 로드맵. 실전 카드뉴스와 리서치 요약을 무료로 열람하세요.',
    openGraph: {
      title: '자산관리 선행학습 | 당신의 피비',
      description: '특허법인 처제 한과장과 현실주의 언니 한실장의 리얼 50주 금융 독립 스토리. 숲부터 보는 탑다운 자산배분과 ETF 실전 가이드.',
      url: 'https://yourpb.vercel.app/learning',
      siteName: '당신의 피비',
      images: [
        {
          url: 'https://vypehsjeufupmrpgcsbd.supabase.co/storage/v1/object/public/upload/learning/ep_01/1.png',
          width: 800,
          height: 1000,
          alt: '당신의 피비 자산관리 선행학습 50부작',
        },
      ],
      locale: 'ko_KR',
      type: 'website',
    },
  };
}

export default async function LearningPage() {
  const sessionUser = await getSessionUser();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-black selection:text-white">
      <div className="print:hidden">
        <Header initialUser={sessionUser} />
      </div>
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto px-4 py-24 text-center text-gray-400">
              <div className="animate-spin w-8 h-8 border-2 border-yellow-accent border-t-transparent rounded-full mx-auto mb-4" />
              <p className="font-bold">선행학습실 강의 데이터를 불러오는 중입니다...</p>
            </div>
          }
        >
          <LearningHubClient initialUser={sessionUser} />
        </Suspense>
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
