'use server'

import { createClient } from '@/lib/supabase-server';
import { getSessionUser } from './auth';
import { revalidatePath } from 'next/cache';

/**
 * ETF 찜하기 토글 (이미 찜했으면 해제, 아니면 추가)
 */
export async function toggleWishlist(ticker: string) {
  const supabase = await createClient();
  const user = await getSessionUser();

  if (!user) {
    return { error: '로그인이 필요한 기능입니다.' };
  }

  try {
    // 기존에 이미 찜했는지 확인
    const { data: existing, error: checkError } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('etf_ticker', ticker)
      .maybeSingle();

    if (checkError) {
      console.error('wishlist check error:', checkError);
      return { error: '찜 상태 확인 중 오류가 발생했습니다.' };
    }

    if (existing) {
      // 존재하면 찜 해제
      const { error: deleteError } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', existing.id);

      if (deleteError) {
        console.error('wishlist delete error:', deleteError);
        return { error: '찜 해제 중 오류가 발생했습니다.' };
      }
    } else {
      // 존재하지 않으면 찜 추가
      const { error: insertError } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          etf_ticker: ticker,
        });

      if (insertError) {
        console.error('wishlist insert error:', insertError);
        return { error: '찜 등록 중 오류가 발생했습니다.' };
      }
    }

    // 관련 페이지 새로고침
    revalidatePath('/');
    revalidatePath('/wishlist');
    revalidatePath(`/etf/${ticker}`);

    return { success: true };
  } catch (error) {
    console.error('toggleWishlist error:', error);
    return { error: '처리 중 서버 오류가 발생했습니다.' };
  }
}

/**
 * 현재 로그인한 사용자의 찜한 ETF 목록 조회
 * - ETF 정보를 함께 조인하여 반환합니다.
 */
export async function getWishlist() {
  const supabase = await createClient();
  const user = await getSessionUser();

  if (!user) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        etf_ticker,
        etf_list:etf_list (
          ticker,
          name,
          category,
          report,
          leverage
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('getWishlist error:', error);
      return [];
    }

    if (!data) return [];

    // 관계 데이터 flattening 및 유효 데이터 필터링
    return data
      .map((item: any) => item.etf_list)
      .filter((etf: any) => etf !== null);
  } catch (error) {
    console.error('getWishlist exception:', error);
    return [];
  }
}
