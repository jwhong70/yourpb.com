'use server'

import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export interface SignUpParams {
  name: string;
  email: string;
  password: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

/**
 * 회원가입 Action
 * - Supabase Auth에 사용자 정보를 전달해 계정을 생성합니다.
 * - 이메일 인증이 활성화된 상태여야 이메일 인증 완료 후 실제 로그인이 가능합니다.
 * - raw_user_meta_data에 이름을 전달하여 DB handle_new_user 트리거가 동작하게 합니다.
 */
export async function signUp(params: SignUpParams) {
  const supabase = await createClient();
  const { name, email, password } = params;

  if (!name || !email || !password) {
    return { error: '이름, 이메일, 비밀번호를 모두 입력해 주세요.' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { 
    success: true, 
    message: '회원가입 인증 메일이 발송되었습니다. 가입을 완료하려면 메일함에서 링크를 클릭해 주세요.' 
  };
}

/**
 * 로그인 Action
 * - 이메일과 비밀번호로 로그인 처리합니다.
 * - 성공 시 홈('/')으로 리다이렉트합니다.
 */
export async function signIn(params: SignInParams) {
  const supabase = await createClient();
  const { email, password } = params;

  if (!email || !password) {
    return { error: '이메일과 비밀번호를 입력해 주세요.' };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // 로그인 성공 시 기존 데모 쿠키 초기화
  const cookieStore = await cookies();
  cookieStore.set('demo_user', '', { expires: new Date(0), path: '/' });
  cookieStore.set('demo_membership_status', '', { expires: new Date(0), path: '/' });

  redirect('/');
}

/**
 * 로그아웃 Action
 * - 세션을 종료하고 홈('/')으로 리다이렉트합니다.
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // 로그아웃 시 기존 데모 쿠키 초기화
  const cookieStore = await cookies();
  cookieStore.set('demo_user', '', { expires: new Date(0), path: '/' });
  cookieStore.set('demo_membership_status', '', { expires: new Date(0), path: '/' });

  redirect('/');
}

/**
 * 현재 로그인 세션 사용자 조회 Action
 * - 현재 세션의 인증 사용자 및 DB 연동 프로필(멤버십 정보 포함)을 조회합니다.
 * - 비로그인 시 null을 반환합니다.
 */
export async function getSessionUser() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // 1. 실제 로그인 세션이 존재하는 경우 데모 쿠키와 관계없이 실제 세션을 최우선 보장
  if (user && !authError) {
    const { data: profile, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (dbError || !profile) {
      // 트리거 미동작 등 일시적인 문제 발생 시 Auth 메타데이터를 기반으로 기본 객체 반환
      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || '',
        membership_status: 'free',
        subscription_end_date: null,
      };
    }

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      membership_status: profile.membership_status,
      subscription_end_date: profile.subscription_end_date,
    };
  }

  // 2. 비로그인 상태일 때만 데모 쿠키 검사
  const cookieStore = await cookies();
  const isDemo = cookieStore.get('demo_user')?.value === 'true';
  const demoStatus = cookieStore.get('demo_membership_status')?.value;

  if (isDemo) {
    return {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'demo@yourpb.com',
      name: '홍길동 PB',
      membership_status: demoStatus || 'premium',
      subscription_end_date: null,
    };
  }

  return null;
}

/**
 * 구글 소셜 로그인 Action
 */
export async function signInWithGoogle() {
  const supabase = await createClient();

  const { headers } = await import('next/headers');
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const origin = `${protocol}://${host}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

/**
 * 카카오 소셜 로그인 Action
 */
export async function signInWithKakao() {
  const supabase = await createClient();

  const { headers } = await import('next/headers');
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const origin = `${protocol}://${host}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

