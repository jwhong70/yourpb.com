'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Copy, Check, Calculator, Lock, ExternalLink, Info } from 'lucide-react';
import { PortfolioAllocation } from '@/config/portfolio';

interface PriceInfo {
  close: number;
  date?: string;
}

interface PortfolioCalculatorProps {
  portfolioData: PortfolioAllocation[];
  prices: Record<string, PriceInfo>;
  defaultExchangeRate?: number;
}

const PRESET_AMOUNTS = [
  { label: '1천만', value: 10_000_000 },
  { label: '3천만', value: 30_000_000 },
  { label: '5천만', value: 50_000_000 },
  { label: '1억', value: 100_000_000 },
  { label: '3억', value: 300_000_000 },
];

export default function PortfolioCalculator({
  portfolioData,
  prices,
  defaultExchangeRate = 1400,
}: PortfolioCalculatorProps) {
  // 투자금 상태 (기본 5,000만 원)
  const [totalCapital, setTotalCapital] = useState<number>(50_000_000);
  const [inputStr, setInputStr] = useState<string>('50,000,000');
  const [exchangeRate, setExchangeRate] = useState<number>(defaultExchangeRate);
  const [isEditingRate, setIsEditingRate] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  // 투자금 직접 입력 핸들러
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = raw ? parseInt(raw, 10) : 0;
    setTotalCapital(num);
    setInputStr(num ? num.toLocaleString('ko-KR') : '');
  };

  // 프리셋 버튼 클릭 핸들러
  const handlePresetClick = (amount: number) => {
    setTotalCapital(amount);
    setInputStr(amount.toLocaleString('ko-KR'));
  };

  // 비중별 계산 산출
  const calculatedItems = useMemo(() => {
    return portfolioData.map((item) => {
      const targetKrw = Math.round((totalCapital * item.pct) / 100);
      const targetUsd = exchangeRate > 0 ? targetKrw / exchangeRate : 0;

      const priceInfo = item.ticker ? prices[item.ticker] : null;
      const unitPriceUsd = priceInfo?.close || 0;

      // 예상 매수 주수 (USD 금액 / 주간 종가)
      let estimatedShares = 0;
      if (unitPriceUsd > 0 && targetUsd > 0) {
        estimatedShares = Math.floor(targetUsd / unitPriceUsd);
      }

      return {
        ...item,
        targetKrw,
        targetUsd,
        unitPriceUsd,
        priceDate: priceInfo?.date || '',
        estimatedShares,
      };
    });
  }, [portfolioData, totalCapital, exchangeRate, prices]);

  // 개별 종목 매매 요약 복사
  const handleCopySingle = (item: typeof calculatedItems[0], index: number) => {
    const isCash = item.type.includes('현금') || !item.ticker;
    const text = isCash
      ? `[당신의 피비 배분] ${item.type} (${item.pct}%): ${item.targetKrw.toLocaleString('ko-KR')}원 (예수금 대기)`
      : `[당신의 피비 배분] ${item.type}(${item.ticker} ${item.pct}%): ${item.targetKrw.toLocaleString('ko-KR')}원 (약 $${Math.round(item.targetUsd).toLocaleString('en-US')}, 예상 약 ${item.estimatedShares.toLocaleString('ko-KR')}주)`;

    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  // 전체 포트폴리오 매매 요약 복사
  const handleCopyAll = () => {
    const lines = [
      `🏛️ [당신의 피비 모델 포트폴리오 매매 가이드]`,
      `• 총 투자금: ${totalCapital.toLocaleString('ko-KR')}원 (환율: ${exchangeRate.toLocaleString('ko-KR')}원/$)`,
      `────────────────────────────────────`,
    ];

    calculatedItems.forEach((item) => {
      const isCash = item.type.includes('현금') || !item.ticker;
      if (isCash) {
        lines.push(`• ${item.type} (${item.pct}%): ${item.targetKrw.toLocaleString('ko-KR')}원 (예수금 대기)`);
      } else {
        lines.push(
          `• ${item.type} - ${item.name} (${item.ticker} ${item.pct}%):\n` +
          `  - 목표 배분액: ${item.targetKrw.toLocaleString('ko-KR')}원 (약 $${Math.round(item.targetUsd).toLocaleString('en-US')})\n` +
          `  - 예상 매수 수량: 약 ${item.estimatedShares.toLocaleString('ko-KR')}주 (기준가: $${item.unitPriceUsd.toFixed(2)})`
        );
      }
    });

    lines.push(`────────────────────────────────────`);
    lines.push(`※ 주간 종가 기준 예상치이며 실시간 호가 및 환율에 따라 소폭 차이가 발생할 수 있습니다.`);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="bg-white border-2 border-black p-6 sm:p-8 space-y-6 shadow-sm">
      {/* 1. 상단 타이틀 & 내년 차세대 확장 탭 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-black/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 bg-[#D4AF37] rounded-full inline-block" />
            <span className="text-xs font-bold text-[#9E533F] tracking-wider uppercase font-mono">
              PORTFOLIO ALLOCATION CALCULATOR
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-black tracking-tight flex items-center gap-2">
            <Calculator className="w-5 h-5 text-black shrink-0" />
            당신의 피비 모델 포트폴리오 1초 배분 계산기
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            내 투자금을 입력하면 당월 모델 포트폴리오 비중에 맞춘 <b>목표 금액(원화/달러)</b>과 <b>예상 매수 주수</b>를 즉시 산출합니다.
          </p>
        </div>

        {/* 내년 차세대 확장 예고 탭 슬롯 */}
        <div className="inline-flex items-center p-1 bg-gray-100 border border-black/10 rounded-none self-start lg:self-auto text-xs font-bold">
          <button
            type="button"
            className="px-3 py-1.5 bg-black text-white shadow-xs rounded-none transition-all cursor-default"
          >
            간편 비중 계산기
          </button>
          <div
            className="px-3 py-1.5 text-gray-400 flex items-center gap-1.5 select-none rounded-none"
            title="한국투자증권, 키움증권, KB증권 등 Open API 기반 실시간 계좌 잔고 연동 및 스마트 분할 주문 서비스가 2027년 상반기 공개됩니다."
          >
            <Lock className="w-3 h-3 text-gray-400" />
            <span>증권사 계좌 연동</span>
            <span className="text-[9px] bg-gray-200 text-gray-600 px-1 py-0.2 font-mono">2027</span>
          </div>
        </div>
      </div>

      {/* 2. 투자금 입력 및 프리셋 컨트롤 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-gray-50 p-5 border border-black/10">
        <div className="lg:col-span-7 space-y-3">
          <label className="block text-xs font-bold text-gray-700 tracking-wider">
            내 총 투자 금액 (KRW)
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputStr}
              onChange={handleAmountChange}
              placeholder="0"
              className="w-full pl-4 pr-14 py-3 bg-white border-2 border-black text-xl sm:text-2xl font-black font-mono text-black focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
            <span className="absolute right-4 text-sm font-bold text-gray-500">원</span>
          </div>

          {/* 프리셋 버튼 */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-gray-500 mr-1">빠른 선택:</span>
            {PRESET_AMOUNTS.map((p) => {
              const isActive = totalCapital === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handlePresetClick(p.value)}
                  className={`px-3 py-1 text-xs font-bold font-mono transition-all border ${
                    isActive
                      ? 'bg-black text-white border-black shadow-xs'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 환율 정보 박스 */}
        <div className="lg:col-span-5 bg-white p-4 border border-black/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600">기준 적용 환율</span>
            <button
              type="button"
              onClick={() => setIsEditingRate(!isEditingRate)}
              className="text-[11px] font-bold text-[#9E533F] hover:underline"
            >
              {isEditingRate ? '완료' : '환율 변경'}
            </button>
          </div>
          {isEditingRate ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(Number(e.target.value) || 1400)}
                className="w-28 px-2 py-1 border border-black font-mono text-sm font-bold"
              />
              <span className="text-xs text-gray-500">원/$</span>
            </div>
          ) : (
            <div className="text-xl font-black font-mono text-black">
              1$ = {exchangeRate.toLocaleString('ko-KR')} 원
            </div>
          )}
          <p className="text-[11px] text-gray-500 leading-tight">
            미국 달러 ETF는 위 기준 환율로 자동 환산되어 목표 금액과 수량이 계산됩니다.
          </p>
        </div>
      </div>

      {/* 3. 자산군별 배분 결과 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {calculatedItems.map((item, idx) => {
          const isCash = item.type.includes('현금') || !item.ticker;
          const isCopied = copiedIndex === idx;

          return (
            <div
              key={item.type}
              className="bg-white border border-black p-4 flex flex-col justify-between hover:border-[#D4AF37] transition-all group"
            >
              {/* 상단: 자산군 & 비중 뱃지 */}
              <div>
                <div className="flex items-center justify-between border-b border-black/10 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-bold text-black">{item.type}</span>
                  </div>
                  <span className="text-xs font-black font-mono bg-black text-white px-2 py-0.5">
                    {item.pct}%
                  </span>
                </div>

                {/* 종목명 & 티커 */}
                <div className="mb-3">
                  {item.ticker ? (
                    <Link
                      href={`/etf/${item.ticker}`}
                      className="inline-flex items-center gap-1 font-mono text-xs font-extrabold text-[#D4AF37] hover:underline"
                    >
                      <span>{item.ticker}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  ) : (
                    <span className="text-xs font-mono text-gray-400">KRW CASH</span>
                  )}
                  <p className="text-xs font-semibold text-gray-800 line-clamp-1 mt-0.5" title={item.name}>
                    {item.name}
                  </p>
                </div>

                {/* 목표 배분 금액 (원화 & 달러) */}
                <div className="bg-gray-50 p-2.5 border border-black/5 space-y-1 mb-3">
                  <div className="text-[10px] font-bold text-gray-500">목표 배분 금액</div>
                  <div className="text-base sm:text-lg font-black font-mono text-black">
                    {item.targetKrw.toLocaleString('ko-KR')} <span className="text-xs font-normal">원</span>
                  </div>
                  {!isCash && (
                    <div className="text-xs font-bold font-mono text-gray-600">
                      약 ${Math.round(item.targetUsd).toLocaleString('en-US')}
                    </div>
                  )}
                </div>

                {/* 예상 매수 수량 (하나증권 등 수량 입력 전용 HTS 대응) */}
                {!isCash ? (
                  <div className="border-t border-dashed border-black/15 pt-2 space-y-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-gray-600">예상 매수 수량</span>
                      <span className="font-mono font-black text-sm text-[#9E533F]">
                        약 {item.estimatedShares.toLocaleString('ko-KR')} 주
                      </span>
                    </div>
                    {item.unitPriceUsd > 0 && (
                      <p className="text-[9.5px] text-gray-400 text-right font-mono">
                        (주간 종가 ${item.unitPriceUsd.toFixed(2)} 기준)
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="border-t border-dashed border-black/15 pt-2">
                    <span className="text-[11px] font-semibold text-gray-500">
                      변동성 대비 현금성 예수금 보관
                    </span>
                  </div>
                )}
              </div>

              {/* 하단 개별 복사 버튼 */}
              <div className="pt-3 mt-3 border-t border-black/10 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleCopySingle(item, idx)}
                  className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1 transition-colors"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-green-600">복사됨</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>복사</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. 하단 전체 요약 복사 버튼 & 친절한 HTS 실전 가이드 */}
      <div className="pt-2 border-t border-black/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* HTS/MTS 팁 안내문 */}
        <div className="flex items-start gap-2 max-w-2xl text-[11px] text-gray-600 leading-relaxed">
          <Info className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
          <div>
            <b>HTS/MTS 실전 주문 가이드</b>:
            <ul className="list-disc pl-3.5 mt-0.5 space-y-0.5 text-gray-500">
              <li><b>하나증권 등 수량 입력 HTS</b>: 계산기 두드릴 필요 없이 위 <b>'예상 매수 수량'</b>을 주문창에 그대로 입력하시면 됩니다.</li>
              <li><b>토스·키움·미래에셋 등 금액 주문 앱</b>: 산출된 <b>'목표 배분 금액'</b>을 입력하시면 시스템이 실시간으로 수량을 맞춰줍니다.</li>
              <li>※ 당사 시세는 주간 종가 기준이므로, 실시간 호가 및 환율 변동에 따라 1~2주 내외의 체결 오차가 발생할 수 있습니다.</li>
            </ul>
          </div>
        </div>

        {/* 전체 매매 요약 복사 버튼 */}
        <button
          type="button"
          onClick={handleCopyAll}
          className="w-full sm:w-auto px-5 py-3 bg-black text-white hover:bg-[#D4AF37] hover:text-black font-extrabold text-xs sm:text-sm tracking-tight flex items-center justify-center gap-2 transition-all shrink-0 border border-black shadow-xs"
        >
          {copiedAll ? (
            <>
              <Check className="w-4 h-4 text-green-400" />
              <span>전체 주문 요약 복사 완료!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>전체 포트폴리오 매매 요약 복사</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
