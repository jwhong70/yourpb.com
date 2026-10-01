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
  const targetEmail = 'jwhong70@naver.com';
  console.log(`Resetting membership for ${targetEmail}...`);

  const { data, error } = await supabase
    .from('users')
    .update({
      membership_status: 'free',
      subscription_end_date: null
    })
    .eq('email', targetEmail)
    .select();

  if (error) {
    console.error('Update failed:', error);
  } else {
    console.log('Update successful! Updated user record:', data);
  }
}

main();
