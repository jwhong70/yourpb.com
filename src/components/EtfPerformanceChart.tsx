'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, ReferenceLine, LabelList } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

interface EtfPerformanceChartProps {
  yield_1w: number | null;
  yield_5w: number | null;
  yield_20w: number | null;
  yield_60w: number | null;
  yield_120w: number | null;
  source?: string;
}

const chartConfig = {
  value: {
    label: '수익률',
  },
} satisfies ChartConfig;

export default function EtfPerformanceChart({
  yield_1w,
  yield_5w,
  yield_20w,
  yield_60w,
  yield_120w,
  source,
}: EtfPerformanceChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. 유효한 데이터만 맵핑
  const chartData = useMemo(() => {
    return [
      { name: '1주', value: yield_1w !== null ? Number(yield_1w) : null },
      { name: '5주', value: yield_5w !== null ? Number(yield_5w) : null },
      { name: '20주', value: yield_20w !== null ? Number(yield_20w) : null },
      { name: '60주', value: yield_60w !== null ? Number(yield_60w) : null },
      { name: '120주', value: yield_120w !== null ? Number(yield_120w) : null },
    ].filter((item): item is { name: string; value: number } => item.value !== null);
  }, [yield_1w, yield_5w, yield_20w, yield_60w, yield_120w]);

  if (!mounted) {
    return <div className="h-62.5 bg-black/5 animate-pulse rounded-md" />;
  }

  // 막대 끝 커스텀 레이블 렌더러
  const renderCustomLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (value === undefined || value === null) return null;
    const isPositive = value >= 0;
    const offset = isPositive ? -8 : 14;
    return (
      <text
        x={x + width / 2}
        y={y + offset}
        fill="#000000"
        textAnchor="middle"
        className="text-[10px] font-extrabold font-mono"
      >
        {value > 0 ? '+' : ''}
        {value.toFixed(1)}%
      </text>
    );
  };

  return (
    <div className="lg:h-115 flex flex-col p-6 rounded-none bg-box-bg border border-t-[#000000] border-b-[#000000] border-l-white border-r-white shadow-xl">
      <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-6">
        <div>
          <h4 className="text-lg font-bold text-[#000000] tracking-tight">수익률 성과 지표</h4>
          <p className="text-xs text-[#000000]/60 mt-1">최근 데이터 기준 주요 기간별 운용 수익률 현황입니다.</p>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-50 text-[#000000]/50 text-sm">
          수익률 데이터가 존재하지 않습니다.
        </div>
      ) : (
        /* shadcn/ui 기반 흑백 막대 차트 */
        <div className="relative w-full h-60 pb-2 flex flex-col items-center">
          <ChartContainer config={chartConfig} className="w-full h-full max-w-md">
            <BarChart data={chartData} margin={{ top: 20, right: 10, left: -25, bottom: 5 }}>
              <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-[10px] font-bold"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-[9px] font-bold font-mono"
                tickFormatter={(val) => `${val}%`}
              />
              {/* 0% 중심 기준선 */}
              <ReferenceLine y={0} stroke="#000000" strokeWidth={1.5} />
              
              <Bar dataKey="value" barSize={36} isAnimationActive={false}>
                {chartData.map((entry, index) => {
                  const isPositive = entry.value >= 0;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={isPositive ? '#000000' : '#9E9E9E'}
                    />
                  );
                })}
                <LabelList dataKey="value" content={renderCustomLabel} />
              </Bar>
              <ChartTooltip
                cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => `기간: ${label}`}
                    formatter={(value) => [`${(value as number).toFixed(1)}%`, '수익률']}
                  />
                }
              />
            </BarChart>
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
