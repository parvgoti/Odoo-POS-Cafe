import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vvkdptycohrersbwqiqr.supabase.co';
const supabaseKey = 'sb_publishable_ry_Z-Tb1--Mv_jmJNtvh8g_udvWejdQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Testing insert into pos_sessions...');
  const { data, error } = await supabase.from('pos_sessions').insert({
    opened_by: null,
    opening_amount: 200,
    status: 'open',
  }).select();
  
  console.log('Insert result:', data);
  console.log('Insert error:', error);
}

run();
