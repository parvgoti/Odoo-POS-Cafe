import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vvkdptycohrersbwqiqr.supabase.co';
const supabaseKey = 'sb_publishable_ry_Z-Tb1--Mv_jmJNtvh8g_udvWejdQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('pos_sessions').select('*');
  console.log('pos_sessions data:', data);
  console.log('pos_sessions error:', error);
}

run();
