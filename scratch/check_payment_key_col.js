const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envPath = 'c:/coding/YOURPB/.env';
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = match[2] || '';
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[match[1]] = val.trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  // users 테이블에 last_payment_key 업데이트 시도
  const { data, error } = await supabase
    .from('users')
    .update({ last_payment_key: 'test_key' })
    .eq('email', 'jwhong70@naver.com')
    .select();

  console.log('Update last_payment_key test result:', { data, error });
}

main();
