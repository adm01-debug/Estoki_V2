import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders } from "../_shared/cors.ts";
import { InventoryTransferSchema, validateInput } from "../_shared/schemas.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: getCorsHeaders(req) });
  const headers = { ...getCorsHeaders(req), "Content-Type": "application/json" };

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "", // Use anon key to respect RLS if needed, but RPC is security definer
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const body = await req.json();
    const validation = validateInput(InventoryTransferSchema, body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error, details: validation.details }),
        { status: 400, headers }
      );
    }

    const { produto_id, origem_id, destino_id, quantidade, lote_id } = validation.data;

    // Use RPC for atomic transaction
    const { data, error } = await supabaseClient.rpc("transferir_estoque", {
      p_produto_id: produto_id,
      p_origem_id: origem_id,
      p_destino_id: destino_id,
      p_quantidade: quantidade,
      p_lote_id: lote_id,
    });

    if (error) throw error;

    if (!data.success) {
      return new Response(JSON.stringify({ error: data.error }), { status: 400, headers });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: data.message,
        data: { produto_id, quantidade, origem_id, destino_id },
      }),
      { headers }
    );
  } catch (error) {
    console.error("Inventory Transfer error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
});
