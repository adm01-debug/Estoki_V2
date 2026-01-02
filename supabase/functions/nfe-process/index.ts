import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { action, nfe_data } = await req.json();

    let result;
    switch (action) {
      case "validate": {
        const errors = [];
        if (!nfe_data.emitente?.cnpj) errors.push("CNPJ do emitente obrigatório");
        if (!nfe_data.destinatario?.cnpj && !nfe_data.destinatario?.cpf) errors.push("CPF/CNPJ do destinatário obrigatório");
        if (!nfe_data.itens || nfe_data.itens.length === 0) errors.push("Pelo menos 1 item obrigatório");
        
        result = { valid: errors.length === 0, errors };
        break;
      }

      case "calculate": {
        const itens = nfe_data.itens || [];
        let totalProdutos = 0, totalIcms = 0, totalPis = 0, totalCofins = 0;

        itens.forEach((item: any) => {
          const valor = item.quantidade * item.valor_unitario;
          totalProdutos += valor;
          totalIcms += valor * (item.icms_aliquota || 0.18);
          totalPis += valor * 0.0165;
          totalCofins += valor * 0.076;
        });

        result = {
          total_produtos: totalProdutos.toFixed(2),
          total_icms: totalIcms.toFixed(2),
          total_pis: totalPis.toFixed(2),
          total_cofins: totalCofins.toFixed(2),
          total_nota: (totalProdutos + totalIcms).toFixed(2),
        };
        break;
      }

      case "generate": {
        const nfeId = crypto.randomUUID();
        const chaveAcesso = `35${new Date().toISOString().slice(0,7).replace("-","")}${nfeData.emitente?.cnpj || "00000000000000"}55001${String(nfeId).substring(0,9)}1${String(Math.random()).substring(2,11)}`;
        
        const { data: nfe, error } = await supabase.from("nfe").insert({
          id: nfeId, chave_acesso: chaveAcesso, status: "pending",
          emitente: nfe_data.emitente, destinatario: nfe_data.destinatario,
          itens: nfe_data.itens, totais: nfe_data.totais,
        }).select().single();

        if (error) throw error;
        result = { nfe_id: nfeId, chave_acesso: chaveAcesso, status: "pending" };
        break;
      }

      default:
        throw new Error("Ação inválida. Use: validate, calculate, generate");
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
  }
});
