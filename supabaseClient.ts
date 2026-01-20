import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://btuhrymhqclweclajaqx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Mtjbj-pPEWBv79kFnaIGHQ_aiC5aSCm';

// Initialize the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);