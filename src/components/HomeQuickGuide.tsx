'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

export default function HomeQuickGuide() {
  const [isOpen, setIsOpen] = useState(false);

  const steps = [
    {
      step: '1단계',
      badge: '자산배분',
      title: '먼저 시장의 큰 흐름을 검토하세요',
      desc: '이달의 거시 경제 국면(금리·유동성)과 피비 모델 포트폴리오를 확인하고, 내 자산의 큰 비중(주식·채권·현금) 틀을 잡습니다.',
      linkText: '이달의 거시 국면 검토하기',
      href: '/macro',
      accentColor: '#EA580C',
    },
    {
      step: '2단계',
      badge: 'ETF 탐색',
      title: '그 다음 내 기둥이 될 ETF를 선택하세요',
      desc: '자산배분 비중에 맞추어 미국 및 국내 상장 글로벌 대표 ETF(시장지수·섹터·채권)를 둘러보고 포트폴리오를 채웁니다.',
      linkText: '글로벌 ETF 목록 둘러보기',
      href: '/etf',
      accentColor: '#38BDF8',
    },
    {
      step: '3단계',
      badge: '속 종목 엑스레이',
      title: '마지막으로 ETF 속 종목을 엑스레이 하세요',
      desc: '선택한 ETF 속에 어떤 대형 우량주가 몇 %나 담겨 있는지, 밸류에이션(P/E)과 기간수익률을 정밀하게 투시합니다.',
      linkText: '대표 ETF 엑스레이 투시하기',
      href: '/etf/SPY',
      accentColor: '#4ADE80',
    },
  ];

  return (
    <section className="bg-white border border-black/10 rounded-none shadow-xs overflow-hidden transition-all duration-200">
      {/* 1줄 상단 헤더: 아이콘/불릿 없이 100% 텍스트 여백 확보 (기본 접힘) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-black/5 transition-colors cursor-pointer select-none"
        aria-expanded={isOpen}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm sm:text-base font-extrabold tracking-tight break-keep">
              이 사이트 대체 어떻게 쓰는 건가요?
            </h2>
            <span className="text-[11px] font-bold text-brand-dark bg-brand/15 px-2 py-0.5 border border-brand/30 whitespace-nowrap">
              3단계 투자 가이드
            </span>
          </div>
          <p className="text-xs text-gray-500 hidden sm:block truncate">
            당신의 피비와 함께하는 3단계 스마트 탑다운(Top-Down) 자산관리 순서
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-3">
          <span className="text-xs font-bold text-gray-600">
            {isOpen ? '접기 ▲' : '펼쳐보기 ▼'}
          </span>
        </div>
      </button>

      {/* 펼쳐졌을 때 나타나는 3단계 카드 및 인스타그램 배너 */}
      {isOpen && (
        <div className="p-5 sm:p-7 border-t border-black/10 bg-[#FAF9F5] space-y-6 animate-in fade-in duration-200">
          {/* 3단계 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {steps.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-black/10 hover:border-[#EA580C] hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between group shadow-xs"
              >
                <div>
                  {/* 상단 스텝 라벨 (불릿/아이콘 없이 텍스트 뱃지) */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-500 font-mono">
                      STEP {idx + 1}
                    </span>
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-none"
                      style={{
                        backgroundColor: `${item.accentColor}20`,
                        color: item.accentColor === '#EA580C' ? '#9A3412' : item.accentColor,
                        border: `1px solid ${item.accentColor}40`,
                      }}
                    >
                      {item.badge}
                    </span>
                  </div>

                  {/* 핵심 한줄 코칭 */}
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 leading-snug group-hover:text-[#EA580C] transition-colors break-keep">
                    {item.title}
                  </h3>

                  {/* 세부 설명 */}
                  <p className="text-xs text-gray-600 leading-relaxed mb-5 break-keep">
                    {item.desc}
                  </p>
                </div>

                {/* 액션 바로가기 링크 */}
                <Link
                  href={item.href}
                  className="inline-flex items-center justify-between w-full pt-3 border-t border-black/10 text-xs font-bold text-gray-800 group-hover:text-[#EA580C] transition-colors"
                >
                  <span>{item.linkText}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            ))}
          </div>

          {/* 하단 인스타그램 옴니채널 연계 배너: 불릿/아이콘 없이 1열(Full-Width) 수직 스택 */}
          <div className="flex flex-col gap-3.5 bg-white p-5 sm:p-6 border border-black/10 border-l-4 border-l-[#833AB4] shadow-xs">
            {/* 1행: 뱃지 + 제목 */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-[#833AB4] bg-purple-50 px-2.5 py-0.5 border border-purple-200 whitespace-nowrap">
                인스타그램 매일 저녁 7시 실시간 연재
              </span>
              <strong className="text-sm sm:text-base font-bold text-gray-900 break-keep">
                글과 데이터 표가 다소 낯설거나 어려우신가요?
              </strong>
            </div>

            {/* 2행: 본문 설명 */}
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed break-keep">
              웹 리포트와 함께 인스타그램에서 <span className="text-gray-950 font-bold">매일 저녁 7시(퇴근길) 60초 릴스 처방전</span>을 함께 보시면, 투자 흐름을 훨씬 쉽고 깊이 있게 파악하실 수 있어 더욱 유용합니다.
            </p>

            {/* 3행: 액션 버튼 */}
            <div className="pt-1">
              <a
                href="https://www.instagram.com/yourpb_hong/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1F1F1F] hover:bg-[#2B2B2B] text-white border border-black/20 font-bold text-xs sm:text-sm transition-all shadow-xs whitespace-nowrap cursor-pointer"
              >
                <span>인스타그램 60초 릴스 보러가기</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#EA580C]" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
