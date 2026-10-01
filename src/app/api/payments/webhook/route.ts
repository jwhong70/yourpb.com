import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

/**
 * 토스페이먼츠 웹훅(Webhook) 수신 엔드포인트
 * - 결제 취소/환불(CANCELED, PARTIAL_CANCELED) 이벤트 발생 시 회원 등급을 자동으로 'free'로 동기화합니다.
 * - 결제 상태 변경(PAYMENT_STATUS_CHANGED)을 실시간으로 추적합니다.
 */
export async function GET() {
  const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasTossSecret = !!process.env.TOSS_SECRET_KEY;

  return NextResponse.json({
    status: 'online',
    service: 'YourPB Toss Webhook Handler',
    envCheck: {
      NEXT_PUBLIC_SUPABASE_URL: hasSupabaseUrl,
      SUPABASE_SERVICE_ROLE_KEY: hasServiceRoleKey,
      TOSS_SECRET_KEY: hasTossSecret,
    },
    message: hasServiceRoleKey 
      ? 'Webhook is ready and configured properly.' 
      : 'WARNING: SUPABASE_SERVICE_ROLE_KEY is missing in environment variables!'
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[Toss Webhook] Received raw webhook payload:', JSON.stringify(body, null, 2));

    const eventType = body.eventType;
    const data = body.data || body;

    const rawStatus = data?.status;
    const rawOrderId = data?.orderId;
    const paymentKey = data?.paymentKey;
    const totalAmount = data?.totalAmount;
    const customerKey = data?.customerKey;
    const customerEmail = data?.customerEmail;

    let finalStatus = rawStatus;
    let finalOrderId = rawOrderId;
    let finalCancels = data?.cancels;

    // 1. paymentKey가 존재할 경우 토스 API를 직접 조회하여 최신 실시간 결제 상태 취득
    const tossSecretKey = process.env.TOSS_SECRET_KEY;
    if (paymentKey && tossSecretKey) {
      try {
        const basicToken = Buffer.from(`${tossSecretKey}:`).toString('base64');
        const tossRes = await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}`, {
          headers: {
            'Authorization': `Basic ${basicToken}`,
            'Content-Type': 'application/json',
          },
        });
        if (tossRes.ok) {
          const tossData = await tossRes.json();
          console.log('[Toss Webhook] Fetched direct payment data from Toss API:', JSON.stringify(tossData, null, 2));
          if (tossData.status) finalStatus = tossData.status;
          if (tossData.orderId) finalOrderId = tossData.orderId;
          if (tossData.cancels) finalCancels = tossData.cancels;
        }
      } catch (apiErr) {
        console.warn('[Toss Webhook] Could not fetch payment directly from Toss API:', apiErr);
      }
    }

    console.log(`[Toss Webhook] EventType: ${eventType}, FinalStatus: ${finalStatus}, OrderId: ${finalOrderId}, PaymentKey: ${paymentKey}`);

    const supabase = createAdminClient();

    // 2. 유저 식별자(userId) 찾기 (4중 다층 매칭 전략)
    let targetUserId: string | null = null;
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

    // 전략 1: customerKey가 UUID인 경우
    if (customerKey && uuidRegex.test(customerKey)) {
      targetUserId = customerKey;
    }

    // 전략 2: orderId 안에 UUID가 포함되어 있는 경우 (예: order_UUID_timestamp)
    if (!targetUserId && finalOrderId && typeof finalOrderId === 'string') {
      const match = finalOrderId.match(uuidRegex);
      if (match) {
        targetUserId = match[0];
      }
    }

    // 전략 3: customerEmail로 users 테이블 조회
    if (!targetUserId && customerEmail) {
      const { data: userByEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', customerEmail)
        .maybeSingle();
      if (userByEmail) {
        targetUserId = userByEmail.id;
      }
    }

    // 전략 4 (최후의 안전장치): 구버전 결제창으로 인해 orderId에 UUID가 없는 경우
    // 취소 이벤트인데 targetUserId를 못 찾았다면, 현재 membership_status가 'premium'인 유저 중 가장 최근 가입/갱신 유저를 탐색
    const isCancelled = 
      finalStatus === 'CANCELED' ||
      finalStatus === 'PARTIAL_CANCELED' ||
      finalStatus === 'ABORTED' ||
      finalStatus === 'EXPIRED' ||
      (Array.isArray(finalCancels) && finalCancels.length > 0);

    if (!targetUserId && isCancelled) {
      console.log('[Toss Webhook] Fallback: Searching for active premium users to process cancellation...');
      const { data: premiumUsers } = await supabase
        .from('users')
        .select('id, email, subscription_end_date')
        .eq('membership_status', 'premium')
        .order('subscription_end_date', { ascending: false });

      if (premiumUsers && premiumUsers.length > 0) {
        // 프리미엄 유저 중 1순위 타겟 지정
        targetUserId = premiumUsers[0].id;
        console.log(`[Toss Webhook] Fallback identified target user: ${premiumUsers[0].email} (${targetUserId})`);
      }
    }

    console.log(`[Toss Webhook] Identified targetUserId: ${targetUserId || 'NOT_FOUND'}`);

    // 3. 결제 취소 / 환불 처리
    if (isCancelled) {
      console.log(`[Toss Webhook] Processing cancellation for order: ${finalOrderId}, status: ${finalStatus}`);

      if (targetUserId) {
        // userId가 확인되면 즉시 회원 등급을 'free'로 강등 및 만료일 초기화
        const { data: updatedData, error: updateError } = await supabase
          .from('users')
          .update({
            membership_status: 'free',
            subscription_end_date: null,
          })
          .eq('id', targetUserId)
          .select();

        if (updateError) {
          console.error('[Toss Webhook] Failed to downgrade user membership in DB:', updateError);
        } else {
          console.log(`[Toss Webhook] Successfully downgraded user (${targetUserId}) to free membership. Result:`, updatedData);
        }
      } else {
        console.warn(`[Toss Webhook] Could not identify target user from payload (orderId: ${finalOrderId}, customerKey: ${customerKey}, email: ${customerEmail}).`);
      }
    }

    // 4. 결제 완료(DONE) 이벤트 처리 (웹훅을 통한 백업)
    else if (finalStatus === 'DONE') {
      console.log(`[Toss Webhook] Payment confirmed (DONE) for order: ${finalOrderId}, amount: ${totalAmount}`);
    }

    // 토스페이먼츠 웹훅 규격: 200 OK 응답 반환
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      event: eventType,
      orderId: finalOrderId,
      targetUserId,
      paymentStatus: finalStatus 
    });

  } catch (err: any) {
    console.error('[Toss Webhook] Error processing webhook:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Internal webhook error' },
      { status: 500 }
    );
  }
}
