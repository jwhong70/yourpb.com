import React from 'react';
import Link from 'next/link';
import { getSessionUser } from '@/app/actions/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SubscribeSuccessClient from './SubscribeSuccessClient';
import { AlertTriangle } from 'lucide-react';

interface SuccessPageProps {
  searchParams: Promise<{
    paymentKey?: string;
    orderId?: string;
    amount?: string;
    plan?: string;
  }>;
}

export default async function SubscribeSuccessPage({ searchParams }: SuccessPageProps) {
  const user = await getSessionUser();
  const params = await searchParams;

  const paymentKey = params.paymentKey || '';
  const orderId = params.orderId || '';
  const amount = Number(params.amount || '0');
  const plan = (params.plan === '1month' ? '1month' : '12months') as '1month' | '12months';

  // 1. 유효하지 않은 요청 가드
  if (!paymentKey || !orderId || amount <= 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
        <Header initialUser={user} />
        <main className="grow pt-32 pb-20 bg-[#F9F8F6]">
          <div className="max-w-md mx-auto px-4 text-center">
            <div className="bg-box-bg border border-red-500/20 p-8 shadow-xl space-y-6">
              <div className="flex justify-center">
                <AlertTriangle className="w-16 h-16 text-red-500 animate-bounce" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">유효하지 않은 결제 정보</h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                결제 승인에 필요한 매개변수가 누락되었거나 유효하지 않습니다. 고객센터로 문의해 주세요.
              </p>
              <div className="pt-2">
                <Link
                  href="/subscribe"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-black hover:bg-gray-900 active:scale-95 text-white font-bold transition-all text-sm"
                >
                  구독 페이지로 이동
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Header initialUser={user} />
      <main className="grow pt-32 pb-20 bg-[#F9F8F6]">
        {/* 쿠키 수정(cookies.set) 우회를 위해 결제 승인 비동기 처리를 클라이언트 컴포넌트에 위임 */}
        <SubscribeSuccessClient
          paymentKey={paymentKey}
          orderId={orderId}
          amount={amount}
          plan={plan}
        />
      </main>
      <Footer />
    </div>
  );
}
