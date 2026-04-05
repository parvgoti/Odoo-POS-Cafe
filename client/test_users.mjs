import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vvkdptycohrersbwqiqr.supabase.co';
const supabaseKey = 'sb_publishable_ry_Z-Tb1--Mv_jmJNtvh8g_udvWejdQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data } = await supabase.from('users').select('*');
  console.log('users:', data);
  const { data: admin } = await supabase.from('users').select('*').eq('role', 'admin').limit(1);
  if (admin && admin.length > 0) {
    console.log('Admin user found:', admin[0].id);
    const { error } = await supabase.from('pos_sessions').insert({
      opened_by: admin[0].id,
      opening_amount: 200,
      status: 'open',
    });
    console.log('Insert with admin id error:', error);
  }
}

run();
