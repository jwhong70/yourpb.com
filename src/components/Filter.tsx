'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import WishlistButton from '@/app/components/WishlistButton';

interface ETF {
  ticker: string;
  name: string;
  category: string;
  report: string;
  leverage: string | null;
}

interface FilterProps {
  initialEtfs: ETF[];
  initialWishlistTickers?: string[];
  isLoggedIn?: boolean;
  children?: (filteredEtfs: ETF[]) => React.ReactNode;
}

export default function Filter({ 
  initialEtfs, 
  initialWishlistTickers = [], 
  isLoggedIn = false, 
  children 
}: FilterProps) {
  // 필터 상태 변수
  const [leverageFilter, setLeverageFilter] = useState<'exclude' | 'include'>('exclude');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<string>('all');
  
  // 이미지 로드 에러 트래킹을 위한 상태
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // 1차 필터링: 레버리지 필터 적용
  const etfsAfterLeverage = initialEtfs.filter(etf => {
    if (leverageFilter === 'exclude') {
      return etf.leverage === null;
    } else {
      return etf.leverage !== null;
    }
  });

  // 대분류 고유 목록 자동 추출
  const categories = Array.from(new Set(initialEtfs.map(e => e.category).filter(Boolean)));

  // 2차 필터링: 대분류 필터 적용
  const etfsAfterCategory = etfsAfterLeverage.filter(etf => {
    if (selectedCategory === 'all') return true;
    return etf.category === selectedCategory;
  });

  // 중분류 고유 목록 자동 추출 (현재 선택된 대분류 및 레버리지 상태에서만 나오는 중분류를 보여줌으로써 다이나믹 연동)
  const reports = Array.from(new Set(etfsAfterCategory.map(e => e.report).filter(Boolean))).sort();

  // 대분류 클릭 시 중분류 초기화
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setSelectedReport('all');
  };

  // 최종 필터링: 중분류 필터 적용
  const filteredEtfs = etfsAfterCategory.filter(etf => {
    if (selectedReport === 'all') return true;
    return etf.report === selectedReport;
  });

  // 이미지 에러 핸들러
  const handleImageError = (ticker: string) => {
    setImageErrors(prev => ({ ...prev, [ticker]: true }));
  };

  // 카테고리별 Fallback 그라데이션 매핑
  const getGradientClass = (category: string) => {
    switch (category) {
      case '시장':
        return 'from-blue-primary/40 to-sky-primary/20 border-blue-primary/30';
      case '섹터':
        return 'from-red-accent/40 to-coral/20 border-red-accent/30';
      case '테마':
        return 'from-yellow-accent/40 to-lime/20 border-yellow-accent/30';
      default:
        return 'from-gold/40 to-silver/20 border-gold/30';
    }
  };

  return (
    <div className="space-y-8">
      {/* 필터 컨트롤 영역 */}
      <div className="bg-[#F1F1F1] p-6 rounded-none border border-t-[#000000] border-b-[#000000] border-l-white border-r-white space-y-6">
        
        {/* 1단계: 레버리지 토글 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-xs text-[#000000] font-bold uppercase tracking-wider w-20">레버리지</span>
          <div className="flex gap-2">
            <button
              onClick={() => { setLeverageFilter('exclude'); setSelectedCategory('all'); setSelectedReport('all'); }}
              className={`px-4 py-1.5 rounded-none text-xs font-bold transition-all cursor-pointer border ${
                leverageFilter === 'exclude'
                  ? 'bg-[#000000] text-white border-[#000000] shadow-md'
                  : 'bg-white text-gray-800 border-black/20 hover:bg-black/5 shadow-sm'
              }`}
            >
              레버리지 제외 (1X)
            </button>
            <button
              onClick={() => { setLeverageFilter('include'); setSelectedCategory('all'); setSelectedReport('all'); }}
              className={`px-4 py-1.5 rounded-none text-xs font-bold transition-all cursor-pointer border ${
                leverageFilter === 'include'
                  ? 'bg-[#000000] text-white border-[#000000] shadow-md'
                  : 'bg-white text-gray-800 border-black/20 hover:bg-black/5 shadow-sm'
              }`}
            >
              레버리지 포함 (Leveraged/Inverse)
            </button>
          </div>
        </div>

        {/* 2단계: 대분류 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-t border-[#000000] pt-4">
          <span className="text-xs text-[#000000] font-bold uppercase tracking-wider w-20">대분류</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryClick('all')}
              className={`px-4 py-1.5 rounded-none text-xs font-bold transition-all cursor-pointer border ${
                selectedCategory === 'all'
                  ? 'bg-[#000000] text-white border-[#000000] shadow-md'
                  : 'bg-white text-gray-800 border-black/20 hover:bg-black/5 shadow-sm'
              }`}
            >
              전체
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-4 py-1.5 rounded-none text-xs font-bold transition-all cursor-pointer border ${
                  selectedCategory === category
                    ? 'bg-[#000000] text-white border-[#000000] shadow-md'
                    : 'bg-white text-gray-800 border-black/20 hover:bg-black/5 shadow-sm'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 3단계: 중분류 */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 border-t border-[#000000] pt-4">
          <span className="text-xs text-[#000000] font-bold uppercase tracking-wider w-20 mt-1.5">중분류</span>
          <div className="flex flex-wrap gap-2 max-w-5xl">
            <button
              onClick={() => setSelectedReport('all')}
              className={`px-4 py-1.5 rounded-none text-xs font-bold transition-all cursor-pointer border ${
                selectedReport === 'all'
                  ? 'bg-[#000000] text-white border-[#000000] shadow-md'
                  : 'bg-white text-gray-800 border-black/20 hover:bg-black/5 shadow-sm'
              }`}
            >
              전체
            </button>
            {reports.map((report) => (
              <button
                key={report}
                onClick={() => setSelectedReport(report)}
                className={`px-4 py-1.5 rounded-none text-xs font-bold transition-all cursor-pointer border ${
                  selectedReport === report
                    ? 'bg-[#000000] text-white border-[#000000] shadow-md'
                    : 'bg-white text-gray-800 border-black/20 hover:bg-black/5 shadow-sm'
                }`}
              >
                {report}
              </button>
            ))}
          </div>
        </div>

      </div>

      {children ? (
        children(filteredEtfs)
      ) : (
        /* 필터링 결과 그리드 */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-gray-500 font-semibold">
              조회 결과: <strong className="text-gray-900 text-sm">{filteredEtfs.length}</strong>개 항목
            </span>
          </div>

          {filteredEtfs.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {filteredEtfs.map((etf) => {
                const isWished = initialWishlistTickers.includes(etf.ticker);
                const isError = imageErrors[etf.ticker];
                const storageUrl = `https://vypehsjeufupmrpgcsbd.supabase.co/storage/v1/object/public/upload/poster-etf/${etf.ticker.toUpperCase()}.png`;

                return (
                  <motion.div
                    key={etf.ticker}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="group flex flex-col bg-[#F1F1F1] border border-t-[#000000] border-b-[#000000] border-l-white border-r-white rounded-none hover:shadow-xl transition-all"
                  >
                    <Link href={`/etf/${etf.ticker}`} className="block relative aspect-2/3 w-full overflow-hidden bg-navy/60">
                      {/* poster 상단 테두리 위에 이름 표시 */}
                      <div className="absolute top-0 left-0 right-0 z-10 px-3 py-1.5 bg-linear-to-b from-black/80 to-transparent">
                        <span className="text-[10px] font-bold text-silver truncate block">
                          {etf.ticker}
                        </span>
                      </div>

                      {!isError ? (
                        <img
                          src={storageUrl}
                          alt={`${etf.ticker} Poster`}
                          onError={() => handleImageError(etf.ticker)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        /* Fallback 글래스모피즘 플레이스홀더 */
                        <div className={`w-full h-full bg-linear-to-br ${getGradientClass(etf.category)} flex flex-col items-center justify-center p-4 text-center border-b`}>
                          <span className="text-2xl font-extrabold tracking-wider text-white/20 select-none uppercase mb-2">
                            {etf.category}
                          </span>
                          <span className="text-sm font-bold text-white tracking-wide truncate max-w-full">
                            {etf.ticker}
                          </span>
                          <span className="text-[10px] text-white/50 truncate max-w-full mt-1">
                            {etf.name}
                          </span>
                          {etf.leverage && (
                            <span className="text-[9px] font-bold text-white bg-red-accent/80 border border-red-500/20 px-1.5 py-0.5 rounded mt-2">
                              {etf.leverage}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>

                    {/* 하단 정보 영역 */}
                    <div className="p-3 flex flex-col justify-between grow gap-2 bg-[#F1F1F1]">
                      <Link href={`/etf/${etf.ticker}`} className="block group-hover:text-sky-primary transition-colors">
                        <span className="text-[10px] font-bold text-[#000000] tracking-wide block mb-0.5">
                          {etf.ticker}
                        </span>
                        <h3 className="text-xs font-semibold text-[#000000] line-clamp-2 leading-snug">
                          {etf.name}
                        </h3>
                      </Link>

                      <div className="flex items-center justify-between border-t border-[#000000] pt-2 mt-auto">
                        <span className="text-[10px] text-gray-500 font-medium">
                          {etf.category}
                        </span>
                        <WishlistButton
                          ticker={etf.ticker}
                          initialIsWished={isWished}
                          isLoggedIn={isLoggedIn}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-[#F1F1F1] border border-t-[#000000] border-b-[#000000] border-l-white border-r-white rounded-none text-center">
              <span className="text-sm text-gray-400 font-semibold">
                해당하는 관심 ETF 상품이 존재하지 않습니다.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
