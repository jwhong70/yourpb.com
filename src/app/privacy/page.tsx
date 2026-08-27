import React from 'react';
import { getSessionUser } from '@/app/actions/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default async function PrivacyPage() {
  const user = await getSessionUser();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Header initialUser={user} />
      <main className="grow pt-32 pb-20 bg-[#F9F8F6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-box-bg border border-[#000000] p-6 sm:p-10 shadow-lg space-y-8 rounded-none">
            <div className="border-b border-[#000000] pb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                개인정보처리방침
              </h1>
              <p className="text-xs text-gray-500 mt-2">
                시행일자: 2026년 8월 27일
              </p>
            </div>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 border-l-4 border-black pl-3 leading-none">
                1. 개인정보의 수집 및 이용 목적
              </h2>
              <div className="text-sm leading-relaxed text-gray-700 space-y-2 pl-4">
                <p>
                  "당신의 피비"(이하 "회사")는 회원에게 맞춤형 자산배분 분석 정보 및 프리미엄 유료 서비스를 제공하기 위해 아래와 같은 목적으로 개인정보를 수집합니다.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>서비스 가입 의사 확인, 회원제 서비스 제공에 따른 회원 식별 및 가입 관리</li>
                  <li>프리미엄 구독 멤버십 결제, 청구 및 영수증 발행</li>
                  <li>고객 문의 사항 상담, 민원 처리 및 고지사항 전달</li>
                </ul>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 border-l-4 border-black pl-3 leading-none">
                2. 수집하는 개인정보의 항목
              </h2>
              <div className="text-sm leading-relaxed text-gray-700 space-y-2 pl-4">
                <p>회사는 가입 시점에 아래와 같은 개인정보를 수집합니다:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>필수 수집 항목:</strong> 로그인 이메일 주소, 이름(닉네임), 비밀번호(자체 가입 시), 소셜 로그인 제공자 정보(소셜 연동 시)</li>
                  <li><strong>유료 서비스 결제 시:</strong> 카드 결제사 정보, 승인 번호, 연락처 등 전자금융거래법에 따른 필수 정보 (결제 대행사를 통해 안전하게 처리되며 회사는 직접 카드번호 정보를 저장하지 않습니다.)</li>
                </ul>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 border-l-4 border-black pl-3 leading-none">
                3. 개인정보의 보유 및 이용 기간
              </h2>
              <p className="text-sm leading-relaxed text-gray-700 pl-4">
                회원의 개인정보는 회원 탈퇴 시 즉시 파기하는 것을 원칙으로 합니다. 단, 전자금융거래법 등 관련 법령에 의해 보존할 필요가 있는 경우, 회사는 법령에서 규정한 기간 동안 회원의 정보를 별도 보관합니다. (예: 계약 또는 청약철회 등에 관한 기록 5년, 대금결제 및 재화 등의 공급에 관한 기록 5년)
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 border-l-4 border-black pl-3 leading-none">
                4. 개인정보보호책임자
              </h2>
              <div className="text-sm leading-relaxed text-gray-700 pl-4 space-y-1">
                <p>회사는 회원의 개인정보를 보호하고 관련 불만을 처리하기 위하여 아래와 같이 개인정보보호책임자를 지정하고 있습니다.</p>
                <ul className="list-disc pl-5 space-y-0.5 mt-1">
                  <li><strong>개인정보보호책임자:</strong> 홍정웅 (대표)</li>
                  <li><strong>연락처:</strong> 070-4507-4460</li>
                  <li><strong>이메일:</strong> jwhong70@gmail.com</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
