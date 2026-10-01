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
  const userId = '7a3df8e7-734f-42ae-a44d-ec749493ba3c'; // jwhong70@naver.com
  const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { last_payment_key: 'sample_payment_key_123' }
  });

  console.log('Update user_metadata result:', { user: updateData?.user?.user_metadata, updateError });

  const { data: getUserData, error: getUserError } = await supabase.auth.admin.getUserById(userId);
  console.log('Get user_metadata result:', { user: getUserData?.user?.user_metadata, getUserError });
}

main();
