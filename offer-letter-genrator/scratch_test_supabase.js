const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://hbuhkenlctqefgpqxiah.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8ng1nrZRN0sP_Kohwj1jjg_mD0ZHsSc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  console.log('Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('members').select('*').limit(5);
    if (error) {
      console.error('Supabase Error:', error);
    } else {
      console.log('Success! Data count:', data ? data.length : 0);
      console.log('Sample data:', data);
    }
  } catch (err) {
    console.error('Catch Error:', err);
  }
}

test();
