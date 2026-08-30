'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { HeartOff, LogIn } from 'lucide-react';
import WishlistButton from '@/app/components/WishlistButton';

interface ETF {
  ticker: string;
  name: string;
  category: string;
  report: string;
  leverage: string | null;
}

interface WishlistGridProps {
  wishlist: ETF[];
  isLoggedIn: boolean;
}

export default function WishlistGrid({ wishlist, isLoggedIn }: WishlistGridProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleImageError = (ticker: string) => {
    setImageErrors((prev) => ({ ...prev, [ticker]: true }));
  };

  // 모바일 가로 스크롤 시 활성 인덱스 계산
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollLeft = container.scrollLeft;
    const itemWidth = container.clientWidth / 2; // 카드 2장이 100%이므로 카드 1개는 너비의 절반
    if (itemWidth > 0) {
      const index = Math.round(scrollLeft / itemWidth);
      setActiveIndex(index);
    }
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

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-box-bg border border-t-[#000000] border-b-[#000000] border-l-white border-r-white rounded-none text-center space-y-6 max-w-2xl mx-auto shadow-sm">
        <div className="w-16 h-16 bg-red-accent/10 rounded-full flex items-center justify-center text-[#000000]">
          <LogIn className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-extrabold text-gray-900 select-none">로그인이 필요한 service입니다</h3>
          <p className="text-base text-gray-500">찜 목록을 확인하고 관리하려면 로그인해 주세요.</p>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-2 px-6 py-2.5 bg-[#000000] hover:bg-gray-900 active:scale-95 text-white text-base font-black rounded-none shadow-md transition-all"
        >
          <span>로그인하러 가기</span>
        </Link>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-box-bg border border-t-[#000000] border-b-[#000000] border-l-white border-r-white rounded-none text-center space-y-4 max-w-2xl mx-auto shadow-sm">
        <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center text-gray-400">
          <HeartOff className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-extrabold text-gray-900 select-none">찜한 ETF가 없습니다</h3>
          <p className="text-base text-gray-500">관심 있는 ETF를 찾아 하트를 눌러보세요!</p>
        </div>
        <Link
          href="/"
          className="text-base font-bold text-sky-600 hover:text-sky-700 hover:underline"
        >
          ETF 목록 둘러보기 &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <span className="text-sm text-gray-500 font-semibold">
          내가 찜한 ETF: <strong className="text-gray-900 text-base">{wishlist.length}</strong>개 항목
        </span>
      </div>

      {/* 모바일 560px 이하 flex-nowrap 스냅 레이아웃, 초과 시 grid 레이아웃 분기 */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex flex-nowrap overflow-x-auto min-[561px]:grid min-[561px]:grid-cols-3 lg:grid-cols-6 gap-6 snap-x snap-mandatory scroll-smooth pb-4 scrollbar-none"
      >
        {wishlist.map((etf, idx) => {
          const isError = imageErrors[etf.ticker];
          const storageUrl = `https://vypehsjeufupmrpgcsbd.supabase.co/storage/v1/object/public/upload/poster-etf/${etf.ticker.toUpperCase()}.png`;

          return (
            <motion.div
              key={etf.ticker}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (idx % 6) * 0.08 }}
              whileHover={{ scale: 1.05 }}
              className="w-[calc(50%-12px)] shrink-0 min-[561px]:w-auto snap-start group flex flex-col bg-box-bg border border-t-[#000000] border-b-[#000000] border-l-white border-r-white rounded-none hover:shadow-xl transition-all"
            >
              <Link href={`/etf/${etf.ticker}`} className="block relative aspect-2/3 w-full overflow-hidden bg-navy/60">
                {/* poster 상단 테두리 위에 이름 표시 */}
                <div className="absolute top-0 left-0 right-0 z-10 px-3 py-1.5 bg-linear-to-b from-black/80 to-transparent">
                  <span className="text-xs font-bold text-silver truncate block">
                    {etf.ticker}
                  </span>
                </div>

                {!isError ? (
                  <Image
                    src={storageUrl}
                    alt={`${etf.ticker} Poster`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={() => handleImageError(etf.ticker)}
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
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2 leading-snug">
                    {etf.name}
                  </h3>
                </Link>

                <div className="flex items-center justify-between border-t border-[#000000] pt-2 mt-auto">
                  <span className="text-sm text-gray-700 font-medium">
                    {etf.category}
                  </span>
                  <WishlistButton
                    ticker={etf.ticker}
                    initialIsWished={true} // 이 그리드는 모두 찜한 ETF들만 보여줌
                    isLoggedIn={isLoggedIn}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 모바일 전용 닷 인디케이터 (560px 이하에서만 노출) */}
      <div className="flex min-[561px]:hidden justify-center gap-1.5 pt-4">
        {wishlist.map((_, idx) => (
          <span
            key={idx}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
              activeIndex === idx ? 'bg-[#000000] w-3' : 'bg-[#000000]/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
