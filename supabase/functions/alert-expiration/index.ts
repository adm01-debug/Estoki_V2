import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders } from "../_shared/cors.ts";
import { AlertExpirationSchema, validateInput } from "../_shared/schemas.ts";
import { exigirSessao } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  const recusaSemSessao = await exigirSessao(req);
  if (recusaSemSessao) return recusaSemSessao;

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const raw = await req.json().catch(() => ({}));
    const v = validateInput(AlertExpirationSchema, raw);
    if (!v.success) {
      return new Response(
        JSON.stringify({ error: v.error, details: v.details }),
        {
          status: 400,
          headers: {
            ...getCorsHeaders(req),
            "Content-Type": "application/json",
          },
        },
      );
    }

    const days_threshold = v.data.days_threshold ?? 30;
    const thresholdDate = new Date(
      Date.now() + days_threshold * 24 * 60 * 60 * 1000,
    );

    // Lotes reais (schema PT) com validade dentro do threshold e estoque > 0
    const { data: lotes, error } = await supabase
      .from("lotes")
      .select("id, produto_id, numero_lote, data_validade, quantidade_atual")
      .lte("data_validade", thresholdDate.toISOString().slice(0, 10));
    if (error) throw error;

    const expiring = (lotes || []).filter((l) => {
      if (!l.data_validade || l.quantidade_atual <= 0) return false;
      const v = new Date(l.data_validade).setHours(0, 0, 0, 0);
      return v >= new Date().setHours(0, 0, 0, 0);
    });

    // Nomes/SKUs dos produtos (map em memória para evitar embed 1-N)
    const produtoIds = [...new Set(expiring.map((l) => l.produto_id))];
    const produtos: Record<string, { sku: string; nome: string }> = {};
    if (produtoIds.length > 0) {
      const { data: ps } = await supabase
        .from("produtos")
        .select("id, sku, nome")
        .in("id", produtoIds);
      for (const p of ps || []) produtos[p.id] = { sku: p.sku, nome: p.nome };
    }

    // Não duplicar: último alerta ativo por lote na UI canônica (alertas_historico)
    const { data: pending } = await supabase
      .from("alertas_historico")
      .select("lote_id, created_at")
      .eq("tipo", "vencimento_proximo")
      .eq("status", "ativo")
      .order("created_at", { ascending: false });
    const lastOpen = new Map();
    for (const a of pending || []) {
      if (a.lote_id && !lastOpen.has(a.lote_id)) {
        lastOpen.set(a.lote_id, a.created_at);
      }
    }

    const alerts = expiring.map((l) => {
      const prod = produtos[l.produto_id];
      const daysUntilExpiry = Math.floor(
        (new Date(l.data_validade).getTime() - Date.now()) /
          (24 * 60 * 60 * 1000),
      );
      const severity = daysUntilExpiry <= 7
        ? "urgente"
        : daysUntilExpiry <= 15
        ? "critico"
        : "aviso";

      return {
        lote_id: l.id,
        produto_id: l.produto_id,
        tipo: "vencimento_proximo",
        severidade: severity,
        titulo: `Vencimento próximo: ${prod?.nome ?? "produto"}`,
        mensagem: `${
          prod?.sku ?? "SKU"
        }: lote ${l.numero_lote} (${l.quantidade_atual} un.) vence em ${daysUntilExpiry} dias`,
        status: "ativo",
        dados_contexto: {
          sku: prod?.sku,
          numero_lote: l.numero_lote,
          quantidade: l.quantidade_atual,
          data_validade: l.data_validade,
          dias_para_vencer: daysUntilExpiry,
          fonte: "alert-expiration",
        },
      };
    });

    const toInsert = alerts.filter((a) => lastOpen.get(a.lote_id) == null);

    if (toInsert.length > 0) {
      const { error: insErr } = await supabase.from("alertas_historico").insert(
        toInsert,
      );
      if (insErr) throw insErr;
    }

    return new Response(
      JSON.stringify({
        success: true,
        alerts_created: toInsert.length,
        expiring_lots: expiring.length,
        pending_dup: alerts.length - toInsert.length,
      }),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 400,
    });
  }
});
