'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
}

interface TickerFaqAccordionProps {
  ticker: string;
  name?: string;
  isEtf?: boolean;
  items?: FaqItem[];
}

export default function TickerFaqAccordion({
  ticker,
  name,
  isEtf = true,
  items,
}: TickerFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // 기본 FAQ (정중하고 품격 있는 피비 전담 존댓말 경어체 적용)
  const defaultItems: FaqItem[] = isEtf
    ? [
        {
          question: `${ticker}의 실제 편입 종목 엑스레이는 어떻게 확인해야 할까요?`,
          answer: `${ticker}의 상위 10개 핵심 편입 종목과 실제 비중은 바로 위 '보유 비중 상위 10종목' 표에서 언제든 편리하게 확인해 보실 수 있습니다. 특정 대형주로의 쏠림이 있는지 점검하는 것이 ETF 간접투자의 가장 중요한 첫걸음입니다.`,
        },
        {
          question: `포트폴리오에 ${ticker}를 편입할 때 비중은 어떻게 가져가는 것이 좋을까요?`,
          answer: `특정 종목에 과도하게 편입하시기보다는, 거시 경제 국면(금리·유동성)과 HRP(계층적 위험 패리티) 분산 모델을 고려하여 변동성을 낮추는 방향으로 자산배분을 설계하시기를 권해 드립니다. 매월 초 업데이트되는 '월간 브리프'에서 모델 포트폴리오 가이드를 자세히 참고해 보실 수 있습니다.`,
        },
        {
          question: `이 ETF의 심층 분석 리포트 원본은 어떻게 소장할 수 있나요?`,
          answer: `기본 지표와 핵심 데이터는 웹에서 자유롭게 열람하실 수 있으며, 고화질 정밀 리서치 원본 PDF 파일은 '프리미엄 멤버십' 전용 혜택으로 유료 소장 및 다운로드해 보실 수 있습니다.`,
        },
      ]
    : [
        {
          question: `${name ? `${name}(${ticker})` : ticker} 종목을 볼 때 어떤 지표를 먼저 확인해야 할까요?`,
          answer: `단기 시세 등락보다는 P/E, P/B 밸류에이션과 21인 글로벌 대가들의 투자 관점, 그리고 주가 추이와 수익률 성과 지표를 종합적으로 확인해 보시기를 권해 드립니다.`,
        },
        {
          question: `이 주식이 편입된 대표적인 글로벌 ETF도 함께 확인할 수 있나요?`,
          answer: `개별 우량주는 단독 투자뿐만 아니라 주요 글로벌 ETF의 구성 종목으로 함께 점검하시면 고객님 포트폴리오의 간접 노출 비중을 한눈에 파악하실 수 있도록 지원해 드립니다.`,
        },
        {
          question: `정밀 진단 원본 리포트는 어디서 다운로드받을 수 있나요?`,
          answer: `웹페이지의 기본 분석 내용은 언제든 확인하실 수 있으며, 정밀 리서치 원본 PDF 파일은 '프리미엄 멤버십' 가입 후 유료 소장 혜택으로 편리하게 다운로드해 보실 수 있습니다.`,
        },
      ];

  const faqList = items && items.length > 0 ? items : defaultItems;

  // Google FAQPage Schema.org 구조화 데이터
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
    <section className="mt-12 mb-8 bg-white border border-black/10 rounded-none p-5 sm:p-7 shadow-xs">
      {/* FAQPage JSON-LD 스키마 주입 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="flex items-center gap-2 mb-5">
        <HelpCircle className="w-5 h-5 text-[#9A3412]" />
        <h2 className="text-base sm:text-lg font-bold tracking-tight">
          당신의 피비와 고객의 릴스 톡 (FAQ)
        </h2>
      </div>

      <div className="divide-y divide-black/5">
        {faqList.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="py-3.5 first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() => toggleAccordion(idx)}
                className="w-full flex items-center justify-between text-left gap-4 group"
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-[#9A3412] bg-[#EA580C]/15 px-2 py-0.5 border border-[#EA580C]/30 rounded-none shrink-0 mt-0.5">
                    고객
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-[#9A3412] transition-colors">
                    {item.question}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 mt-1 ${
                    isOpen ? 'rotate-180 text-[#9A3412]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="mt-2.5 text-xs sm:text-sm text-gray-700 leading-relaxed pl-3 border-l-2 border-[#EA580C] bg-[#F9F8F6] p-3">
                  <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-[#9A3412]">
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
    </section>
  );
}
