'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Compass, PieChart, Layers, ScanText } from 'lucide-react';

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
      desc: '자산배분 비중에 맞추어 미국 및 국내 상장 글로벌 대표 ETF(시장지수·배당성장·채권)를 둘러보고 포트폴리오를 채웁니다.',
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
    <section className="bg-linear-to-b from-[#181818] via-[#121212] to-[#0A0A0A] border border-white/10 rounded-none p-6 sm:p-8 shadow-xl">
      {/* 상단 헤더: 고객의 직관적 질문 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-none bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
            <Compass className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>이 사이트 대체 어떻게 쓰는 건가요?</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              당신의 피비와 함께하는 3단계 스마트 탑다운(Top-Down) 자산관리 순서
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 border border-[#D4AF37]/20 w-fit">
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
              className="bg-black/40 border border-white/10 hover:border-[#D4AF37]/60 transition-all duration-200 p-5 flex flex-col justify-between group"
            >
              <div>
                {/* 상단 스텝 라벨 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 font-mono">
                      STEP {idx + 1}
                    </span>
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-none"
                      style={{
                        backgroundColor: `${item.accentColor}15`,
                        color: item.accentColor,
                        border: `1px solid ${item.accentColor}30`,
                      }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <Icon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </div>

                {/* 핵심 한줄 코칭 */}
                <h3 className="text-sm sm:text-base font-bold text-white mb-2 leading-snug group-hover:text-[#D4AF37] transition-colors">
                  {item.title}
                </h3>

                {/* 세부 설명 */}
                <p className="text-xs text-gray-400 leading-relaxed mb-5">
                  {item.desc}
                </p>
              </div>

              {/* 액션 바로가기 링크 */}
              <Link
                href={item.href}
                className="inline-flex items-center justify-between w-full pt-3 border-t border-white/10 text-xs font-bold text-gray-300 group-hover:text-[#D4AF37] transition-colors"
              >
                <span>{item.linkText}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

