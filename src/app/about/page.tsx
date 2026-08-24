import React from 'react';
import { Mail, Instagram, Briefcase, GraduationCap, Award, User } from 'lucide-react';
import Link from 'next/link';
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
      description: '자산관리, 핀테크, 투자전략 및 포트폴리오 관리 분야의 전문 교수 및 연구원 활동.',
    },
    {
      period: '2023.03 ~ 2024.03',
      title: '광주은행 자산관리본부 신탁연금부 부장대우',
      description: '퇴직연금 원금 비보장 상품 수익률 및 포트폴리오 자산배분 관리 총괄. 2023년 2분기부터 2024년 1분기까지 4분기 연속 IRP 수익률 전업권 1위 및 DC 수익률 은행권 4위 달성을 주도하였습니다.',
    },
    {
      period: '2021.04 ~ 2023.02',
      title: '코코칭 주식회사 대표',
      description: '금융연수원 핀테크/자산관리 교수 및 하나금융투자 FA 교육 강사 활동. ‘퇴직연금으로 시작하는 자기주도 자산관리’ 도서를 출간하여 개인 자산관리 지평을 넓혔습니다.',
    },
    {
      period: '2020.09 ~ 2021.03',
      title: '케이뱅크 빅데이터팀 부장대우',
      description: '마이데이터(MyData) 사업 준비 및 선진 금융 자산관리 비즈니스 모델 구축 TF를 총괄 수행하였습니다.',
    },
    {
      period: '2015.02 ~ 2019.12',
      title: 'JB금융지주 금융조사부 부장 & 광주은행 WM사업부 부장대우',
      description: '광주은행 WMS(Wealth Management System) 도입 프로젝트 PM(국내 최초 하이브리드 로보어드바이저 적용)을 수행하고, 일임형 ISA MP 설계/운용(누적 수익률 은행권 1위)을 지휘하였습니다. 그룹 자산관리 및 투자금융 리포트 총괄 자문위원으로도 활약했습니다.',
    },
    {
      period: '2013.02 ~ 2014.12',
      title: '알파에셋자산운용㈜ 주식운용팀 팀장',
      description: '글로벌 대체에너지 펀드(알파에셋 투모로우에너지 펀드) 운용 총괄(2013년 펀드 수익률 전체 1위 달성) 및 Pre-IPO, IPO 펀드들을 전담 관리하였습니다.',
    },
    {
      period: '2011.06 ~ 2013.01',
      title: '하나증권 청담금융센터 PB',
      description: '하나증권 청담금융센터에서 VIP 고객 대상 세밀한 글로벌 자산배분 포트폴리오를 제안하고 밀착 케어 서비스를 제공하였습니다.',
    },
    {
      period: '2009.04 ~ 2011.05',
      title: 'KTB자산운용㈜ 주식운용2팀 & 전략리서치팀 팀장',
      description: '랩(Wrap) 운용 총괄, 리서치 총괄 및 지주/소비재 섹터 담당. 자산배분형 펀드 및 절대수익형 펀드 운용을 수행하였습니다.',
    },
    {
      period: '2008.06 ~ 2009.04',
      title: '동부자산운용㈜ 주식운용팀 차장',
      description: '동부생명 변액계정 펀드, 동부화재 일임펀드 및 공공기관 기관 일임 사모펀드들을 전문 운용하였습니다.',
    },
    {
      period: '2001.02 ~ 2008.05',
      title: '교보생명㈜ 조사역 & 교보AXA자산운용㈜ 선임주식운용역',
      description: '변액계정펀드 및 Hi-Korea 적립식 공모 펀드를 성공적으로 운용하고, 금융감독원 선정 우수 펀드인 교보 징검다리 펀드를 전담 운용하였습니다.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Header initialUser={user} />
      <main className="grow pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16 mt-10">
      
      {/* 1. 프로필 요약 (첫번째 블록) */}
      <section className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
        {/* 미세한 팝 컬러 그라데이션 장식 배경 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-accent/5 rounded-full blur-3xl pointer-events-none" />

        {/* 웹: 좌우 / 앱: 세로 반응형 flex */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
          
          {/* 프로필 이미지 */}
          <div className="w-48 h-48 sm:w-56 sm:h-56 shrink-0 rounded-2xl overflow-hidden border border-gray-100 shadow-md bg-gray-50 relative group">
            <img
              src="/profile_animation.png"
              alt="홍선생 프로필"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* 이력서 요약 문구 및 메인 설명 */}
          <div className="flex-1 space-y-5 text-center md:text-left">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                홍선생
              </h1>
            </div>

            <p className="text-lg font-bold text-gray-700 leading-relaxed max-w-2xl">
              "20년 이상의 현업 금융 운용 지식과 퇴직연금 포트폴리오 관리 성과를 바탕으로, 자산배분 시장을 리딩하며 고객 맞춤형 최적의 ETF 포트폴리오를 제공합니다."
            </p>

            <p className="text-sm text-gray-500 leading-relaxed">
              하나증권 PB 및 자산운용사 펀드매니저 출신으로, 퇴직연금 및 특정금전신탁 분야에서 탁월한 자산관리 수익률(IRP 전업권 1위)을 달성한 금융 전문가입니다. 
            </p>

            {/* 이력서 다운로드 버튼 제거됨 */}
          </div>

        </div>
      </section>

      {/* 2. 경력 사항 타임라인 (두번째 블록) */}
      <section className="space-y-8">
        <div className="flex items-center gap-2.5 border-b border-black pb-4">
          <Briefcase className="w-6 h-6 text-[#000000]" />
          <h2 className="text-2xl font-extrabold text-[#000000] tracking-tight">
            전문 경력 (Career History)
          </h2>
        </div>

        {/* 수직 타임라인 레이아웃 */}
        <div className="relative border-l border-[#000000] ml-4 pl-6 sm:pl-8 space-y-10">
          {careerHistory.map((item, idx) => (
            <div key={idx} className="relative group">
              {/* 타임라인 원형 마커 노드 */}
              <span className="absolute -left-10 sm:-left-12 top-1.5 flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-[#000000] group-hover:border-[#000000] transition-colors shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#000000] group-hover:bg-[#000000] transition-colors" />
              </span>

              {/* 경력 상세 카드 */}
              <div className="bg-white border border-gray-150 rounded-2xl p-6 hover:shadow-md hover:border-[#000000] transition-all space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h3 className="text-base font-extrabold text-[#000000] group-hover:text-[#000000] transition-colors">
                    {item.title}
                  </h3>
                  <span className="text-xs font-bold font-mono text-[#000000] shrink-0 bg-black/5 px-2.5 py-0.5 rounded-md self-start sm:self-center">
                    {item.period}
                  </span>
                </div>
                <p className="text-sm text-[#000000] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 학력 & 자격증 정보 */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* 학력 정보 */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <GraduationCap className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-bold text-gray-900">학력 사항</h3>
          </div>
          <ul className="space-y-3.5 text-sm">
            <li className="flex justify-between items-start gap-4">
              <div>
                <strong className="text-gray-900 block">한국외국어대학교 일반대학원 석사</strong>
                <span className="text-xs text-gray-500">재무관리 전공, 회계학 부전공</span>
              </div>
              <span className="text-xs font-bold text-gray-500 font-mono">2000.08</span>
            </li>
            <li className="flex justify-between items-start gap-4">
              <div>
                <strong className="text-gray-900 block">한국외국어대학교 학사</strong>
                <span className="text-xs text-gray-500">일본어 전공, 경영학 부전공</span>
              </div>
              <span className="text-xs font-bold text-gray-500 font-mono">1994.02</span>
            </li>
          </ul>
        </div>

        {/* 자격증 정보 */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Award className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-bold text-gray-900">금융 자격 취득</h3>
          </div>
          <ul className="space-y-3.5 text-sm">
            <li className="flex justify-between items-center gap-4">
              <span className="text-gray-900 font-medium">자산운용전문인력 (국토교통부)</span>
              <span className="text-xs font-bold text-gray-500 font-mono">2017.12</span>
            </li>
            <li className="flex justify-between items-center gap-4">
              <span className="text-gray-900 font-medium">부동산운용전문인력 (자산운용협회)</span>
              <span className="text-xs font-bold text-gray-500 font-mono">2007.07</span>
            </li>
            <li className="flex justify-between items-center gap-4">
              <span className="text-gray-900 font-medium">일반운용전문인력 (투자신탁협회)</span>
              <span className="text-xs font-bold text-gray-500 font-mono">2002.06</span>
            </li>
          </ul>
        </div>

      </section>

      {/* 4. CONTACT US (세번째 블록 - 이메일, 인스타 링크 연동) */}
      <section className="bg-[#F1F1F1] border border-gray-200 rounded-3xl p-8 sm:p-10 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            CONTACT US
          </h2>
          <p className="text-sm text-gray-500">
            자산배분 상담 및 퇴직연금 포트폴리오 진단 문의를 기다립니다.
          </p>
        </div>

        {/* 2열 배치 (이메일, 인스타그램) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          
          {/* 이메일 카드 */}
          <a
            href="mailto:jwhong70@gmail.com"
            className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 hover:border-black/30 rounded-2xl text-center transition-all hover:shadow-md group cursor-pointer"
          >
            <div className="text-[#000000] mb-4 group-hover:scale-110 transition-transform">
              <Mail className="w-8 h-8" />
            </div>
            <span className="text-xs text-gray-400 font-semibold tracking-wider uppercase mb-1">E-mail</span>
            <strong className="text-sm text-gray-900 font-sans group-hover:text-[#000000] transition-colors">
              jwhong70@gmail.com
            </strong>
            <span className="text-[10px] text-gray-400 mt-2">클릭하여 메일 발송하기 &rarr;</span>
          </a>

          {/* 인스타그램 카드 */}
          <a
            href="https://www.instagram.com/yourpb_hong/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 hover:border-black/30 rounded-2xl text-center transition-all hover:shadow-md group cursor-pointer"
          >
            <div className="text-[#000000] mb-4 group-hover:scale-110 transition-transform">
              <Instagram className="w-8 h-8" />
            </div>
            <span className="text-xs text-gray-400 font-semibold tracking-wider uppercase mb-1">Instagram</span>
            <strong className="text-sm text-gray-900 font-sans group-hover:text-[#000000] transition-colors">
              @yourpb_hong
            </strong>
            <span className="text-[10px] text-gray-400 mt-2">클릭하여 프로필 방문하기 &rarr;</span>
          </a>

        </div>
      </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
