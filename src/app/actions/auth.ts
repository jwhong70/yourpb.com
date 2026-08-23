'use server'

import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

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

  redirect('/');
}

/**
 * 로그아웃 Action
 * - 세션을 종료하고 홈('/')으로 리다이렉트합니다.
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
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

  if (authError || !user) {
    return null;
  }

  // users 테이블에서 멤버십 상태 및 프로필 정보 조회
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
