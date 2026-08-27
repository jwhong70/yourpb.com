import React from 'react';
import { getSessionUser } from '@/app/actions/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default async function RefundPage() {
  const user = await getSessionUser();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Header initialUser={user} />
      <main className="grow pt-32 pb-20 bg-[#F9F8F6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-box-bg border border-[#000000] p-6 sm:p-10 shadow-lg space-y-8 rounded-none">
            <div className="border-b border-[#000000] pb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                취소 및 환불 정책
              </h1>
              <p className="text-xs text-gray-500 mt-2">
                시행일자: 2026년 8월 27일
              </p>
            </div>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 border-l-4 border-black pl-3 leading-none">
                1. 청약철회 및 환불 기준
              </h2>
              <div className="text-sm leading-relaxed text-gray-700 space-y-2 pl-4">
                <p>
                  • <strong>디지털 콘텐츠 / 서비스 (프리미엄 멤버십):</strong>
                  <br />
                  결제 후 서비스 이용 내역이 없거나 콘텐츠(리포트 다운로드, 대시보드 조회 등)를 열람하지 않은 경우, 결제일로부터 7일 이내에 전액 환불을 요청하실 수 있습니다. 단, 이미 서비스 이용을 시작하거나 제공이 완료된 디지털 콘텐츠의 경우, 관련 법령(전자상거래 등에서의 소비자보호에 관한 법률)에 따라 청약철회가 제한될 수 있습니다.
                </p>
                <p>
                  • <strong>실물 상품:</strong>
                  <br />
                  상품 수령 후 7일 이내에 교환 및 반품(환불)을 요청하실 수 있습니다. 고객님의 단순 변심에 의한 반품의 경우 왕복 배송비는 고객님께서 부담하셔야 합니다. 단, 상품이 훼손되거나 사용 흔적이 있는 경우에는 청약철회가 불가합니다.
                </p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 border-l-4 border-black pl-3 leading-none">
                2. 환불 제한 사항
              </h2>
              <div className="text-sm leading-relaxed text-gray-700 space-y-2 pl-4">
                <p>다음의 경우 환불이 제한되거나 불가할 수 있습니다:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>멤버십 결제 후 리서치 PDF 보고서를 1회 이상 다운로드한 경우</li>
                  <li>이용 기간이 만료되었거나 서비스 이용 회수가 전량 소진된 경우</li>
                  <li>고객의 책임 있는 사유로 실물 상품 또는 콘텐츠가 멸실/훼손된 경우</li>
                </ul>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 border-l-4 border-black pl-3 leading-none">
                3. 환불 절차 및 방법
              </h2>
              <div className="text-sm leading-relaxed text-gray-700 space-y-2 pl-4">
                <p>
                  고객센터(유선 연락처: 070-4507-4460 또는 이메일: jwhong70@gmail.com)로 주문 정보 및 회원 계정 정보를 전달하여 환불을 신청합니다.
                </p>
                <p>
                  환불 요건 충족 여부를 확인한 후 결제 취소를 진행하며, 승인 완료 후 3~5영업일 이내에 기존 결제 수단(신용카드, 간편결제 등)을 통해 대금이 환불 처리됩니다.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
