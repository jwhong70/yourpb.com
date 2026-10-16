'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  createChart,
  ColorType,
  CandlestickSeries,
  LineSeries,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type LineData,
  type Time,
} from 'lightweight-charts';

export interface PriceItem {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface EtfCandleChartProps {
  prices: PriceItem[];
  source?: string;
}

export default function EtfCandleChart({ prices, source }: EtfCandleChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  // 차트 모드: 'candle' (캔들스틱) 또는 'line' (종가 라인)
  const [chartMode, setChartMode] = useState<'candle' | 'line'>('candle');
  const [isFullView, setIsFullView] = useState(false);
  const [isAtRecent, setIsAtRecent] = useState(true);
  const isFullViewRef = useRef(false);
  useEffect(() => {
    isFullViewRef.current = isFullView;
  }, [isFullView]);

  // 호버 툴팁 상태
  const [hoverData, setHoverData] = useState<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    changeRate: number;
  } | null>(null);

  // 1. 날짜 오름차순 정렬 및 Lightweight Charts 호환 포맷 가공
  const { sortedData, maData } = useMemo(() => {
    if (!prices || prices.length === 0) {
      return { sortedData: [], maData: [] };
    }

    const sorted = [...prices]
      .filter((p) => p.date && p.close != null && !isNaN(Number(p.close)))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((p) => ({
        time: p.date.slice(0, 10) as Time,
        open: Number(p.open || p.close),
        high: Number(p.high || p.close),
        low: Number(p.low || p.close),
        close: Number(p.close),
      }));

    // 중복 날짜 제거
    const uniqueSorted: typeof sorted = [];
    const seenTimes = new Set<string>();
    for (const item of sorted) {
      const t = String(item.time);
      if (!seenTimes.has(t)) {
        seenTimes.add(t);
        uniqueSorted.push(item);
      }
    }

    // 20주 이동평균선(MA 20) 계산
    const ma: LineData[] = [];
    for (let i = 0; i < uniqueSorted.length; i++) {
      if (i >= 19) {
        let sum = 0;
        for (let j = i - 19; j <= i; j++) {
          sum += uniqueSorted[j].close;
        }
        ma.push({
          time: uniqueSorted[i].time,
          value: Math.round((sum / 20) * 100) / 100,
        });
      }
    }

    return { sortedData: uniqueSorted, maData: ma };
  }, [prices]);

  // 최근 120주 초기 범위
  const targetBarCount = 120;
  const initialRange = useMemo(() => {
    if (sortedData.length === 0) return { from: 0, to: 0 };
    const count = Math.min(sortedData.length, targetBarCount);
    return {
      from: sortedData.length - count - 0.5,
      to: sortedData.length - 0.5,
    };
  }, [sortedData.length]);

  // 가격 포맷 함수: 소수점 2자리 (ETF의 달러/원화 공통 최적화)
  const formatPrice = (val: number) => {
    if (val >= 1000) {
      return Math.round(val).toLocaleString();
    }
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container || sortedData.length === 0) return;

