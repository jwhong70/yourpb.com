'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Compass, PieChart, Layers, ScanText, Instagram, ExternalLink } from 'lucide-react';

export default function HomeQuickGuide() {
  const steps = [
    {
      step: '1단계',
      badge: '자산배분',
      title: '먼저 시장의 큰 흐름을 검토하세요',
      desc: '이달의 거시 경제 국면(금리·유동성)과 피비 모델 포트폴리오를 확인하고, 내 자산의 큰 비중(주식·채권·현금) 틀을 잡습니다.',
      linkText: '이달의 거시 국면 검토하기',
      href: '/macro',
      icon: PieChart,
      accentColor: '#D4AF37',
    },
    {
      step: '2단계',
      badge: 'ETF 탐색',
      title: '그 다음 내 기둥이 될 ETF를 선택하세요',
      desc: '자산배분 비중에 맞추어 미국 및 국내 상장 글로벌 대표 ETF(시장지수·섹터·채권)를 둘러보고 포트폴리오를 채웁니다.',
      linkText: '글로벌 ETF 목록 둘러보기',
      href: '/etf',
      icon: Layers,
      accentColor: '#38BDF8',
    },
    {
      step: '3단계',
      badge: '속 종목 엑스레이',
      title: '마지막으로 ETF 속 종목을 엑스레이 하세요',
      desc: '선택한 ETF 속에 어떤 대형 우량주가 몇 %나 담겨 있는지, 밸류에이션(P/E)과 기간수익률을 정밀하게 투시합니다.',
      linkText: '대표 ETF 엑스레이 투시하기',
      href: '/etf/SPY',
      icon: ScanText,
      accentColor: '#4ADE80',
    },
  ];

  return (
    <section className="bg-white border border-black/10 rounded-none p-6 sm:p-8 shadow-xs">
      {/* 상단 헤더: 고객의 직관적 질문 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-5 border-b border-black/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-none bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center">
            <Compass className="w-5 h-5 text-[#8B6508]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <span>이 사이트 대체 어떻게 쓰는 건가요?</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              당신의 피비와 함께하는 3단계 스마트 탑다운(Top-Down) 자산관리 순서
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-[#8B6508] bg-[#D4AF37]/15 px-3 py-1 border border-[#D4AF37]/30 w-fit">
          초보자도 1분이면 끝나는 투자 나침반
        </span>
      </div>

      {/* 3단계 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-[#F9F8F6] border border-black/10 hover:border-[#D4AF37] hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between group"
            >
              <div>
                {/* 상단 스텝 라벨 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 font-mono">
                      STEP {idx + 1}
                    </span>
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-none"
                      style={{
                        backgroundColor: `${item.accentColor}20`,
                        color: item.accentColor === '#D4AF37' ? '#8B6508' : item.accentColor,
                        border: `1px solid ${item.accentColor}40`,
                      }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <Icon className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                </div>

                {/* 핵심 한줄 코칭 */}
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 leading-snug group-hover:text-[#8B6508] transition-colors">
                  {item.title}
                </h3>

                {/* 세부 설명 */}
                <p className="text-xs text-gray-600 leading-relaxed mb-5">
                  {item.desc}
                </p>
              </div>

              {/* 액션 바로가기 링크 */}
              <Link
                href={item.href}
                className="inline-flex items-center justify-between w-full pt-3 border-t border-black/10 text-xs font-bold text-gray-800 group-hover:text-[#8B6508] transition-colors"
              >
                <span>{item.linkText}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* 하단 인스타그램 옴니채널 연계 배너 (웹 + 인스타 릴스 시너지) */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-linear-to-r from-purple-50/80 via-white to-pink-50/80 p-4 sm:p-5 border border-purple-200/80 shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-none bg-linear-to-br from-[#E1306C]/15 via-[#C13584]/15 to-[#833AB4]/15 border border-[#E1306C]/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <Instagram className="w-5 h-5 text-[#E1306C]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-[#E1306C] bg-[#E1306C]/10 px-2 py-0.5 border border-[#E1306C]/25 whitespace-nowrap">
                매일 저녁 7시 실시간 연재
              </span>
              <strong className="text-xs sm:text-sm font-bold text-gray-900 break-keep">
                글과 데이터 표가 다소 낯설거나 어려우신가요?
              </strong>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed break-keep">
              웹 리포트와 함께 인스타그램에서 <span className="text-gray-900 font-semibold">매일 저녁 7시(퇴근길) 60초 릴스 처방전</span>을 함께 보시면, 투자 흐름을 훨씬 쉽고 깊이 있게 파악하실 수 있어 더욱 유용합니다.
            </p>
          </div>
        </div>

        <a
          href="https://www.instagram.com/yourpb_hong/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-4 py-2.5 bg-linear-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shrink-0 text-center shadow-md whitespace-nowrap"
        >
          <span>인스타그램 릴스 보러가기</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </section>
  );
}

