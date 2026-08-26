'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import PortOne from '@portone/browser-sdk/v2';
import { upgradeToPremium } from '@/app/actions/subscription';

interface User {
  id: string;
  email: string | null | undefined;
  name: string;
  membership_status: string;
  subscription_end_date: string | null | undefined;
}

interface SubscribeClientProps {
  initialUser: User | null;
}

export default function SubscribeClient({ initialUser }: SubscribeClientProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState<string | null>(null); // '1month' | '12months' | null

  // 주문 ID용 무작위 난수 문자열 생성 함수
  function randomId() {
    return [...crypto.getRandomValues(new Uint32Array(2))]
      .map((word) => word.toString(16).padStart(8, '0'))
      .join('');
  }

  // 결제 진행 및 멤버십 업그레이드 수행 핸들러
  const handlePayment = async (plan: '1month' | '12months') => {
    // 1. 비로그인 유저 예외 처리
    if (!initialUser) {
      alert('구독 플랜을 시작하려면 로그인이 필요합니다. 로그인 페이지로 이동합니다.');
      router.push('/login');
      return;
    }

    // 2. 이미 프리미엄 상태인 유저 체크 (사용자 편의성)
    if (initialUser.membership_status === 'premium') {
      alert('이미 프리미엄 멤버십 구독을 이용 중이십니다.');
      return;
    }

    setIsPending(plan);

    try {
      const paymentId = `pay-${randomId()}`;
      const amount = plan === '1month' ? 5000 : 50000;
      const orderName = plan === '1month' ? '당신의피비 프리미엄 멤버십 1개월' : '당신의피비 프리미엄 멤버십 1년';

      // 3. PortOne 결제 요청 (환경변수 값 우선, 없으면 2.project-setting.md에 기재된 키로 폴백)
      const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID || 'store-10d105a7-7c65-4547-87f2-cc8e02e83c48';
      const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY || 'channel-key-94a351f1-262d-4388-bbbf-d5c4f318b8a4';

      const payment = await PortOne.requestPayment({
        storeId,
        channelKey,
        paymentId,
        orderName,
        totalAmount: amount,
        currency: 'KRW',
        payMethod: 'EASY_PAY',
        easyPay: {
          easyPayProvider: 'EASY_PAY_PROVIDER_KAKAOPAY',
        },
      });

      // 4. 결제 응답이 없을 경우 예외 처리
      if (!payment) {
        alert('결제 응답을 받지 못했습니다. 다시 시도해 주세요.');
        setIsPending(null);
        return;
      }

      // 5. 결제 실패 또는 취소 처리
      if (payment.code !== undefined) {
        alert(`결제에 실패하였습니다: ${payment.message || '취소됨'}`);
        setIsPending(null);
        return;
      }

      // 5. 결제 성공 후 서버 액션 트리거
      const result = await upgradeToPremium(plan);

      if (result.success) {
        alert('프리미엄 멤버십이 시작되었습니다!');
        // 홈 화면('/')으로 이동하여 신규 프리미엄 권한을 즉시 사용할 수 있도록 전역 갱신
        window.location.href = '/';
      } else {
        alert(`멤버십 업그레이드 오류: ${result.error || '알 수 없는 에러가 발생했습니다.'}`);
      }
    } catch (err: any) {
      console.error('Payment processing error:', err);
      alert(`결제 과정 중 오류가 발생했습니다: ${err.message || err}`);
    } finally {
      setIsPending(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto items-stretch pt-4">
      
      {/* 1. 1개월 플랜 카드 */}
      <div className="flex flex-col bg-[#000000] border border-white/10 rounded-none p-8 lg:p-10 shadow-xl justify-between space-y-8 relative">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider">1개월 멤버십</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl lg:text-5xl font-black tracking-tight text-white">₩5,000</span>
              <span className="ml-2 text-sm font-semibold text-gray-500">/ 월</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">매월 정기 결제, 언제든지 해지 가능</p>
          </div>

          {/* 혜택 리스트 */}
          <div className="border-t border-white/10 pt-6">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-gray-300">ETF/주식 상세 리뷰 무제한 조회</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-gray-300">ETF/주식 리포트 무제한 다운로드</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 가입 시작 버튼 */}
        <div className="pt-4">
          <button
            onClick={() => handlePayment('1month')}
            disabled={isPending !== null}
            type="button"
            className="w-full py-4 px-6 bg-white/10 hover:bg-white/20 active:scale-98 text-white font-bold rounded-none border border-white/10 transition-all text-base tracking-wide disabled:opacity-50"
          >
            {isPending === '1month' ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>결제 진행 중...</span>
              </div>
            ) : (
              <span>시작하기</span>
            )}
          </button>
        </div>
      </div>

      {/* 2. 1년 플랜 카드 (추천 - 금빛 테두리 강조) */}
      <div className="flex flex-col bg-[#000000] border-2 border-[#D4AF37] rounded-none p-8 lg:p-10 shadow-2xl justify-between space-y-8 relative md:scale-105 z-10 shadow-[#D4AF37]/5">
        
        {/* 추천 태그 뱃지 */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black text-xs font-black tracking-widest px-4 py-1.5 uppercase select-none">
          RECOMMENDED
        </div>

        <div className="space-y-6">
          <div className="pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#D4AF37] uppercase tracking-wider">1년 멤버십</h3>
              <span className="text-xs font-bold text-white bg-red-accent/90 border border-red-500/20 px-2 py-0.5 rounded-none">
                17% 할인
              </span>
            </div>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl lg:text-5xl font-black tracking-tight text-white">₩50,000</span>
              <span className="ml-2 text-sm font-semibold text-gray-500">/ 년</span>
            </div>
            <p className="mt-2 text-xs text-gray-400">정가 ₩60,000 ➡️ 연 ₩50,000 (추천 상품)</p>
          </div>

          {/* 혜택 리스트 */}
          <div className="border-t border-white/10 pt-6">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-gray-300 font-semibold">1개월 혜택 모두 포함</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-gray-300">이메일 자산분석 1회 무료 제공</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 가입 시작 버튼 */}
        <div className="pt-4">
          <button
            onClick={() => handlePayment('12months')}
            disabled={isPending !== null}
            type="button"
            className="w-full py-4 px-6 bg-[#D4AF37] hover:bg-[#c29d2f] active:scale-98 text-black font-black rounded-none shadow-md shadow-[#D4AF37]/10 transition-all text-base tracking-wide disabled:opacity-50"
          >
            {isPending === '12months' ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                <span>결제 진행 중...</span>
              </div>
            ) : (
              <span>시작하기</span>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
