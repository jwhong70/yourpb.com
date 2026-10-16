'use client';

import React, { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toggleWishlist } from '@/app/actions/wishlist';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

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
  const [prevInitial, setPrevInitial] = useState(initialIsWished);
  const [isWished, setIsWished] = useState(initialIsWished);
  const [isPending, startTransition] = useTransition();

  if (prevInitial !== initialIsWished) {
    setPrevInitial(initialIsWished);
    setIsWished(initialIsWished);
  }

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error('로그인이 필요한 서비스입니다', {
        description: '관심 종목을 저장하려면 로그인해 주세요.',
        action: {
          label: '로그인',
          onClick: () => router.push('/login'),
        },
      });
      return;
    }

    // 1. UI 즉시 반응 (낙관적 업데이트)
    const willBeWished = !isWished;
    setIsWished(willBeWished);

    // 2. 서버 액션 트리거
    startTransition(async () => {
      try {
        const result = await toggleWishlist(ticker);
        if (result && result.error) {
          // 서버 에러 응답 시 원래 상태로 롤백
          setIsWished(!willBeWished);
          toast.error(result.error);
        } else {
          if (willBeWished) {
            toast.success(`${ticker} 관심 종목에 추가되었습니다.`);
          } else {
            toast.info(`${ticker} 관심 종목에서 제외되었습니다.`);
          }
        }
      } catch (error) {
        // 네트워크 에러 시 원래 상태로 롤백
        setIsWished(!willBeWished);
        toast.error('관심 종목 변경 중 오류가 발생했습니다.');
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
