'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AllocationItem {
  allocation_type: string;
  category_name: string;
  allocation_pct: number;
}

interface EtfAllocationChartsProps {
  allocations: AllocationItem[];
}

// 프리미엄 색상 팔레트
const COLOR_PALETTE = [
  '#F96D69', // 코랄
  '#5BC2E7', // 스카이
  '#FFD735', // 옐로우
  '#BAD739', // 라임
  '#987956', // 골드
  '#FFABC2', // 핑크
  '#3AAD67', // 그린
  '#8E8C8A', // 실버
];
const OTHER_COLOR = '#334155'; // 기타 항목용 슬레이트 그레이

export default function EtfAllocationCharts({ allocations }: EtfAllocationChartsProps) {
  // 1. 타입별 데이터 그룹화 및 기타 항목 계산
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
      // 소수점 둘째 자리까지 안전하게 가공
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

  const devData = getGroupedData('개발단계');
  const countryData = getGroupedData('국가');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <DoughnutChartWidget title="개발단계별 비중" data={devData} />
      <DoughnutChartWidget title="국가별 비중" data={countryData} />
    </div>
  );
}

interface DoughnutChartWidgetProps {
  title: string;
  data: { name: string; value: number }[];
}

function DoughnutChartWidget({ title, data }: DoughnutChartWidgetProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // SVG 파라미터
  const cx = 100;
  const cy = 100;
  const rOuter = 85;
  const rInner = 55;

  // 데이터의 총합 (100% 보장되지만 안전장치로 계산)
  const total = data.reduce((acc, curr) => acc + curr.value, 0) || 100;

  // 누적 각도를 추적하여 호 조각 생성
  let currentAngle = 0;
  const segments = data.map((item, idx) => {
    const angleSize = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angleSize;
    currentAngle = endAngle;

    // 색상 지정
    const fill = item.name === '기타' 
      ? OTHER_COLOR 
      : COLOR_PALETTE[idx % COLOR_PALETTE.length];

    return {
      ...item,
      startAngle,
      endAngle,
      fill,
      index: idx,
    };
  });

  // 호(Arc) 패스 계산 헬퍼 함수
  const getDoughnutPath = (
    startX: number,
    startY: number,
    startAngle: number,
    endAngle: number,
    isHovered: boolean
  ) => {
    // 호버 시 살짝 확장 효과
    const outerR = isHovered ? rOuter + 4 : rOuter;
    const innerR = isHovered ? rInner - 2 : rInner;

    const rad = (degree: number) => ((degree - 90) * Math.PI) / 180;
    const sRad = rad(startAngle);
    
    // Next.js 렌더링 시 정밀도 소실 및 오차 방지
    let diff = endAngle - startAngle;
    if (diff >= 360) diff = 359.999;
    const eRad = rad(startAngle + diff);

    const x1 = (cx + outerR * Math.cos(sRad)).toFixed(4);
    const y1 = (cy + outerR * Math.sin(sRad)).toFixed(4);
    const x2 = (cx + outerR * Math.cos(eRad)).toFixed(4);
    const y2 = (cy + outerR * Math.sin(eRad)).toFixed(4);

    const x3 = (cx + innerR * Math.cos(eRad)).toFixed(4);
    const y3 = (cy + innerR * Math.sin(eRad)).toFixed(4);
    const x4 = (cx + innerR * Math.cos(sRad)).toFixed(4);
    const y4 = (cy + innerR * Math.sin(sRad)).toFixed(4);

    const largeArcFlag = diff > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  // 중앙에 표시할 정보 선택
  const activeSegment = hoveredIdx !== null ? segments[hoveredIdx] : null;
  // 기본으로 가장 비중이 큰 항목을 중앙에 보여줌
  const defaultSegment = segments.length > 0 ? segments[0] : null;
  const displaySegment = activeSegment || defaultSegment;

  return (
    <div className="flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl transition-all hover:border-white/20">
      <h3 className="text-lg font-bold text-white mb-6 select-none tracking-tight">
        {title}
      </h3>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-50 text-white/40 text-sm">
          데이터가 존재하지 않습니다.
        </div>
      ) : (
        <>
          {/* SVG Doughnut Chart */}
          <div className="relative w-50 h-50 mb-6">
            <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
              <g className="cursor-pointer">
                {segments.map((seg, idx) => {
                  const isHovered = hoveredIdx === idx;
                  return (
                    <path
                      key={idx}
                      d={getDoughnutPath(cx, cy, seg.startAngle, seg.endAngle, isHovered)}
                      fill={seg.fill}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      className="transition-all duration-300 ease-out"
                      style={{
                        filter: isHovered ? `drop-shadow(0 0 8px ${seg.fill}80)` : 'none',
                        opacity: hoveredIdx !== null && !isHovered ? 0.6 : 1,
                      }}
                    />
                  );
                })}
              </g>

              {/* 중앙 정보 텍스트 */}
              {displaySegment && (
                <g className="pointer-events-none select-none">
                  <text
                    x={cx}
                    y={cy - 8}
                    textAnchor="middle"
                    className="text-[11px] font-bold text-white/50"
                  >
                    {hoveredIdx !== null ? '선택 항목' : '최대 비중'}
                  </text>
                  <text
                    x={cx}
                    y={cy + 12}
                    textAnchor="middle"
                    className="text-base font-extrabold text-white truncate max-w-20"
                    style={{ fontSize: displaySegment.name.length > 5 ? '13px' : '15px' }}
                  >
                    {displaySegment.name}
                  </text>
                  <text
                    x={cx}
                    y={cy + 28}
                    textAnchor="middle"
                    className="text-xs font-bold text-yellow-accent"
                  >
                    {displaySegment.value.toFixed(1)}%
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* 범례 리스트 */}
          <div className="w-full space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
            {segments.map((seg, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    isHovered ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: seg.fill }}
                    />
                    <span className="text-sm font-semibold text-white/80 truncate max-w-30">
                      {seg.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-white">
                    {seg.value.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
