'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

export interface PriceItem {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface StockCandleChartProps {
  prices: PriceItem[];
  source?: string;
}

const chartConfig = {
  openClose: {
    label: '주가 (시가/종가)',
  },
} satisfies ChartConfig;

export default function StockCandleChart({ prices, source }: StockCandleChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. 데이터를 날짜 오름차순(오래된 날짜 -> 최신 날짜)으로 정렬 및 레인지 데이터 가공
  const chartData = useMemo(() => {
    return [...prices]
      .map((p) => {
        const open = Number(p.open);
        const close = Number(p.close);
        const high = Number(p.high);
        const low = Number(p.low);
        const isBullish = close >= open;

        return {
          date: p.date,
          open,
          high,
          low,
          close,
          // Recharts 범위 바용 배열 데이터 [하한, 상한]
          openClose: isBullish ? [open, close] : [close, open],
          lowHigh: [low, high],
          isBullish,
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [prices]);

  if (!mounted) {
    return <div className="h-87.5 bg-black/5 animate-pulse rounded-md" />;
  }

  return (
    <div className="flex flex-col h-full p-6 rounded-none bg-box-bg border border-t-[#000000] border-b-[#000000] border-l-white border-r-white shadow-xl">
      {/* 타이틀 영역 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-[#000000] tracking-tight">주가 추이 (120주 주봉)</h3>
          <p className="text-xs text-[#000000]/60 mt-1">마우스를 올려서 상세 주가 정보를 확인하실 수 있습니다.</p>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-80 text-[#000000]/50 text-sm">
          가격 데이터가 존재하지 않습니다.
        </div>
      ) : (
        /* shadcn/ui 기반 흑백 캔들 차트 뷰포트 */
        <div className="relative w-full h-80 pb-2">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <ComposedChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(2, 7)}
                className="text-[9px] font-medium"
              />
              <YAxis
                domain={['auto', 'auto']}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-[9px] font-medium"
              />
              {/* 캔들 꼬리선: 얇은 검은색 막대 */}
              <Bar
                dataKey="lowHigh"
                fill="#000000"
                barSize={1}
                className="opacity-75"
                isAnimationActive={false}
              />
              {/* 캔들 몸통: 상승(흰색 채움 + 검은 테두리), 하락(검은색 솔리드) */}
              <Bar dataKey="openClose" barSize={8} isAnimationActive={false}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isBullish ? '#ffffff' : '#000000'}
                    stroke="#000000"
                    strokeWidth={1}
                  />
                ))}
              </Bar>
              <ChartTooltip
                cursor={{ stroke: 'rgba(0, 0, 0, 0.1)', strokeWidth: 1 }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => `일자: ${value}`}
                    formatter={(_, __, item) => {
                      const payload = item.payload;
                      return (
                        <div className="flex flex-col gap-1 text-[11px] font-semibold text-gray-900">
                          <div>시가: {payload.open.toLocaleString()}원</div>
                          <div>고가: {payload.high.toLocaleString()}원</div>
                          <div>저가: {payload.low.toLocaleString()}원</div>
                          <div>종가: {payload.close.toLocaleString()}원</div>
                        </div>
                      );
                    }}
                  />
                }
              />
            </ComposedChart>
          </ChartContainer>
        </div>
      )}
      {source && (
        <div className="text-right text-[10px] text-gray-500 font-mono mt-1 mr-2 select-none">
          source: {source}
        </div>
      )}
    </div>
  );
}
