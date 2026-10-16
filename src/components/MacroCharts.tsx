'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  createChart,
  ColorType,
  CrosshairMode,
  LineStyle,
  LineWidth,
  HistogramSeries,
  AreaSeries,
  CandlestickSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from 'lightweight-charts';

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

// ----------------------------------------------------
// 고해상도 PNG 다운로드 헬퍼 함수 (Canvas & SVG 동시 지원)
// ----------------------------------------------------
export const downloadSvgAsPng = (targetElement: HTMLElement | SVGSVGElement | null, fileName: string) => {
  if (!targetElement) return;

  try {
    // 1. 컨테이너 내부의 Canvas 요소들을 탐색 (TradingView Lightweight Charts)
    const canvases = targetElement.querySelectorAll('canvas');
    if (canvases && canvases.length > 0) {
      const firstCanvas = canvases[0];
      const targetW = firstCanvas.width || 1200;
      const targetH = firstCanvas.height || 680;

      const mergedCanvas = document.createElement('canvas');
      mergedCanvas.width = targetW;
      mergedCanvas.height = targetH;
      const ctx = mergedCanvas.getContext('2d');

      if (ctx) {
        // 프리미엄 베이지-화이트 배경
        ctx.fillStyle = '#F9F8F6';
        ctx.fillRect(0, 0, mergedCanvas.width, mergedCanvas.height);

        // Lightweight Charts가 생성한 모든 레이어 Canvas들을 1:1 레티나 스케일로 순서대로 합성
        canvases.forEach((c) => {
          if (c.width > 0 && c.height > 0) {
            ctx.drawImage(c, 0, 0, targetW, targetH);
          }
        });

        const pngDataUrl = mergedCanvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngDataUrl;
        downloadLink.download = `${fileName.replace(/[\/:*?"<>|]/g, '_')}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        return;
      }
    }

    // 2. SVG 요소인 경우 (폴백)
    const svgElement = targetElement.tagName.toLowerCase() === 'svg'
      ? (targetElement as SVGSVGElement)
      : targetElement.querySelector('svg');

    if (svgElement) {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = 2;
        const width = svgElement.viewBox.baseVal.width || 800;
        const height = svgElement.viewBox.baseVal.height || 360;

        canvas.width = width * scale;
        canvas.height = height * scale;

        const context = canvas.getContext('2d');
        if (context) {
          context.fillStyle = '#FFFFFF';
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
    }
  } catch (error) {
    console.error('Error exporting chart as PNG:', error);
  }
};

// 시간 정규화 헬퍼 (YYYY-MM-DD Time 형식)
function normalizeTime(d: ChartDataPoint): string | null {
  if (d.year) {
    return `${d.year}-01-01`;
  }
  if (d.date) {
    const raw = d.date.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    if (/^\d{4}-\d{2}$/.test(raw)) return `${raw}-01`;
    if (/^\d{4}$/.test(raw)) return `${raw}-01-01`;
  }
  return null;
}

// 공통 차트 옵션 빌더
function getCommonChartOptions(container: HTMLElement) {
  return {
    width: container.clientWidth || 600,
    height: 340,
    layout: {
      background: { type: ColorType.Solid, color: '#F9F8F6' },
      textColor: '#4B5563',
      fontSize: 10,
      fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    grid: {
      vertLines: { color: 'rgba(0, 0, 0, 0.04)' },
      horzLines: { color: 'rgba(0, 0, 0, 0.06)' },
    },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: {
        color: '#9CA3AF',
        width: 1 as LineWidth,
        style: LineStyle.Dashed,
        labelBackgroundColor: '#111111',
      },
      horzLine: {
        color: '#9CA3AF',
        width: 1 as LineWidth,
        style: LineStyle.Dashed,
        labelBackgroundColor: '#111111',
      },
    },
    rightPriceScale: {
      borderColor: 'rgba(0, 0, 0, 0.15)',
      entireTextOnly: true,
      minimumWidth: 55,
      scaleMargins: {
        top: 0.12,
        bottom: 0.12,
      },
    },
    timeScale: {
      borderColor: 'rgba(0, 0, 0, 0.15)',
      timeVisible: false,
      secondsVisible: false,
    },
    handleScroll: {
      mouseWheel: true,
      pressedMouseMove: true,
      horzTouchDrag: true,
      vertTouchDrag: false,
    },
    handleScale: {
      axisPressedMouseMove: true,
      mouseWheel: true,
      pinch: true,
    },
  };
}

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
// 1. 세로 막대 차트 (MacroBarChart - Lightweight Histogram)
// ----------------------------------------------------
export function MacroBarChart({
  data,
  valueKey = 'value',
  title = '세로막대 차트',
  chartKey,
  source,
}: BaseChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  const [hoverData, setHoverData] = useState<{ time: string; value: number } | null>(null);
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // 데이터 정제 및 날짜 오름차순 정렬
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const map = new Map<string, { time: Time; value: number; color: string; rawYear?: number }>();

    for (const d of data) {
      const timeStr = normalizeTime(d);
      if (!timeStr) continue;

      const rawVal = d[valueKey as keyof ChartDataPoint];
      if (rawVal === undefined || rawVal === null || isNaN(Number(rawVal))) continue;

      const numVal = Number(rawVal);
      const isCurrent = d.year === currentYear;
      // 올해 지표: 골드(#D4AF37), 일반 양수: 딥블랙(#111111), 음수: 슬레이트(#4B5563)
      const color = isCurrent ? '#D4AF37' : (numVal >= 0 ? '#111111' : '#4B5563');

      map.set(timeStr, {
        time: timeStr as Time,
        value: Math.round(numVal * 100) / 100,
        color,
        rawYear: d.year,
      });
    }

    return Array.from(map.values()).sort((a, b) =>
      String(a.time).localeCompare(String(b.time))
    );
  }, [data, valueKey, currentYear]);

  // 차트 인스턴스 초기화 & 반응형 렌더링
  useEffect(() => {
    const container = containerRef.current;
    if (!container || sortedData.length === 0) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(container, getCommonChartOptions(container));
    chartRef.current = chart;

    const series = chart.addSeries(HistogramSeries, {
      base: 0,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });
    seriesRef.current = series;
    series.setData(sortedData);

    // 마우스 호버 트래킹
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || param.point === undefined || !param.seriesData.get(series)) {
        setHoverData(null);
        return;
      }
      const item = param.seriesData.get(series) as { value: number };
      if (item && item.value !== undefined) {
        setHoverData({
          time: String(param.time),
          value: item.value,
        });
      }
    });

    chart.timeScale().fitContent();

    // 반응형 리사이즈 대응
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      if (width > 0 && chartRef.current) {
        chartRef.current.applyOptions({ width });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [sortedData]);

  const latestPoint = sortedData[sortedData.length - 1];
  const activeData = hoverData || (latestPoint ? { time: String(latestPoint.time), value: latestPoint.value } : null);

  if (sortedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 rounded-xl bg-foreground/3 border border-foreground/5 text-foreground/30 text-xs italic">
        시계열 데이터가 존재하지 않습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col p-2 bg-[#F9F8F6] border-b border-b-[#000000]/60 shadow-xs">
      {/* 상단 컨트롤 & 실시간 호버 정보 바 */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-1.5 mb-1 bg-white/70 border border-black/5 rounded text-xs select-none">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800 text-[11px] truncate max-w-[200px] sm:max-w-xs">{title}</span>
          <button
            type="button"
            onClick={() => chartRef.current?.timeScale().fitContent()}
            title="전체 보기"
            className="px-1.5 py-0.5 text-[10px] font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors cursor-pointer"
          >
            전체 보기
          </button>
        </div>

        {activeData && (
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-gray-500 font-sans text-[10px]">{activeData.time}</span>
            <span className="font-extrabold text-[#000000] bg-[#D4AF37]/15 px-1.5 py-0.5 rounded border border-[#D4AF37]/30">
              {activeData.value > 0 ? `+${activeData.value}` : activeData.value}
            </span>
          </div>
        )}
      </div>

      {/* TradingView Canvas 렌더링 컨테이너 (PNG 추출용 id 부여) */}
      <div
        id={chartKey}
        ref={containerRef}
        className="w-full h-80 relative overflow-hidden"
      />

      {source && (
        <div className="text-right text-[10px] text-gray-500 font-mono mt-1 mr-2 select-none">
          source: {source}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// 2. 선/영역 차트 (MacroLineChart - Lightweight Area)
// ----------------------------------------------------
export function MacroLineChart({
  data,
  valueKey = 'value',
  title = '선 차트',
  chartKey,
  source,
}: BaseChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);

  const [hoverData, setHoverData] = useState<{ time: string; value: number } | null>(null);

  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const map = new Map<string, { time: Time; value: number }>();

    for (const d of data) {
      const timeStr = normalizeTime(d);
      if (!timeStr) continue;

      const rawVal = d[valueKey as keyof ChartDataPoint];
      if (rawVal === undefined || rawVal === null || isNaN(Number(rawVal))) continue;

      const numVal = Number(rawVal);
      map.set(timeStr, {
        time: timeStr as Time,
        value: Math.round(numVal * 100) / 100,
      });
    }

    return Array.from(map.values()).sort((a, b) =>
      String(a.time).localeCompare(String(b.time))
    );
  }, [data, valueKey]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || sortedData.length === 0) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(container, getCommonChartOptions(container));
    chartRef.current = chart;

    // 럭셔리 블랙 & 골드 그라데이션 Area 차트
    const series = chart.addSeries(AreaSeries, {
      lineColor: '#111111',
      lineWidth: 2 as LineWidth,
      topColor: 'rgba(212, 175, 55, 0.35)',
      bottomColor: 'rgba(212, 175, 55, 0.00)',
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      crosshairMarkerBorderColor: '#D4AF37',
      crosshairMarkerBackgroundColor: '#111111',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });
    seriesRef.current = series;
    series.setData(sortedData);

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || param.point === undefined || !param.seriesData.get(series)) {
        setHoverData(null);
        return;
      }
      const item = param.seriesData.get(series) as { value: number };
      if (item && item.value !== undefined) {
        setHoverData({
          time: String(param.time),
          value: item.value,
        });
      }
    });

    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      if (width > 0 && chartRef.current) {
        chartRef.current.applyOptions({ width });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [sortedData]);

  const latestPoint = sortedData[sortedData.length - 1];
  const activeData = hoverData || (latestPoint ? { time: String(latestPoint.time), value: latestPoint.value } : null);

  if (sortedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 rounded-xl bg-foreground/3 border border-foreground/5 text-foreground/30 text-xs italic">
        시계열 데이터가 존재하지 않습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col p-2 bg-[#F9F8F6] border-b border-b-[#000000]/60 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-1.5 mb-1 bg-white/70 border border-black/5 rounded text-xs select-none">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800 text-[11px] truncate max-w-[200px] sm:max-w-xs">{title}</span>
          <button
            type="button"
            onClick={() => chartRef.current?.timeScale().fitContent()}
            title="전체 보기"
            className="px-1.5 py-0.5 text-[10px] font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors cursor-pointer"
          >
            전체 보기
          </button>
        </div>

        {activeData && (
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-gray-500 font-sans text-[10px]">{activeData.time}</span>
            <span className="font-extrabold text-[#000000] bg-[#D4AF37]/15 px-1.5 py-0.5 rounded border border-[#D4AF37]/30">
              {activeData.value > 0 ? `+${activeData.value}` : activeData.value}
            </span>
          </div>
        )}
      </div>

      <div
        id={chartKey}
        ref={containerRef}
        className="w-full h-80 relative overflow-hidden"
      />

      {source && (
        <div className="text-right text-[10px] text-gray-500 font-mono mt-1 mr-2 select-none">
          source: {source}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// 3. 캔들/주봉 차트 (MacroCandleChart - Lightweight Candlestick)
// ----------------------------------------------------
export function MacroCandleChart({
  data,
  title = '주봉 차트',
  chartKey,
  source,
}: BaseChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const maSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  const [hoverData, setHoverData] = useState<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
  } | null>(null);

  const { candleData, maData } = useMemo(() => {
    if (!data || data.length === 0) return { candleData: [], maData: [] };

    const map = new Map<string, { time: Time; open: number; high: number; low: number; close: number }>();

    for (const d of data) {
      const timeStr = normalizeTime(d);
      if (!timeStr) continue;

      const o = d.open != null ? Number(d.open) : null;
      const h = d.high != null ? Number(d.high) : null;
      const l = d.low != null ? Number(d.low) : null;
      const c = d.close != null ? Number(d.close) : null;

      if (o === null || h === null || l === null || c === null) continue;

      map.set(timeStr, {
        time: timeStr as Time,
        open: o,
        high: h,
        low: l,
        close: c,
      });
    }

    const sorted = Array.from(map.values()).sort((a, b) =>
      String(a.time).localeCompare(String(b.time))
    );

    // 20선 이동평균선 산출
    const ma: { time: Time; value: number }[] = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i >= 19) {
        let sum = 0;
        for (let j = i - 19; j <= i; j++) {
          sum += sorted[j].close;
        }
        ma.push({
          time: sorted[i].time,
          value: Math.round((sum / 20) * 100) / 100,
        });
      }
    }

    return { candleData: sorted, maData: ma };
  }, [data]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || candleData.length === 0) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(container, getCommonChartOptions(container));
    chartRef.current = chart;

    // 정통 블랙 & 골드 캔들스틱
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#D4AF37',
      downColor: '#222222',
      borderUpColor: '#B8860B',
      borderDownColor: '#111111',
      wickUpColor: '#D4AF37',
      wickDownColor: '#222222',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });
    candleSeriesRef.current = candleSeries;
    candleSeries.setData(candleData);

    // 20선 이동평균선
    if (maData.length > 0) {
      const maSeries = chart.addSeries(LineSeries, {
        color: '#4B5563',
        lineWidth: 1 as LineWidth,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      maSeriesRef.current = maSeries;
      maSeries.setData(maData);
    }

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || param.point === undefined || !param.seriesData.get(candleSeries)) {
        setHoverData(null);
        return;
      }
      const item = param.seriesData.get(candleSeries) as { open: number; high: number; low: number; close: number };
      if (item && item.close !== undefined) {
        setHoverData({
          time: String(param.time),
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        });
      }
    });

    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      if (width > 0 && chartRef.current) {
        chartRef.current.applyOptions({ width });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [candleData, maData]);

  const latestPoint = candleData[candleData.length - 1];
  const activeData = hoverData || (latestPoint ? {
    time: String(latestPoint.time),
    open: latestPoint.open,
    high: latestPoint.high,
    low: latestPoint.low,
    close: latestPoint.close,
  } : null);

  if (candleData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 rounded-xl bg-foreground/3 border border-foreground/5 text-foreground/30 text-xs italic">
        시계열 캔들 데이터가 존재하지 않습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col p-2 bg-[#F9F8F6] border-b border-b-[#000000]/60 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-1.5 mb-1 bg-white/70 border border-black/5 rounded text-xs select-none">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800 text-[11px] truncate max-w-[200px] sm:max-w-xs">{title}</span>
          <button
            type="button"
            onClick={() => chartRef.current?.timeScale().fitContent()}
            title="전체 보기"
            className="px-1.5 py-0.5 text-[10px] font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors cursor-pointer"
          >
            전체 보기
          </button>
          <div className="hidden sm:flex items-center gap-2 text-[10px] text-gray-500 font-medium ml-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-[#D4AF37] inline-block border border-[#B8860B]" /> 상승
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-[#222222] inline-block border border-[#111111]" /> 하락
            </span>
            {maData.length > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-[#4B5563] inline-block" /> 20선
              </span>
            )}
          </div>
        </div>

        {activeData && (
          <div className="flex items-center gap-2.5 text-[10px] font-mono">
            <span className="text-gray-500 font-sans">{activeData.time}</span>
            <span>시: <strong>{activeData.open}</strong></span>
            <span>고: <strong>{activeData.high}</strong></span>
            <span>저: <strong>{activeData.low}</strong></span>
            <span>종: <strong className="text-[#000000] bg-[#D4AF37]/15 px-1 py-0.5 rounded border border-[#D4AF37]/30">{activeData.close}</strong></span>
          </div>
        )}
      </div>

      <div
        id={chartKey}
        ref={containerRef}
        className="w-full h-80 relative overflow-hidden"
      />

      {source && (
        <div className="text-right text-[10px] text-gray-500 font-mono mt-1 mr-2 select-none">
          source: {source}
        </div>
      )}
    </div>
  );
}
