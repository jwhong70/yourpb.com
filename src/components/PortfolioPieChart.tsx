"use client"

import React, { useState } from "react"

export interface PortfolioItem {
  type: string
  pct: number
  ticker: string
  name: string
  color: string
}

interface PortfolioPieChartProps {
  data: PortfolioItem[]
}

export default function PortfolioPieChart({ data }: PortfolioPieChartProps) {
  const [hoveredItem, setHoveredItem] = useState<PortfolioItem | null>(null)

  // 비중이 0보다 큰 자산만 선별
  const chartItems = data.filter((item) => item.pct > 0)

  // SVG 파이 조각 계산
  const cx = 150
  const cy = 150
  const r = 130

  let currentAngle = -90 // 12시 방향부터 시작

  const slices = chartItems.map((item) => {
    const angle = (item.pct / 100) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle += angle

    const startRad = (Math.PI / 180) * startAngle
    const endRad = (Math.PI / 180) * endAngle

    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)

    const largeArcFlag = angle > 180 ? 1 : 0
    const d = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`

    // 텍스트 위치 (파이 조각 중심)
    const midRad = (Math.PI / 180) * (startAngle + angle / 2)
    const textRadius = r * 0.62
    const tx = cx + textRadius * Math.cos(midRad)
    const ty = cy + textRadius * Math.sin(midRad)

    return {
      ...item,
      d,
      tx: Number(tx.toFixed(2)),
      ty: Number(ty.toFixed(2)),
      angle,
    }
  })

  return (
    <div className="relative w-full aspect-square max-w-65 print:max-w-45 mx-auto flex items-center justify-center select-none">
      <svg
        viewBox="0 0 300 300"
        className="w-full h-full block"
      >
        {slices.map((slice) => (
          <g
            key={slice.type}
            className="cursor-pointer"
            onMouseEnter={() => setHoveredItem(slice)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <path
              d={slice.d}
              fill={slice.color}
              stroke="#000000"
              strokeWidth="1.5"
              className="transition-opacity duration-200 hover:opacity-90"
            />
            <text
              x={slice.tx}
              y={slice.ty}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#ffffff"
              className="font-bold text-[13.5px] font-sans pointer-events-none fill-white"
              style={{
                textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.85))',
              }}
            >
              {slice.type} {slice.pct}%
            </text>
          </g>
        ))}
      </svg>

      {/* 마우스 호버 툴팁 */}
      {hoveredItem && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2.5 py-1 font-bold shadow-lg pointer-events-none whitespace-nowrap z-20">
          {hoveredItem.name} ({hoveredItem.pct}%)
        </div>
      )}
    </div>
  )
}
