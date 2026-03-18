import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://keuqufrmevoqxfbiwgza.supabase.co';
const supabaseKey = 'sb_publishable_V3mMn5EAZH_N80-9JWYarw_AI4ePbp6';

export const supabase = createClient(supabaseUrl, supabaseKey);