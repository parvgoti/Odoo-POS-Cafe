import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vvkdptycohrersbwqiqr.supabase.co';
const supabaseKey = 'sb_publishable_ry_Z-Tb1--Mv_jmJNtvh8g_udvWejdQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: tables } = await supabase.from('tables').select('*');
  if (tables && tables.length > 0) {
    const tableNumber = tables[2].table_number;
    console.log('Testing table:', tableNumber);
    
    const { data: tbl, error } = await supabase.from('tables').select('id')
      .or(`table_number.eq.${tableNumber},table_number.eq."${tableNumber}"`).maybeSingle();
      
    if (error) {
       console.log('OR Lookup Error:', error.message);
    } else {
       console.log('OR Lookup Result ID:', tbl?.id);
    }

    const { data: tbl2, error: err2 } = await supabase.from('tables').select('id')
      .eq('table_number', String(tableNumber)).maybeSingle();
      
    if (err2) {
       console.log('EQ Lookup Error:', err2.message);
    } else {
       console.log('EQ Lookup Result ID:', tbl2?.id);
    }
  }
}

run();
