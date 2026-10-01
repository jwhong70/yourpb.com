import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

/**
 * 토스페이먼츠 웹훅(Webhook) 수신 엔드포인트
 * - 결제 취소/환불(CANCELED, PARTIAL_CANCELED) 이벤트 발생 시 회원 등급을 자동으로 'free'로 갱신합니다.
 * - 결제 상태 변경(PAYMENT_STATUS_CHANGED)을 실시간으로 추적합니다.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[Toss Webhook] Received webhook event:', JSON.stringify(body, null, 2));

    const { eventType, data } = body;

    if (!data) {
      return NextResponse.json({ message: 'No data payload found' }, { status: 400 });
    }

    const { status, orderId, paymentKey, totalAmount } = data;
    console.log(`[Toss Webhook] EventType: ${eventType}, Status: ${status}, OrderId: ${orderId}, PaymentKey: ${paymentKey}`);

    // orderId 파싱: "order_${userId}_${randomId}" 형식에서 userId 추출
    let userId: string | null = null;
    if (orderId && typeof orderId === 'string') {
      const parts = orderId.split('_');
      if (parts.length >= 3 && parts[0] === 'order') {
        userId = parts[1];
      }
    }

    const supabase = createAdminClient();

    // 1. 결제 취소 / 환불 / 만료 / 중단 이벤트 처리
    if (
      status === 'CANCELED' ||
      status === 'PARTIAL_CANCELED' ||
      status === 'ABORTED' ||
      status === 'EXPIRED'
    ) {
      console.log(`[Toss Webhook] Processing cancellation for order: ${orderId}, status: ${status}`);

      if (userId) {
        // userId가 확인되면 즉시 회원 등급을 'free'로 강등 및 만료일 초기화
        const { error: updateError } = await supabase
          .from('users')
          .update({
            membership_status: 'free',
            subscription_end_date: null,
          })
          .eq('id', userId);

        if (updateError) {
          console.error('[Toss Webhook] Failed to downgrade user membership:', updateError);
        } else {
          console.log(`[Toss Webhook] Successfully downgraded user (${userId}) to free membership.`);
        }
      } else {
        console.warn(`[Toss Webhook] Could not extract userId directly from orderId: ${orderId}`);
      }
    }

    // 2. 결제 완료(DONE) 이벤트 처리 (프론트엔드 리다이렉트 유실 시 백업 보장)
    else if (status === 'DONE') {
      console.log(`[Toss Webhook] Payment confirmed (DONE) for order: ${orderId}, amount: ${totalAmount}`);
    }

    // 토스페이먼츠 웹훅은 200 OK 응답을 받아야 재전송을 중단합니다.
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      event: eventType,
      orderId,
      paymentStatus: status 
    });

  } catch (err: any) {
    console.error('[Toss Webhook] Error processing webhook:', err);
    return NextResponse.json(
      { status: 'error', message: err.message || 'Internal webhook error' },
      { status: 500 }
    );
  }
}
