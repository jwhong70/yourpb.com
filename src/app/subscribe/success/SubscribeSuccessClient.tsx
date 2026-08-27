'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { confirmTossPayment } from '@/app/actions/subscription';
import { CheckCircle2, AlertTriangle, Home, CreditCard } from 'lucide-react';

interface SubscribeSuccessClientProps {
  paymentKey: string;
  orderId: string;
  amount: number;
  plan: '1month' | '6months';
}

export default function SubscribeSuccessClient({
  paymentKey,
  orderId,
  amount,
  plan
}: SubscribeSuccessClientProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'fail'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function executeConfirm() {
      try {
        // 브라우저 클라이언트 단에서 서버 액션을 POST 형태로 안전하게 트리거
        // 이를 통해 서버 액션 내부에서 cookies().set()이 오류 없이 정상 수행됨
        const result = await confirmTossPayment(paymentKey, orderId, amount, plan);
        if (result.success) {
          setStatus('success');
        } else {
          setErrorMsg(result.error || '결제 승인 처리 중 에러가 발생했습니다.');
          setStatus('fail');
        }
      } catch (err: any) {
        console.error('Toss Payments confirmation client error:', err);
        setErrorMsg(err.message || '승인 요청 중 예상치 못한 오류가 발생했습니다.');
        setStatus('fail');
      }
    }

    executeConfirm();
  }, [paymentKey, orderId, amount, plan]);

  // 1. 승인 요청 중 (로딩 화면)
  if (status === 'loading') {
    return (
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="bg-box-bg border border-black p-8 sm:p-10 shadow-xl space-y-6 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-black/20 border-t-black rounded-full animate-spin" />
          <h1 className="text-xl font-black text-gray-900 tracking-tight">결제 승인 요청 중</h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            토스페이먼츠와 거래 안전 승인 검증 절차를 진행하고 있습니다.
            <br />
            페이지를 새로고침하거나 닫지 마세요.
          </p>
        </div>
      </div>
    );
  }

  // 2. 승인 실패 화면
  if (status === 'fail') {
    return (
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
              {errorMsg || '알 수 없는 대행 오류'}
            </span>
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <Link
              href="/subscribe"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-black hover:bg-gray-900 active:scale-95 text-white font-bold transition-all text-sm select-none cursor-pointer"
            >
              결제 재시도하기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. 승인 성공 화면
  return (
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
          <h4 className="font-extrabold text-[#000000] border-b border-black/10 pb-2 flex items-center gap-1.5 select-none">
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
                {plan === '1month' ? '프리미엄 1개월' : '프리미엄 6개월'}
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
            className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-black hover:bg-gray-900 active:scale-95 text-white font-bold transition-all text-sm rounded-none select-none cursor-pointer"
          >
            <Home className="w-4 h-4" />
            홈 화면으로
          </Link>
        </div>
      </div>
    </div>
  );
}
