'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ArrowUpDown, Lock } from 'lucide-react';

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
  isPremium: boolean;
}

export default function Filter({ initialStocks, isPremium }: FilterProps) {
  const router = useRouter();

  // 필터 상태
  const [interestFilter, setInterestFilter] = useState<'y' | 'all'>('y');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  // 정렬 상태
  const [sortColumn, setSortColumn] = useState<keyof StockWithPrice>('ticker');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // 1. 대분류(sector2) 고유 목록 자동 추출 (필터 상태 연동)
  const sectors = useMemo(() => {
    const stocksFilteredByInterest = interestFilter === 'y'
      ? initialStocks.filter((s) => s.interest === 'y')
      : initialStocks;
    const list = stocksFilteredByInterest.map((s) => s.sector2).filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [initialStocks, interestFilter]);

  // 대분류 선택 시 중분류 초기화
  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSector(e.target.value);
    setSelectedIndustry('all');
  };

  // 2. 선택된 대분류에 대응하는 중분류(industry2) 고유 목록 자동 추출
  const industries = useMemo(() => {
    const stocksFilteredByInterest = interestFilter === 'y'
      ? initialStocks.filter((s) => s.interest === 'y')
      : initialStocks;

    const filteredBySector = selectedSector === 'all'
      ? stocksFilteredByInterest
      : stocksFilteredByInterest.filter((s) => s.sector2 === selectedSector);
    
    const list = filteredBySector.map((s) => s.industry2).filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [initialStocks, selectedSector, interestFilter]);

  // 3. 필터링된 주식 목록
  const filteredStocks = useMemo(() => {
    return initialStocks.filter((stock) => {
      const matchInterest = interestFilter === 'all' || stock.interest === 'y';
      const matchSector = selectedSector === 'all' || stock.sector2 === selectedSector;
      const matchIndustry = selectedIndustry === 'all' || stock.industry2 === selectedIndustry;
      return matchInterest && matchSector && matchIndustry;
    });
  }, [initialStocks, selectedSector, selectedIndustry, interestFilter]);

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
      setSortDirection('asc');
    }
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
      {/* 관심만 vs 유니버스 전체 토글 */}
      <div className="flex justify-start">
        <div className="inline-flex rounded-none bg-[#F1F1F1] border border-t-[#000000] border-b-[#000000] border-l-white border-r-white p-1 shadow-xs select-none">
          <button
            type="button"
            onClick={() => {
              setInterestFilter('y');
              setSelectedSector('all');
              setSelectedIndustry('all');
            }}
            className={`px-5 py-2 text-xs font-bold rounded-none transition-all cursor-pointer ${
              interestFilter === 'y'
                ? 'bg-[#000000] text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-950'
            }`}
          >
            관심만
          </button>
          <button
            type="button"
            onClick={() => {
              setInterestFilter('all');
              setSelectedSector('all');
              setSelectedIndustry('all');
            }}
            className={`px-5 py-2 text-xs font-bold rounded-none transition-all cursor-pointer ${
              interestFilter === 'all'
                ? 'bg-[#000000] text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-950'
            }`}
          >
            유니버스 전체
          </button>
        </div>
      </div>

      {/* 1. 필터 셀렉트 박스 영역 */}
      <div className="bg-[#F1F1F1] p-6 rounded-none border border-t-[#000000] border-b-[#000000] border-l-white border-r-white backdrop-blur-md shadow-sm">
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
      </div>

      {/* 2. 검색 결과 요약 및 표 영역 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-gray-500 font-semibold select-none">
            검색 결과: <strong className="text-gray-900 text-sm font-extrabold">{sortedStocks.length}</strong>개 종목
          </span>
          {!isPremium && (
            <span className="inline-flex items-center gap-1 text-[10px] text-gold font-bold bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full select-none">
              <Lock className="w-3 h-3 text-gold" />
              상세조회는 Premium 전용
            </span>
          )}
        </div>

        {sortedStocks.length > 0 ? (
          <div className="overflow-x-auto rounded-none border border-t-[#000000] border-b-[#000000] border-l-white border-r-white bg-[#F1F1F1] shadow-lg">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#000000] text-white font-bold text-xs uppercase tracking-wider select-none divide-x divide-white">
                  <th
                    onClick={() => handleSort('ticker')}
                    className="py-4.5 px-5 sm:px-8 cursor-pointer hover:bg-gray-900 transition-colors"
                  >
                    티커 {renderSortIcon('ticker')}
                  </th>
                  <th
                    onClick={() => handleSort('name')}
                    className="py-4.5 px-4 cursor-pointer hover:bg-gray-900 transition-colors"
                  >
                    종목명 {renderSortIcon('name')}
                  </th>
                  <th
                    onClick={() => handleSort('close')}
                    className="py-4.5 px-4 text-right cursor-pointer hover:bg-gray-900 transition-colors"
                  >
                    현재가 {renderSortIcon('close')}
                  </th>
                  <th
                    onClick={() => handleSort('yield_1w')}
                    className="py-4.5 px-4 text-right cursor-pointer hover:bg-gray-900 transition-colors"
                  >
                    1주 {renderSortIcon('yield_1w')}
                  </th>
                  <th
                    onClick={() => handleSort('yield_5w')}
                    className="py-4.5 px-4 text-right cursor-pointer hover:bg-gray-900 transition-colors"
                  >
                    5주 {renderSortIcon('yield_5w')}
                  </th>
                  <th
                    onClick={() => handleSort('yield_20w')}
                    className="py-4.5 px-4 text-right cursor-pointer hover:bg-gray-900 transition-colors"
                  >
                    20주 {renderSortIcon('yield_20w')}
                  </th>
                  <th
                    onClick={() => handleSort('yield_60w')}
                    className="py-4.5 px-4 text-right cursor-pointer hover:bg-gray-900 transition-colors"
                  >
                    60주 {renderSortIcon('yield_60w')}
                  </th>
                  <th
                    onClick={() => handleSort('yield_120w')}
                    className="py-4.5 px-4 text-right cursor-pointer hover:bg-gray-900 transition-colors"
                  >
                    120주 {renderSortIcon('yield_120w')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#000000] text-xs sm:text-sm text-gray-800">
                {sortedStocks.map((stock) => {
                  const y1 = getYieldStyle(stock.yield_1w);
                  const y5 = getYieldStyle(stock.yield_5w);
                  const y20 = getYieldStyle(stock.yield_20w);
                  const y60 = getYieldStyle(stock.yield_60w);
                  const y120 = getYieldStyle(stock.yield_120w);

                  return (
                    <tr
                      key={stock.ticker}
                      onClick={() => handleRowClick(stock.ticker)}
                      className="hover:bg-black/5 transition-colors cursor-pointer group divide-x divide-white"
                    >
                      <td className="py-4.5 px-5 sm:px-8 font-mono font-bold text-[#000000] group-hover:text-gray-700 transition-colors">
                        {stock.ticker}
                      </td>
                      <td className="py-4.5 px-4 font-semibold max-w-60 sm:max-w-80 truncate" title={stock.name}>
                        <div className="flex items-center gap-1.5">
                          <span className="truncate">{stock.name}</span>
                          {!isPremium && (
                            <Lock className="w-3 h-3 text-gold/60 shrink-0" />
                          )}
                        </div>
                      </td>
                      <td className="py-4.5 px-4 text-right font-mono font-bold">
                        {formatPrice(stock.close)}
                      </td>
                      <td className={`py-4.5 px-4 text-right font-mono ${y1.colorClass}`}>
                        {y1.text}
                      </td>
                      <td className={`py-4.5 px-4 text-right font-mono ${y5.colorClass}`}>
                        {y5.text}
                      </td>
                      <td className={`py-4.5 px-4 text-right font-mono ${y20.colorClass}`}>
                        {y20.text}
                      </td>
                      <td className={`py-4.5 px-4 text-right font-mono ${y60.colorClass}`}>
                        {y60.text}
                      </td>
                      <td className={`py-4.5 px-4 text-right font-mono ${y120.colorClass}`}>
                        {y120.text}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-[#F1F1F1] border border-t-[#000000] border-b-[#000000] border-l-white border-r-white rounded-none text-center">
            <span className="text-sm text-gray-400 font-semibold">
              필터에 해당하는 주식 종목이 존재하지 않습니다.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
