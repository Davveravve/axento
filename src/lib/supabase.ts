import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
 throw new Error('Missing Supabase environment variables');
}

let supabaseClient: ReturnType<typeof createClient>;

export function getSupabaseClient() {
 if (!supabaseClient) {
   supabaseClient = createClient(supabaseUrl, supabaseKey);
 }
 return supabaseClient;
}

export const supabase = getSupabaseClient();