'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
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
import { toast } from 'sonner';

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
// 차트 인스턴스 전역 레지스트리 (PNG 추출용)
// ----------------------------------------------------
export const chartInstances = new Map<string, IChartApi>();

// ----------------------------------------------------
// 고해상도 PNG 다운로드 헬퍼 함수 (takeScreenshot 및 캔버스 합성)
// ----------------------------------------------------
export const downloadSvgAsPng = (targetElement: HTMLElement | SVGSVGElement | null, fileName: string) => {
  if (!targetElement) return;

  try {
    let chartInstance: IChartApi | null = (targetElement as unknown as { __chartInstance?: IChartApi }).__chartInstance || null;
    if (!chartInstance && targetElement.id) {
      chartInstance = chartInstances.get(targetElement.id) || null;
    }
    if (!chartInstance) {
      const childWithChart = targetElement.querySelector('[id^="chart-svg-"]') as HTMLElement | null;
      if (childWithChart) {
        chartInstance = (childWithChart as unknown as { __chartInstance?: IChartApi }).__chartInstance ||
          (childWithChart.id ? chartInstances.get(childWithChart.id) || null : null);
      }
    }

    if (chartInstance && typeof chartInstance.takeScreenshot === 'function') {
      const screenshotCanvas = chartInstance.takeScreenshot(true, false);
      if (screenshotCanvas && screenshotCanvas.width > 0 && screenshotCanvas.height > 0) {
        const padding = 20;
        const headerH = 50;
        const outCanvas = document.createElement('canvas');
        outCanvas.width = screenshotCanvas.width + padding * 2;
        outCanvas.height = screenshotCanvas.height + headerH + padding * 2;
        const ctx = outCanvas.getContext('2d');

        if (ctx) {
          ctx.fillStyle = '#F9F8F6';
          ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);

          ctx.fillStyle = '#111111';
          ctx.font = 'bold 20px Pretendard, -apple-system, sans-serif';
          ctx.textBaseline = 'middle';
          ctx.fillText(fileName, padding, padding + 20);

          ctx.fillStyle = '#6B7280';
          ctx.font = '500 13px Pretendard, -apple-system, sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText('당신의 피비 | yourpb.vercel.app', outCanvas.width - padding, padding + 20);
          ctx.textAlign = 'left';

          ctx.drawImage(screenshotCanvas, padding, padding + headerH);

          const pngDataUrl = outCanvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngDataUrl;
          downloadLink.download = `${fileName.replace(/[\/:*?"<>|]/g, '_')}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          toast.success('차트 이미지가 저장되었습니다', {
            description: `${fileName}.png`,
          });
          return;
        }
      }
    }

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
          toast.success('차트 이미지가 저장되었습니다', {
            description: `${fileName}.png`,
          });
        }
        URL.revokeObjectURL(blobURL);
      };
      image.src = blobURL;
    }
  } catch (error) {
    console.error('Error exporting chart as PNG:', error);
    toast.error('차트 이미지 저장 중 오류가 발생했습니다');
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

// 소수점 셋째 자리 반올림 (둘째 자리 표시) 헬퍼
function formatVal(val: number | null | undefined): string {
  if (val == null || isNaN(Number(val))) return '-';
  return Number(val).toFixed(2);
}

// 공통 차트 옵션 빌더 (fixRightEdge: 최신 데이터 우측 고정)
function getCommonChartOptions(container: HTMLElement) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  return {
    width: container.clientWidth || 600,
    height: container.clientHeight || (isMobile ? 220 : 280),
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
      visible: true,
      borderVisible: true,
      borderColor: 'rgba(0, 0, 0, 0.15)',
      timeVisible: true,
      secondsVisible: false,
      fixRightEdge: true, // 최신 데이터 우측 끝 고정
      rightOffset: 0.5,
      lockVisibleTimeRangeOnResize: true,
      tickMarkFormatter: (time: Time) => {
        const s = String(time);
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
          const [y, m, d] = s.split('-');
          if (m === '01' && d === '01') return y;
          return `${y.slice(2)}.${m}`;
        }
        return s;
      },
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
// 1. 세로 막대 차트 (현재 기준 과거 5년 ~ 향후 3년 초기 포커스 & 우측 고정 줌)
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
  const [isFullView, setIsFullView] = useState(false);
  const isFullViewRef = useRef(false);
  isFullViewRef.current = isFullView;

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

  // 연간 데이터 판별
  const isYearlyData = useMemo(() => {
    return sortedData.some(d => d.rawYear != null);
  }, [sortedData]);

  // 현재 기준 과거 5년 ~ 향후 3년 초기 뷰포트 계산
  const initialRange = useMemo(() => {
    if (sortedData.length === 0) return { from: 0, to: 0 };

    if (isYearlyData) {
      const curYear = new Date().getFullYear();
      const startTarget = curYear - 5; // 과거 5년
      const endTarget = curYear + 3;   // 향후 3년

      let fromIdx = 0;
      let toIdx = sortedData.length - 1;

      // startTarget 이상인 첫 번째 인덱스
      const foundStart = sortedData.findIndex(d => {
        const y = d.rawYear || parseInt(String(d.time).slice(0, 4), 10);
        return !isNaN(y) && y >= startTarget;
      });
      if (foundStart !== -1) fromIdx = foundStart;

      // endTarget 이하인 마지막 인덱스
      for (let i = sortedData.length - 1; i >= 0; i--) {
        const y = sortedData[i].rawYear || parseInt(String(sortedData[i].time).slice(0, 4), 10);
        if (!isNaN(y) && y <= endTarget) {
          toIdx = i;
          break;
        }
      }

      return {
        from: fromIdx - 0.5,
        to: toIdx + 0.5,
      };
    }

    // 분기/월간 데이터: 최근 20개 (약 5년)
    const targetCount = 20;
    const count = Math.min(sortedData.length, targetCount);
    return {
      from: sortedData.length - count - 0.5,
      to: sortedData.length - 0.5,
    };
  }, [sortedData, isYearlyData]);

  // 뷰포트 토글 핸들러
  const handleToggleView = useCallback(() => {
    const chart = chartRef.current;
    if (!chart || sortedData.length === 0) return;

    if (isFullView) {
      chart.timeScale().setVisibleLogicalRange(initialRange);
      setIsFullView(false);
    } else {
      chart.timeScale().fitContent();
      setIsFullView(true);
    }
  }, [isFullView, sortedData.length, initialRange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || sortedData.length === 0) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(container, getCommonChartOptions(container));
    chartRef.current = chart;

    (container as unknown as { __chartInstance: IChartApi }).__chartInstance = chart;
    if (chartKey) {
      chartInstances.set(chartKey, chart);
    }

    chart.timeScale().applyOptions({
      barSpacing: 22,
      minBarSpacing: 4,
      rightOffset: 0.5,
    });

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

    // 1. 초기 뷰포트: 현재 기준 과거 5년 ~ 향후 3년 정확히 설정
    chart.timeScale().setVisibleLogicalRange(initialRange);
    setIsFullView(false);

    // 2. 좌우 경계 클램핑: 왼쪽 빈 스페이스 차단 & 우측 최근 데이터 자석 고정
    let isAdjusting = false;
    let isUserPannedPast = false;
    const anchorTo = initialRange.to;
    const minFrom = -0.5;

    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (!range || isAdjusting) return;

      let targetFrom: number = range.from;
      let targetTo: number = range.to;
      let needsUpdate = false;

      // ① 왼쪽 빈 스페이스 완벽 차단: 첫 번째 데이터(인덱스 0) 왼쪽으로 넘어가지 못하도록 고정
      if (targetFrom < minFrom) {
        targetFrom = minFrom;
        needsUpdate = true;
      }

      // ② 우측 자석 앵커링: 최근 뷰 상태에서 축소(Zoom Out) 시 우측 끝 고정 유지
      if (!isFullViewRef.current) {
        if (range.to < anchorTo - 1.5) {
          isUserPannedPast = true;
        } else if (range.to >= anchorTo - 0.2) {
          isUserPannedPast = false;
        }

        if (!isUserPannedPast && targetTo < anchorTo) {
          const span = targetTo - targetFrom;
          targetTo = anchorTo;
          targetFrom = Math.max(minFrom, anchorTo - span);
          needsUpdate = true;
        }
      }

      // ③ 전체 데이터 너비를 초과하는 무한 축소 방지
      const maxSpan = sortedData.length;
      if (targetTo - targetFrom > maxSpan) {
        targetFrom = minFrom;
        targetTo = sortedData.length - 0.5;
        needsUpdate = true;
      }

      if (needsUpdate) {
        isAdjusting = true;
        chart.timeScale().setVisibleLogicalRange({
          from: targetFrom as any,
          to: targetTo as any,
        });
        setTimeout(() => { isAdjusting = false; }, 0);
      }
    });

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && chartRef.current) {
        chartRef.current.applyOptions({
          width,
          ...(height > 0 ? { height } : {}),
        });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartKey) {
        chartInstances.delete(chartKey);
      }
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [sortedData, chartKey, initialRange]);

  const latestPoint = sortedData[sortedData.length - 1];
  const activeData = hoverData || (latestPoint ? { time: String(latestPoint.time), value: latestPoint.value } : null);

  if (sortedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 rounded-xl bg-foreground/3 border border-foreground/5 text-foreground/30 text-xs italic">
        시계열 데이터가 존재하지 않습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col p-2 bg-[#F9F8F6] border-b border-b-[#000000]/60 shadow-xs">
      <div className="flex flex-col gap-1.5 px-2.5 py-2 mb-1 bg-white/80 border border-black/5 rounded text-xs select-none">
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-900 text-xs truncate max-w-full">{title}</span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-black/5">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleView}
              title={isFullView ? '최근 범위 보기' : '전체 시계열 보기'}
              className="px-2 py-0.5 text-[10px] font-semibold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
            >
              {isFullView ? '최근 보기' : '전체 보기'}
            </button>
            <span className="text-[9px] text-gray-400 hidden sm:inline">
              (과거 5년~향후 3년 / ← 드래그 시 과거)
            </span>
          </div>

          {activeData && (
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="text-gray-500 font-sans text-[10px]">{activeData.time}</span>
              <span className="font-extrabold text-[#000000] bg-[#D4AF37]/15 px-1.5 py-0.5 rounded border border-[#D4AF37]/30">
                {activeData.value > 0 ? `+${formatVal(activeData.value)}` : formatVal(activeData.value)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div
        id={chartKey}
        ref={containerRef}
        className="w-full h-55 sm:h-70 relative overflow-hidden"
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
// 2. 선/영역 차트 (최근 5년 초기 뷰 & 우측 고정 줌 & 전체 보기 토글)
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
  const [isFullView, setIsFullView] = useState(false);
  const isFullViewRef = useRef(false);
  isFullViewRef.current = isFullView;

  // 월간 지표는 최근 60개(5년)
  const targetBarCount = 60;

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

  const initialRange = useMemo(() => {
    if (sortedData.length === 0) return { from: 0, to: 0 };
    const count = Math.min(sortedData.length, targetBarCount);
    return {
      from: sortedData.length - count - 0.5,
      to: sortedData.length - 0.5,
    };
  }, [sortedData.length, targetBarCount]);

  const handleToggleView = useCallback(() => {
    const chart = chartRef.current;
    if (!chart || sortedData.length === 0) return;

    if (isFullView) {
      chart.timeScale().setVisibleLogicalRange(initialRange);
      setIsFullView(false);
    } else {
      chart.timeScale().fitContent();
      setIsFullView(true);
    }
  }, [isFullView, sortedData.length, initialRange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || sortedData.length === 0) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(container, getCommonChartOptions(container));
    chartRef.current = chart;

    (container as unknown as { __chartInstance: IChartApi }).__chartInstance = chart;
    if (chartKey) {
      chartInstances.set(chartKey, chart);
    }

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

    // 최근 5년 초기 포커스
    chart.timeScale().setVisibleLogicalRange(initialRange);
    setIsFullView(false);

    // 2. 좌우 경계 클램핑: 왼쪽 빈 스페이스 차단 & 우측 최근 데이터 자석 고정
    let isAdjusting = false;
    let isUserPannedPast = false;
    const anchorTo = sortedData.length - 0.5;
    const minFrom = -0.5;

    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (!range || isAdjusting) return;

      let targetFrom: number = range.from;
      let targetTo: number = range.to;
      let needsUpdate = false;

      // ① 왼쪽 빈 스페이스 완벽 차단: 첫 번째 데이터(인덱스 0) 왼쪽으로 넘어가지 못하도록 고정
      if (targetFrom < minFrom) {
        targetFrom = minFrom;
        needsUpdate = true;
      }

      // ② 우측 자석 앵커링: 최근 뷰 상태에서 축소(Zoom Out) 시 우측 끝 고정 유지
      if (!isFullViewRef.current) {
        if (range.to < anchorTo - 1.5) {
          isUserPannedPast = true;
        } else if (range.to >= anchorTo - 0.2) {
          isUserPannedPast = false;
        }

        if (!isUserPannedPast && targetTo < anchorTo) {
          const span = targetTo - targetFrom;
          targetTo = anchorTo;
          targetFrom = Math.max(minFrom, anchorTo - span);
          needsUpdate = true;
        }
      }

      // ③ 전체 데이터 너비를 초과하는 무한 축소 방지
      const maxSpan = sortedData.length;
      if (targetTo - targetFrom > maxSpan) {
        targetFrom = minFrom;
        targetTo = sortedData.length - 0.5;
        needsUpdate = true;
      }

      if (needsUpdate) {
        isAdjusting = true;
        chart.timeScale().setVisibleLogicalRange({
          from: targetFrom as any,
          to: targetTo as any,
        });
        setTimeout(() => { isAdjusting = false; }, 0);
      }
    });

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && chartRef.current) {
        chartRef.current.applyOptions({
          width,
          ...(height > 0 ? { height } : {}),
        });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartKey) {
        chartInstances.delete(chartKey);
      }
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [sortedData, chartKey, initialRange]);

  const latestPoint = sortedData[sortedData.length - 1];
  const activeData = hoverData || (latestPoint ? { time: String(latestPoint.time), value: latestPoint.value } : null);

  if (sortedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 rounded-xl bg-foreground/3 border border-foreground/5 text-foreground/30 text-xs italic">
        시계열 데이터가 존재하지 않습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col p-2 bg-[#F9F8F6] border-b border-b-[#000000]/60 shadow-xs">
      <div className="flex flex-col gap-1.5 px-2.5 py-2 mb-1 bg-white/80 border border-black/5 rounded text-xs select-none">
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-900 text-xs truncate max-w-full">{title}</span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-black/5">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleView}
              title={isFullView ? '최근 5년 보기' : '전체 시계열 보기'}
              className="px-2 py-0.5 text-[10px] font-semibold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
            >
              {isFullView ? '최근 보기' : '전체 보기'}
            </button>
            <span className="text-[9px] text-gray-400 hidden sm:inline">
              (최근 5년 / ← 드래그 시 과거)
            </span>
          </div>

          {activeData && (
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="text-gray-500 font-sans text-[10px]">{activeData.time}</span>
              <span className="font-extrabold text-[#000000] bg-[#D4AF37]/15 px-1.5 py-0.5 rounded border border-[#D4AF37]/30">
                {activeData.value > 0 ? `+${formatVal(activeData.value)}` : formatVal(activeData.value)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div
        id={chartKey}
        ref={containerRef}
        className="w-full h-55 sm:h-70 relative overflow-hidden"
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
// 3. 캔들/주봉 차트 (최근 120주 초기 뷰 & 우측 고정 줌 & 전체 보기 토글)
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

  const [isFullView, setIsFullView] = useState(false);
  const isFullViewRef = useRef(false);
  isFullViewRef.current = isFullView;

  const targetBarCount = 120; // 최근 120주

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

  const initialRange = useMemo(() => {
    if (candleData.length === 0) return { from: 0, to: 0 };
    const count = Math.min(candleData.length, targetBarCount);
    return {
      from: candleData.length - count - 0.5,
      to: candleData.length - 0.5,
    };
  }, [candleData.length, targetBarCount]);

  const handleToggleView = useCallback(() => {
    const chart = chartRef.current;
    if (!chart || candleData.length === 0) return;

    if (isFullView) {
      chart.timeScale().setVisibleLogicalRange(initialRange);
      setIsFullView(false);
    } else {
      chart.timeScale().fitContent();
      setIsFullView(true);
    }
  }, [isFullView, candleData.length, initialRange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || candleData.length === 0) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(container, getCommonChartOptions(container));
    chartRef.current = chart;

    (container as unknown as { __chartInstance: IChartApi }).__chartInstance = chart;
    if (chartKey) {
      chartInstances.set(chartKey, chart);
    }

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

    // 최근 120주 초기 포커스
    chart.timeScale().setVisibleLogicalRange(initialRange);
    setIsFullView(false);

    // 2. 좌우 경계 클램핑: 왼쪽 빈 스페이스 차단 & 우측 최근 데이터 자석 고정
    let isAdjusting = false;
    let isUserPannedPast = false;
    const anchorTo = candleData.length - 0.5;
    const minFrom = -0.5;

    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (!range || isAdjusting) return;

      let targetFrom: number = range.from;
      let targetTo: number = range.to;
      let needsUpdate = false;

      // ① 왼쪽 빈 스페이스 완벽 차단: 첫 번째 데이터(인덱스 0) 왼쪽으로 넘어가지 못하도록 고정
      if (targetFrom < minFrom) {
        targetFrom = minFrom;
        needsUpdate = true;
      }

      // ② 우측 자석 앵커링: 최근 뷰 상태에서 축소(Zoom Out) 시 우측 끝 고정 유지
      if (!isFullViewRef.current) {
        if (range.to < anchorTo - 1.5) {
          isUserPannedPast = true;
        } else if (range.to >= anchorTo - 0.2) {
          isUserPannedPast = false;
        }

        if (!isUserPannedPast && targetTo < anchorTo) {
          const span = targetTo - targetFrom;
          targetTo = anchorTo;
          targetFrom = Math.max(minFrom, anchorTo - span);
          needsUpdate = true;
        }
      }

      // ③ 전체 데이터 너비를 초과하는 무한 축소 방지
      const maxSpan = candleData.length;
      if (targetTo - targetFrom > maxSpan) {
        targetFrom = minFrom;
        targetTo = candleData.length - 0.5;
        needsUpdate = true;
      }

      if (needsUpdate) {
        isAdjusting = true;
        chart.timeScale().setVisibleLogicalRange({
          from: targetFrom as any,
          to: targetTo as any,
        });
        setTimeout(() => { isAdjusting = false; }, 0);
      }
    });

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && chartRef.current) {
        chartRef.current.applyOptions({
          width,
          ...(height > 0 ? { height } : {}),
        });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartKey) {
        chartInstances.delete(chartKey);
      }
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [candleData, maData, chartKey, initialRange]);

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
      <div className="flex items-center justify-center h-40 rounded-xl bg-foreground/3 border border-foreground/5 text-foreground/30 text-xs italic">
        시계열 캔들 데이터가 존재하지 않습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col p-2 bg-[#F9F8F6] border-b border-b-[#000000]/60 shadow-xs">
      <div className="flex flex-col gap-1.5 px-2.5 py-2 mb-1 bg-white/80 border border-black/5 rounded text-xs select-none">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-gray-900 text-xs truncate max-w-50 sm:max-w-xs">{title}</span>
          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium shrink-0">
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

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-black/5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleView}
              title={isFullView ? '최근 120주 보기' : '전체 시계열 보기'}
              className="px-2 py-0.5 text-[10px] font-semibold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
            >
              {isFullView ? '최근 보기' : '전체 보기'}
            </button>
            <span className="text-[9px] text-gray-400 hidden sm:inline">
              (최근 120주 / ← 드래그 시 과거)
            </span>
          </div>

          {activeData && (
            <div className="flex items-center gap-1.5 text-[10px] font-mono flex-wrap justify-end">
              <span className="text-gray-500 font-sans text-[9px] mr-1">{activeData.time}</span>
              <span>시: <strong className="text-gray-900">{formatVal(activeData.open)}</strong></span>
              <span>고: <strong className="text-gray-900">{formatVal(activeData.high)}</strong></span>
              <span>저: <strong className="text-gray-900">{formatVal(activeData.low)}</strong></span>
              <span>종: <strong className="text-[#000000] bg-[#D4AF37]/20 px-1 py-0.5 rounded border border-[#D4AF37]/40 font-bold">{formatVal(activeData.close)}</strong></span>
            </div>
          )}
        </div>
      </div>

      <div
        id={chartKey}
        ref={containerRef}
        className="w-full h-55 sm:h-70 relative overflow-hidden"
      />

      {source && (
        <div className="text-right text-[10px] text-gray-500 font-mono mt-1 mr-2 select-none">
          source: {source}
        </div>
      )}
    </div>
  );
}
