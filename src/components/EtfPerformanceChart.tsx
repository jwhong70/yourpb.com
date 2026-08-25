'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface EtfPerformanceChartProps {
  yield_1w: number | null;
  yield_5w: number | null;
  yield_20w: number | null;
  yield_60w: number | null;
  yield_120w: number | null;
}

export default function EtfPerformanceChart({
  yield_1w,
  yield_5w,
  yield_20w,
  yield_60w,
  yield_120w,
}: EtfPerformanceChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // 1. 데이터 리스트 빌드
  const items = [
    { label: '1주 수익률', value: yield_1w, code: '1w' },
    { label: '5주 수익률', value: yield_5w, code: '5w' },
    { label: '20주 수익률', value: yield_20w, code: '20w' },
    { label: '60주 수익률', value: yield_60w, code: '60w' },
    { label: '120주 수익률', value: yield_120w, code: '120w' },
  ];

  // 2. 값 정규화 및 스케일 구하기
  const values = items.map((i) => i.value).filter((v): v is number => v !== null);
  const maxVal = values.length > 0 ? Math.max(...values, 5) : 10;
  const minVal = values.length > 0 ? Math.min(...values, -5) : -10;

  // 절댓값 최대값을 기준으로 차트 상하 대칭 축을 만듦 (Y축 0%가 정중앙에 배치되도록)
  const absMax = Math.max(Math.abs(maxVal), Math.abs(minVal)) * 1.1;

  // 3. SVG 크기 설정
  const width = 500;
  const height = 260;
  const paddingY = 30;
  const paddingX = 40;

  // 0% 기준선 Y 좌표
  const zeroY = height / 2;

  // 값에 따른 Y 좌표 매핑 헬퍼 함수
  const getY = (val: number) => {
    // 0%가 정중앙(height/2)이고, 상하 대칭축이 absMax
    const scale = (height / 2 - paddingY) / absMax;
    return zeroY - val * scale;
  };

  return (
    <div className="flex flex-col p-6 rounded-none bg-box-bg border border-t-[#000000] border-b-[#000000] border-l-white border-r-white shadow-xl">
      <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-6">
        <div>
          <h4 className="text-lg font-bold text-[#000000] tracking-tight">수익률 성과 지표</h4>
          <p className="text-xs text-[#000000]/60 mt-1">최근 데이터 기준 주요 기간별 운용 수익률 현황입니다.</p>
        </div>
      </div>

      {values.length === 0 ? (
        <div className="flex items-center justify-center h-50 text-[#000000]/50 text-sm">
          수익률 데이터가 존재하지 않습니다.
        </div>
      ) : (
        <div className="relative w-full flex flex-col items-center">
          {/* SVG Canvas */}
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible max-w-lg"
          >
            {/* 그라데이션 정의 */}
            <defs>
              {/* 플러스 수익률: 코랄 그라데이션 */}
              <linearGradient id="coral-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF9F9B" />
                <stop offset="100%" stopColor="#F96D69" />
              </linearGradient>
              {/* 마이너스 수익률: 스카이블루 그라데이션 */}
              <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5BC2E7" />
                <stop offset="100%" stopColor="#003CDC" />
              </linearGradient>
            </defs>

            {/* 뒷배경 수평 가이드라인 (예: +30%, 0%, -30%) */}
            {[-absMax * 0.6, 0, absMax * 0.6].map((lineVal, idx) => {
              const y = getY(lineVal);
              const isZero = lineVal === 0;
              return (
                <g key={idx}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke={isZero ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)'}
                    strokeWidth={isZero ? 1.5 : 1}
                    strokeDasharray={isZero ? 'none' : '4 4'}
                  />
                  <text
                    x={paddingX - 10}
                    y={y + 4}
                    textAnchor="end"
                    fill="rgba(0, 0, 0, 0.6)"
                    className="text-[9px] font-bold"
                  >
                    {lineVal.toFixed(0)}%
                  </text>
                </g>
              );
            })}

            {/* 막대 및 텍스트 렌더링 */}
            {items.map((item, idx) => {
              if (item.value === null) return null;

              const val = item.value;
              const barWidth = 48;
              
              // 각 막대의 X축 중앙
              const colWidth = (width - paddingX * 2) / items.length;
              const x = paddingX + colWidth * idx + colWidth / 2;
              
              const targetY = getY(val);
              const barHeight = Math.abs(targetY - zeroY);
              const barY = val >= 0 ? targetY : zeroY;

              const isPositive = val >= 0;
              const fill = isPositive ? '#007C1F' : '#D60016';
              const hoverColor = isPositive ? '#007C1F' : '#D60016';

              const isHovered = hoveredIdx === idx;

              return (
                <g key={idx} className="cursor-pointer">
                  {/* 세로 막대 (Framer Motion과 유사하게 CSS transition 활용) */}
                  <rect
                    x={x - barWidth / 2}
                    y={barY}
                    width={barWidth}
                    height={barHeight || 1} // 높이가 0이 되는 것 방지
                    fill={fill}
                    rx={0}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className="transition-all duration-300 ease-out"
                    style={{
                      filter: isHovered ? `drop-shadow(0 0 10px ${hoverColor}b0)` : 'none',
                      transformOrigin: `${x}px ${zeroY}px`,
                      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                      opacity: hoveredIdx !== null && !isHovered ? 0.6 : 1,
                    }}
                  />

                  {/* 막대 상/하단 값 텍스트 */}
                  <text
                    x={x}
                    y={isPositive ? barY - 8 : barY + barHeight + 14}
                    textAnchor="middle"
                    fill={isHovered ? hoverColor : '#000000'}
                    className="text-[10px] font-extrabold transition-colors duration-200"
                  >
                    {val >= 0 ? '+' : ''}
                    {val.toFixed(1)}%
                  </text>

                  {/* 하단 축 레이블 */}
                  <text
                    x={x}
                    y={height - 8}
                    textAnchor="middle"
                    fill="rgba(0, 0, 0, 0.7)"
                    className="text-[10px] font-bold"
                  >
                    {item.label.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* 호버 상세 툴팁 오버레이 */}
          {hoveredIdx !== null && items[hoveredIdx].value !== null && (
            <div className="absolute top-20 bg-white/95 border border-black/15 rounded-none py-2.5 px-4 shadow-xl text-center backdrop-blur-md max-w-xs animate-in fade-in zoom-in duration-200">
              <span className="text-[10px] font-semibold text-black/50 block mb-0.5">
                {items[hoveredIdx].label}
              </span>
              <span
                className="text-lg font-black text-black"
              >
                {(items[hoveredIdx].value ?? 0) >= 0 ? '+' : ''}
                {(items[hoveredIdx].value ?? 0).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
