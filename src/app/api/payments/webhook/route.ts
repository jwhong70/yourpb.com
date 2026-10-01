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

    const { eventType, data } = body;

    if (!data) {
      return NextResponse.json({ message: 'No data payload found' }, { status: 400 });
    }

    const { status, orderId, paymentKey, totalAmount, customerKey, customerEmail } = data;
    console.log(`[Toss Webhook] EventType: ${eventType}, Status: ${status}, OrderId: ${orderId}, CustomerKey: ${customerKey}, Email: ${customerEmail}`);

    const supabase = createAdminClient();

    // 1. 유저 식별자(userId) 찾기 (3중 폴백 전략)
    let targetUserId: string | null = null;
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

    // 전략 1: customerKey가 UUID인 경우
    if (customerKey && uuidRegex.test(customerKey)) {
      targetUserId = customerKey;
    }

    // 전략 2: orderId 안에 UUID가 포함되어 있는 경우 (예: order_UUID_timestamp)
    if (!targetUserId && orderId && typeof orderId === 'string') {
      const match = orderId.match(uuidRegex);
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

    console.log(`[Toss Webhook] Identified targetUserId: ${targetUserId || 'NOT_FOUND'}`);

    // 2. 결제 취소 / 환불 / 만료 / 중단 이벤트 처리
    const isCancelled = 
      status === 'CANCELED' ||
      status === 'PARTIAL_CANCELED' ||
      status === 'ABORTED' ||
      status === 'EXPIRED' ||
      (Array.isArray(data.cancels) && data.cancels.length > 0);

    if (isCancelled) {
      console.log(`[Toss Webhook] Processing cancellation for order: ${orderId}, status: ${status}`);

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
        console.warn(`[Toss Webhook] Could not identify target user from payload (orderId: ${orderId}, customerKey: ${customerKey}, email: ${customerEmail}).`);
      }
    }

    // 3. 결제 완료(DONE) 이벤트 처리 (웹훅을 통한 백업)
    else if (status === 'DONE') {
      console.log(`[Toss Webhook] Payment confirmed (DONE) for order: ${orderId}, amount: ${totalAmount}`);
    }

    // 토스페이먼츠 웹훅 규격: 200 OK 응답 반환
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      event: eventType,
      orderId,
      targetUserId,
      paymentStatus: status 
    });

  } catch (err: any) {
    console.error('[Toss Webhook] Error processing webhook:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Internal webhook error' },
      { status: 500 }
    );
  }
}
