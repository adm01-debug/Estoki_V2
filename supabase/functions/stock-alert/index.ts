import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

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

    const lowStock = withStock.filter(
      (p) => p.estoque_minimo != null && p.estoque_minimo > 0 && p.estoque_atual < p.estoque_minimo
    );
    const outOfStock = withStock.filter((p) => p.estoque_atual === 0);

    // Não duplicar: último alerta ativo por produto+tipo na UI canônica (alertas_historico)
    const { data: pending } = await supabase
      .from("alertas_historico")
      .select("produto_id, tipo, created_at")
      .in("tipo", ["estoque_minimo", "ponto_pedido"])
      .eq("status", "ativo")
      .order("created_at", { ascending: false });
    const lastOpen = new Map();
    for (const a of pending || []) {
      const key = `${a.produto_id}|${a.tipo}`;
      if (!lastOpen.has(key)) lastOpen.set(key, a.created_at);
    }

    const alerts = [
      // estoque_minimo: abaixo do mínimo (abastecimento urgente)
      ...(lowStock || []).map((p) => ({
        produto_id: p.id,
        tipo: "estoque_minimo",
        severidade: (p.estoque_atual < (p.ponto_pedido || p.estoque_minimo)) ? "critico" : "aviso",
        titulo: `Estoque abaixo do mínimo: ${p.nome}`,
        mensagem: `${p.sku}: ${p.estoque_atual} un. (mínimo ${p.estoque_minimo})`,
        status: "ativo",
        dados_contexto: {
          sku: p.sku,
          estoque_atual: p.estoque_atual,
          estoque_minimo: p.estoque_minimo,
          ponto_pedido: p.ponto_pedido,
          fonte: "stock-alert",
        },
      })),
      // ponto_pedido: acima do mínimo mas no ponto de reposição
      ...(withStock || [])
        .filter(
          (p) =>
            p.estoque_minimo != null &&
            p.estoque_minimo > 0 &&
            p.ponto_pedido != null &&
            p.ponto_pedido > 0 &&
            p.estoque_atual >= p.estoque_minimo &&
            p.estoque_atual <= p.ponto_pedido
        )
        .map((p) => ({
          produto_id: p.id,
          tipo: "ponto_pedido",
          severidade: "aviso",
          titulo: `Ponto de pedido atingido: ${p.nome}`,
          mensagem: `${p.sku}: ${p.estoque_atual} un. (ponto de pedido ${p.ponto_pedido})`,
          status: "ativo",
          dados_contexto: {
            sku: p.sku,
            estoque_atual: p.estoque_atual,
            estoque_minimo: p.estoque_minimo,
            ponto_pedido: p.ponto_pedido,
            fonte: "stock-alert",
          },
        })),
    ];

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
        low_stock: lowStock.length,
        out_of_stock: outOfStock.length,
        pending_dup: alerts.length - toInsert.length,
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
