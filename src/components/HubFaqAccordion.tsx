'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface HubFaqAccordionProps {
  type: 'etf' | 'stock';
  isLoggedIn?: boolean;
}

export default function HubFaqAccordion({
  type,
  isLoggedIn = false,
}: HubFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // 첫 번째 FAQ 기본 오픈

  const isEtf = type === 'etf';

  // 정중하고 품격 있는 피비 전담 경어체 적용
  const faqList = isEtf
    ? [
        {
          question: '글로벌 ETF를 고를 때 가장 먼저 무엇을 확인해야 할까요?',
          answer:
            '단순한 과거 수익률보다는 ETF 속 "실제 구성 종목과 편입 비중", 총보수율, 그리고 배당의 지속성을 먼저 꼼꼼히 확인해 보시기를 권해 드립니다. 당신의 피비에서는 원하시는 종목을 클릭하시면 상위 10대 편입 종목 엑스레이를 언제든 직접 확인해 보실 수 있습니다.',
        },
        {
          question: '회원가입을 진행하면 어떤 무료 혜택을 이용할 수 있나요?',
          answer:
            '간편 무료 회원가입만으로도 관심 있는 글로벌 ETF를 나만의 찜 목록(위시리스트)에 담아두고, 시장 지표와 차트 및 기본 편입 비중을 제한 없이 편리하게 모니터링하실 수 있도록 지원해 드립니다.',
        },
        {
          question: '고화질 원본 리포트 소장과 프리미엄 멤버십은 어떻게 이용하나요?',
          answer:
            '고화질 정밀 리서치 원본 PDF 파일 다운로드와 거시 경제 국면에 맞춘 월간 포트폴리오 전략 처방은 "프리미엄 멤버십" 회원 전용 유료 소장 혜택입니다. 상단 멤버십 메뉴에서 합리적인 정기 구독 혜택을 자세히 확인해 보실 수 있습니다.',
        },
      ]
    : [
        {
          question: '개별 우량주 진단은 ETF 투자와 어떤 관련이 있나요?',
          answer:
            '1,000여 개 글로벌 대형 우량주 리서치는 고객님께서 보유하신 ETF 속에 어떤 기업이 얼마나 담겨 있는지 투시(X-Ray)하고, 이미 보유 중이신 핵심 주식을 정밀 케어해 드리기 위한 필수 지원 도구입니다.',
        },
        {
          question: '대가들의 투자 관점과 신뢰도 평가는 어떻게 활용하나요?',
          answer:
            '워런 버핏, 찰리 멍거 등 21인의 글로벌 대가들의 투자 철학을 현대적 팩터로 계량화하여 단기 테마가 아닌 펀더멘털과 안전마진 관점에서 객관적으로 종목을 점검해 보실 수 있도록 도와드립니다.',
        },
        {
          question: '개별주 정밀 분석 리포트 원본은 어떻게 소장할 수 있나요?',
          answer:
            '웹 화면의 기본 밸류에이션 지표는 무료로 확인하실 수 있으며, 정밀 리서치 원본 PDF 파일은 프리미엄 멤버십 가입 후 유료 소장 및 다운로드 혜택으로 편리하게 이용하실 수 있습니다.',
        },
      ];

  // Google 공식 FAQPage Schema.org 구조화 데이터
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqList.map((item) => ({
      '@type': 'Question',
      name: `고객 질문: ${item.question}`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `당신의 피비 답변: ${item.answer}`,
      },
    })),
  };

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="mt-14 mb-8 bg-[#141414] border border-white/10 rounded-none p-5 sm:p-8">
      {/* FAQPage JSON-LD 스키마 주입 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            당신의 피비와 고객의 릴스 톡 (FAQ)
          </h2>
        </div>
        <span className="text-xs text-gray-400">
          3050 스마트 자기주도 투자자를 위한 핵심 가이드
        </span>
      </div>

      <div className="divide-y divide-white/5 mb-8">
        {faqList.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="py-4 first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() => toggleAccordion(idx)}
                className="w-full flex items-center justify-between text-left gap-4 group"
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-none shrink-0 mt-0.5">
                    고객
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-gray-200 group-hover:text-[#D4AF37] transition-colors">
                    {item.question}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 mt-1 ${
                    isOpen ? 'rotate-180 text-[#D4AF37]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="mt-3 text-xs sm:text-sm text-gray-300 leading-relaxed pl-3.5 border-l-2 border-[#D4AF37]/60 bg-black/25 p-3">
                  <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-bold text-[#D4AF37]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>당신의 피비</span>
                  </div>
                  <p className="whitespace-pre-line">{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 회원가입 및 멤버십 안내 전환 앵커 (정중한 경어체 적용) */}
      <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-linear-to-r from-black/40 via-[#1A1A1A] to-black/40 p-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <div className="text-xs sm:text-sm text-gray-300">
            {!isLoggedIn ? (
              <span>
                무료 회원가입으로 <strong>관심 종목 찜하기</strong>를 시작하시고,{' '}
                <strong>프리미엄 멤버십</strong>으로 정밀 리서치 원본 PDF를 유료 소장해 보세요.
              </span>
            ) : (
              <span>
                매월 업데이트되는 <strong>정밀 리서치 원본 PDF 유료 소장</strong>은 프리미엄 멤버십 회원 전용 혜택입니다.
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-bold text-gray-200 hover:text-white bg-white/5 hover:bg-white/10 transition-colors text-center border border-white/10"
              >
                무료 회원가입
              </Link>
              <Link
                href="/subscribe"
                className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-bold text-black bg-[#D4AF37] hover:bg-[#c29f2f] transition-colors flex items-center justify-center gap-1.5"
              >
                <span>멤버십 혜택보기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          ) : (
            <Link
              href="/subscribe"
              className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-bold text-black bg-[#D4AF37] hover:bg-[#c29f2f] transition-colors flex items-center justify-center gap-1.5"
            >
              <span>멤버십 혜택보기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
