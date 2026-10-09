'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, History, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { PB_PORTFOLIO_HISTORY, RebalancingHistoryItem } from '@/config/portfolio-history';

export default function PortfolioHistoryTimeline() {
  const [expandedId, setExpandedId] = useState<string | null>(
    PB_PORTFOLIO_HISTORY.length > 0 ? PB_PORTFOLIO_HISTORY[0].id : null
  );

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  if (!PB_PORTFOLIO_HISTORY || PB_PORTFOLIO_HISTORY.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-black/10 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-gray-900" />
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-gray-900 select-none">
            포트폴리오 리밸런싱 히스토리
          </h3>
        </div>
        <span className="text-xs sm:text-sm font-semibold text-gray-500 font-mono">
          총 {PB_PORTFOLIO_HISTORY.length}회 매매 집행
        </span>
      </div>

      <div className="space-y-4">
        {PB_PORTFOLIO_HISTORY.map((item: RebalancingHistoryItem, idx: number) => {
          const isExpanded = expandedId === item.id;
          const sellCount = item.trades.filter(t => t.action.includes('매도') || t.action.includes('축소')).length;
          const buyCount = item.trades.filter(t => t.action.includes('매수') || t.action.includes('편입') || t.action.includes('확대')).length;

          return (
            <div
              key={item.id}
              className="border border-black bg-white shadow-xs transition-all duration-200"
            >
              {/* 타임라인 헤더 (클릭 시 아코디언 토글) */}
              <button
                type="button"
                onClick={() => toggleExpand(item.id)}
                className="w-full text-left p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 transition-colors select-none"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span className="px-2.5 py-1 bg-black text-white text-xs font-mono font-bold shrink-0">
                    {item.date}
                  </span>
                  <div>
                    <h4 className="text-base font-extrabold text-gray-900 leading-snug">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-600 font-medium">
                      {sellCount > 0 && (
                        <span className="text-[#D60016] font-bold flex items-center gap-0.5">
                          <TrendingDown className="w-3.5 h-3.5" /> 매도 {sellCount}건
                        </span>
                      )}
                      {sellCount > 0 && buyCount > 0 && <span className="text-gray-300">|</span>}
                      {buyCount > 0 && (
                        <span className="text-[#007C1F] font-bold flex items-center gap-0.5">
                          <TrendingUp className="w-3.5 h-3.5" /> 매수 {buyCount}건
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-xs font-bold text-gray-500">
                    {isExpanded ? '상세 접기' : '매매 내역 보기'}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-700" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-700" />
                  )}
                </div>
              </button>

              {/* 타임라인 상세 내용 */}
              {isExpanded && (
                <div className="p-4 sm:p-6 border-t border-black/10 bg-[#F9F8F6] space-y-5">
                  {/* 리밸런싱 요약 설명 */}
                  <div className="p-3.5 sm:p-4 bg-white border border-black/10 border-l-4 border-l-black shadow-2xs">
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-relaxed">
                      💡 {item.summary}
                    </p>
                  </div>

                  {/* 매매 실행 주문 목록 표 */}
                  <div className="space-y-2">
                    <div className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                      실행 주문 내역 (Execution Orders)
                    </div>
                    <div className="space-y-2">
                      {item.trades.map((trade, tIdx) => {
                        const isSell = trade.action.includes('매도') || trade.action.includes('축소');
                        const diffPct = trade.newPct - trade.prevPct;

                        return (
                          <div
                            key={`${trade.ticker}-${tIdx}`}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white border ${
                              isSell ? 'border-[#D60016]/40 hover:border-[#D60016]' : 'border-[#007C1F]/40 hover:border-[#007C1F]'
                            } shadow-2xs transition-colors gap-2.5`}
                          >
                            {/* 좌측: 액션 뱃지 + 티커 + 종목명 */}
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`px-2 py-0.5 text-xs font-black shrink-0 ${
                                  isSell
                                    ? 'bg-[#D60016] text-white'
                                    : 'bg-[#007C1F] text-white'
                                }`}
                              >
                                {trade.action}
                              </span>
                              
                              {trade.ticker ? (
                                <Link
                                  href={`/etf/${trade.ticker}`}
                                  className="px-2 py-0.5 border border-black text-xs font-mono font-extrabold text-black hover:bg-black hover:text-white transition-colors"
                                >
                                  {trade.ticker}
                                </Link>
                              ) : (
                                <span className="text-xs text-gray-400 font-mono font-bold">CASH</span>
                              )}

                              <span className="text-xs sm:text-sm font-bold text-gray-900 truncate max-w-50 sm:max-w-80">
                                {trade.name}
                              </span>
                            </div>

                            {/* 우측: 국가 구분 + 변경 전후 편입비 */}
                            <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-gray-100 sm:border-0 pt-2 sm:pt-0">
                              <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5">
                                {trade.country}
                              </span>
                              <div className="flex items-center gap-2 font-mono">
                                <span className="text-xs text-gray-500 font-bold">{trade.prevPct}%</span>
                                <ArrowRight className="w-3 h-3 text-gray-400" />
                                <span className="text-sm font-black text-black">{trade.newPct}%</span>
                                <span
                                  className={`text-xs font-bold ${
                                    isSell ? 'text-[#D60016]' : 'text-[#007C1F]'
                                  }`}
                                >
                                  ({diffPct > 0 ? `+${diffPct}%p` : `${diffPct}%p`})
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 변경 전후 포트폴리오 비교 문자열 칩 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                    <div className="p-2.5 bg-white border border-black/10">
                      <span className="font-bold text-gray-500 block mb-1">기존 비중</span>
                      <span className="text-gray-800 font-semibold">{item.previousPortfolio}</span>
                    </div>
                    <div className="p-2.5 bg-white border border-black/10">
                      <span className="font-bold text-gray-500 block mb-1">변경 후 비중</span>
                      <span className="text-black font-extrabold">{item.newPortfolio}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
