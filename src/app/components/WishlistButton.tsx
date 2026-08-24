'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toggleWishlist } from '@/app/actions/wishlist';
import { motion } from 'framer-motion';

interface WishlistButtonProps {
  ticker: string;
  initialIsWished: boolean;
  isLoggedIn: boolean;
}

export default function WishlistButton({
  ticker,
  initialIsWished,
  isLoggedIn,
}: WishlistButtonProps) {
  const router = useRouter();
  const [isWished, setIsWished] = useState(initialIsWished);
  const [isPending, startTransition] = useTransition();

  // 부모 컴포넌트에서 전달한 상태가 변경될 시 동기화 (예: 다른 곳에서 토글되거나 리밸리데이션 시)
  useEffect(() => {
    setIsWished(initialIsWished);
  }, [initialIsWished]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      alert('/login으로 이동하세요');
      router.push('/login');
      return;
    }

    // 1. UI 즉시 반응 (낙관적 업데이트)
    setIsWished((prev) => !prev);

    // 2. 서버 액션 트리거
    startTransition(async () => {
      try {
        const result = await toggleWishlist(ticker);
        if (result && result.error) {
          // 서버 에러 응답 시 원래 상태로 롤백
          setIsWished((prev) => !prev);
          alert(result.error);
        }
      } catch (error) {
        // 네트워크 에러 시 원래 상태로 롤백
        setIsWished((prev) => !prev);
        console.error('Failed to toggle wishlist:', error);
      }
    });
  };

  return (
    <motion.button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.85 }}
      className={`p-1.5 rounded-full transition-all cursor-pointer bg-gray-50 hover:bg-gray-100 hover:shadow-xs border border-gray-100 ${
        isPending ? 'opacity-60 cursor-not-allowed' : ''
      }`}
      title={isWished ? '찜 해제' : '찜하기'}
    >
      <Heart
        className={`w-4 h-4 transition-colors duration-200 ${
          isWished 
            ? 'fill-[#dc2626] text-[#dc2626] drop-shadow-[0_1px_3px_rgba(220,38,38,0.4)]' 
            : 'text-gray-400 hover:text-[#dc2626]'
        }`}
      />
    </motion.button>
  );
}
