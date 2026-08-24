const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

console.log('Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listStorage() {
  const { data, error } = await supabase.storage.from('upload').list('model-portfolio');
  if (error) {
    console.error('Error listing storage:', error);
    return;
  }
  console.log('Files in model-portfolio:');
  console.log(data.map(f => f.name));
}

listStorage();
