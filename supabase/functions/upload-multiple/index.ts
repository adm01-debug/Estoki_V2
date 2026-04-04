import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const bucket = formData.get("bucket") as string || "uploads";
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const results = [];
    for (const file of files) {
      const path = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type });
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
        results.push({ path: data.path, url: publicUrl, name: file.name });
      }
    }
    return new Response(JSON.stringify({ uploaded: results.length, files: results }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }); }
});
