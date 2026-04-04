import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: getCorsHeaders(req) });
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "images";
    if (!file.type.startsWith("image/")) throw new Error("Arquivo deve ser uma imagem");
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const fileName = `${folder}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from("images").upload(fileName, file, { contentType: file.type });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName);
    return new Response(JSON.stringify({ path: data.path, url: urlData.publicUrl }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  }
});
