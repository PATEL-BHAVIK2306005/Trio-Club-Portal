import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hbuhkenlctqefgpqxiah.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_8ng1nrZRN0sP_Kohwj1jjg_mD0ZHsSc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
