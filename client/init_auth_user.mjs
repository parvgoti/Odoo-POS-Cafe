import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vvkdptycohrersbwqiqr.supabase.co';
const supabaseKey = 'sb_publishable_ry_Z-Tb1--Mv_jmJNtvh8g_udvWejdQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Ensure we have at least one user in the users table...');
  const { data: users } = await supabase.from('users').select('*');
  
  if (!users || users.length === 0) {
    // Generate an ID or let DB generate
    const adminId = 'd65f5739-e483-4ee1-b0db-6ddfc2a62ebd'; // random UUID
    const { error: insertUserErr } = await supabase.from('users').insert({
      id: adminId,
      name: 'Admin User',
      email: 'admin@odoocafe.com',
      role: 'admin'
    });
    console.log('Inserted user:', adminId, insertUserErr);
    
    // Now insert a mock pos_session just to populate the UI
    const { error: sessionErr } = await supabase.from('pos_sessions').insert({
      opened_by: adminId,
      opening_amount: 250,
      status: 'closed',
      closed_at: new Date(Date.now() - 3600000).toISOString(),
      closing_amount: 500,
      notes: 'End of shift'
    });
    console.log('Inserted closed session:', sessionErr);
  } else {
    console.log('Users exist:', users);
  }
}

run();
