import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { access_key, nfe_id } = await req.json();
    if (!access_key && !nfe_id) return new Response(JSON.stringify({ error: "access_key or nfe_id required" }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });

    const validations = [];
    // Validar chave de acesso (44 dígitos)
    if (access_key) {
      const isValidKey = /^\d{44}$/.test(access_key);
      validations.push({ field: "access_key", valid: isValidKey, message: isValidKey ? "Chave válida" : "Chave deve ter 44 dígitos" });
      // Validar dígito verificador
      const digits = access_key.split("").map(Number);
      const weights = [4,3,2,9,8,7,6,5,4,3,2,9,8,7,6,5,4,3,2,9,8,7,6,5,4,3,2,9,8,7,6,5,4,3,2,9,8,7,6,5,4,3,2];
      let sum = 0;
      for (let i = 0; i < 43; i++) sum += digits[i] * weights[i];
      const dv = 11 - (sum % 11);
      const expectedDV = dv >= 10 ? 0 : dv;
      const dvValid = digits[43] === expectedDV;
      validations.push({ field: "check_digit", valid: dvValid, message: dvValid ? "DV válido" : "DV inválido" });
    }

    if (nfe_id) {
      const { data: nfe } = await supabase.from("nfe_documents").select("*").eq("id", nfe_id).single();
      if (nfe) {
        validations.push({ field: "nfe_exists", valid: true, message: "NF-e encontrada no sistema" });
        validations.push({ field: "status", valid: nfe.status !== "cancelled", message: nfe.status === "cancelled" ? "NF-e cancelada" : "Status OK" });
      } else {
        validations.push({ field: "nfe_exists", valid: false, message: "NF-e não encontrada" });
      }
    }

    const isValid = validations.every(v => v.valid);
    if (nfe_id) await supabase.from("nfe_documents").update({ validation_status: isValid ? "valid" : "invalid", validated_at: new Date().toISOString() }).eq("id", nfe_id);

    return new Response(JSON.stringify({ success: true, is_valid: isValid, validations }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  }
});
