import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const cookieStore = await cookies();
    
    // 1. 리다이렉트할 URL 결정 및 NextResponse 생성
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const host = forwardedHost || request.headers.get('host') || '';
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    
    let redirectUrl = `${origin}${next}`;
    if (!isLocal && forwardedHost) {
      const proto = forwardedProto || 'https';
      redirectUrl = `${proto}://${forwardedHost}${next}`;
    }
    
    const response = NextResponse.redirect(redirectUrl);

    // 2. response 객체의 cookies를 갱신할 수 있는 Supabase 클라이언트 생성
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              // Server-side cookie store 업데이트
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
              // ★ 브라우저로 내려갈 Response 객체의 cookies에도 저장 (중요)
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              );
            } catch {
              // Ignore if called in layout or other server components
            }
          },
        },
      }
    );

    // 3. 인증 코드를 세션으로 교환 (성공 시 setAll을 통해 response에 쿠키가 세팅됨)
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return response;
    }
  }

  // 에러 발생 시 로그인 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/login?error=OAuth%20인증에%20실패했습니다.`);
}
