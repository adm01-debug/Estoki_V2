import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const hoje = new Date().toISOString().split('T')[0];

    const { data: eventos } = await supabase
      .from('eventos_triagem')
      .select('*')
      .gte('created_at', hoje);

    const { data: posicoes } = await supabase
      .from('posicoes_estoque')
      .select('*');

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

    await supabase.from('metricas_operacionais').insert({
      tipo: 'kpi_diario',
      valor: totalTriagens,
      dados: kpis,
    });

    return new Response(JSON.stringify(kpis), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
});
