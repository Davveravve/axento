import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing environment variables for Supabase');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const POST: APIRoute = async ({ request }) => {
  try {
    const { user_id } = await request.json();

    // Radera användardata i specifik ordning
    await supabase
      .from('products')
      .delete()
      .eq('user_id', user_id);

    await supabase
      .from('locations')
      .delete()
      .eq('user_id', user_id);
      
    await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', user_id);

    // Radera användaren sist
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user_id);
    if (deleteError) throw deleteError;

    return new Response(JSON.stringify({ success: true }));
  } catch (error: any) {
    console.error('Delete account error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 400 }
    );
  }
};