import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders } from "../_shared/cors.ts";
import { exigirSessaoOuCron } from "../_shared/auth.ts";
import { montarAlertas } from "../_shared/alertas.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  const recusaSemSessao = await exigirSessaoOuCron(req);
  if (recusaSemSessao) return recusaSemSessao;

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Estoque real: produtos (PT) + soma das quantidades em estoque_posicao
    const { data: produtos, error } = await supabase
      .from("produtos")
      .select("id, sku, nome, estoque_minimo, estoque_maximo, ponto_pedido, estoque:estoque_posicao(quantidade)");
    if (error) throw error;

    const withStock = (produtos || []).map((p) => ({
      ...p,
      estoque_atual: (p.estoque || []).reduce((acc, e) => acc + (e.quantidade || 0), 0),
    }));

    // Fonte única das regras: quem decide o que alertar e com que severidade é a
    // configuração editável em Configurações > Alertas, não o código da função.
    const { data: config } = await supabase
      .from("alertas_config")
      .select("tipo, ativo, threshold_valor, threshold_dias, severidade");

    const alerts = montarAlertas(withStock, config);
    const outOfStock = withStock.filter((p) => p.estoque_atual === 0);

    // Não duplicar: último alerta ativo por produto+tipo na UI canônica (alertas_historico)
    const { data: pending } = await supabase
      .from("alertas_historico")
      .select("produto_id, tipo, created_at")
      .in("tipo", ["estoque_minimo", "ponto_pedido", "estoque_maximo"])
      .eq("status", "ativo")
      .order("created_at", { ascending: false });
    const lastOpen = new Map();
    for (const a of pending || []) {
      const key = `${a.produto_id}|${a.tipo}`;
      if (!lastOpen.has(key)) lastOpen.set(key, a.created_at);
    }

    // Apenas alertas sem duplicata ativa do mesmo produto+tipo
    const toInsert = alerts.filter((a) => lastOpen.get(`${a.produto_id}|${a.tipo}`) == null);

    if (toInsert.length > 0) {
      const { error: insErr } = await supabase.from("alertas_historico").insert(toInsert);
      if (insErr) throw insErr;
    }

    return new Response(
      JSON.stringify({
        success: true,
        alerts_created: toInsert.length,
        low_stock: alerts.filter((a) => a.tipo === "estoque_minimo").length,
        out_of_stock: outOfStock.length,
        pending_dup: alerts.length - toInsert.length,
        regras_desativadas: (config || []).filter((c) => c.ativo === false).map((c) => c.tipo),
      }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 400,
    });
  }
});
