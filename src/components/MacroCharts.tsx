'use client';

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 공통 타입 정의
export interface ChartDataPoint {
  date?: string;
  year?: number;
  value?: number | null;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  close?: number | null;
  qoq_pct?: number | null;
  yoy_pct?: number | null;
  mom_pct?: number | null;
  yield_4w?: number | null;
  yield_52w?: number | null;
  score?: number | null;
  rating?: string | null;
}

interface BaseChartProps {
  data: ChartDataPoint[];
  themeIndex?: number;
  valueKey?: string;
}

// 색상 팔레트 정의 (사용자 지정 색상 다양하게 구성)
export const CHART_THEMES = [
  { primary: '#003CDC', secondary: '#5BC2E7', area: 'rgba(91, 194, 231, 0.15)', name: 'Blue-Sky' },
  { primary: '#987956', secondary: '#8E8C8A', area: 'rgba(142, 140, 138, 0.15)', name: 'Gold-Silver' },
  { primary: '#F96D69', secondary: '#FFABC2', area: 'rgba(255, 171, 194, 0.15)', name: 'Coral-Pink' },
  { primary: '#3AAD67', secondary: '#BAD739', area: 'rgba(186, 215, 57, 0.15)', name: 'Green-Lime' },
  { primary: '#FFD735', secondary: '#FF9F9B', area: 'rgba(255, 159, 155, 0.15)', name: 'Yellow-PinkLight' },
  { primary: '#dc2626', secondary: '#FFABC2', area: 'rgba(255, 171, 194, 0.15)', name: 'Red-Pink' }
];

// 날짜 포맷팅 헬퍼
const formatLabel = (d: ChartDataPoint) => {
  if (d.year) return `${d.year}년`;
  if (d.date) {
    const parts = d.date.split('-');
    if (parts.length >= 2) {
      return `${parts[0].slice(2)}.${parts[1]}`;
    }
    return d.date;
  }
  return '';
};

