'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase-server';

/**
 * 사용자의 멤버십 상태를 Premium으로 업그레이드하는 서버 액션
 * @param plan 플랜 종류 ('1month' | '12months')
 * @returns 성공 여부 및 결과 객체
 */
export async function upgradeToPremium(plan: '1month' | '12months') {
  try {
    const supabase = await createClient();

    // 1. 현재 세션 로그인 유저 정보 조회
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 2. 만료일 계산
    const expiryDate = new Date();
    if (plan === '1month') {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (plan === '12months') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      return { success: false, error: '올바르지 않은 구독 플랜 종류입니다.' };
    }

    // YYYY-MM-DD 형태로 변환
    const subscriptionEndDate = expiryDate.toISOString().split('T')[0];

    // 3. users 테이블의 membership_status 및 subscription_end_date 정보 갱신
    const { error: dbError } = await supabase
      .from('users')
      .update({
        membership_status: 'premium',
        subscription_end_date: subscriptionEndDate
      })
      .eq('id', user.id);

    if (dbError) {
      console.error('Database update error during upgradeToPremium:', dbError);
      return { success: false, error: '사용자 프로필 멤버십 정보 업데이트에 실패했습니다.' };
    }

    // 4. 헤더 뱃지 및 로컬 렌더링 즉시 반영을 위한 멤버십 데모 쿠키 동시 갱신
    const cookieStore = await cookies();
    cookieStore.set('demo_membership_status', 'premium', { path: '/' });

    // 5. 캐시 강제 재검증 처리
    revalidatePath('/');
    revalidatePath('/subscribe');
    revalidatePath('/wishlist');

    return { success: true };
  } catch (err: any) {
    console.error('upgradeToPremium execution failure:', err);
    return { success: false, error: err.message || '멤버십 업그레이드 처리 중 예상치 못한 오류가 발생했습니다.' };
  }
}

/**
 * 토스페이먼츠 결제 승인을 요청하고 성공 시 멤버십을 업그레이드하는 서버 액션
 */
export async function confirmTossPayment(
  paymentKey: string,
  orderId: string,
  amount: number,
  plan: '1month' | '12months'
) {
  try {
    // 1. 토스페이먼츠 승인 API 호출
    const secretKey = process.env.TOSS_SECRET_KEY || 'test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6';
    const basicToken = Buffer.from(`${secretKey}:`).toString('base64');

    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Toss Payments confirmation failed:', data);
      return { success: false, error: data.message || '결제 승인 요청이 실패했습니다.' };
    }

    // 2. 승인 성공 시 멤버십 업그레이드 진행
    const upgradeResult = await upgradeToPremium(plan);
    if (!upgradeResult.success) {
      return { success: false, error: upgradeResult.error };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Toss Payments confirmTossPayment execution error:', err);
    return { success: false, error: err.message || '결제 승인 처리 중 예상치 못한 오류가 발생했습니다.' };
  }
}
