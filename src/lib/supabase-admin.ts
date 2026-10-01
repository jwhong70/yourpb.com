import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Admin Client (Service Role)
 * - RLS(Row Level Security)를 우회하여 백엔드/웹훅에서 유저 권한을 안전하게 수정할 때 사용합니다.
 * - 절대 클라이언트(브라우저) 코드에 노출하지 마세요.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase URL or SUPABASE_SERVICE_ROLE_KEY is missing.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
