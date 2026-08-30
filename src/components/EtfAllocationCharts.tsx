'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

export interface AllocationItem {
  allocation_type: string;
  category_name: string;
  allocation_pct: number;
}

interface EtfAllocationChartsProps {
  allocations: AllocationItem[];
  source?: string;
}

// 명도 순서 흑백 모노크롬 그라데이션 팔레트
const MONO_PALETTE = [
  '#000000', // 1위 (검은색)
  '#262626', // 2위 (차콜)
  '#4D4D4D', // 3위 (짙은 회색)
  '#737373', // 4위 (미디엄 그레이)
  '#999999', // 5위 (그레이)
  '#B3B3B3', // 6위 (라이트 그레이)
  '#CCCCCC', // 7위 (실버)
  '#E5E5E5', // 8위
  '#F2F2F2', // 9위
];

export default function EtfAllocationCharts({ allocations, source }: EtfAllocationChartsProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-75 bg-black/5 animate-pulse rounded-md" />;
  }

  // 타입별 데이터 그룹화 및 기타 항목 계산
  const getGroupedData = (type: string) => {
    const filtered = allocations.filter((item) => item.allocation_type === type);
    
    // 비중 합계 계산
    const sum = filtered.reduce((acc, curr) => acc + curr.allocation_pct, 0);
    
    let result = filtered.map((item) => ({
      name: item.category_name,
      value: item.allocation_pct,
    }));

    // 비중의 합이 100% 이하인 경우 '기타' 추가
    if (sum < 100 && sum > 0) {
      const rest = 100 - sum;
      result.push({
        name: '기타',
        value: parseFloat(rest.toFixed(4)),
      });
    }

    // 내림차순 정렬 (기타는 항상 맨 마지막에 배치)
    result.sort((a, b) => {
      if (a.name === '기타') return 1;
      if (b.name === '기타') return -1;
      return b.value - a.value;
    });

    return result;
  };

  const countryData = getGroupedData('국가');
  const sectorData = getGroupedData('섹터');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
      <DoughnutChartWidget title="국가별 비중" data={countryData} source={source} />
      <DoughnutChartWidget title="섹터 비중" data={sectorData} source={source} />
    </div>
  );
}

interface DoughnutChartWidgetProps {
  title: string;
  data: { name: string; value: number }[];
  source?: string;
}

function DoughnutChartWidget({ title, data, source }: DoughnutChartWidgetProps) {
  const chartConfig = {} satisfies ChartConfig;

  // 범례 및 파이에 맵핑할 색상 결정
  const segments = data.map((item, idx) => {
    const fill = item.name === '기타'
      ? '#808080' // 기타 항목은 일관된 중간 회색
      : MONO_PALETTE[idx % MONO_PALETTE.length];
    return {
      ...item,
      fill,
    };
  });

  return (
    <div className="lg:h-115 flex flex-col items-center p-6 rounded-none bg-box-bg border border-t-[#000000] border-b-[#000000] border-l-white border-r-white shadow-xl transition-all justify-between w-full">
      <div className="w-full flex flex-col items-center">
        <h3 className="text-lg font-bold text-[#000000] mb-6 select-none tracking-tight">
          {title}
        </h3>

        {data.length === 0 ? (
          <div className="flex items-center justify-center h-50 text-white/40 text-sm">
            데이터가 존재하지 않습니다.
          </div>
        ) : (
          <>
            {/* Recharts Pie 도넛 차트 */}
            <div className="relative w-50 h-50 mb-6">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <PieChart>
                  <Pie
                    data={segments}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={1}
                    dataKey="value"
                    isAnimationActive={false}
                  >
                    {segments.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.fill}
                        stroke="#000000"
                        strokeWidth={0.5}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        nameKey="name"
                        hideLabel
                        formatter={(value, name) => [`${(value as number).toFixed(1)}%`, name]}
                      />
                    }
                  />
                </PieChart>
              </ChartContainer>
            </div>

            {/* 범례 리스트 (글자 크기 text-base, 두께 font-semibold 통일) */}
            <div className="w-full space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
              {segments.map((seg, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-none transition-colors hover:bg-black/5"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: seg.fill }}
                    />
                    <span className="text-base font-semibold text-gray-900 truncate max-w-30">
                      {seg.name}
                    </span>
                  </div>
                  <span className="text-base font-semibold text-gray-900">
                    {seg.value.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {source && (
        <div className="w-full text-right text-[10px] text-gray-500 font-mono mt-2 mr-2 select-none">
          source: {source}
        </div>
      )}
    </div>
  );
}
