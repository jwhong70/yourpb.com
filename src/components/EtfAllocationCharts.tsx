'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useIsMounted } from '@/hooks/useIsMounted';

export interface AllocationItem {
  allocation_type: string;
  category_name: string;
  allocation_pct: number;
}

interface EtfAllocationChartsProps {
  allocations: AllocationItem[];
  source?: string;
}

// 리포트와 동일한 럭셔리 골드/블랙 테마 팔레트 (1위: 골드, 2위: 블랙, 3위: 차콜그레이, 4위: 슬레이트그레이)
const COLOR_PALETTE = [
  '#D4AF37', // 1위 (골드)
  '#111111', // 2위 (블랙)
  '#374151', // 3위 (차콜)
  '#757D8A', // 4위 / 기타 (슬레이트)
];

const RADIAN = Math.PI / 180;

// 파이 차트 슬라이스 내부 라벨 렌더러
interface CustomLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  name?: string;
  value?: number;
  fill?: string;
}

const renderCustomizedLabel = (props: CustomLabelProps) => {
  const {
    cx = 0,
    cy = 0,
    midAngle = 0,
    outerRadius = 110,
    name = '',
    value = 0,
    fill = '#111111',
  } = props;

  // 슬라이스 비중에 따라 라벨의 방사형 거리 최적화
  const distRatio = value >= 40 ? 0.52 : value >= 15 ? 0.60 : 0.68;
  const radius = outerRadius * distRatio;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const isGold = fill.toUpperCase() === '#D4AF37';
  const textColor = isGold ? '#111111' : '#FFFFFF';

  if (value < 4.0) {
    return (
      <text
        x={x}
        y={y}
        fill={textColor}
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[10px] sm:text-[11px] font-bold select-none pointer-events-none"
      >
        {name} {value.toFixed(1)}%
      </text>
    );
  }

  return (
    <text
      x={x}
      y={y}
      fill={textColor}
      textAnchor="middle"
      dominantBaseline="central"
      className="select-none pointer-events-none"
    >
      <tspan x={x} dy="-0.5em" className="text-xs sm:text-sm font-extrabold">
        {name}
      </tspan>
      <tspan x={x} dy="1.25em" className="text-xs sm:text-sm font-bold">
        {value.toFixed(1)}%
      </tspan>
    </text>
  );
};

export default function EtfAllocationCharts({ allocations, source }: EtfAllocationChartsProps) {
  const mounted = useIsMounted();

  if (!mounted) {
    return <div className="h-75 bg-black/5 animate-pulse rounded-none" />;
  }

  // 상위 3개 개별 표시 + 4위부터는 '기타'로 합산 (리포트와 100% 동일한 로직)
  const getGroupedData = (type: string) => {
    const filtered = allocations.filter((item) => item.allocation_type === type);
    
    // 유효 항목 정렬
    const valid = filtered
      .map((item) => ({
        name: item.category_name,
        value: Number(item.allocation_pct) || 0,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    if (valid.length === 0) return [];
    if (valid.length <= 3) return valid;

    const top3 = valid.slice(0, 3);
    const rest = valid.slice(3);
    const restSum = rest.reduce((acc, curr) => acc + curr.value, 0);

    if (restSum > 0.05) {
      top3.push({
        name: '기타',
        value: parseFloat(restSum.toFixed(1)),
      });
    }

    return top3;
  };

  const countryData = getGroupedData('국가');
  const sectorData = getGroupedData('섹터');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      <SolidPieChartWidget title="[국가별 비중]" data={countryData} source={source} />
      <SolidPieChartWidget title="[섹터별 비중]" data={sectorData} source={source} />
    </div>
  );
}

interface SolidPieChartWidgetProps {
  title: string;
  data: { name: string; value: number }[];
  source?: string;
}

function SolidPieChartWidget({ title, data, source }: SolidPieChartWidgetProps) {
  // 색상 매핑: 1위 골드, 2위 블랙, 3위 차콜, 4위 슬레이트
  const segments = data.map((item, idx) => ({
    ...item,
    fill: COLOR_PALETTE[idx % COLOR_PALETTE.length],
  }));

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 rounded-none bg-box-bg border border-t-[#000000] border-b-[#000000] border-l-white border-r-white shadow-md transition-all justify-between w-full">
      <div className="w-full flex flex-col items-center">
        <h3 className="text-base sm:text-lg font-bold text-[#000000] mb-2 sm:mb-4 select-none tracking-tight">
          {title}
        </h3>

        {data.length === 0 ? (
          <div className="flex items-center justify-center h-60 text-gray-400 text-sm font-medium">
            데이터가 존재하지 않습니다.
          </div>
        ) : (
          <div className="relative w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segments}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={105}
                  paddingAngle={0.5}
                  dataKey="value"
                  startAngle={140}
                  isAnimationActive={false}
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {segments.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill}
                      stroke="#FFFFFF"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${(Number(value) || 0).toFixed(1)}%`, name]}
                  contentStyle={{
                    backgroundColor: '#111111',
                    border: '1px solid #D4AF37',
                    borderRadius: '0px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    padding: '6px 10px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                  itemStyle={{ color: '#D4AF37' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      {source && (
        <div className="w-full text-right text-[10px] text-gray-400 font-mono mt-1 mr-1 select-none">
          source: {source}
        </div>
      )}
    </div>
  );
}

