import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

interface DivergenciaFornecedor {
  fornecedor: string;
  totalLotes: number;
  lotesComDivergencia: number;
  taxaDivergencia: number;
  ultimaDivergencia: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Iniciando análise de divergências por fornecedor...');

    // Buscar todos os lotes dos últimos 30 dias
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 30);

    const { data: lotes, error: lotesError } = await supabase
      .from('lotes')
      .select('id, fornecedor, status, quantidade_pedida, quantidade_atual, created_at')
      .gte('created_at', dataLimite.toISOString())
      .not('fornecedor', 'is', null);

    if (lotesError) {
      console.error('Erro ao buscar lotes:', lotesError);
      throw lotesError;
    }

    console.log(`Encontrados ${lotes?.length || 0} lotes para análise`);

    // Agrupar por fornecedor e calcular métricas
    const fornecedorMetricas: Record<string, DivergenciaFornecedor> = {};

    for (const lote of lotes || []) {
      const fornecedor = lote.fornecedor || 'Desconhecido';
      
      if (!fornecedorMetricas[fornecedor]) {
        fornecedorMetricas[fornecedor] = {
          fornecedor,
          totalLotes: 0,
          lotesComDivergencia: 0,
          taxaDivergencia: 0,
          ultimaDivergencia: '',
        };
      }

      fornecedorMetricas[fornecedor].totalLotes++;

      // Verificar se há divergência
      const temDivergencia = lote.status === 'divergencia' || 
        (lote.quantidade_pedida && lote.quantidade_atual !== lote.quantidade_pedida);

      if (temDivergencia) {
        fornecedorMetricas[fornecedor].lotesComDivergencia++;
        
        if (!fornecedorMetricas[fornecedor].ultimaDivergencia || 
            lote.created_at > fornecedorMetricas[fornecedor].ultimaDivergencia) {
          fornecedorMetricas[fornecedor].ultimaDivergencia = lote.created_at;
        }
      }
    }

    // Calcular taxa de divergência e identificar fornecedores problemáticos
    const fornecedoresCriticos: DivergenciaFornecedor[] = [];
    const THRESHOLD_TAXA_DIVERGENCIA = 0.15; // 15% de divergência
    const MIN_LOTES_PARA_ALERTA = 3; // Mínimo de lotes para gerar alerta

    for (const fornecedor in fornecedorMetricas) {
      const metricas = fornecedorMetricas[fornecedor];
      metricas.taxaDivergencia = metricas.totalLotes > 0 
        ? metricas.lotesComDivergencia / metricas.totalLotes 
        : 0;

      if (metricas.taxaDivergencia >= THRESHOLD_TAXA_DIVERGENCIA && 
          metricas.totalLotes >= MIN_LOTES_PARA_ALERTA) {
        fornecedoresCriticos.push(metricas);
      }
    }

    console.log(`Fornecedores críticos identificados: ${fornecedoresCriticos.length}`);

    // Criar alertas para fornecedores críticos
    const alertasCriados: string[] = [];

    for (const fornecedor of fornecedoresCriticos) {
      // Verificar se já existe alerta ativo para este fornecedor
      const { data: alertaExistente } = await supabase
        .from('alertas_historico')
        .select('id')
        .eq('tipo', 'divergencia_inventario')
        .eq('status', 'ativo')
        .ilike('titulo', `%${fornecedor.fornecedor}%`)
        .maybeSingle();

      if (!alertaExistente) {
        const taxaPercentual = (fornecedor.taxaDivergencia * 100).toFixed(1);
        
        const { error: alertaError } = await supabase
          .from('alertas_historico')
          .insert({
            tipo: 'divergencia_inventario',
            severidade: fornecedor.taxaDivergencia >= 0.30 ? 'critico' : 'aviso',
            titulo: `Alta taxa de divergência: ${fornecedor.fornecedor}`,
            mensagem: `O fornecedor ${fornecedor.fornecedor} apresenta taxa de divergência de ${taxaPercentual}% nos últimos 30 dias (${fornecedor.lotesComDivergencia}/${fornecedor.totalLotes} lotes).`,
            status: 'ativo',
            dados_contexto: {
              fornecedor: fornecedor.fornecedor,
              totalLotes: fornecedor.totalLotes,
              lotesComDivergencia: fornecedor.lotesComDivergencia,
              taxaDivergencia: fornecedor.taxaDivergencia,
              ultimaDivergencia: fornecedor.ultimaDivergencia,
            },
          });

        if (alertaError) {
          console.error(`Erro ao criar alerta para ${fornecedor.fornecedor}:`, alertaError);
        } else {
          alertasCriados.push(fornecedor.fornecedor);
          console.log(`Alerta criado para fornecedor: ${fornecedor.fornecedor}`);
        }
      }
    }

    // Criar notificações para os alertas
    for (const fornecedorNome of alertasCriados) {
      const fornecedor = fornecedoresCriticos.find(f => f.fornecedor === fornecedorNome);
      if (!fornecedor) continue;

      const taxaPercentual = (fornecedor.taxaDivergencia * 100).toFixed(1);

      await supabase
        .from('notificacoes')
        .insert({
          tipo: 'alerta_fornecedor',
          titulo: '⚠️ Alerta de Fornecedor',
          mensagem: `${fornecedor.fornecedor} tem ${taxaPercentual}% de divergência nos últimos 30 dias`,
          referencia_tipo: 'fornecedor',
        });
    }

    const response = {
      success: true,
      analisados: lotes?.length || 0,
      fornecedoresAnalisados: Object.keys(fornecedorMetricas).length,
      fornecedoresCriticos: fornecedoresCriticos.length,
      alertasCriados: alertasCriados.length,
      detalhes: fornecedoresCriticos,
    };

    console.log('Análise concluída:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro na função alerta-divergencia-fornecedor:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
