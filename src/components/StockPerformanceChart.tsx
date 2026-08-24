'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface StockPerformanceChartProps {
  yield_1w: number | null;
  yield_5w: number | null;
  yield_20w: number | null;
  yield_60w: number | null;
  yield_120w: number | null;
}

export default function StockPerformanceChart({
  yield_1w,
  yield_5w,
  yield_20w,
  yield_60w,
  yield_120w,
}: StockPerformanceChartProps) {
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
  const height = 320;
  const paddingY = 25;
  const paddingX = 40;

  // 0% 기준선 Y 좌표
  const zeroY = height / 2;

  // 값에 따른 Y 좌표 매핑 헬퍼 함수
  const getY = (val: number) => {
    const scale = (height / 2 - paddingY) / absMax;
    return zeroY - val * scale;
  };

  return (
    <div className="flex flex-col h-full p-6 rounded-none bg-[#F1F1F1] border border-t-[#000000] border-b-[#000000] border-l-white border-r-white shadow-xl">
      <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-6">
        <div>
          <h4 className="text-lg font-bold text-[#000000] tracking-tight">기간별 수익률 성과</h4>
          <p className="text-xs text-[#000000]/60 mt-1">최근 데이터 기준 주요 기간별 주가 수익률 현황입니다.</p>
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
            className="w-full h-auto overflow-visible"
          >
            {/* 그라데이션 정의 */}
            <defs>
              {/* 플러스 수익률: 코랄 그라데이션 */}
              <linearGradient id="stock-coral-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF9F9B" />
                <stop offset="100%" stopColor="#F96D69" />
              </linearGradient>
              {/* 마이너스 수익률: 스카이블루 그라데이션 */}
              <linearGradient id="stock-sky-grad" x1="0" y1="0" x2="0" y2="1">
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
                  {!isZero && (
                    <text
                      x={paddingX - 10}
                      y={y + 3}
                      fill="rgba(0, 0, 0, 0.6)"
                      textAnchor="end"
                      className="text-[9px] font-bold font-mono"
                    >
                      {lineVal > 0 ? '+' : ''}
                      {lineVal.toFixed(0)}%
                    </text>
                  )}
                </g>
              );
            })}

            {/* 0% 텍스트 표기 */}
            <text
              x={paddingX - 10}
              y={zeroY + 3}
              fill="rgba(0, 0, 0, 0.7)"
              textAnchor="end"
              className="text-[9px] font-black font-mono"
            >
              0%
            </text>

            {/* 막대 및 텍스트 렌더링 */}
            {items.map((item, idx) => {
              if (item.value === null) return null;

              const val = item.value;
              const isPositive = val >= 0;
              const barHeight = Math.abs(getY(val) - zeroY);
              const barY = isPositive ? getY(val) : zeroY;

              const colWidth = (width - paddingX * 2) / items.length;
              const barWidth = 48; // 막대 너비를 48px로 넓게 확장
              const barX = paddingX + idx * colWidth + (colWidth - barWidth) / 2;

              const isHovered = hoveredIdx === idx;

              return (
                <g key={idx}>
                  {/* 호버 배경 인터랙션 하이라이트 */}
                  <rect
                    x={paddingX + idx * colWidth + 4}
                    y={paddingY}
                    width={colWidth - 8}
                    height={height - paddingY * 2}
                    fill={isHovered ? 'rgba(0, 0, 0, 0.03)' : 'transparent'}
                    rx={12}
                    className="transition-colors duration-200"
                  />

                  {/* 수익률 막대 (Framer Motion 적용) */}
                  <motion.rect
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill={isPositive ? '#007C1F' : '#D60016'}
                    rx={0}
                    initial={{ scaleY: 0, originY: isPositive ? 1 : 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ type: 'spring', stiffness: 80, delay: idx * 0.05 }}
                    style={{
                      opacity: hoveredIdx !== null && !isHovered ? 0.6 : 1,
                      filter: isHovered
                        ? `drop-shadow(0 0 6px ${isPositive ? '#007C1F' : '#D60016'})`
                        : 'none',
                    }}
                  />

                  {/* 막대 위/아래 수익률 값 라벨 */}
                  <text
                    x={barX + barWidth / 2}
                    y={isPositive ? barY - 8 : barY + barHeight + 15}
                    textAnchor="middle"
                    fill={isHovered ? (isPositive ? '#007C1F' : '#D60016') : '#000000'}
                    className="text-[10px] font-extrabold font-mono"
                    style={{
                      opacity: hoveredIdx !== null && !isHovered ? 0.5 : 1,
                      transition: 'fill 0.2s',
                    }}
                  >
                    {val > 0 ? '+' : ''}
                    {val.toFixed(1)}%
                  </text>

                  {/* 하단 기간 라벨 */}
                  <text
                    x={barX + barWidth / 2}
                    y={height - 8}
                    textAnchor="middle"
                    fill={isHovered ? '#000000' : 'rgba(0, 0, 0, 0.5)'}
                    className="text-[10px] font-semibold"
                    style={{ transition: 'fill 0.2s' }}
                  >
                    {item.code.toUpperCase()}
                  </text>

                  {/* 마우스 인터랙션을 위한 대형 투명 rect */}
                  <rect
                    x={paddingX + idx * colWidth}
                    y={paddingY}
                    width={colWidth}
                    height={height - paddingY * 2}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}
