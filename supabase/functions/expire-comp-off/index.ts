import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('comp_off_balance')
    .update({ is_expired: true })
    .lt('expiry_date', today)
    .eq('is_used', false)
    .eq('is_expired', false)
    .select('id');

  return new Response(JSON.stringify({ expired: data?.length || 0, error: error?.message }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
