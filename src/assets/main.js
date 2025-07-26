import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
const supabaseUrl = 'https://YOURPROJECT.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch simulasi
async function getSimulasi() {
  let { data, error } = await supabase.from('simulasi').select('*');
  if (error) console.error(error);
  else return data;
}
// Fetch worksheet
async function getWorksheet() {
  let { data, error } = await supabase.from('worksheet').select('*');
  if (error) console.error(error);
  else return data;
}

// Lanjutkan dengan renderContent() seperti biasa, tapi datanya dari getSimulasi/getWorksheet