'use client';

import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

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

// SVG를 PNG 파일로 다운로드하는 공통 헬퍼 함수
export const downloadSvgAsPng = (svgElement: SVGSVGElement | null, fileName: string) => {
  if (!svgElement) return;

  try {
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2;
      const width = svgElement.viewBox.baseVal.width || 800;
      const height = svgElement.viewBox.baseVal.height || 560;
      
      canvas.width = width * scale;
      canvas.height = height * scale;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        
        const pngDataUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngDataUrl;
        downloadLink.download = `${fileName.replace(/[\/:*?"<>|]/g, '_')}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(blobURL);
    };
    image.src = blobURL;
  } catch (error) {
    console.error('Error exporting chart as PNG:', error);
  }
};

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

interface BaseChartProps {
  data: ChartDataPoint[];
  themeIndex?: number;
  valueKey?: string;
  title?: string;
  chartKey?: string;
  barSize?: number;
  source?: string;
}

// ----------------------------------------------------
// 1. 세로 막대 차트 (MacroBarChart)
// ----------------------------------------------------
export function MacroBarChart({ data, themeIndex = 0, valueKey = 'value', title = '세로막대 차트', chartKey, barSize = 32, source }: BaseChartProps) {
  const chartData = useMemo(() => {
    return data
      .filter((d) => d.year !== undefined || d.date !== undefined)
      .map((d) => ({
        ...d,
        name: formatLabel(d),
        displayVal: (d[valueKey as keyof ChartDataPoint] !== undefined && d[valueKey as keyof ChartDataPoint] !== null) ? Number(d[valueKey as keyof ChartDataPoint]) : null,
      }))
      .filter((d) => d.displayVal !== null && !isNaN(d.displayVal))
      .sort((a, b) => {
        if (a.year && b.year) return a.year - b.year;
        return new Date(a.date || '').getTime() - new Date(b.date || '').getTime();
      }) as (ChartDataPoint & { name: string; displayVal: number })[];
  }, [data, valueKey]);

  const chartConfig = useMemo(() => {
    return {
      displayVal: {
        label: title,
        color: '#333333',
      }
    };
  }, [title]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 rounded-xl bg-foreground/3 border border-foreground/5 text-foreground/30 text-xs italic">
        시계열 데이터가 존재하지 않습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col p-2 bg-[#F9F8F6] border border-t-[#000000] border-b-[#000000] border-l-white border-r-white shadow-sm">
      <ChartContainer config={chartConfig} className="w-full h-64 md:h-96 aspect-auto">
        <BarChart
          data={chartData}
          id={chartKey}
          margin={{ top: 20, right: 10, left: -20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.2} vertical={false} />
          <XAxis 
            dataKey="name" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fontSize: 10, fontWeight: 'bold', fill: 'rgba(0,0,0,0.7)' }}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false}
            tick={{ fontSize: 9, fontWeight: 'semibold', fill: 'rgba(0,0,0,0.5)' }}
          />
          <ChartTooltip
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar
            dataKey="displayVal"
            barSize={barSize}
            radius={[2, 2, 0, 0]}
          >
            {chartData.map((entry, index) => {
              const fill = entry.displayVal >= 0 ? '#333333' : '#9E9E9E';
              return <Cell key={`cell-${index}`} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ChartContainer>
      {source && (
        <div className="text-right text-[10px] text-gray-500 font-mono mt-1 mr-2 select-none">
          source: {source}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// 2. 선 차트 (MacroLineChart)
// ----------------------------------------------------
export function MacroLineChart({ data, themeIndex = 0, valueKey = 'value', title = '선 차트', chartKey, source }: BaseChartProps) {
  const chartData = useMemo(() => {
    return data
      .filter((d) => d.year !== undefined || d.date !== undefined)
      .map((d) => ({
        ...d,
        name: formatLabel(d),
        displayVal: (d[valueKey as keyof ChartDataPoint] !== undefined && d[valueKey as keyof ChartDataPoint] !== null) ? Number(d[valueKey as keyof ChartDataPoint]) : null,
      }))
      .filter((d) => d.displayVal !== null && !isNaN(d.displayVal))
      .sort((a, b) => {
        if (a.year && b.year) return a.year - b.year;
        return new Date(a.date || '').getTime() - new Date(b.date || '').getTime();
      }) as (ChartDataPoint & { name: string; displayVal: number })[];
  }, [data, valueKey]);

  const chartConfig = useMemo(() => {
    return {
      displayVal: {
        label: title,
        color: '#000000',
      }
    };
  }, [title]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 rounded-xl bg-foreground/3 border border-foreground/5 text-foreground/30 text-xs italic">
        시계열 데이터가 존재하지 않습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col p-2 bg-[#F9F8F6] border border-t-[#000000] border-b-[#000000] border-l-white border-r-white shadow-sm">
      <ChartContainer config={chartConfig} className="w-full h-64 md:h-96 aspect-auto">
        <AreaChart
          data={chartData}
          id={chartKey}
          margin={{ top: 20, right: 10, left: -20, bottom: 10 }}
        >
          <defs>
            <linearGradient id={`colorGrad-${chartKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#000000" stopOpacity={0.08}/>
              <stop offset="95%" stopColor="#000000" stopOpacity={0.00}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.2} vertical={false} />
          <XAxis 
            dataKey="name" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fontSize: 10, fontWeight: 'bold', fill: 'rgba(0,0,0,0.7)' }}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false}
            tick={{ fontSize: 9, fontWeight: 'semibold', fill: 'rgba(0,0,0,0.5)' }}
            domain={['auto', 'auto']}
          />
          <ChartTooltip
            content={<ChartTooltipContent hideLabel />}
          />
          <Area
            type="monotone"
            dataKey="displayVal"
            stroke="#000000"
            strokeWidth={2.5}
            fillOpacity={1}
            fill={`url(#colorGrad-${chartKey})`}
          />
        </AreaChart>
      </ChartContainer>
      {source && (
        <div className="text-right text-[10px] text-gray-500 font-mono mt-1 mr-2 select-none">
          source: {source}
        </div>
      )}
    </div>
  );
}

