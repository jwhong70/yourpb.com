'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ModelETF {
  ticker: string;
  name: string;
  category: string;
}

interface ModelCarouselProps {
  etfs: ModelETF[];
}

export default function ModelCarousel({ etfs }: ModelCarouselProps) {
  return (
    <div className="space-y-4">
      {/* 타이틀 영역 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl select-none text-3d-premium">
            구성 ETF
          </h2>
        </div>
      </div>

      {/* 그리드 영역: 모바일 2열, 태블릿 3열, 데스크탑 5열 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        {etfs.map((etf) => {
          const storageUrl = `https://vypehsjeufupmrpgcsbd.supabase.co/storage/v1/object/public/upload/model-portfolio/${etf.ticker.toUpperCase()}.png`;
          return (
            <motion.div
              key={etf.ticker}
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="group cursor-pointer flex flex-col"
            >
              <Link href={`/etf/${etf.ticker}`} className="block">
                <div className="relative aspect-2/3 rounded-2xl overflow-hidden border border-white/5 bg-navy/60 group-hover:border-white/20 transition-all shadow-lg group-hover:shadow-sky-primary/5">
                  
                  {/* poster 상단 테두리 위에 이름(Ticker) 표시 */}
                  <div className="absolute top-0 left-0 right-0 z-10 px-3.5 py-2 bg-linear-to-b from-black/85 to-transparent">
                    <span className="text-xs font-bold text-silver tracking-wider uppercase select-none">
                      {etf.ticker}
                    </span>
                  </div>

                  <img
                    src={storageUrl}
                    alt={`${etf.ticker} Poster`}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* 오버레이 액션 */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="px-4 py-2 bg-white text-navy font-extrabold text-sm rounded-xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      상세 정보 보기
                    </span>
                  </div>
                </div>

                {/* 하단 상세 정보 */}
                <div className="mt-3.5 px-1">
                  <span className="text-xs font-extrabold text-yellow-accent select-none uppercase tracking-wide">
                    {etf.category} ETF
                  </span>
                  <h3 className="text-base font-extrabold text-white truncate group-hover:text-sky-primary transition-colors mt-0.5">
                    {etf.name}
                  </h3>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
