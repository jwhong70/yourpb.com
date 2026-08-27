'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';

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

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';

export default function SubscribeClient({ initialUser }: SubscribeClientProps) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'1month' | '6months'>('6months');
  const [widgets, setWidgets] = useState<any>(null);
  const [isWidgetLoading, setIsWidgetLoading] = useState(true);
  const [isPending, setIsPending] = useState<string | null>(null);

  // 주문 ID용 무작위 난수 문자열 생성 함수
  function randomId() {
    return [...crypto.getRandomValues(new Uint32Array(2))]
      .map((word) => word.toString(16).padStart(8, '0'))
      .join('');
  }

  // 1. 토스페이먼츠 위젯 SDK 로드 및 초기화
  useEffect(() => {
    async function initTossPayments() {
      if (!initialUser) return;
      try {
        const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
        // 고유 customerKey 사용 (비회원은 ANONYMOUS)
        const customerKey = initialUser.id || 'ANONYMOUS';
        const widgetsInstance = tossPayments.widgets({ customerKey });

        const amount = selectedPlan === '1month' ? 5000 : 25000;
        await widgetsInstance.setAmount({
          currency: 'KRW',
          value: amount,
        });

        // 결제수단 및 약관 위젯 렌더링
        await widgetsInstance.renderPaymentMethods({
          selector: '#payment-method',
          variantKey: 'DEFAULT',
        });

        await widgetsInstance.renderAgreement({
          selector: '#agreement',
          variantKey: 'DEFAULT',
        });

        setWidgets(widgetsInstance);
        setIsWidgetLoading(false);
      } catch (err) {
        console.error('Toss Payments initialization failed:', err);
        setIsWidgetLoading(false);
      }
    }

    initTossPayments();
  }, [initialUser]);

  // 2. 선택 요금제(plan) 변경 시 결제위젯 금액 업데이트
  useEffect(() => {
    if (widgets) {
      const amount = selectedPlan === '1month' ? 5000 : 25000;
      widgets.setAmount({
        currency: 'KRW',
        value: amount,
      });
    }
  }, [selectedPlan, widgets]);

  // 3. 결제 진행 핸들러
  const handlePaymentSubmit = async () => {
    // 비로그인 유저 예외 처리
    if (!initialUser) {
      alert('구독 플랜을 시작하려면 로그인이 필요합니다. 로그인 페이지로 이동합니다.');
      router.push('/login');
      return;
    }

    // 이미 프리미엄 상태인 유저 체크
    if (initialUser.membership_status === 'premium') {
      alert('이미 프리미엄 멤버십 구독을 이용 중이십니다.');
      return;
    }

    if (!widgets) {
      alert('결제창 모듈 로딩 중입니다. 잠시만 대기 후 다시 시도해 주세요.');
      return;
    }

    setIsPending(selectedPlan);

    try {
      const amount = selectedPlan === '1month' ? 5000 : 25000;
      const orderName = selectedPlan === '1month' ? '당신의피비 프리미엄 멤버십 1개월' : '당신의피비 프리미엄 멤버십 6개월';
      const orderId = `order-${randomId()}`;

      // 토스페이먼츠 결제 요청 실행 (결제 인증 리다이렉트)
      await widgets.requestPayment({
        orderId,
        orderName,
        successUrl: `${window.location.origin}/subscribe/success?plan=${selectedPlan}`,
        failUrl: `${window.location.origin}/subscribe/fail`,
      });
    } catch (err: any) {
      console.error('Payment request failed:', err);
      alert(`결제 처리 중 에러가 발생했습니다: ${err.message || err}`);
      setIsPending(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pt-4">
      {/* 플랜 카드 선택 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
        
        {/* 1. 1개월 플랜 카드 */}
        <div 
          onClick={() => setSelectedPlan('1month')}
          className={`flex flex-col bg-[#000000] border cursor-pointer rounded-none p-8 lg:p-10 shadow-xl justify-between space-y-8 relative transition-all duration-300 ${
            selectedPlan === '1month' 
              ? 'border-white scale-102 ring-2 ring-white/20' 
              : 'border-white/10 opacity-70 hover:opacity-100'
          }`}
        >
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider">1개월 멤버십</h3>
                {selectedPlan === '1month' && (
                  <span className="text-[10px] font-black text-black bg-white px-2 py-0.5 uppercase tracking-wide">
                    SELECTED
                  </span>
                )}
              </div>
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
        </div>

        {/* 2. 6개월 플랜 카드 (추천) */}
        <div 
          onClick={() => setSelectedPlan('6months')}
          className={`flex flex-col bg-[#000000] border cursor-pointer rounded-none p-8 lg:p-10 shadow-2xl justify-between space-y-8 relative transition-all duration-300 ${
            selectedPlan === '6months' 
              ? 'border-[#D4AF37] scale-105 z-10 shadow-[#D4AF37]/5' 
              : 'border-white/10 opacity-70 hover:opacity-100'
          }`}
        >
          {/* 추천 태그 뱃지 */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black text-xs font-black tracking-widest px-4 py-1.5 uppercase select-none">
            RECOMMENDED
          </div>

          <div className="space-y-6">
            <div className="pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#D4AF37] uppercase tracking-wider">6개월 멤버십</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white bg-red-accent/90 border border-red-500/20 px-2 py-0.5 rounded-none">
                    17% 할인
                  </span>
                  {selectedPlan === '6months' && (
                    <span className="text-[10px] font-black text-black bg-[#D4AF37] px-2 py-0.5 uppercase tracking-wide">
                      SELECTED
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl lg:text-5xl font-black tracking-tight text-white">₩25,000</span>
                <span className="ml-2 text-sm font-semibold text-gray-500">/ 6개월</span>
              </div>
              <p className="mt-2 text-xs text-gray-400">정가 ₩30,000 ➡️ ₩25,000 (추천 상품)</p>
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
        </div>
      </div>

      {/* 3. 토스페이먼츠 결제위젯 통합 결제 영역 */}
      {initialUser && (
        <div className="bg-white p-6 sm:p-8 border border-black shadow-lg space-y-6">
          <h4 className="text-base font-extrabold text-black border-l-4 border-black pl-3 select-none leading-none">
            결제 수단 선택 및 동의
          </h4>
          
          {/* 위젯 로딩 인디케이터 */}
          {isWidgetLoading && (
            <div className="flex flex-col items-center justify-center py-10 space-y-2">
              <div className="w-8 h-8 border-4 border-black/20 border-t-black rounded-full animate-spin" />
              <p className="text-xs text-gray-500">토스 결제 위젯을 구성하는 중입니다...</p>
            </div>
          )}

          {/* 토스 결제위젯 렌더링 컨테이너 */}
          <div className={isWidgetLoading ? 'hidden' : 'block'}>
            <div id="payment-method" className="w-full" />
            <div id="agreement" className="w-full border-t border-gray-100 pt-4" />
          </div>
        </div>
      )}

      {/* 최종 결제 요청 실행 버튼 */}
      <div className="pt-4 flex justify-center">
        <button
          onClick={handlePaymentSubmit}
          disabled={isPending !== null || (!!initialUser && isWidgetLoading)}
          type="button"
          className="w-full max-w-md py-4 px-6 bg-[#D4AF37] hover:bg-[#c29d2f] active:scale-98 text-black font-black rounded-none shadow-xl shadow-[#D4AF37]/10 transition-all text-lg tracking-wide disabled:opacity-50 select-none cursor-pointer text-center"
        >
          {isPending ? (
            <div className="flex items-center justify-center gap-2.5">
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              <span>결제 진행 중...</span>
            </div>
          ) : (
            <span>
              결제하기 (₩{(selectedPlan === '1month' ? 5000 : 25000).toLocaleString()})
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
