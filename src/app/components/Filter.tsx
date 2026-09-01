'use client';

import React, { useState, useMemo, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ArrowUpDown, Lock, Heart } from 'lucide-react';
import { toggleStockWishlist } from '@/app/actions/stock_wishlist';

export interface StockWithPrice {
  ticker: string;
  name: string;
  sector2: string;
  industry2: string;
  interest: string;
  close: number | null;
  yield_1w: number | null;
  yield_5w: number | null;
  yield_20w: number | null;
  yield_60w: number | null;
  yield_120w: number | null;
}

interface FilterProps {
  initialStocks: StockWithPrice[];
  initialWishlistTickers?: string[];
  isLoggedIn?: boolean;
  isPremium: boolean;
}

export default function Filter({
  initialStocks,
  initialWishlistTickers = [],
  isLoggedIn = false,
  isPremium,
}: FilterProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // 주식 목록 상태 관리 (초기값: 로그인 시 DB 찜 목록 반영)
  const [stocks, setStocks] = useState<StockWithPrice[]>(() => {
    if (isLoggedIn && initialWishlistTickers.length > 0) {
      return initialStocks.map((s) => ({
        ...s,
        interest: initialWishlistTickers.includes(s.ticker) ? 'y' : 'n',
      }));
    }
    return initialStocks;
  });
  const [isMounted, setIsMounted] = useState(false);

  // 컴포넌트 마운트 시: 로그인 상태면 DB 찜 목록 동기화, 비로그인이면 localStorage에서 로드
  useEffect(() => {
    setIsMounted(true);
    try {
      if (isLoggedIn) {
        setStocks((prev) =>
          prev.map((s) => ({
            ...s,
            interest: initialWishlistTickers.includes(s.ticker) ? 'y' : 'n',
          }))
        );
        localStorage.setItem('yourpb_interest_tickers_v2', JSON.stringify(initialWishlistTickers));
      } else {
        const stored = localStorage.getItem('yourpb_interest_tickers_v2');
        if (stored) {
          const tickers: string[] = JSON.parse(stored);
          setStocks((prev) =>
            prev.map((s) => ({
              ...s,
              interest: tickers.includes(s.ticker) ? 'y' : 'n',
            }))
          );
        } else {
          setStocks((prev) =>
            prev.map((s) => ({
              ...s,
              interest: 'n',
            }))
          );
        }
      }
    } catch (e) {
      console.error('Failed to load stock interest tickers:', e);
    }
  }, [isLoggedIn, initialWishlistTickers]);

  // 필터 상태 (디폴트: 유니버스 전체)
  const [interestFilter, setInterestFilter] = useState<'y' | 'all'>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'1w' | '5w' | '20w' | '60w' | '120w'>('1w');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 정렬 상태 (기본 정렬: yield_1w, 내림차순 desc)
  const [sortColumn, setSortColumn] = useState<keyof StockWithPrice>('yield_1w');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // 관심 종목 등록/해제 핸들러 (하이브리드: 로그인 시 DB + localStorage, 비로그인 시 localStorage)
  const handleToggleInterest = (e: React.MouseEvent, ticker: string, currentInterest: string) => {
    e.stopPropagation(); // 행 클릭 이벤트가 상세 페이지 이동을 유도하는 것 방지

    const nextInterest = currentInterest === 'y' ? 'n' : 'y';

    // 1. UI 상태 즉시 반영 (낙관적 업데이트)
    setStocks((prev) =>
      prev.map((s) => (s.ticker === ticker ? { ...s, interest: nextInterest } : s))
    );

    // 2. localStorage 업데이트
    try {
      const stored = localStorage.getItem('yourpb_interest_tickers_v2');
      let tickers: string[] = stored ? JSON.parse(stored) : [];

      if (nextInterest === 'y') {
        if (!tickers.includes(ticker)) {
          tickers.push(ticker);
        }
      } else {
        tickers = tickers.filter((t) => t !== ticker);
      }

      localStorage.setItem('yourpb_interest_tickers_v2', JSON.stringify(tickers));
    } catch (err) {
      console.error('Failed to update localStorage for interest tickers:', err);
    }

    // 3. 로그인 상태일 경우 Supabase DB와 비동기 동기화
    if (isLoggedIn) {
      startTransition(async () => {
        try {
          const result = await toggleStockWishlist(ticker);
          if (result && result.error) {
            console.error('Failed to sync stock wishlist on server:', result.error);
          }
        } catch (error) {
          console.error('toggleStockWishlist error:', error);
        }
      });
    }
  };

  // 1. 대분류(sector2) 고유 목록 자동 추출 (필터 상태 연동)
  const sectors = useMemo(() => {
    const stocksFilteredByInterest = interestFilter === 'y'
      ? stocks.filter((s) => s.interest === 'y')
      : stocks;
    const list = stocksFilteredByInterest.map((s) => s.sector2).filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [stocks, interestFilter]);

  // 대분류 선택 시 중분류 초기화
  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSector(e.target.value);
    setSelectedIndustry('all');
  };

  // 2. 선택된 대분류에 대응하는 중분류(industry2) 고유 목록 자동 추출
  const industries = useMemo(() => {
    const stocksFilteredByInterest = interestFilter === 'y'
      ? stocks.filter((s) => s.interest === 'y')
      : stocks;

    const filteredBySector = selectedSector === 'all'
      ? stocksFilteredByInterest
      : stocksFilteredByInterest.filter((s) => s.sector2 === selectedSector);
    
    const list = filteredBySector.map((s) => s.industry2).filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [stocks, selectedSector, interestFilter]);

  // 3. 필터링된 주식 목록
  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      const matchInterest = interestFilter === 'all' || stock.interest === 'y';
      const matchSector = selectedSector === 'all' || stock.sector2 === selectedSector;
      const matchIndustry = selectedIndustry === 'all' || stock.industry2 === selectedIndustry;
      const matchSearch = !searchTerm.trim() || stock.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchInterest && matchSector && matchIndustry && matchSearch;
    });
  }, [stocks, selectedSector, selectedIndustry, interestFilter, searchTerm]);

  // 4. 정렬 로직 적용
  const sortedStocks = useMemo(() => {
    const listCopy = [...filteredStocks];
    listCopy.sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      // null 또는 undefined 값 처리 (하단 정렬)
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      // 숫자 정렬
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      // 문자열 정렬
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return listCopy;
  }, [filteredStocks, sortColumn, sortDirection]);

  // 정렬 핸들러
  const handleSort = (column: keyof StockWithPrice) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('desc'); // 새로운 정렬 기준 설정 시 내림차순(desc)이 기본값이 되도록 설정
    }
  };

  // 기간별 성과 선택 시 정렬 동조 핸들러
  const handlePeriodChange = (period: '1w' | '5w' | '20w' | '60w' | '120w') => {
    setSelectedPeriod(period);
    setSortColumn(`yield_${period}` as keyof StockWithPrice);
    setSortDirection('desc');
  };

  // 정렬 화살표 아이콘 렌더링
  const renderSortIcon = (column: keyof StockWithPrice) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 ml-1.5 opacity-30 inline-block" />;
    }
    return sortDirection === 'asc' ? (
      <span className="ml-1.5 text-coral text-xs font-bold inline-block">▲</span>
    ) : (
      <span className="ml-1.5 text-blue-primary text-xs font-bold inline-block">▼</span>
    );
  };

  // 수익률 포맷 및 색상
  const getYieldStyle = (val: number | null) => {
    if (val === null || val === undefined) return { colorClass: 'text-gray-400', text: '-' };
    const formatted = `${val > 0 ? '+' : ''}${val.toFixed(1)}%`;
    if (val > 0) return { colorClass: 'text-[#007C1F] font-bold', text: formatted };
    if (val < 0) return { colorClass: 'text-[#D60016] font-bold', text: formatted };
    return { colorClass: 'text-gray-900', text: formatted };
  };

  // 현재가 포맷팅 (소수점이 있는 경우 소수점 한자리)
  const formatPrice = (val: number | null) => {
    if (val === null || val === undefined) return '-';
    return val % 1 === 0
      ? val.toLocaleString(undefined, { maximumFractionDigits: 0 })
      : val.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  // 행 클릭 시 상세 페이지 이동 제어
  const handleRowClick = (ticker: string) => {
    if (isPremium) {
      router.push(`/stock/${ticker}`);
    } else {
      alert('상세 조회는 Premium 회원만 이용 가능합니다. 프리미엄 멤버십 가입은 관리자에게 문의해 주세요. (support@yourpb.com)');
    }
  };

  return (
    <div className="space-y-8">
      {/* 유니버스 전체 vs 관심만 토글 (순서 교체) */}
      <div className="flex justify-start">
        <div className="inline-flex rounded-none bg-box-bg border border-t-[#000000] border-b-[#000000] border-l-white border-r-white p-1 shadow-xs select-none">
          <button
            type="button"
            onClick={() => {
              setInterestFilter('all');
              setSelectedSector('all');
              setSelectedIndustry('all');
            }}
            className={`w-28 py-2 text-xs font-bold rounded-none transition-all cursor-pointer ${
              interestFilter === 'all'
                ? 'bg-[#000000] text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-950'
            }`}
          >
            유니버스 전체
          </button>
          <button
            type="button"
            onClick={() => {
              setInterestFilter('y');
              setSelectedSector('all');
              setSelectedIndustry('all');
            }}
            className={`w-28 py-2 text-xs font-bold rounded-none transition-all cursor-pointer ${
              interestFilter === 'y'
                ? 'bg-[#000000] text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-950'
            }`}
          >
            관심만
          </button>
        </div>
      </div>

      {/* 1. 필터 셀렉트 박스 및 종목명 검색창 영역 */}
      <div className="bg-box-bg p-6 rounded-none border border-t-[#000000] border-b-[#000000] border-l-white border-r-white backdrop-blur-md shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 대분류 드롭다운 */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="sector-select" className="text-xs text-gray-700 font-bold tracking-wider">
                대분류 (Sector)
              </label>
              <div className="relative">
                <select
                  id="sector-select"
                  value={selectedSector}
                  onChange={handleSectorChange}
                  className="w-full appearance-none bg-white text-gray-800 border border-[#000000] rounded-none py-3.5 px-4 pr-10 text-sm font-semibold focus:outline-hidden focus:ring-1 focus:ring-black cursor-pointer transition-all shadow-xs"
                >
                  <option value="all">전체 대분류</option>
                  {sectors.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* 중분류 드롭다운 */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="industry-select" className="text-xs text-gray-700 font-bold tracking-wider">
                중분류 (Industry)
              </label>
              <div className="relative">
                <select
                  id="industry-select"
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full appearance-none bg-white text-gray-800 border border-[#000000] rounded-none py-3.5 px-4 pr-10 text-sm font-semibold focus:outline-hidden focus:ring-1 focus:ring-black cursor-pointer transition-all shadow-xs"
                >
                  <option value="all">전체 중분류</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 종목명 검색창 */}
          <div className="flex flex-col space-y-2">
            <label htmlFor="search-input" className="text-xs text-gray-700 font-bold tracking-wider">
              종목명 검색
            </label>
            <input
              id="search-input"
              type="text"
              placeholder="종목명을 입력하세요..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-gray-800 border border-[#000000] rounded-none py-3.5 px-4 text-sm font-semibold focus:outline-hidden focus:ring-1 focus:ring-black transition-all shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* 2. 검색 결과 요약 및 표 영역 */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
          <div className="flex flex-col space-y-1">
            <span className="text-xs text-gray-500 font-semibold select-none">
              검색 결과: <strong className="text-gray-900 text-sm font-extrabold">{sortedStocks.length}</strong>개 종목
            </span>
            <span className="text-[11px] text-gray-400 font-medium select-none flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-[#dc2626] text-[#dc2626]" />
              종목명 왼쪽 하트를 클릭해 나만의 찜한 주식을 관리해 보세요.
            </span>
          </div>
          <div className="flex items-center gap-3">
            {!isPremium && (
              <span className="inline-flex items-center gap-1 text-[10px] text-gold font-bold bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full select-none">
                <Lock className="w-3 h-3 text-gold" />
                Premium
              </span>
            )}
            
            {/* 기간별 성과 목록상자 */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700 shrink-0">기간별 성과 선택</span>
              <div className="relative">
                <select
                  value={selectedPeriod}
                  onChange={(e) => handlePeriodChange(e.target.value as any)}
                  className="appearance-none bg-white text-gray-800 border border-[#000000] rounded-none py-1.5 px-3 pr-8 text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-black cursor-pointer shadow-xs select-none"
                >
                  <option value="1w">1주</option>
                  <option value="5w">5주</option>
                  <option value="20w">20주</option>
                  <option value="60w">60주</option>
                  <option value="120w">120주</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {sortedStocks.length > 0 ? (
          <div className="overflow-x-auto rounded-none border border-t-[#000000] border-b-[#000000] border-l-white border-r-white bg-box-bg shadow-lg">
            <table className="w-full text-left border-collapse text-xs font-sans table-fixed">
              <thead>
                <tr className="bg-[#000000] text-white font-bold text-xs uppercase tracking-wider select-none divide-x divide-white">
                  <th
                    onClick={() => handleSort('name')}
                    className="py-3 px-3 sm:px-6 cursor-pointer hover:bg-gray-900 transition-colors"
                  >
                    종목명 {renderSortIcon('name')}
                  </th>
                  <th
                    onClick={() => handleSort(`yield_${selectedPeriod}` as any)}
                    className="py-3 px-3 sm:px-6 text-right cursor-pointer hover:bg-gray-900 transition-colors w-24 sm:w-32"
                  >
                    수익률 {renderSortIcon(`yield_${selectedPeriod}` as any)}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#000000] text-xs text-gray-900 font-sans">
                {sortedStocks.map((stock) => {
                  const periodYield = stock[`yield_${selectedPeriod}` as keyof StockWithPrice] as number | null;
                  const yieldStyle = getYieldStyle(periodYield);
                  const isWished = stock.interest === 'y';

                  return (
                     <tr
                       key={stock.ticker}
                       onClick={() => handleRowClick(stock.ticker)}
                       className="hover:bg-black/5 transition-colors cursor-pointer group divide-x divide-white"
                     >
                       <td className="py-3 px-3 sm:px-6 font-semibold truncate" title={stock.name}>
                         <div className="flex items-center gap-2">
                           <button
                             type="button"
                             onClick={(e) => handleToggleInterest(e, stock.ticker, stock.interest)}
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
                           <span className="truncate">{stock.name}</span>
                           {!isPremium && (
                             <Lock className="w-3 h-3 text-gold/60 shrink-0" />
                           )}
                         </div>
                       </td>
                       <td className={`py-3 px-3 sm:px-6 text-right truncate ${yieldStyle.colorClass}`}>
                         {yieldStyle.text}
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
              필터에 해당하는 주식 종목이 존재하지 않습니다.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
