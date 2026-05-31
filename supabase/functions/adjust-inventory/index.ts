import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { validateInput, InventoryAdjustSchema } from "../_shared/schemas.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  try {
    const body = await req.json();
    const validation = validateInput(InventoryAdjustSchema, body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error, details: validation.details }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const { produto_id, posicao_id, quantidade_nova, motivo, lote_id } = validation.data;

    // Auth check (optional but recommended in real scenarios)
    // const authHeader = req.headers.get("Authorization");
    // ... logic to verify user ...

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Buscar saldo atual para calcular a diferença
    const { data: current, error: fetchError } = await supabase
      .from("estoque_posicao")
      .select("quantidade")
      .eq("produto_id", produto_id)
      .eq("posicao_id", posicao_id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    const previousQty = current?.quantidade || 0;
    const difference = quantidade_nova - previousQty;

    // Atualizar ou inserir saldo
    let upsertError;
    if (current) {
      const { error } = await supabase
        .from("estoque_posicao")
        .update({ quantidade: quantidade_nova, updated_at: new Date().toISOString() })
        .eq("produto_id", produto_id)
        .eq("posicao_id", posicao_id);
      upsertError = error;
    } else {
      const { error } = await supabase.from("estoque_posicao").insert({
        produto_id,
        posicao_id,
        quantidade: quantidade_nova,
        lote_id,
      });
      upsertError = error;
    }

    if (upsertError) throw upsertError;

    // Registrar o ajuste no log de auditoria/ajustes
    const { data: adjustment, error: logError } = await supabase
      .from("ajustes_inventario")
      .insert({
        produto_id,
        posicao_id,
        quantidade_anterior: previousQty,
        quantidade_nova,
        diferenca: difference,
        motivo,
        lote_id,
      })
      .select()
      .single();

    if (logError) throw logError;

    return new Response(
      JSON.stringify({
        success: true,
        adjustment,
        message: "Ajuste de estoque realizado com sucesso",
      }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Erro ao processar ajuste", message: error.message }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
