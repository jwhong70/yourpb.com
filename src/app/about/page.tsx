import React from 'react';
import { Mail, Instagram, Phone } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getSessionUser } from '@/app/actions/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: '당신의 PB, 홍선생 프로필 | YOURPB',
  description: '20년 이상의 금융 포트폴리오 자산관리 전문가, 홍선생의 상세 약력과 전문성을 소개합니다.',
};

export default async function AboutPage() {
  const user = await getSessionUser();
  const careerHistory = [
    {
      period: '2024.03 ~ 현재',
      title: '한국금융연수원 교수',
      description: '자산관리, 핀테크, 투자전략, 포트폴리오 관리 분야의 전문 교수',
    },
    {
      period: '2023.03 ~ 2024.03',
      title: '광주은행 신탁연금부장',
      description: '퇴직연금 상품 수익률, 자산배분 관리 총괄. 2023년 2분기부터 2024년 1분기까지 4분기 연속 IRP 수익률 전업권 1위 달성을 주도',
    },
    {
      period: '2021.04 ~ 2023.02',
      title: '코코칭 주식회사 대표',
      description: '금융연수원 교수 및 FA 교육 강사 활동. ‘퇴직연금으로 시작하는 자기주도 자산관리’ 도서 출간',
    },
    {
      period: '2020.09 ~ 2021.03',
      title: '케이뱅크 TF 리더',
      description: '마이데이터 사업 준비, 자산관리 비즈니스 구축 TF 총괄',
    },
    {
      period: '2015.02 ~ 2019.12',
      title: '광주은행 WM사업부장',
      description: '광주은행 자산관리시스템 프로젝트 PM(국내 최초 hybrid RA 적용) 수행, 일임형 ISA MP 설계/운용(누적 수익률 은행권 1위) 지휘',
    },
    {
      period: '2013.02 ~ 2014.12',
      title: '알파에셋 주식운용팀장',
      description: '글로벌 대체에너지 펀드(알파에셋 투모로우에너지 펀드) 운용(2013년 펀드 수익률 전체 1위 달성)',
    },
    {
      period: '2011.06 ~ 2013.01',
      title: '하나 Club-One PB',
      description: '하나 Club-One에서 VIP 고객관리 담당',
    },
    {
      period: '2009.04 ~ 2011.05',
      title: 'KTB 주식운용2팀장',
      description: '랩(Wrap) 운용 총괄, 리서치 총괄. 자산배분형 및 절대수익형 펀드 운용',
    },
    {
      period: '2008.06 ~ 2009.04',
      title: '동부 주식운용팀 차장',
      description: '동부생명 변액펀드, 동부화재 일임펀드, 공공기관 일임펀드 전문 운용',
    },
    {
      period: '2001.02 ~ 2008.05',
      title: '교보AXA 주식운용역',
      description: '대표 펀드인 Hi- Korea 주식형 펀드, 교보 징검다리 펀드(금융감독원 선정 우수 펀드) 운용',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Header initialUser={user} />
      <main className="grow pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16 mt-10">

          {/* 1. 프로필 요약 (첫번째 블록) */}
          <section className="bg-box-bg rounded-none p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            {/* 미세한 팝 컬러 그라데이션 장식 배경 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-accent/5 rounded-full blur-3xl pointer-events-none" />

            {/* 웹: 좌우 / 앱: 세로 반응형 flex */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">

              {/* 프로필 이미지 */}
              <div className="w-48 h-48 sm:w-56 sm:h-56 shrink-0 rounded-none overflow-hidden border border-t-[#000000] border-b-[#000000] border-l-white border-r-white shadow-md bg-inner-bg relative group">
                <Image
                  src="/profile_animation.png"
                  alt="홍선생 프로필"
                  fill
                  sizes="(max-width: 768px) 192px, 224px"
                  priority
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* 이력서 요약 문구 및 메인 설명 */}
              <div className="flex-1 space-y-5 text-center md:text-left">
                <div className="space-y-2">
                  <h1 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl select-none">
                    홍선생
                  </h1>
                </div>

                <p className="text-base font-bold text-gray-700 leading-relaxed max-w-2xl">
                  "20년 이상의 현업 금융 지식과 포트폴리오 관리 성과를 바탕으로, 당신을 위한 맞춤형 포트폴리오를 제공합니다."
                </p>

                <p className="text-base text-gray-500 leading-relaxed">
                  은행 및 증권사 PB, 대형 자산운용사 펀드 매니저 출신으로, 펀드, ISA, 퇴직연금 분야에서 탁월한 수익률(일임형 ISA, IRP 전업권 1위)을 달성한 금융 전문가입니다.
                </p>

                {/* 이력서 다운로드 버튼 제거됨 */}
              </div>

            </div>
          </section>

          {/* 2. 경력 사항 타임라인 (두번째 블록) */}
          <section className="space-y-8">
            <div className="flex items-center pb-2">
              <h2 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl select-none">
                전문 경력 (Career History)
              </h2>
            </div>

            {/* 수직 타임라인 레이아웃 (세로선 스타일 변경) */}
            <div className="relative border-l-2 border-[#D4AF37]/30 ml-4 pl-3 sm:pl-4 space-y-10">
              {careerHistory.map((item, idx) => (
                <div key={idx} className="relative group">
                  {/* 타임라인 원형 마커 노드 (블릿 스타일 변경) */}
                  <span className="absolute -left-6.5 sm:-left-7.5 top-2.5 flex items-center justify-center w-4.5 h-4.5 rounded-full bg-white border-2 border-[#D4AF37] transition-all shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                  </span>

                  {/* 경력 상세 카드 */}
                  <div className="bg-box-bg border border-t-[#000000] border-b-[#000000] border-l-white border-r-white rounded-none p-6 hover:shadow-md hover:border-[#D4AF37] transition-all space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <h3 className="text-xl font-extrabold text-[#000000] group-hover:text-[#D4AF37] transition-colors">
                        {item.title}
                      </h3>
                      <span className="text-sm font-bold font-mono text-[#000000] shrink-0 bg-black/5 px-2.5 py-0.5 rounded-none self-start sm:self-center">
                        {item.period}
                      </span>
                    </div>
                    <p className="text-base text-[#000000] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>


          {/* 4. CONTACT US (세번째 블록 - 이메일, 인스타 링크 연동) */}
          <section className="bg-box-bg rounded-none p-8 sm:p-10 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight select-none">
                CONTACT US
              </h2>
              <p className="text-base text-gray-500">
                자산배분 상담 및 퇴직연금 포트폴리오 진단 문의를 기다립니다.
              </p>
            </div>

            {/* 3열 배치 (이메일, 전화, 인스타그램) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">

              {/* 이메일 카드 */}
              <a
                href="mailto:jwhong70@gmail.com"
                className="flex flex-col items-center justify-center p-6 bg-[#D4AF37] hover:bg-[#c29d2f] rounded-none text-center transition-all hover:shadow-lg group cursor-pointer"
              >
                <div className="text-gray-900 mb-4 group-hover:scale-110 transition-transform">
                  <Mail className="w-8 h-8" />
                </div>
                <span className="text-sm text-gray-900 font-extrabold tracking-wider uppercase mb-1">E-mail</span>
                <strong className="text-base text-gray-900 font-sans group-hover:text-black transition-colors break-all">
                  jwhong70@gmail.com
                </strong>
                <span className="text-sm text-gray-900/70 font-semibold mt-2">클릭하여 메일 발송하기 &rarr;</span>
              </a>

              {/* 전화 문의 카드 */}
              <a
                href="tel:070-4507-4460"
                className="flex flex-col items-center justify-center p-6 bg-[#D4AF37] hover:bg-[#c29d2f] rounded-none text-center transition-all hover:shadow-lg group cursor-pointer"
              >
                <div className="text-gray-900 mb-4 group-hover:scale-110 transition-transform">
                  <Phone className="w-8 h-8" />
                </div>
                <span className="text-sm text-gray-900 font-extrabold tracking-wider uppercase mb-1">Phone</span>
                <strong className="text-base text-gray-900 font-sans group-hover:text-black transition-colors break-all">
                  070-4507-4460
                </strong>
                <span className="text-sm text-gray-900/70 font-semibold mt-2">클릭하여 전화 걸기 &rarr;</span>
              </a>

              {/* 인스타그램 카드 */}
              <a
                href="https://www.instagram.com/yourpb_hong/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-6 bg-[#D4AF37] hover:bg-[#c29d2f] rounded-none text-center transition-all hover:shadow-lg group cursor-pointer"
              >
                <div className="text-gray-900 mb-4 group-hover:scale-110 transition-transform">
                  <Instagram className="w-8 h-8" />
                </div>
                <span className="text-sm text-gray-900 font-extrabold tracking-wider uppercase mb-1">Instagram</span>
                <strong className="text-base text-gray-900 font-sans group-hover:text-black transition-colors break-all">
                  @yourpb_hong
                </strong>
                <span className="text-sm text-gray-900/70 font-semibold mt-2">클릭하여 프로필 방문하기 &rarr;</span>
              </a>

            </div>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
