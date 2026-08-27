import React from 'react';
import Link from 'next/link';
import { getSessionUser } from '@/app/actions/auth';
import { confirmTossPayment } from '@/app/actions/subscription';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle2, AlertTriangle, Home, CreditCard } from 'lucide-react';

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

  // 2. 서버 단에서 토스페이먼츠 결제 승인(Confirm) 호출 및 회원 승급(upgradeToPremium) 연쇄 처리
  const confirmResult = await confirmTossPayment(paymentKey, orderId, amount, plan);

  if (!confirmResult.success) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
        <Header initialUser={user} />
        <main className="grow pt-32 pb-20 bg-[#F9F8F6]">
          <div className="max-w-md mx-auto px-4 text-center">
            <div className="bg-box-bg border border-red-500/20 p-8 shadow-xl space-y-6">
              <div className="flex justify-center">
                <AlertTriangle className="w-16 h-16 text-red-500" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">결제 승인 실패</h1>
              <p className="text-sm text-gray-600 leading-relaxed">
                토스 결제 승인 처리 중 에러가 발생했습니다:
                <br />
                <span className="font-semibold text-red-500 block mt-2">
                  {confirmResult.error || '알 수 없는 대행 오류'}
                </span>
              </p>
              <div className="pt-4 flex flex-col gap-2">
                <Link
                  href="/subscribe"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-black hover:bg-gray-900 active:scale-95 text-white font-bold transition-all text-sm"
                >
                  결제 재시도하기
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
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-box-bg border border-[#000000] p-8 sm:p-10 shadow-2xl space-y-8 rounded-none text-center">
            
            <div className="space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-[#007C1F]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                멤버십 결제가 완료되었습니다!
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed">
                당신의 피비 프리미엄 서비스를 이용해 주셔서 감사합니다.
                <br />
                지금부터 모든 유료 리서치 정보와 다운로드 기능을 제약 없이 이용할 수 있습니다.
              </p>
            </div>

            {/* 결제 요약 명세서 */}
            <div className="border border-black/10 bg-white/50 p-5 space-y-3 text-left font-sans text-xs">
              <h4 className="font-extrabold text-[#000000] border-b border-black/10 pb-2 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" />
                결제 승인 내역 (Receipt)
              </h4>
              <div className="space-y-2 leading-relaxed text-[#000000]/80">
                <div className="flex justify-between">
                  <span className="text-gray-500">주문서 번호 (Order ID)</span>
                  <span className="font-mono text-gray-900 truncate max-w-[200px]">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">결제 플랜 (Membership)</span>
                  <span className="font-bold text-gray-900">
                    {plan === '1month' ? '프리미엄 1개월' : '프리미엄 1년 (연간)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">최종 승인 금액 (Amount)</span>
                  <span className="font-bold text-[#D60016]">₩{amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-black hover:bg-gray-900 active:scale-95 text-white font-bold transition-all text-sm rounded-none"
              >
                <Home className="w-4 h-4" />
                홈 화면으로
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
