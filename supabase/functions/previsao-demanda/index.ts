import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { GenericPayloadSchema, validateInput } from "../_shared/schemas.ts";

interface PrevisaoDemanda {
  produto_id: string;
  produto_nome: string;
  demanda_prevista: number;
  tendencia: "alta" | "estavel" | "baixa";
  confianca: number;
  recomendacao: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const __raw = await req.json();
    const __v = validateInput(GenericPayloadSchema, __raw);
    if (!__v.success) return new Response(JSON.stringify(__v), { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } });
    const { produto_id } = __raw;

    console.log(
      "Iniciando previsão de demanda...",
      produto_id ? `Produto: ${produto_id}` : "Todos os produtos"
    );

    // Buscar dados históricos de movimentações
    const dataInicio = new Date();
    dataInicio.setMonth(dataInicio.getMonth() - 3);

    // Buscar produtos ativos
    let produtosQuery = supabase.from("produtos").select("id, nome, sku, giro_mensal, curva_abc");
    if (produto_id) {
      produtosQuery = produtosQuery.eq("id", produto_id);
    }
    const { data: produtos, error: produtosError } = await produtosQuery.limit(20);

    if (produtosError) throw produtosError;
    if (!produtos || produtos.length === 0) {
      return new Response(
        JSON.stringify({ previsoes: [], mensagem: "Nenhum produto encontrado" }),
        {
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        }
      );
    }

    // Buscar histórico de movimentações por produto
    const { data: movimentacoes, error: movError } = await supabase
      .from("rastreamento_historico")
      .select("produto_id, quantidade, data_evento, tipo_evento")
      .gte("data_evento", dataInicio.toISOString())
      .in("tipo_evento", ["saida_transporte", "entrega", "separacao"]);

    if (movError) {
      console.error("Erro ao buscar movimentações:", movError);
    }

    // Calcular métricas por produto
    const metricas: Record<string, { saidas: number[]; total: number }> = {};

    for (const mov of movimentacoes || []) {
      if (!mov.produto_id) continue;
      if (!metricas[mov.produto_id]) {
        metricas[mov.produto_id] = { saidas: [], total: 0 };
      }
      metricas[mov.produto_id].saidas.push(mov.quantidade || 0);
      metricas[mov.produto_id].total += mov.quantidade || 0;
    }

    // Preparar contexto para IA
    const produtosContext = produtos.map((p) => ({
      id: p.id,
      nome: p.nome,
      sku: p.sku,
      giroMensal: p.giro_mensal || 0,
      curvaABC: p.curva_abc || "C",
      movimentacoes: metricas[p.id]?.total || 0,
      mediaMovimentacao: metricas[p.id]?.saidas.length
        ? (metricas[p.id].total / metricas[p.id].saidas.length).toFixed(1)
        : 0,
    }));

    // Fallback heurístico determinístico — usado quando IA falha (403, 429, timeout).
    const heuristicFallback = () => ({
      previsoes: produtos.map((p) => {
        const mov = metricas[p.id]?.total || 0;
        const giro = p.giro_mensal || 0;
        const base = mov > 0 ? Math.round(mov / 3) : giro;
        const tendencia: "alta" | "estavel" | "baixa" =
          p.curva_abc === "A" ? "alta" : p.curva_abc === "C" ? "baixa" : "estavel";
        return {
          produto_id: p.id,
          produto_nome: p.nome,
          demanda_prevista: base,
          tendencia,
          confianca: mov > 0 ? 70 : 45,
          recomendacao:
            base > giro * 1.2
              ? "Aumentar estoque de segurança"
              : base < giro * 0.8
              ? "Reduzir compras no próximo ciclo"
              : "Manter níveis atuais",
        } as PrevisaoDemanda;
      }),
      resumo: "Previsão heurística baseada em histórico e curva ABC (IA indisponível).",
    });

    // Chamar Lovable AI para análise
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em previsão de demanda para gestão de estoque.
Analise os dados históricos e forneça previsões precisas.
Responda SEMPRE em formato JSON válido com a estrutura:
{
  "previsoes": [
    {
      "produto_id": "uuid",
      "demanda_prevista_mensal": number,
      "tendencia": "alta" | "estavel" | "baixa",
      "confianca_percentual": number (0-100),
      "recomendacao": "string com ação sugerida"
    }
  ],
  "resumo": "análise geral do cenário"
}`,
          },
          {
            role: "user",
            content: `Analise a demanda dos seguintes produtos dos últimos 3 meses e preveja a demanda para o próximo mês:

${JSON.stringify(produtosContext, null, 2)}

Considere:
- Curva ABC (A = alta rotatividade)
- Tendência das movimentações
- Sazonalidade típica

Forneça previsões e recomendações práticas.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Erro AI Gateway:", aiResponse.status, errorText.slice(0, 200));
      const fb = heuristicFallback();
      return new Response(
        JSON.stringify({
          success: true,
          fallback: true,
          motivo_fallback: `AI Gateway ${aiResponse.status}`,
          previsoes: fb.previsoes,
          resumo: fb.resumo,
          periodo: { inicio: dataInicio.toISOString(), fim: new Date().toISOString() },
        }),
        { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || "";

    // Extrair JSON da resposta
    let previsoes: PrevisaoDemanda[] = [];
    let resumo = "";

    try {
      // Tentar parsear JSON da resposta
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        resumo = parsed.resumo || "";

        previsoes = (parsed.previsoes || []).map((p: any) => {
          const produto = produtos.find((prod) => prod.id === p.produto_id);
          return {
            produto_id: p.produto_id,
            produto_nome: produto?.nome || "Produto",
            demanda_prevista: p.demanda_prevista_mensal || 0,
            tendencia: p.tendencia || "estavel",
            confianca: p.confianca_percentual || 50,
            recomendacao: p.recomendacao || "",
          };
        });
      }
    } catch (parseError) {
      console.error("Erro ao parsear resposta IA:", parseError);
      // Fallback com dados básicos
      previsoes = produtos.map((p) => ({
        produto_id: p.id,
        produto_nome: p.nome,
        demanda_prevista: p.giro_mensal || 10,
        tendencia: "estavel" as const,
        confianca: 60,
        recomendacao: "Manter níveis atuais de estoque",
      }));
      resumo = "Previsão baseada em dados históricos básicos.";
    }

    console.log(`Previsões geradas para ${previsoes.length} produtos`);

    return new Response(
      JSON.stringify({
        success: true,
        previsoes,
        resumo,
        periodo: {
          inicio: dataInicio.toISOString(),
          fim: new Date().toISOString(),
        },
      }),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro na previsão de demanda:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
