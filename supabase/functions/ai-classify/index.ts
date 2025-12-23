import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { text, categories } = await req.json();
    const prompt = `Classifique o seguinte texto em uma das categorias: ${categories.join(", ")}.\n\nTexto: "${text}"\n\nResponda apenas com o nome da categoria.`;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-3.5-turbo", messages: [{ role: "user", content: prompt }], max_tokens: 50 })
    });
    const data = await response.json();
    const category = data.choices?.[0]?.message?.content?.trim();
    return new Response(JSON.stringify({ category, confidence: categories.includes(category) ? 1 : 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
});
