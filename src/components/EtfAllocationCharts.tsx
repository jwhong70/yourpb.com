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
  payload?: {
    name?: string;
    value?: number;
    fill?: string;
  };
}

const renderCustomizedLabel = (props: CustomLabelProps) => {
  const {
    cx = 0,
    cy = 0,
    midAngle = 0,
    outerRadius = 95,
  } = props;

  const rawName = props.name || props.payload?.name || '';
  const rawValue = typeof props.value === 'number' ? props.value : (Number(props.payload?.value) || 0);
  const rawFill = props.fill || props.payload?.fill || '#111111';

  // 비중이 6% 미만인 미세 슬라이스는 내부 공간 협소로 인한 글자 겹침을 방지하기 위해
  // 내부 라벨을 표시하지 않고 하단 범례 및 툴팁으로 안내합니다.
  if (rawValue < 6.0) {
    return null;
  }

  // 슬라이스 비중에 따라 라벨의 방사형 거리 최적화
  const distRatio = rawValue >= 35 ? 0.52 : rawValue >= 15 ? 0.58 : 0.65;
  const radius = outerRadius * distRatio;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const isGold = rawFill.toUpperCase() === '#D4AF37';
  const textColor = isGold ? '#111111' : '#FFFFFF';

  return (
    <text
      x={x}
      y={y}
      fill={textColor}
      textAnchor="middle"
      dominantBaseline="central"
      className="select-none pointer-events-none"
    >
      <tspan x={x} dy="-0.35em" fontSize="11px" className="font-extrabold select-none">
        {rawName}
      </tspan>
      <tspan x={x} dy="1.25em" fontSize="9.5px" className="font-bold select-none">
        {rawValue.toFixed(1)}%
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
    <div className="flex flex-col items-center p-4 sm:p-5 rounded-none bg-box-bg border border-t-[#000000] border-b-[#000000] border-l-white border-r-white shadow-md transition-all justify-between w-full">
      <div className="w-full flex flex-col items-center">
        <h3 className="text-base sm:text-lg font-bold text-[#000000] mb-2 select-none tracking-tight">
          {title}
        </h3>

        {data.length === 0 ? (
          <div className="flex items-center justify-center h-60 text-gray-400 text-sm font-medium">
            데이터가 존재하지 않습니다.
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* 360도 완벽한 솔리드 파이 차트 */}
            <div className="relative w-full h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={segments}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={95}
                    paddingAngle={0.5}
                    dataKey="value"
                    nameKey="name"
                    startAngle={90}
                    endAngle={-270}
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

            {/* 하단 범례 배지 리스트 (미세 슬라이스 포함 전 항목 가시화) */}
            <div className="w-full grid grid-cols-2 gap-x-3 gap-y-1.5 pt-2.5 border-t border-black/10 mt-1">
              {segments.map((seg, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 px-1.5 bg-[#F9F8F6]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-none shrink-0"
                      style={{ backgroundColor: seg.fill }}
                    />
                    <span className="font-semibold text-gray-800 truncate" title={seg.name}>
                      {seg.name}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900 ml-1.5 shrink-0">
                    {seg.value.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {source && (
        <div className="w-full text-right text-[10px] text-gray-400 font-mono mt-2 mr-1 select-none">
          source: {source}
        </div>
      )}
    </div>
  );
}