interface CandlePoint {
  date: string;
  name: string;
  open: number;
  high: number;
  low: number;
  close: number;
  isBullish: boolean;
  wick: number[];
  body: number[];
  fill: string;
}

// ----------------------------------------------------
// 3. 캔들 차트 (MacroCandleChart)
// ----------------------------------------------------
export function MacroCandleChart({ data, themeIndex = 0, title = '주식/선물 캔들차트', chartKey, source }: BaseChartProps) {
  const chartData = useMemo(() => {
    return data
      .filter((d) => d.date !== undefined)
      .map((d) => {
        if (!d.date) return null;
        const o = d.open !== undefined && d.open !== null ? Number(d.open) : null;
        const h = d.high !== undefined && d.high !== null ? Number(d.high) : null;
        const l = d.low !== undefined && d.low !== null ? Number(d.low) : null;
        const c = d.close !== undefined && d.close !== null ? Number(d.close) : null;
        
        if (o === null || h === null || l === null || c === null) return null;
        
        const isBullish = c >= o;
        
        return {
          ...d,
          name: d.date.slice(2, 7),
          open: o,
          high: h,
          low: l,
          close: c,
          isBullish,
          wick: [l, h],
          body: isBullish ? [o, c] : [c, o],
          fill: '#000000',
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()) as CandlePoint[];
  }, [data]);

  const chartConfig = useMemo(() => {
    return {
      close: {
        label: '종가',
        color: '#000000',
      }
    };
  }, []);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 rounded-xl bg-foreground/3 border border-foreground/5 text-foreground/30 text-xs italic">
        시계열 캔들 데이터가 존재하지 않습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col p-2 bg-[#F9F8F6] border border-t-[#000000] border-b-[#000000] border-l-white border-r-white shadow-sm">
      <ChartContainer config={chartConfig} className="w-full h-64 md:h-96 aspect-auto">
        <ComposedChart
          data={chartData}
          id={chartKey}
          margin={{ top: 20, right: 10, left: -20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.2} vertical={false} />
          <XAxis 
            dataKey="name" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fontSize: 9, fill: 'rgba(0,0,0,0.5)' }}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false}
            tick={{ fontSize: 9, fontWeight: 'semibold', fill: 'rgba(0,0,0,0.5)' }}
            domain={['auto', 'auto']}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                return (
                  <div className="grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl font-mono">
                    <div className="font-medium text-muted-foreground">{d.date}</div>
                    <div className="grid gap-0.5">
                       <div>시가: <span className="font-semibold">{d.open.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span></div>
                       <div>고가: <span className="font-semibold">{d.high.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span></div>
                       <div>저가: <span className="font-semibold">{d.low.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span></div>
                       <div>종가: <span className="font-semibold">{d.close.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span></div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          {/* High-Low Wick: 양봉 #007C1F, 음봉 #D60016 */}
          <Bar
            dataKey="wick"
            barSize={1.5}
          >
            {chartData.map((entry, index) => (
              <Cell key={`wick-cell-${index}`} fill={entry.isBullish ? '#007C1F' : '#D60016'} />
            ))}
          </Bar>
          {/* Open-Close Body: 양봉 #007C1F, 음봉 #D60016 */}
          <Bar
            dataKey="body"
            barSize={8}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`body-cell-${index}`} 
                fill={entry.isBullish ? '#007C1F' : '#D60016'} 
                stroke={entry.isBullish ? '#007C1F' : '#D60016'}
                strokeWidth={1}
              />
            ))}
          </Bar>
        </ComposedChart>
      </ChartContainer>
      {source && (
        <div className="text-right text-[10px] text-gray-500 font-mono mt-1 mr-2 select-none">
          source: {source}
        </div>
      )}
    </div>
  );
}
