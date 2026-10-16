'use client';

import React from 'react';

interface MiniSparklineProps {
  data: number[];
  width?: number;
  height?: number;
}

export default function MiniSparkline({
  data,
  width = 52,
  height = 15,
}: MiniSparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const paddingY = 2;
  const usableHeight = height - paddingY * 2;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - paddingY - ((val - min) / range) * usableHeight;
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  });

  const pathD = points.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );

  const isUp = (data[data.length - 1] ?? 0) >= (data[0] ?? 0);
  // 상승 흐름: 시그니처 럭셔리 골드 (#D4AF37), 조정 흐름: 슬레이트 차콜 (#64748B)
  const strokeColor = isUp ? '#D4AF37' : '#64748B';
  const lastPoint = points[points.length - 1];

  return (
    <div
      className="inline-flex items-center shrink-0 select-none"
      title={`최근 ${data.length}주 추세 (${isUp ? '상승' : '조정'})`}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        aria-hidden="true"
      >
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {lastPoint && (
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r="1.5"
            fill={strokeColor}
          />
        )}
      </svg>
    </div>
  );
}
