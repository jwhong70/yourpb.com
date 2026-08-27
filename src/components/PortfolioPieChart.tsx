"use client"

import React from "react"
import { Pie, PieChart, Cell, LabelList } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

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
  // 비중이 0보다 큰 자산만 선별
  const chartItems = data.filter(item => item.pct > 0)

  // shadcn/ui 차트 설정 구성
  const chartConfig = React.useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {}
    chartItems.forEach((item) => {
      config[item.type] = {
        label: item.type,
        color: item.color,
      }
    })
    return config
  }, [chartItems])

  // Recharts용 데이터 포맷
  const chartData = React.useMemo(() => {
    return chartItems.map((item) => ({
      name: item.type,
      value: item.pct,
      fill: item.color,
    }))
  }, [chartItems])

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-75 w-full"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel nameKey="name" />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={0}
          outerRadius="90%"
          stroke="#000000"
          strokeWidth={1}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-90 transition-opacity duration-200 cursor-pointer" />
          ))}
          {/* 파이 내부에 조각 이름 + 비율 텍스트 표시 */}
          <LabelList
            dataKey="name"
            position="inside"
            fill="#ffffff"
            className="font-bold text-[13px] pointer-events-none fill-white font-serif drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
            formatter={(value: any) => {
              if (value === undefined || value === null) return "";
              const valueStr = String(value);
              const item = chartItems.find(i => i.type === valueStr);
              return item ? `${item.type} ${item.pct}%` : valueStr;
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
