import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calcular KPIs operacionais
    const hoje = new Date().toISOString().split('T')[0];

    // Buscar eventos do dia
    const { data: eventos } = await supabase
      .from('eventos_triagem')
      .select('*')
      .gte('created_at', hoje);

    // Buscar posições
    const { data: posicoes } = await supabase
      .from('posicoes_estoque')
      .select('*');

    // Calcular métricas
    const totalTriagens = eventos?.length || 0;
    const totalPosicoes = posicoes?.length || 0;
    const posicoesOcupadas = posicoes?.filter(p => p.status === 'ocupada').length || 0;
    const taxaOcupacao = totalPosicoes > 0 ? (posicoesOcupadas / totalPosicoes) * 100 : 0;

    const kpis = {
      triagens_dia: totalTriagens,
      total_posicoes: totalPosicoes,
      posicoes_ocupadas: posicoesOcupadas,
      taxa_ocupacao: taxaOcupacao.toFixed(2),
      calculated_at: new Date().toISOString(),
    };

    // Salvar métricas
    await supabase.from('metricas_operacionais').insert({
      tipo: 'kpi_diario',
      valor: totalTriagens,
      dados: kpis,
    });

    return new Response(JSON.stringify(kpis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
