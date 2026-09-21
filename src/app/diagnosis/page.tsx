import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DiagnosisClientPage from '@/components/DiagnosisClientPage';
import { getSessionUser } from '@/app/actions/auth';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '투자 행동 편향 정밀 진단 | 당신의 피비',
    description: '행동재무학 기반 19가지 실전 문항을 통해 나의 무의식적 투자 심리 약점을 진단하고 맞춤형 극복 처방전을 발급받으세요.',
    openGraph: {
      title: '투자 행동 편향 정밀 진단 | 당신의 피비',
      description: '19가지 실전 문항으로 진단하는 나의 투자 심리 약점과 맞춤형 극복 솔루션',
      url: 'https://yourpb.vercel.app/diagnosis',
      siteName: '당신의 피비',
      images: [
        {
          url: '/icon-512x512.png',
          width: 512,
          height: 512,
          alt: '당신의 피비 투자 행동 편향 진단',
        },
      ],
      locale: 'ko_KR',
      type: 'website',
    },
  };
}

export default async function DiagnosisPage() {
  const sessionUser = await getSessionUser();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-black selection:text-white">
      <div className="print:hidden">
        <Header initialUser={sessionUser} />
      </div>
      <main className="flex-1">
        <DiagnosisClientPage initialUser={sessionUser} />
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
