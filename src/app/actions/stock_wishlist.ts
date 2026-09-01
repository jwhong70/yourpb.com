'use server'

import { createClient } from '@/lib/supabase-server';
import { getSessionUser } from './auth';
import { revalidatePath } from 'next/cache';

/**
 * 주식 찜하기 토글 (이미 찜했으면 해제, 아니면 추가)
 */
export async function toggleStockWishlist(ticker: string) {
  const supabase = await createClient();
  const user = await getSessionUser();

  if (!user) {
    return { error: '로그인이 필요한 기능입니다.' };
  }

  try {
    // 기존에 이미 찜했는지 확인
    const { data: existing, error: checkError } = await supabase
      .from('stock_wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('stock_ticker', ticker)
      .maybeSingle();

    if (checkError) {
      console.error('stock_wishlist check error:', checkError);
      return { error: '찜 상태 확인 중 오류가 발생했습니다.' };
    }

    if (existing) {
      // 존재하면 찜 해제
      const { error: deleteError } = await supabase
        .from('stock_wishlists')
        .delete()
        .eq('id', existing.id);

      if (deleteError) {
        console.error('stock_wishlist delete error:', deleteError);
        return { error: '찜 해제 중 오류가 발생했습니다.' };
      }
    } else {
      // 존재하지 않으면 찜 추가
      const { error: insertError } = await supabase
        .from('stock_wishlists')
        .insert({
          user_id: user.id,
          stock_ticker: ticker,
        });

      if (insertError) {
        console.error('stock_wishlist insert error:', insertError);
        return { error: '찜 등록 중 오류가 발생했습니다.' };
      }
    }

    // 관련 페이지 새로고침
    revalidatePath('/stock');
    revalidatePath(`/stock/${ticker}`);

    return { success: true };
  } catch (error) {
    console.error('toggleStockWishlist error:', error);
    return { error: '처리 중 서버 오류가 발생했습니다.' };
  }
}

/**
 * 현재 로그인한 사용자의 찜한 주식 티커 목록 조회
 */
export async function getStockWishlist(): Promise<string[]> {
  const supabase = await createClient();
  const user = await getSessionUser();

  if (!user) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('stock_wishlists')
      .select('stock_ticker')
      .eq('user_id', user.id);

    if (error) {
      console.error('getStockWishlist error:', error);
      return [];
    }

    if (!data) return [];

    return data.map((item: any) => item.stock_ticker).filter(Boolean);
  } catch (error) {
    console.error('getStockWishlist exception:', error);
    return [];
  }
}
