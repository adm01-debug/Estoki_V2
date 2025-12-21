import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const today = new Date().toISOString().split("T")[0];

    const [{ count: totalPosicoes }, { count: ocupadas }, { count: triagensHoje }] = await Promise.all([
      supabase.from("posicoes").select("*", { count: "exact", head: true }),
      supabase.from("posicoes").select("*", { count: "exact", head: true }).eq("status", "ocupada"),
      supabase.from("triagens").select("*", { count: "exact", head: true }).gte("created_at", today),
    ]);

    const kpis = {
      ocupacaoPercentual: ((ocupadas || 0) / (totalPosicoes || 1)) * 100,
      triagensHoje: triagensHoje || 0,
      totalPosicoes: totalPosicoes || 0,
      calculatedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(kpis), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
