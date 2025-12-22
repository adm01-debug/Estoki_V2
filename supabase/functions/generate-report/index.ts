import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { tipo, data_inicio, data_fim } = await req.json();
    let reportData: Record<string, unknown> = {};

    switch (tipo) {
      case 'triagem':
        const { data: triagens } = await supabase
          .from('eventos_triagem')
          .select('*')
          .gte('created_at', data_inicio)
          .lte('created_at', data_fim);
        reportData = {
          tipo: 'Relatório de Triagem',
          periodo: { inicio: data_inicio, fim: data_fim },
          total_registros: triagens?.length || 0,
          dados: triagens,
        };
        break;
      case 'estoque':
        const { data: posicoes } = await supabase.from('posicoes_estoque').select('*');
        reportData = {
          tipo: 'Relatório de Estoque',
          total_posicoes: posicoes?.length || 0,
          ocupadas: posicoes?.filter(p => p.status === 'ocupada').length || 0,
          disponiveis: posicoes?.filter(p => p.status === 'disponivel').length || 0,
        };
        break;
      default:
        return new Response(JSON.stringify({ error: 'Tipo inválido' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    reportData.gerado_em = new Date().toISOString();
    return new Response(JSON.stringify(reportData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
