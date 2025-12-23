import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { to, template, data } = await req.json();
    const WHATSAPP_TOKEN = Deno.env.get("WHATSAPP_TOKEN");
    const WHATSAPP_PHONE_ID = Deno.env.get("WHATSAPP_PHONE_ID");
    const response = await fetch(`https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_ID}/messages`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to, type: "template", template: { name: template, language: { code: "pt_BR" }, components: data } })
    });
    const result = await response.json();
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
});
