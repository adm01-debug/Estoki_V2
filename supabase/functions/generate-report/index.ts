import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const { reportType, dateRange } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    let data;
    switch (reportType) {
      case "triagem":
        const { data: triagens } = await supabase.from("triagens").select("*").gte("created_at", dateRange.start).lte("created_at", dateRange.end);
        data = triagens;
        break;
      case "estoque":
        const { data: posicoes } = await supabase.from("posicoes").select("*");
        data = posicoes;
        break;
      default:
        throw new Error("Tipo de relatório inválido");
    }

    return new Response(JSON.stringify({ data, generatedAt: new Date().toISOString() }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
