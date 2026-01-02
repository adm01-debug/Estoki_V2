import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { action, lot_number, product_id, quantity, location, metadata } = await req.json();

    if (!action || !lot_number) throw new Error("action e lot_number são obrigatórios");

    let result;

    switch (action) {
      case "create":
        result = await supabase.from("inventory_lots").insert({
          batch_number: lot_number, product_id, quantity, location,
          received_at: new Date().toISOString(), status: "active", metadata,
        }).select().single();
        break;

      case "move":
        result = await supabase.from("inventory_lots").update({ location })
          .eq("batch_number", lot_number).select().single();
        await supabase.from("lot_movements").insert({
          lot_number, movement_type: "transfer", to_location: location,
        });
        break;

      case "consume":
        const { data: lot } = await supabase.from("inventory_lots")
          .select("quantity").eq("batch_number", lot_number).single();
        
        if (!lot || lot.quantity < quantity) throw new Error("Quantidade insuficiente no lote");
        
        result = await supabase.from("inventory_lots")
          .update({ quantity: lot.quantity - quantity })
          .eq("batch_number", lot_number).select().single();
        
        await supabase.from("lot_movements").insert({
          lot_number, movement_type: "consumption", quantity,
        });
        break;

      case "history":
        result = await supabase.from("lot_movements")
          .select("*").eq("lot_number", lot_number).order("created_at", { ascending: false });
        break;

      default:
        throw new Error("Ação inválida");
    }

    return new Response(JSON.stringify({ success: true, data: result?.data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
  }
});