    // 기존 인스턴스 정리
    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
    }

    // 럭셔리 블랙/골드 테마 차트 인스턴스 생성
    const chart = createChart(container, {
      width: container.clientWidth,
      height: 320,
      layout: {
        background: { type: ColorType.Solid, color: '#FFFFFF' },
        textColor: '#4B5563',
        fontSize: 11,
        fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
      grid: {
        vertLines: { color: '#F3F4F6' },
        horzLines: { color: '#F3F4F6' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#9CA3AF',
          width: 1,
          style: 2,
          labelBackgroundColor: '#111111',
        },
        horzLine: {
          color: '#9CA3AF',
          width: 1,
          style: 2,
          labelBackgroundColor: '#111111',
        },
      },
      rightPriceScale: {
        borderColor: '#E5E7EB',
        entireTextOnly: true,
        minimumWidth: 50,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: '#E5E7EB',
        timeVisible: true,
        secondsVisible: false,
        fixRightEdge: true, // 최신 데이터 우측 끝 고정
        rightOffset: 0.5,
        lockVisibleTimeRangeOnResize: true,
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
    });

    chartInstanceRef.current = chart;

    // 캔들스틱 또는 라인 시리즈 추가
    if (chartMode === 'candle') {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#D4AF37',          // 상승: 시그니처 골드
        downColor: '#222222',        // 하락: 럭셔리 다크 블랙
        borderUpColor: '#B8860B',    // 골드 테두리
        borderDownColor: '#111111',  // 블랙 테두리
        wickUpColor: '#D4AF37',      // 골드 꼬리
        wickDownColor: '#222222',    // 블랙 꼬리
        priceFormat: {
          type: 'custom',
          minMove: sortedData[0]?.close >= 1000 ? 1 : 0.01,
          formatter: formatPrice,
        },
      });
      candleSeries.setData(sortedData as CandlestickData[]);
      candleSeriesRef.current = candleSeries;
    } else {
      const lineSeries = chart.addSeries(LineSeries, {
        color: '#D4AF37',
        lineWidth: 2,
        priceFormat: {
          type: 'custom',
          minMove: sortedData[0]?.close >= 1000 ? 1 : 0.01,
          formatter: formatPrice,
        },
      });
      lineSeries.setData(sortedData.map((d) => ({ time: d.time, value: d.close })));
      lineSeriesRef.current = lineSeries;
    }

    // 20주 이동평균선(MA 20) 추가
    if (maData.length > 0) {
      const maSeries = chart.addSeries(LineSeries, {
        color: '#4B5563',
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      maSeries.setData(maData);
    }

    // 초기 뷰포트: 최근 120주 포커스
    chart.timeScale().setVisibleLogicalRange(initialRange as any);
    setIsFullView(false);

    // 좌우 경계 클램핑: 왼쪽 빈 스페이스 차단 & 우측 최근 데이터 자석 고정
    let isAdjusting = false;
    let isUserPannedPast = false;
    const anchorTo = sortedData.length - 0.5;
    const minFrom = -0.5;

    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (!range || isAdjusting) return;

      let targetFrom: number = range.from;
      let targetTo: number = range.to;
      let needsUpdate = false;

      // ① 왼쪽 빈 스페이스 완벽 차단: 첫 번째 데이터 이전으로 넘어가지 못하도록 클램핑
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

      // ④ 현재 뷰포트 범위에 따라 [전체 보기] / [최근 120주] 및 [최근 값 고정] 상태 실시간 동기화
      const finalSpan = targetTo - targetFrom;
      const isViewingFull = finalSpan >= (sortedData.length * 0.75);
      if (isViewingFull !== isFullViewRef.current) {
        isFullViewRef.current = isViewingFull;
        setIsFullView(isViewingFull);
      }
      const isNear = Math.abs(targetTo - anchorTo) <= 2;
      setIsAtRecent(isNear);
    });

    // 반응형 리사이즈 감지 (가로 회전 및 윈도우 크기 변화에 너비와 높이 동시 대응)
    const handleResize = () => {
      if (container && chart) {
        chart.applyOptions({
          width: container.clientWidth,
          height: container.clientHeight || 320,
        });
      }
    };
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // 마우스 호버 트래킹 이벤트 구독
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time) {
        setHoverData(null);
        return;
      }

      const point = sortedData.find((d) => d.time === param.time);
      if (point) {
        const changeRate = point.open > 0 ? ((point.close - point.open) / point.open) * 100 : 0;
        setHoverData({
          time: String(point.time),
          open: point.open,
          high: point.high,
          low: point.low,
          close: point.close,
          changeRate,
        });
      } else {
        setHoverData(null);
      }
    });

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartInstanceRef.current = null;
    };
  }, [sortedData, maData, chartMode, initialRange]);

  // 차트 뷰 리셋 / 최근 값 고정 토글
  const handleResetZoom = () => {
    if (!chartInstanceRef.current || sortedData.length === 0) return;

    const currentRange = chartInstanceRef.current.timeScale().getVisibleLogicalRange();
    const anchorTo = sortedData.length - 0.5;
    const isNear = currentRange ? Math.abs(currentRange.to - anchorTo) <= 2 : true;

    // 1. 과거 데이터를 탐색 중인 경우: 즉시 최근 120주로 자석 고정 복귀!
    if (!isNear) {
      chartInstanceRef.current.timeScale().setVisibleLogicalRange(initialRange as any);
      setIsFullView(false);
      setIsAtRecent(true);
      setHoverData(null);
      return;
    }

    // 2. 이미 최근 끝에 있는 경우: 전체 보기 <-> 최근 120주 전환
    if (isFullView) {
      chartInstanceRef.current.timeScale().setVisibleLogicalRange(initialRange as any);
      setIsFullView(false);
    } else {
      chartInstanceRef.current.timeScale().fitContent();
      setIsFullView(true);
    }
    setIsAtRecent(true);
    setHoverData(null);
  };

  const latestPoint = sortedData[sortedData.length - 1];
  const activeData = hoverData || (latestPoint ? {
    time: String(latestPoint.time),
    open: latestPoint.open,
    high: latestPoint.high,
    low: latestPoint.low,
    close: latestPoint.close,
    changeRate: latestPoint.open > 0 ? ((latestPoint.close - latestPoint.open) / latestPoint.open) * 100 : 0,
  } : null);

  return (
    <div className="flex flex-col h-full px-2 py-3.5 sm:p-6 rounded-none bg-box-bg border border-t-[#000000] border-b-[#000000] border-l-white border-r-white shadow-xl">
      {/* 1. 타이틀 영역 */}
      <div className="border-b border-black/10 pb-2.5 mb-2.5 px-0.5 sm:px-0">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-bold text-[#000000] tracking-tight">주가 추이 (주봉)</h3>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#D4AF37]/15 text-[#AA820A] border border-[#D4AF37]/30">
            블랙 & 골드
          </span>
        </div>
        <p className="text-[11px] sm:text-xs text-[#000000]/60 mt-0.5">
          마우스 휠이나 터치 드래그로 확대/축소 및 이동하여 시계열을 탐색할 수 있습니다.
        </p>
      </div>

      {/* 2. 컨트롤 & 범례 바 */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 px-0.5 sm:px-0 select-none">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* 캔들 / 라인 토글 */}
          <div className="inline-flex rounded-md shadow-xs bg-gray-100 p-0.5 border border-black/10">
            <button
              type="button"
              onClick={() => setChartMode('candle')}
              className={`px-2 sm:px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                chartMode === 'candle'
                  ? 'bg-black text-[#D4AF37] shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              🕯️ 캔들
            </button>
            <button
              type="button"
              onClick={() => setChartMode('line')}
              className={`px-2 sm:px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                chartMode === 'line'
                  ? 'bg-black text-[#D4AF37] shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              📈 라인
            </button>
          </div>

          {/* 최근 값 고정 / 전체 보기 리셋 버튼 */}
          <button
            type="button"
            onClick={handleResetZoom}
            title={!isAtRecent ? '최근 120주로 복귀 고정' : (isFullView ? '최근 120주 보기' : '차트 전체 보기')}
            className={`px-2 sm:px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-2xs ${
              !isAtRecent
                ? 'bg-[#000000] text-[#D4AF37] border border-[#D4AF37] font-bold ring-1 ring-[#D4AF37]/50'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-100'
            }`}
          >
            {!isAtRecent ? '📍 최근 값 고정' : (isFullView ? '최근 120주' : '전체 보기')}
          </button>

          {/* 범례 표시 */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-gray-500 font-medium ml-1">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-[#D4AF37] inline-block border border-[#B8860B]" />
              상승
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-[#222222] inline-block border border-[#111111]" />
              하락
            </span>
            {maData.length > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-[#4B5563] inline-block" />
                20주선
              </span>
            )}
          </div>
        </div>

        <div className="text-[10px] sm:text-[11px] text-gray-400">
          <span>🔍 드래그/휠 확대</span>
        </div>
      </div>

      {/* 3. 데이터 현황 및 호버 정보 바 (OHLC + 등락률 + 최근 값 복귀 버튼) */}
      {activeData && (
        <div className="flex flex-wrap items-center justify-between gap-x-2.5 sm:gap-x-4 gap-y-1 text-[11px] sm:text-xs mb-2.5 px-2 py-1.5 sm:px-3 sm:py-2 bg-gray-50/80 rounded border border-gray-200/80 font-mono">
          <div className="flex flex-wrap items-center gap-x-2.5 sm:gap-x-4 gap-y-1">
            <span className="text-gray-500 font-sans text-[10px] sm:text-[11px]">
              {hoverData ? '선택' : '최근'}: <strong className="text-gray-900">{activeData.time}</strong>
            </span>
            <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px]">
              <span>
                시 <strong className="text-gray-900">{formatPrice(activeData.open)}</strong>
              </span>
              <span>
                고 <strong className="text-gray-900">{formatPrice(activeData.high)}</strong>
              </span>
              <span>
                저 <strong className="text-gray-900">{formatPrice(activeData.low)}</strong>
              </span>
              <span>
                종 <strong className="text-gray-900">{formatPrice(activeData.close)}</strong>
              </span>
              <span
                className={`font-bold ${
                  activeData.changeRate >= 0 ? 'text-[#AA820A]' : 'text-[#111111]'
                }`}
              >
                {activeData.changeRate >= 0 ? '+' : ''}
                {activeData.changeRate.toFixed(2)}%
              </span>
            </div>
          </div>

          {hoverData && (
            <button
              type="button"
              onClick={() => setHoverData(null)}
              className="text-[10px] text-gray-600 hover:text-black font-sans font-semibold px-1.5 py-0.5 rounded bg-gray-200/70 hover:bg-gray-300 transition-colors cursor-pointer shrink-0"
              title="최근 종가 기준으로 복귀"
            >
              ✕ 최근 값 고정
            </button>
          )}
        </div>
      )}

      {/* 4. Lightweight Charts 캔버스 뷰포트 */}
      {sortedData.length === 0 ? (
        <div className="flex items-center justify-center h-80 text-[#000000]/50 text-sm">
          주가 데이터가 존재하지 않습니다.
        </div>
      ) : (
        <div className="relative w-full h-80">
          <div ref={chartContainerRef} className="w-full h-full" />
        </div>
      )}

      {/* 5. 소스 표기 */}
      {source && (
        <div className="text-right text-[10px] text-gray-400 font-mono mt-2 pt-1 border-t border-black/5 select-none">
          source: {source}
        </div>
      )}
    </div>
  );
}