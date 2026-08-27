import React from 'react';
import Link from 'next/link';
import { getSessionUser } from '@/app/actions/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface FailPageProps {
  searchParams: Promise<{
    code?: string;
    message?: string;
  }>;
}

export default async function SubscribeFailPage({ searchParams }: FailPageProps) {
  const user = await getSessionUser();
  const params = await searchParams;

  const errorCode = params.code || 'UNKNOWN_ERROR';
  const errorMessage = decodeURIComponent(params.message || '결제 진행 중 오류가 발생했습니다.');

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Header initialUser={user} />
      <main className="grow pt-32 pb-20 bg-[#F9F8F6]">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-box-bg border border-[#000000] p-8 sm:p-10 shadow-2xl space-y-8 rounded-none text-center">
            
            <div className="space-y-4">
              <div className="flex justify-center">
                <XCircle className="w-16 h-16 text-[#D60016]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                결제에 실패하였습니다
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                주문 승인 처리 혹은 카드사 인증 중 오류가 발생했습니다.
                <br />
                아래 오류 코드를 확인하시고 다시 결제를 신청해 주세요.
              </p>
            </div>

            {/* 에러 내역 상세 명세서 */}
            <div className="border border-red-200 bg-red-50/50 p-5 space-y-3 text-left font-sans text-xs">
              <h4 className="font-extrabold text-[#D60016] border-b border-red-200 pb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                오류 명세 (Error Details)
              </h4>
              <div className="space-y-2 leading-relaxed text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">오류 코드 (Code)</span>
                  <span className="font-mono font-bold text-gray-900">{errorCode}</span>
                </div>
                <div className="flex flex-col gap-1 pt-1.5 border-t border-red-100">
                  <span className="text-gray-500">실패 사유 (Reason)</span>
                  <span className="text-gray-900 leading-relaxed font-semibold">{errorMessage}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Link
                href="/subscribe"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-black hover:bg-gray-900 active:scale-95 text-white font-bold transition-all text-sm rounded-none"
              >
                <RefreshCw className="w-4 h-4" />
                결제 다시 시도하기
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
