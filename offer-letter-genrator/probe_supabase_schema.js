const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://hbuhkenlctqefgpqxiah.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8ng1nrZRN0sP_Kohwj1jjg_mD0ZHsSc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function probe() {
  // Test basic insert without email to see what columns are accepted
  const testRow = {
    name: 'Test Probe',
    department: 'Technical Team',
    designation: 'Test Lead',
    role_type: 'Core Member'
  };

  const { data, error } = await supabase.from('members').insert([testRow]).select();
  if (error) {
    console.error('Probe error:', error);
  } else {
    console.log('Inserted test row successfully! Available columns in table:', Object.keys(data[0]));
    console.log('Row content:', data[0]);
    
    // Clean up test probe
    await supabase.from('members').delete().eq('name', 'Test Probe');
  }
}

probe();
