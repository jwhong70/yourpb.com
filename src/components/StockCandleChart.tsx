'use client';

import React, { useState, useMemo, useRef } from 'react';

export interface PriceItem {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface StockCandleChartProps {
  prices: PriceItem[];
}

export default function StockCandleChart({ prices }: StockCandleChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. 데이터를 날짜 오름차순(오래된 날짜 -> 최신 날짜)으로 정렬 및 수치 변환
  const chartData = useMemo(() => {
    return [...prices]
      .map((p) => ({
        date: p.date,
        open: Number(p.open),
        high: Number(p.high),
        low: Number(p.low),
        close: Number(p.close),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [prices]);

  // 2. 가로 캔버스 크기 및 설정
  const chartWidth = 800; // 가상 너비 고정
  const chartHeight = 320; // 가상 높이 고정
  const paddingRight = 60; // 가격 라벨 공간 확보를 위해 소폭 확장
  const paddingLeft = 20;
  const paddingY = 25;

  const availableWidth = chartWidth - paddingLeft - paddingRight;

  // 데이터 1개당 배정된 컬럼의 가로폭
  const colWidth = useMemo(() => {
    if (chartData.length === 0) return 10;
    return availableWidth / chartData.length;
  }, [chartData.length, availableWidth]);

  // 각 캔들의 두께 (컬럼폭의 75%, 최소 1.5px 최대 12px)
  const candleWidth = useMemo(() => {
    return Math.max(1.5, Math.min(12, colWidth * 0.75));
  }, [colWidth]);

  // 3. 고가(high)와 저가(low)의 최대/최소값 계산
  const { maxPrice, minPrice } = useMemo(() => {
    if (chartData.length === 0) return { maxPrice: 100, minPrice: 0 };
    let max = -Infinity;
    let min = Infinity;
    chartData.forEach((d) => {
      if (d.high > max) max = d.high;
      if (d.low < min) min = d.low;
    });

    // 상하단에 여백을 주기 위해 범위 확장
    const diff = max - min || 10;
    return {
      maxPrice: max + diff * 0.05,
      minPrice: Math.max(0, min - diff * 0.05),
    };
  }, [chartData]);

  // 4. 가격을 SVG Y 좌표로 매핑하는 헬퍼 함수
  const getY = (price: number) => {
    const scale = (chartHeight - paddingY * 2) / (maxPrice - minPrice);
    return chartHeight - paddingY - (price - minPrice) * scale;
  };

  // 5. 가로 위치 X 좌표 매핑
  const getX = (index: number) => {
    return paddingLeft + index * colWidth + (colWidth / 2);
  };

  // 가격 포맷팅 헬퍼 함수 (정수/소수 구분 지원)
  const formatPrice = (val: number | null | undefined) => {
    if (val === null || val === undefined || isNaN(val)) return '-';
    // 1000원 이상이거나 정수인 경우 소수점을 지우고 천단위 콤마 처리, 미만 소수점 표기
    return val % 1 === 0
      ? val.toLocaleString(undefined, { maximumFractionDigits: 0 })
      : val.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  // 호버 중인 아이템 정보
  const hoveredItem = hoveredIdx !== null ? chartData[hoveredIdx] : null;

  // 보조 격자선 가격 계산
  const gridLines = useMemo(() => {
    const lines = [];
    const count = 4;
    const step = (maxPrice - minPrice) / count;
    for (let i = 0; i <= count; i++) {
      const price = minPrice + step * i;
      lines.push(price);
    }
    return lines;
  }, [maxPrice, minPrice]);

  return (
    <div className="flex flex-col p-6 rounded-2xl bg-white/5 border border-yellow-accent backdrop-blur-md shadow-xl">
      {/* 최상단: 현재 정보 및 툴팁 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">주가 추이 (120주 주봉)</h3>
          <p className="text-xs text-white/40 mt-1">마우스를 올려서 특정 주봉의 상세 가격 정보를 확인하실 수 있습니다.</p>
        </div>

        {/* 실시간 툴팁 */}
        <div className="h-10 flex items-center">
          {hoveredItem ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/80 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="font-bold text-yellow-accent shrink-0">{hoveredItem.date}</span>
              <span className="shrink-0">시: <strong className="text-white">{formatPrice(hoveredItem.open)}</strong></span>
              <span className="shrink-0">고: <strong className="text-red-400">{formatPrice(hoveredItem.high)}</strong></span>
              <span className="shrink-0">저: <strong className="text-sky-400">{formatPrice(hoveredItem.low)}</strong></span>
              <span className="shrink-0">종: <strong className="text-white">{formatPrice(hoveredItem.close)}</strong></span>
            </div>
          ) : (
            <div className="text-xs text-white/30 italic">차트 위에 마우스를 올리면 가격 상세가 노출됩니다.</div>
          )}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-80 text-white/40 text-sm">
          가격 데이터가 존재하지 않습니다.
        </div>
      ) : (
        /* 차트 컨테이너 - 스크롤바 없이 가로 100% 핏 */
        <div 
          ref={containerRef}
          className="relative w-full overflow-hidden pb-2"
          style={{ cursor: 'crosshair' }}
        >
          <svg 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            width="100%"
            height="100%"
            className="w-full h-auto overflow-visible"
          >
            {/* 뒷배경 가로 격자선 및 가격 레이블 */}
            {gridLines.map((price, idx) => {
              const y = getY(price);
              return (
                <g key={idx} className="opacity-40">
                  <line
                    x1={0}
                    y1={y}
                    x2={chartWidth - paddingRight}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                  />
                  <text
                    x={chartWidth - paddingRight + 6}
                    y={y + 4}
                    fill="rgba(255, 255, 255, 0.4)"
                    className="text-[10px] font-semibold"
                  >
                    {formatPrice(price)}
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
              const color = isBullish ? '#FFFFFF' : '#dc2626'; // 상승: 흰색, 하락: #dc2626
              
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
                    strokeWidth={Math.max(0.8, candleWidth * 0.2)}
                    style={{ opacity: hoveredIdx !== null && !isHovered ? 0.4 : 1 }}
                  />
                  
                  {/* 몸통 상자 */}
                  <rect
                    x={x - (candleWidth / 2)}
                    y={bodyTop}
                    width={candleWidth}
                    height={bodyHeight}
                    fill={color}
                    rx={0.5}
                    style={{ 
                      opacity: hoveredIdx !== null && !isHovered ? 0.4 : 1,
                      filter: isHovered ? `drop-shadow(0 0 4px ${color})` : 'none',
                      transition: 'opacity 0.2s'
                    }}
                  />

                  {/* 월별 또는 특정 일자 레이블 표시 */}
                  {idx % Math.max(5, Math.floor(chartData.length / 10)) === 0 && (
                    <text
                      x={x}
                      y={chartHeight - 4}
                      textAnchor="middle"
                      fill="rgba(255, 255, 255, 0.3)"
                      className="text-[9px] font-medium pointer-events-none select-none"
                    >
                      {d.date.slice(2, 7)}
                    </text>
                  )}

                  {/* 인터랙션용 대형 투명 rect */}
                  <rect
                    x={x - (colWidth / 2)}
                    y={0}
                    width={colWidth}
                    height={chartHeight}
                    fill="transparent"
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
