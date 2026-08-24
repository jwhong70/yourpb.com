const supabaseUrl = "https://vypehsjeufupmrpgcsbd.supabase.co";
const anonKey = "sb_publishable_HOZA4OiIsDSk_ctJlFoq3w_kqUU2104";

async function main() {
  const url = `${supabaseUrl}/storage/v1/object/list/upload`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prefix: "poster-etf",
      limit: 100
    })
  });
  if (!res.ok) {
    console.error('Error status:', res.status, await res.text());
    return;
  }
  const data = await res.json();
  console.log('Files in poster-etf:');
  console.log(data.map(f => f.name));
}
main();
