'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import Filter from './Filter';
import { toggleWishlist } from '@/app/actions/wishlist';

interface EtfWithPrice {
  ticker: string;
  name: string;
  category: string;
  report: string;
  leverage: string | null;
  close: number | null;
  yield_1w: number | null;
  yield_5w: number | null;
  yield_20w: number | null;
  yield_60w: number | null;
  yield_120w: number | null;
  interest?: string;
}

interface EtfSearchClientProps {
  initialEtfs: EtfWithPrice[];
  initialWishlistTickers?: string[];
  isLoggedIn?: boolean;
}

export default function EtfSearchClient({
  initialEtfs,
  initialWishlistTickers = [],
  isLoggedIn = false,
}: EtfSearchClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // ETF 목록 상태 관리 (초기값: 로그인 시 DB 찜 목록 반영)
  const [etfs, setEtfs] = useState<EtfWithPrice[]>(() => {
    if (isLoggedIn && initialWishlistTickers.length > 0) {
      return initialEtfs.map((e) => ({
        ...e,
        interest: initialWishlistTickers.includes(e.ticker) ? 'y' : 'n',
      }));
    }
    return initialEtfs;
  });
  const [isMounted, setIsMounted] = useState(false);

  // 컴포넌트 마운트 시: 로그인 상태면 DB 찜 목록 동기화, 비로그인이면 localStorage에서 로드
  useEffect(() => {
    setIsMounted(true);
    try {
      if (isLoggedIn) {
        // 로그인 상태: 서버의 initialWishlistTickers 기준 반영 & localStorage 캐시 갱신
        setEtfs((prev) =>
          prev.map((e) => ({
            ...e,
            interest: initialWishlistTickers.includes(e.ticker) ? 'y' : 'n',
          }))
        );
        localStorage.setItem('yourpb_interest_etf_tickers', JSON.stringify(initialWishlistTickers));
      } else {
        // 비로그인 상태: localStorage에서 읽어와서 적용
        const stored = localStorage.getItem('yourpb_interest_etf_tickers');
        if (stored) {
          const tickers: string[] = JSON.parse(stored);
          setEtfs((prev) =>
            prev.map((e) => ({
              ...e,
              interest: tickers.includes(e.ticker) ? 'y' : 'n',
            }))
          );
        } else {
          setEtfs((prev) =>
            prev.map((e) => ({
              ...e,
              interest: 'n',
            }))
          );
        }
      }
    } catch (e) {
      console.error('Failed to load etf interest/wishlist tickers:', e);
    }
  }, [isLoggedIn, initialWishlistTickers]);
  
  // 기간 선택 상태 변수 추가
  const [selectedPeriod, setSelectedPeriod] = useState<'1w' | '5w' | '20w' | '60w' | '120w'>('1w');

  // 정렬 상태 변수 (초기 정렬: yield_1w, 내림차순 desc)
  const [sortColumn, setSortColumn] = useState<keyof EtfWithPrice>('yield_1w');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // 관심/찜 종목 등록/해제 핸들러 (하이브리드: 로그인 시 DB + localStorage, 비로그인 시 localStorage)
  const handleToggleInterest = (e: React.MouseEvent, ticker: string, currentInterest?: string) => {
    e.stopPropagation(); // 행 클릭 시 상세 페이지 이동 전파 차단

    const nextInterest = currentInterest === 'y' ? 'n' : 'y';

    // 1. UI 상태 즉시 반응 (낙관적 업데이트)
    setEtfs((prev) =>
      prev.map((etf) => (etf.ticker === ticker ? { ...etf, interest: nextInterest } : etf))
    );

    // 2. localStorage 업데이트
    try {
      const stored = localStorage.getItem('yourpb_interest_etf_tickers');
      let tickers: string[] = stored ? JSON.parse(stored) : [];

      if (nextInterest === 'y') {
        if (!tickers.includes(ticker)) {
          tickers.push(ticker);
        }
      } else {
        tickers = tickers.filter((t) => t !== ticker);
      }

      localStorage.setItem('yourpb_interest_etf_tickers', JSON.stringify(tickers));
    } catch (err) {
      console.error('Failed to update localStorage for etf interest tickers:', err);
    }

    // 3. 로그인 상태일 경우 Supabase DB와 비동기 동기화
    if (isLoggedIn) {
      startTransition(async () => {
        try {
          const result = await toggleWishlist(ticker);
          if (result && result.error) {
            console.error('Failed to sync wishlist on server:', result.error);
          }
        } catch (error) {
          console.error('toggleWishlist error:', error);
        }
      });
    }
  };

  // 정렬 핸들러
  const handleSort = (column: keyof EtfWithPrice) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('desc'); // 새로운 컬럼 정렬 시 내림차순(desc)이 기본값이 되도록 설정
    }
  };

  // 정렬 아이콘 렌더링
  const renderSortIcon = (column: keyof EtfWithPrice) => {
    if (sortColumn !== column) return <span className="ml-1.5 text-white/40 text-[10px]">↕</span>;
    return sortDirection === 'asc' ? (
      <span className="ml-1.5 text-white text-[10px]">▲</span>
    ) : (
      <span className="ml-1.5 text-white text-[10px]">▼</span>
    );
  };

  // 수익률 글자색 클래스 결정
  const getYieldColor = (val: number | null) => {
    if (val === null || val === undefined || val === 0) return 'text-[#000000]/50';
    return val > 0 ? 'text-[#007C1F] font-bold' : 'text-[#D60016] font-bold';
  };

  // 수익률 텍스트 포맷팅
  const formatYield = (val: number | null) => {
    if (val === null || val === undefined) return '-';
    return `${val > 0 ? '+' : ''}${val.toFixed(1)}%`;
  };

  // 현재 필터링 결과를 받아서 정렬 가동
  const getSortedEtfs = (filteredList: any[]) => {
    const listCopy = [...filteredList] as EtfWithPrice[];
    listCopy.sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      // null 또는 undefined 값은 하단 정렬 처리
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      // 숫자 정렬
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      // 문자열 정렬 (티커, 이름 등)
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return listCopy;
  };

  return (
    <div className="space-y-6">
      {/* 3단계 필터 버튼 영역 재사용 */}
      <Filter
        initialEtfs={etfs as any}
        initialWishlistTickers={initialWishlistTickers}
        isLoggedIn={isLoggedIn}
      >
        {(filteredEtfs) => {
          const sortedList = getSortedEtfs(filteredEtfs);

          return (
            <div className="space-y-4">
              {/* 조회 결과 요약 및 기간 선택 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                <div className="flex flex-col space-y-1">
                  <span className="text-xs text-[#000000]/60 font-semibold select-none">
                    검색 결과: <strong className="text-[#000000] text-sm font-extrabold">{sortedList.length}</strong>개 종목
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium select-none flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-[#dc2626] text-[#dc2626]" />
                    종목명 왼쪽 하트를 클릭해 나만의 찜한 ETF를 관리해 보세요.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#000000] font-bold">기간별 성과 선택</span>
                  <div className="relative">
                    <select
                      value={selectedPeriod}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setSelectedPeriod(val);
                        // 기간이 변경되면 기본적으로 해당 기간의 내림차순(desc)으로 정렬 컬럼 변경
                        setSortColumn(`yield_${val}` as any);
                        setSortDirection('desc');
                      }}
                      className="px-4 py-2 pr-8 text-xs font-bold bg-white text-gray-800 border border-black/20 rounded-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-black appearance-none"
                    >
                      <option value="1w">1주</option>
                      <option value="5w">5주</option>
                      <option value="20w">20주</option>
                      <option value="60w">60주</option>
                      <option value="120w">120주</option>
                    </select>
                    {/* select 드롭다운 커스텀 화살표 */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

               {/* 검색 결과 표 */}
              {sortedList.length > 0 ? (
                <div className="overflow-x-auto rounded-none border border-t-[#000000] border-b-[#000000] border-l-white border-r-white bg-box-bg shadow-xl">
                  <table className="w-full text-left border-collapse text-xs font-sans table-fixed">
                    <thead>
                      <tr className="bg-[#000000] text-white font-bold text-xs uppercase tracking-wider select-none divide-x divide-white">
                        <th
                          onClick={() => handleSort('name')}
                          className="py-3 px-3 sm:px-6 cursor-pointer hover:bg-gray-900 transition-colors"
                        >
                          이름 {renderSortIcon('name')}
                        </th>
                        <th
                          onClick={() => handleSort(`yield_${selectedPeriod}` as any)}
                          className="py-3 px-3 sm:px-6 text-right cursor-pointer hover:bg-gray-900 transition-colors w-24 sm:w-32"
                        >
                          수익률 {renderSortIcon(`yield_${selectedPeriod}` as any)}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#000000] text-xs text-[#000000] font-sans">
                      {sortedList.map((etf) => {
                        const yieldVal = etf[`yield_${selectedPeriod}` as keyof EtfWithPrice] as number | null;
                        const isWished = etf.interest === 'y';
                        return (
                          <tr
                            key={etf.ticker}
                            onClick={() => router.push(`/etf/${etf.ticker}`)}
                            className="hover:bg-black/5 transition-colors cursor-pointer"
                          >
                            <td className="py-3 px-3 sm:px-6 font-semibold truncate border-r border-r-white" title={etf.name}>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleInterest(e, etf.ticker, etf.interest)}
                                  className="focus:outline-hidden cursor-pointer p-1 hover:bg-black/5 rounded-full transition-colors shrink-0"
                                  title={isWished ? "찜 해제" : "찜하기"}
                                >
                                  <Heart
                                    className={`w-4 h-4 transition-colors duration-150 ${
                                      isWished
                                        ? 'fill-[#dc2626] text-[#dc2626]'
                                        : 'text-gray-300 hover:text-[#dc2626]'
                                    }`}
                                  />
                                </button>
                                <span className="truncate">{etf.name}</span>
                              </div>
                            </td>
                            <td className={`py-3 px-3 sm:px-6 text-right border-r border-r-white truncate ${getYieldColor(yieldVal)}`}>
                              {formatYield(yieldVal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-box-bg border border-t-[#000000] border-b-[#000000] border-l-white border-r-white rounded-none text-center">
                  <span className="text-sm text-gray-400 font-semibold">
                    해당하는 관심 ETF 상품이 존재하지 않습니다.
                  </span>
                </div>
              )}
            </div>
          );
        }}
      </Filter>
    </div>
  );
}
