'use client';

import React, { useState, useRef } from 'react';
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

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 16 
  },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5, 
      ease: [0.25, 1, 0.5, 1],
    },
  },
  hover: {
    scale: 1.05,
    transition: { 
      type: 'spring', 
      stiffness: 300, 
      damping: 20 
    },
  },
};

export default function Filter({ 
  initialEtfs, 
  initialWishlistTickers = [], 
  isLoggedIn = false, 
  children 
}: FilterProps) {
  // 필터 상태 변수
  const [leverageFilter, setLeverageFilter] = useState<'exclude' | 'include'>('exclude');
  
  // 가로 스크롤 상태 트래킹을 위한 state와 ref
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const cardWidth = container.firstElementChild?.getBoundingClientRect().width || 0;
    const gap = 16; // max-[560px]:gap-4 = 16px
    const itemWidth = cardWidth + gap;
    if (itemWidth > 0) {
      const index = Math.round(container.scrollLeft / itemWidth);
      setActiveIndex(index);
    }
  };
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
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

  // 대분류 클릭 시 중분류 및 검색어 초기화
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setSelectedReport('all');
    setSearchTerm('');
  };

  // 최종 필터링: 중분류 및 종목명 검색어 필터 적용
  const filteredEtfs = etfsAfterCategory.filter(etf => {
    const matchesReport = selectedReport === 'all' || etf.report === selectedReport;
    const matchesSearch = !searchTerm || (etf.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesReport && matchesSearch;
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
      <div className="bg-box-bg p-6 rounded-none border border-t-[#000000] border-b-[#000000] border-l-white border-r-white space-y-6">
        
        {/* 1단계: 레버리지 토글 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-xs text-[#000000] font-bold uppercase tracking-wider w-20">레버리지</span>
          <div className="flex gap-2">
            <button
              onClick={() => { setLeverageFilter('exclude'); setSelectedCategory('all'); setSelectedReport('all'); setSearchTerm(''); }}
              className={`px-4 py-1.5 rounded-none text-xs font-bold transition-all cursor-pointer border ${
                leverageFilter === 'exclude'
                  ? 'bg-[#000000] text-white border-[#000000] shadow-md'
                  : 'bg-white text-gray-800 border-black/20 hover:bg-black/5 shadow-sm'
              }`}
            >
              레버리지 제외 (1X)
            </button>
            <button
              onClick={() => { setLeverageFilter('include'); setSelectedCategory('all'); setSelectedReport('all'); setSearchTerm(''); }}
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-t border-[#000000] pt-4">
          <span className="text-xs text-[#000000] font-bold uppercase tracking-wider w-20">중분류</span>
          <div className="relative w-full sm:max-w-xs">
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full px-4 py-2 text-xs font-bold bg-white text-gray-800 border border-black/20 rounded-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-black appearance-none"
            >
              <option value="all">전체</option>
              {reports.map((report) => (
                <option key={report} value={report}>
                  {report}
                </option>
              ))}
            </select>
            {/* 드롭다운 커스텀 화살표 */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* 4단계: 종목명 검색 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-t border-[#000000] pt-4">
          <span className="text-xs text-[#000000] font-bold uppercase tracking-wider w-20">종목명 검색</span>
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="검색어를 입력하세요..."
              className="w-full px-4 py-2 text-xs bg-white border border-black/20 rounded-none focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 font-bold"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 text-xs font-bold cursor-pointer"
              >
                비우기
              </button>
            )}
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
            <div className="relative">
              <motion.div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 max-[560px]:flex max-[560px]:flex-row max-[560px]:overflow-x-auto max-[560px]:snap-x max-[560px]:snap-mandatory max-[560px]:gap-4 max-[560px]:pb-4 scrollbar-none"
              >
                {filteredEtfs.map((etf, index) => {
                  const isWished = initialWishlistTickers.includes(etf.ticker);
                  const isError = imageErrors[etf.ticker];
                  const storageUrl = `https://vypehsjeufupmrpgcsbd.supabase.co/storage/v1/object/public/upload/poster-etf/${etf.ticker.toUpperCase()}.png`;

                  return (
                    <motion.div
                      key={etf.ticker}
                      variants={cardVariants}
                      whileHover="hover"
                      className={`group flex flex-col bg-box-bg border border-t-[#000000] border-b-[#000000] border-l-white border-r-white rounded-none hover:shadow-xl transition-all max-[560px]:w-[calc(50%-8px)] max-[560px]:shrink-0 ${
                        index % 2 === 0 ? 'max-[560px]:snap-start' : ''
                      }`}
                    >
                      <Link href={`/etf/${etf.ticker}`} className="block relative aspect-2/3 w-full overflow-hidden bg-navy/60">
                        {/* poster 상단 테두리 위에 이름 표시 */}
                        <div className="absolute top-0 left-0 right-0 z-10 px-3 py-1.5 bg-linear-to-b from-black/80 to-transparent">
                          <span className="text-xs font-bold text-silver truncate block">
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
                            <span className="text-base font-bold text-white tracking-wide truncate max-w-full">
                              {etf.ticker}
                            </span>
                            <span className="text-xs text-white/50 truncate max-w-full mt-1">
                              {etf.name}
                            </span>
                            {etf.leverage && (
                              <span className="text-[10px] font-bold text-white bg-red-accent/80 border border-red-500/20 px-1.5 py-0.5 rounded mt-2">
                                {etf.leverage}
                              </span>
                            )}
                          </div>
                        )}
                      </Link>

                      {/* 하단 정보 영역 */}
                      <div className="p-3 flex flex-col justify-between grow gap-2 bg-box-bg">
                        <Link href={`/etf/${etf.ticker}`} className="block group-hover:text-sky-primary transition-colors">
                          <span className="text-sm font-bold text-[#000000] tracking-wide block mb-0.5">
                            {etf.ticker}
                          </span>
                          <h3 className="text-base font-semibold text-[#000000] line-clamp-2 leading-snug">
                            {etf.name}
                          </h3>
                        </Link>

                        <div className="flex items-center justify-between border-t border-[#000000] pt-2 mt-auto">
                          <span className="text-sm text-gray-700 font-medium">
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
              </motion.div>

              {/* 모바일 닷 인디케이터 (화면 너비 560px 이하에서만 작동) */}
              {filteredEtfs.length > 0 && (
                <div className="flex min-[561px]:hidden justify-center items-center gap-1.5 pt-4">
                  {filteredEtfs.map((_, index) => {
                    const activeGroupStart = Math.floor(activeIndex / 2) * 2;
                    const isActive = index === activeGroupStart || index === activeGroupStart + 1;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (scrollContainerRef.current) {
                            const container = scrollContainerRef.current;
                            const cardWidth = container.firstElementChild?.getBoundingClientRect().width || 0;
                            const gap = 16; // max-[560px]:gap-4 (16px)
                            const targetIndex = Math.floor(index / 2) * 2;
                            container.scrollTo({
                              left: targetIndex * (cardWidth + gap),
                              behavior: 'smooth'
                            });
                          }
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${
                          isActive 
                            ? 'bg-black w-4' 
                            : 'bg-black/25 hover:bg-black/40'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-box-bg border border-t-[#000000] border-b-[#000000] border-l-white border-r-white rounded-none text-center">
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
