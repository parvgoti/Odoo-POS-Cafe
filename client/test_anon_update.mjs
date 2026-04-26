import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vvkdptycohrersbwqiqr.supabase.co';
const supabaseKey = 'sb_publishable_ry_Z-Tb1--Mv_jmJNtvh8g_udvWejdQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: tables } = await supabase.from('tables').select('id, table_number').limit(1);
  if (tables && tables.length > 0) {
    const tblId = tables[0].id;
    console.log('Testing anon update on table:', tables[0].table_number);
    const { error: anonErr } = await supabase.from('tables').update({ status: 'occupied' }).eq('id', tblId);
    console.log('Anon update error:', anonErr);
  }
}

run();
