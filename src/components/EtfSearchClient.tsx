'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Filter from './Filter';

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
}

interface EtfSearchClientProps {
  initialEtfs: EtfWithPrice[];
}

export default function EtfSearchClient({ initialEtfs }: EtfSearchClientProps) {
  const router = useRouter();
  
  // 정렬 상태 변수
  const [sortColumn, setSortColumn] = useState<keyof EtfWithPrice>('ticker');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // 정렬 핸들러
  const handleSort = (column: keyof EtfWithPrice) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
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
      <Filter initialEtfs={initialEtfs as any}>
        {(filteredEtfs) => {
          const sortedList = getSortedEtfs(filteredEtfs);

          return (
            <div className="space-y-4">
              {/* 조회 결과 요약 */}
              <div className="flex items-center justify-between px-2">
                <span className="text-xs text-[#000000]/60 font-semibold select-none">
                  검색 결과: <strong className="text-[#000000] text-sm font-extrabold">{sortedList.length}</strong>개 종목
                </span>
              </div>

              {/* 검색 결과 표 */}
              {sortedList.length > 0 ? (
                <div className="overflow-x-auto rounded-none border border-t-[#000000] border-b-[#000000] border-l-white border-r-white bg-[#F1F1F1] shadow-xl">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-[#000000] text-white font-bold text-xs sm:text-sm uppercase tracking-wider select-none divide-x divide-white">
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
                          이름 {renderSortIcon('name')}
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
                    <tbody className="divide-y divide-[#000000] text-xs sm:text-sm text-[#000000]">
                      {sortedList.map((etf) => (
                        <tr
                          key={etf.ticker}
                          onClick={() => router.push(`/etf/${etf.ticker}`)}
                          className="hover:bg-black/5 transition-colors cursor-pointer"
                        >
                          <td className="py-4 px-5 sm:px-8 font-mono font-bold text-[#000000] border-r border-r-white">
                            {etf.ticker}
                          </td>
                          <td className="py-4 px-4 font-semibold max-w-64 sm:max-w-85 truncate border-r border-r-white" title={etf.name}>
                            {etf.name}
                          </td>
                          <td className="py-4 px-4 text-right font-mono font-bold border-r border-r-white">
                            {etf.close !== null ? etf.close.toLocaleString() : '-'}
                          </td>
                          <td className={`py-4 px-4 text-right font-mono border-r border-r-white ${getYieldColor(etf.yield_1w)}`}>
                            {formatYield(etf.yield_1w)}
                          </td>
                          <td className={`py-4 px-4 text-right font-mono border-r border-r-white ${getYieldColor(etf.yield_5w)}`}>
                            {formatYield(etf.yield_5w)}
                          </td>
                          <td className={`py-4 px-4 text-right font-mono border-r border-r-white ${getYieldColor(etf.yield_20w)}`}>
                            {formatYield(etf.yield_20w)}
                          </td>
                          <td className={`py-4 px-4 text-right font-mono border-r border-r-white ${getYieldColor(etf.yield_60w)}`}>
                            {formatYield(etf.yield_60w)}
                          </td>
                          <td className={`py-4 px-4 text-right font-mono border-r border-r-white ${getYieldColor(etf.yield_120w)}`}>
                            {formatYield(etf.yield_120w)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-[#1b2e54]/20 border border-white/5 rounded-3xl text-center">
                  <span className="text-sm text-white/40 font-semibold">
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
