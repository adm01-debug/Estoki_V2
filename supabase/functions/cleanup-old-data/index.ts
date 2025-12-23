import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { days = 90 } = await req.json().catch(() => ({}));
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Limpar logs antigos
    const { count: logsDeleted } = await supabase
      .from('alertas_historico')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .select('*', { count: 'exact', head: true });

    // Limpar notificações lidas antigas
    const { count: notifsDeleted } = await supabase
      .from('notificacoes')
      .delete()
      .eq('lida', true)
      .lt('created_at', cutoffDate.toISOString())
      .select('*', { count: 'exact', head: true });

    return new Response(JSON.stringify({
      success: true,
      cleaned: { logs: logsDeleted || 0, notifications: notifsDeleted || 0 },
      cutoffDate: cutoffDate.toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
