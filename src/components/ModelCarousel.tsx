'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import WishlistButton from '@/app/components/WishlistButton';

interface ModelETF {
  ticker: string;
  name: string;
  category: string;
  leverage?: string | null;
}

interface ModelCarouselProps {
  etfs: ModelETF[];
  initialWishlistTickers?: string[];
  isLoggedIn?: boolean;
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

export default function ModelCarousel({
  etfs,
  initialWishlistTickers = [],
  isLoggedIn = false,
}: ModelCarouselProps) {
  // 이미지 로드 에러 트래킹 상태
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (ticker: string) => {
    setImageErrors((prev) => ({ ...prev, [ticker]: true }));
  };

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
    <div className="space-y-6">
      {/* 타이틀 영역 */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl select-none">
            구성 ETF
          </h2>
        </div>
      </div>

      {/* 그리드 영역: 모바일 2열, 태블릿 3열, 데스크탑 5열 (관심 ETF 스타일과 일체감 있는 배치) */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6"
      >
        {etfs.map((etf) => {
          const isWished = initialWishlistTickers.includes(etf.ticker);
          const isError = imageErrors[etf.ticker];
          // 관심 ETF와 동일한 poster-etf 스토리지 URL 사용
          const storageUrl = `https://vypehsjeufupmrpgcsbd.supabase.co/storage/v1/object/public/upload/poster-etf/${etf.ticker.toUpperCase()}.png`;

          return (
            <motion.div
              key={etf.ticker}
              variants={cardVariants}
              whileHover="hover"
              className="group flex flex-col bg-box-bg border border-t-[#000000] border-b-[#000000] border-l-white border-r-white rounded-none hover:shadow-xl transition-all"
            >
              <Link href={`/etf/${etf.ticker}`} className="block relative aspect-2/3 w-full overflow-hidden bg-navy/60">
                {/* poster 상단 테두리 위에 이름(Ticker) 표시 */}
                <div className="absolute top-0 left-0 right-0 z-10 px-3 py-1.5 bg-linear-to-b from-black/80 to-transparent">
                  <span className="text-xs font-bold text-silver truncate block uppercase tracking-wider">
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
                    <span className="text-xl font-extrabold tracking-wider text-white/20 select-none uppercase mb-2">
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
              <div className="p-3 flex flex-col justify-between grow gap-2 bg-transparent">
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
    </div>
  );
}
