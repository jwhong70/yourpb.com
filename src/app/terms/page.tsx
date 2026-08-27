import React from 'react';
import { getSessionUser } from '@/app/actions/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default async function TermsPage() {
  const user = await getSessionUser();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Header initialUser={user} />
      <main className="grow pt-32 pb-20 bg-[#F9F8F6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-box-bg border border-[#000000] p-6 sm:p-10 shadow-lg space-y-8 rounded-none">
            <div className="border-b border-[#000000] pb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                서비스 이용약관
              </h1>
              <p className="text-xs text-gray-500 mt-2">
                시행일자: 2026년 8월 27일
              </p>
            </div>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 border-l-4 border-black pl-3 leading-none">
                제 1 조 (목적)
              </h2>
              <p className="text-sm leading-relaxed text-gray-700 pl-4">
                본 약관은 "당신의 피비"(이하 "회사")가 제공하는 글로벌 자산관리 리서치 및 ETF 포트폴리오 분석 서비스(이하 "서비스")를 이용함에 있어, 회사와 회원의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 border-l-4 border-black pl-3 leading-none">
                제 2 조 (정의)
              </h2>
              <ul className="text-sm leading-relaxed text-gray-700 pl-8 list-disc space-y-1">
                <li>"회원"이란 회사와 서비스 이용 계약을 체결하고 회원 아이디를 부여받아 서비스를 이용하는 자를 의미합니다.</li>
                <li>"프리미엄 멤버십"이란 회원이 유료 결제를 통해 고급 리서치 리포트 및 대시보드 조회 등 추가 혜택을 이용할 수 있는 유료 서비스를 의미합니다.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 border-l-4 border-black pl-3 leading-none">
                제 3 조 (서비스의 제공 및 제한)
              </h2>
              <div className="text-sm leading-relaxed text-gray-700 space-y-2 pl-4">
                <p>
                  1. 회사는 회원에게 글로벌 매크로 분석 정보, ETF 정보 검색, 자산 배분 알고리즘 결과물 등을 온라인으로 제공합니다.
                </p>
                <p>
                  2. 본 서비스에서 제공하는 모든 투자 정보 및 분석 자료는 투자의 참고 자료일 뿐이며, 특정 종목의 매수 또는 매도를 직접 권유하거나 회원의 최종 투자 수익을 보장하지 않습니다. 모든 투자 결정 및 그에 따른 책임은 회원 본인에게 있습니다.
                </p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 border-l-4 border-black pl-3 leading-none">
                제 4 조 (이용료 및 결제)
              </h2>
              <p className="text-sm leading-relaxed text-gray-700 pl-4">
                유료 서비스의 이용요금 및 결제 방법은 결제 화면에 고지된 바에 따릅니다. 결제 대금은 제휴된 전자결제대행사(PG)를 통해 청구됩니다.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 border-l-4 border-black pl-3 leading-none">
                제 5 조 (지식재산권의 보호)
              </h2>
              <p className="text-sm leading-relaxed text-gray-700 pl-4">
                서비스 내에 게재된 보고서, 텍스트, 이미지, 그래프 및 포트폴리오 자료에 대한 저작권 등 모든 지식재산권은 회사에 귀속됩니다. 회원은 회사의 서면 승인 없이 본 서비스의 콘텐츠를 무단 전재, 복제, 배포 또는 타인에게 공유해서는 안 됩니다.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
