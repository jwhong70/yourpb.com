'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';

/**
 * 사용자의 멤버십 상태를 Premium으로 업그레이드하는 서버 액션
 * @param plan 플랜 종류 ('1month' | '6months')
 * @returns 성공 여부 및 결과 객체
 */
export async function upgradeToPremium(plan: '1month' | '6months') {
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
    } else if (plan === '6months') {
      expiryDate.setMonth(expiryDate.getMonth() + 6);
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
  plan: '1month' | '6months'
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

/**
 * 회원의 프리미엄 구독을 즉시 해지하고 무료(Free) 회원으로 다운그레이드하는 서버 액션
 * @param cancelReason 취소 사유
 */
export async function cancelSubscription(cancelReason: string = '사용자 요청 구독 취소') {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // users 테이블의 membership_status를 free로 리셋
    const { error: dbError } = await supabase
      .from('users')
      .update({
        membership_status: 'free',
        subscription_end_date: null
      })
      .eq('id', user.id);

    if (dbError) {
      console.error('Database update error during cancelSubscription:', dbError);
      return { success: false, error: '회원 등급 변경에 실패했습니다.' };
    }

    // 데모 쿠키 초기화
    const cookieStore = await cookies();
    cookieStore.set('demo_membership_status', '', { expires: new Date(0), path: '/' });

    // 캐시 갱신
    revalidatePath('/');
    revalidatePath('/subscribe');
    revalidatePath('/wishlist');

    return { success: true, message: '구독이 성공적으로 해지되었습니다.' };
  } catch (err: any) {
    console.error('cancelSubscription execution failure:', err);
    return { success: false, error: err.message || '구독 해지 처리 중 오류가 발생했습니다.' };
  }
}

/**
 * 관리자용: 고객의 이메일로 즉시 멤버십을 Free로 리셋하는 서버 액션
 * (상점관리자에서 환불 후 Supabase를 직접 열지 않고 원클릭으로 초기화 가능)
 */
export async function adminResetUserMembership(email: string) {
  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('users')
      .update({
        membership_status: 'free',
        subscription_end_date: null,
      })
      .eq('email', email)
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/subscribe');

    return { success: true, user: data?.[0] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