// ----------------------------------------------------
// 1. 세로 막대 차트 (MacroBarChart)
// ----------------------------------------------------
export function MacroBarChart({ data, themeIndex = 0, valueKey = 'value' }: BaseChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const theme = CHART_THEMES[themeIndex % CHART_THEMES.length];

  // 유효한 수치 데이터 필터링 및 오름차순 정렬
  const chartData = useMemo(() => {
    return data
      .filter((d) => d.year !== undefined || d.date !== undefined)
      .map((d) => ({
        ...d,
        displayVal: d[valueKey as keyof ChartDataPoint] !== undefined ? Number(d[valueKey as keyof ChartDataPoint]) : null,
      }))
      .filter((d) => d.displayVal !== null && !isNaN(d.displayVal))
      .sort((a, b) => {
        if (a.year && b.year) return a.year - b.year;
        return new Date(a.date || '').getTime() - new Date(b.date || '').getTime();
      }) as (ChartDataPoint & { displayVal: number })[];
  }, [data, valueKey]);

  // 설정값
  const width = 800;
  const height = 280;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 30;

  const availableWidth = width - paddingLeft - paddingRight;
  const availableHeight = height - paddingTop - paddingBottom;

  // 최대/최소값 구하고 여백 계산
  const { maxVal, minVal, absMax } = useMemo(() => {
    if (chartData.length === 0) return { maxVal: 10, minVal: -10, absMax: 10 };
    const values = chartData.map((d) => d.displayVal);
    const max = Math.max(...values, 0);
    const min = Math.min(...values, 0);
    const scaleMax = Math.max(Math.abs(max), Math.abs(min)) || 1;
    return { maxVal: max, minVal: min, absMax: scaleMax * 1.15 };
  }, [chartData]);

  // Zero Line 및 좌표 함수
  const zeroY = useMemo(() => {
    // 음수가 있는 경우 정중앙 정렬, 없는 경우 하단 배치
    if (minVal >= 0) return height - paddingBottom;
    const scale = availableHeight / (absMax * 2);
    return paddingTop + availableHeight / 2;
  }, [minVal, availableHeight, absMax, paddingTop, paddingBottom]);

  const getY = (val: number) => {
    if (minVal >= 0) {
      const scale = availableHeight / absMax;
      return height - paddingBottom - val * scale;
    }
    const scale = availableHeight / (absMax * 2);
    return zeroY - val * scale;
  };

  const colWidth = chartData.length > 0 ? availableWidth / chartData.length : 10;
  const barWidth = Math.max(1.5, Math.min(24, colWidth * 0.7));

  const getX = (idx: number) => {
    return paddingLeft + idx * colWidth + colWidth / 2;
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 rounded-xl bg-foreground/3 border border-foreground/5 text-foreground/30 text-xs italic">
        시계열 데이터가 존재하지 않습니다.
      </div>
    );
  }

  const hoveredItem = hoveredIdx !== null ? chartData[hoveredIdx] : null;

  // 가이드라인 값 계산
  const guideLines = minVal >= 0 ? [absMax * 0.75, absMax * 0.35, 0] : [absMax * 0.7, 0, -absMax * 0.7];

  return (
    <div className="flex flex-col p-4 rounded-none bg-box-bg border border-t-[#000000] border-b-[#000000] border-l-white border-r-white shadow-sm">
      {/* 차트 헤더 툴팁 */}
      <div className="flex justify-between items-center mb-4 h-6 px-1">
        <span className="text-[10px] text-[#000000]/60">세로막대형 추이</span>
        <AnimatePresence>
          {hoveredItem && (
            <motion.div
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-[#000000]/90 bg-black/5 px-2 py-0.5 rounded-none border border-black/10 flex gap-3 font-mono"
            >
              <span className="text-yellow-accent font-bold">{formatLabel(hoveredItem)}</span>
              <span>수치: <strong style={{ color: theme.secondary }}>{hoveredItem.displayVal.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}</strong></span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative w-full overflow-hidden" style={{ cursor: 'crosshair' }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" className="w-full h-auto overflow-visible">
          {/* 뒷배경 격자선 */}
          {guideLines.map((val, idx) => {
            const y = getY(val);
            return (
              <g key={idx} className="opacity-60">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.12}
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="currentColor"
                  opacity={0.5}
                  className="text-[9px] font-semibold font-mono"
                >
                  {val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* 데이터 막대 렌더링 */}
          {chartData.map((d, idx) => {
            const x = getX(idx);
            const y = getY(d.displayVal);
            const isPositive = d.displayVal >= 0;
            const barHeight = Math.abs(y - zeroY);
            const barY = isPositive ? y : zeroY;

            const isHovered = hoveredIdx === idx;
            const fill = isPositive ? '#007C1F' : '#D60016';

            return (
              <g key={idx}>
                <rect
                  x={x - barWidth / 2}
                  y={barY}
                  width={barWidth}
                  height={Math.max(1, barHeight)}
                  fill={fill}
                  rx={Math.max(1, barWidth * 0.15)}
                  className="transition-all duration-200"
                  style={{
                    opacity: hoveredIdx !== null && !isHovered ? 0.4 : 1,
                    filter: isHovered ? `drop-shadow(0 0 6px ${fill})` : 'none',
                  }}
                />

                {/* X축 년/월 틱 라벨 */}
                {idx % Math.max(1, Math.floor(chartData.length / 10)) === 0 && (
                  <text
                    x={x}
                    y={height - 8}
                    textAnchor="middle"
                    fill="rgba(0,0,0,0.7)"
                    className="text-[10px] font-bold font-mono select-none"
                  >
                    {formatLabel(d)}
                  </text>
                )}

                {/* 인터랙션 영역 */}
                <rect
                  x={x - colWidth / 2}
                  y={paddingTop}
                  width={colWidth}
                  height={availableHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 2. 선 차트 (MacroLineChart)
// ----------------------------------------------------
export function MacroLineChart({ data, themeIndex = 0, valueKey = 'value' }: BaseChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const theme = CHART_THEMES[themeIndex % CHART_THEMES.length];

  // 정제 및 정렬
  const chartData = useMemo(() => {
    return data
      .filter((d) => d.year !== undefined || d.date !== undefined)
      .map((d) => ({
        ...d,
        displayVal: d[valueKey as keyof ChartDataPoint] !== undefined ? Number(d[valueKey as keyof ChartDataPoint]) : null,
      }))
      .filter((d) => d.displayVal !== null && !isNaN(d.displayVal))
      .sort((a, b) => {
        if (a.year && b.year) return a.year - b.year;
        return new Date(a.date || '').getTime() - new Date(b.date || '').getTime();
      }) as (ChartDataPoint & { displayVal: number })[];
  }, [data, valueKey]);

  const width = 800;
  const height = 280;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 30;

  const availableWidth = width - paddingLeft - paddingRight;
  const availableHeight = height - paddingTop - paddingBottom;

  const { maxVal, minVal } = useMemo(() => {
    if (chartData.length === 0) return { maxVal: 100, minVal: 0 };
    const values = chartData.map((d) => d.displayVal);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const diff = max - min || 10;
    return {
      maxVal: max + diff * 0.08,
      minVal: Math.max(0, min - diff * 0.08)
    };
  }, [chartData]);

  const getY = (val: number) => {
    const scale = availableHeight / (maxVal - minVal);
    return height - paddingBottom - (val - minVal) * scale;
  };

  const colWidth = chartData.length > 0 ? availableWidth / chartData.length : 10;
  const getX = (idx: number) => {
    return paddingLeft + idx * colWidth + colWidth / 2;
  };

  // 선 경로(Path) 문자열 빌드
  const pathD = useMemo(() => {
    if (chartData.length === 0) return '';
    return chartData
      .map((d, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(d.displayVal)}`)
      .join(' ');
  }, [chartData]);

  // 영역 채우기(Area) 경로 빌드
  const areaD = useMemo(() => {
    if (chartData.length === 0) return '';
    const firstX = getX(0);
    const lastX = getX(chartData.length - 1);
    const bottomY = height - paddingBottom;
    return `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [chartData, pathD]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 rounded-xl bg-foreground/3 border border-foreground/5 text-foreground/30 text-xs italic">
        시계열 데이터가 존재하지 않습니다.
      </div>
    );
  }

  const hoveredItem = hoveredIdx !== null ? chartData[hoveredIdx] : null;
  const guideLines = [maxVal - (maxVal - minVal) * 0.15, minVal + (maxVal - minVal) * 0.5, minVal + (maxVal - minVal) * 0.15];

  return (
    <div className="flex flex-col p-4 rounded-none bg-box-bg border-t-[#000000] border-b-[#000000] border-l-white border-r-white border shadow-sm">
      {/* 차트 헤더 툴팁 */}
      <div className="flex justify-between items-center mb-4 h-6 px-1">
        <span className="text-[10px] text-[#000000]/60">선형 시계열 추이</span>
        <AnimatePresence>
          {hoveredItem && (
            <motion.div
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-[#000000]/90 bg-black/5 px-2 py-0.5 rounded-none border border-black/10 flex gap-3 font-mono"
            >
              <span className="text-yellow-accent font-bold">{formatLabel(hoveredItem)}</span>
              <span>수치: <strong style={{ color: theme.secondary }}>{hoveredItem.displayVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative w-full overflow-hidden" style={{ cursor: 'crosshair' }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" className="w-full h-auto overflow-visible">
          {/* 뒷배경 격자선 */}
          {guideLines.map((val, idx) => {
            const y = getY(val);
            return (
              <g key={idx} className="opacity-60">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.12}
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="currentColor"
                  opacity={0.7}
                  className="text-[10px] font-bold font-mono"
                >
                  {val.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </text>
              </g>
            );
          })}

          {/* 선 밑 영역 채우기 */}
          <path d={areaD} fill="rgba(0,0,0,0.08)" className="pointer-events-none" />

          {/* 선 그리기 */}
          <path
            d={pathD}
            fill="none"
            stroke="#000000"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none"
          />

          {/* 호버 가이드 세로선 */}
          {hoveredIdx !== null && (
            <line
              x1={getX(hoveredIdx)}
              y1={paddingTop}
              x2={getX(hoveredIdx)}
              y2={height - paddingBottom}
              stroke="rgba(0, 0, 0, 0.25)"
              strokeWidth={1}
              strokeDasharray="3 3"
              className="pointer-events-none"
            />
          )}

          {/* 호버 포인트 원형 링 */}
          {hoveredIdx !== null && hoveredItem && (
            <circle
              cx={getX(hoveredIdx)}
              cy={getY(hoveredItem.displayVal)}
              r={5}
              fill="#000000"
              stroke="#FFFFFF"
              strokeWidth={2}
              style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.3))' }}
              className="pointer-events-none"
            />
          )}

          {/* 데이터 축 라벨 렌더링 및 마우스 인터랙션 영역 */}
          {chartData.map((d, idx) => {
            const x = getX(idx);

            return (
              <g key={idx}>
                {/* X축 라벨 */}
                {idx % Math.max(1, Math.floor(chartData.length / 10)) === 0 && (
                  <text
                    x={x}
                    y={height - 8}
                    textAnchor="middle"
                    fill="rgba(0,0,0,0.7)"
                    className="text-[10px] font-bold font-mono select-none"
                  >
                    {formatLabel(d)}
                  </text>
                )}

                {/* 인터랙션 영역 */}
                <rect
                  x={x - colWidth / 2}
                  y={paddingTop}
                  width={colWidth}
                  height={availableHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

interface CandlePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

// ----------------------------------------------------
// 3. 캔들 차트 (MacroCandleChart)
// ----------------------------------------------------
export function MacroCandleChart({ data, themeIndex = 0 }: BaseChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // 정제 및 정렬 (시, 고, 저, 종 필수)
  const chartData = useMemo(() => {
    return data
      .filter((d) => d.date !== undefined)
      .map((d) => ({
        date: d.date!,
        open: d.open !== undefined && d.open !== null ? Number(d.open) : null,
        high: d.high !== undefined && d.high !== null ? Number(d.high) : null,
        low: d.low !== undefined && d.low !== null ? Number(d.low) : null,
        close: d.close !== undefined && d.close !== null ? Number(d.close) : null,
      }))
      .filter((d) => d.open !== null && d.high !== null && d.low !== null && d.close !== null)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) as CandlePoint[];
  }, [data]);

  const width = 800;
  const height = 280;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 30;

  const availableWidth = width - paddingLeft - paddingRight;
  const availableHeight = height - paddingTop - paddingBottom;

  const { maxVal, minVal } = useMemo(() => {
    if (chartData.length === 0) return { maxVal: 100, minVal: 0 };
    const highs = chartData.map((d) => d.high);
    const lows = chartData.map((d) => d.low);
    const max = Math.max(...highs);
    const min = Math.min(...lows);
    const diff = max - min || 10;
    return {
      maxVal: max + diff * 0.05,
      minVal: Math.max(0, min - diff * 0.05)
    };
  }, [chartData]);

  const getY = (val: number) => {
    const scale = availableHeight / (maxVal - minVal);
    return height - paddingBottom - (val - minVal) * scale;
  };

  const colWidth = chartData.length > 0 ? availableWidth / chartData.length : 10;
  const candleWidth = Math.max(1.5, Math.min(10, colWidth * 0.7));

  const getX = (idx: number) => {
    return paddingLeft + idx * colWidth + colWidth / 2;
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 rounded-xl bg-foreground/3 border border-foreground/5 text-foreground/30 text-xs italic">
        시계열 캔들 데이터가 존재하지 않습니다.
      </div>
    );
  }

  const hoveredItem = hoveredIdx !== null ? chartData[hoveredIdx] : null;
  const guideLines = [maxVal - (maxVal - minVal) * 0.15, minVal + (maxVal - minVal) * 0.5, minVal + (maxVal - minVal) * 0.15];

  return (
    <div className="flex flex-col p-4 rounded-none bg-box-bg border-t-[#000000] border-b-[#000000] border-l-white border-r-white border shadow-sm">
      {/* 차트 헤더 툴팁 */}
      <div className="flex justify-between items-center mb-4 h-6 px-1">
        <span className="text-[10px] text-[#000000]/60">주식/선물 캔들차트 추이</span>
        <AnimatePresence>
          {hoveredItem && (
            <motion.div
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[11px] text-[#000000]/95 bg-black/5 px-2 py-0.5 rounded-none border border-black/10 flex flex-wrap gap-x-2 gap-y-0.5 font-mono"
            >
              <span className="text-yellow-accent font-bold shrink-0">{hoveredItem.date}</span>
              <span>시: <strong>{hoveredItem.open.toLocaleString(undefined, { maximumFractionDigits: 1 })}</strong></span>
              <span className="shrink-0">고: <strong className="text-[#D60016]">{hoveredItem.high.toLocaleString(undefined, { maximumFractionDigits: 1 })}</strong></span>
              <span className="shrink-0">저: <strong className="text-[#007C1F]">{hoveredItem.low.toLocaleString(undefined, { maximumFractionDigits: 1 })}</strong></span>
              <span className="shrink-0">종: <strong>{hoveredItem.close.toLocaleString(undefined, { maximumFractionDigits: 1 })}</strong></span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative w-full overflow-hidden" style={{ cursor: 'crosshair' }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" className="w-full h-auto overflow-visible">
          {/* 뒷배경 격자선 */}
          {guideLines.map((val, idx) => {
            const y = getY(val);
            return (
              <g key={idx} className="opacity-60">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.12}
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="currentColor"
                  opacity={0.7}
                  className="text-[10px] font-bold font-mono"
                >
                  {val.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </text>
              </g>
            );
          })}

          {/* 캔들 렌더링 */}
          {chartData.map((d, idx) => {
            const isBullish = d.close >= d.open;
            const bodyTop = isBullish ? getY(d.close) : getY(d.open);
            const bodyBottom = isBullish ? getY(d.open) : getY(d.close);
            const bodyHeight = Math.max(1, bodyBottom - bodyTop);

            const x = getX(idx);
            const color = isBullish ? '#007C1F' : '#D60016';

            const isHovered = hoveredIdx === idx;

            return (
              <g key={idx}>
                {/* 꼬리선 (고가 - 저가) */}
                <line
                  x1={x}
                  y1={getY(d.high)}
                  x2={x}
                  y2={getY(d.low)}
                  stroke={color}
                  strokeWidth={1.2}
                  style={{ opacity: hoveredIdx !== null && !isHovered ? 0.3 : 1 }}
                />

                {/* 몸통 */}
                <rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={color}
                  className="transition-all duration-200"
                  style={{
                    opacity: hoveredIdx !== null && !isHovered ? 0.3 : 1,
                    filter: isHovered ? `drop-shadow(0 0 5px ${color})` : 'none',
                  }}
                />

                {/* X축 날짜 라벨 */}
                {idx % Math.max(1, Math.floor(chartData.length / 10)) === 0 && (
                  <text
                    x={x}
                    y={height - 8}
                    textAnchor="middle"
                    fill="rgba(0,0,0,0.5)"
                    className="text-[9px] font-medium font-mono select-none"
                  >
                    {d.date.slice(2, 7)}
                  </text>
                )}

                {/* 인터랙션 영역 */}
                <rect
                  x={x - colWidth / 2}
                  y={paddingTop}
                  width={colWidth}
                  height={availableHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
