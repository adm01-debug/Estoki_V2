import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { DeleteFileSchema, validateInput } from "../_shared/schemas.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: getCorsHeaders(req) });
  const headers = { ...getCorsHeaders(req), "Content-Type": "application/json" };
  try {
    const raw = await req.json().catch(() => ({}));
    const v = validateInput(DeleteFileSchema, raw);
    if (!v.success) return new Response(JSON.stringify(v), { status: 400, headers });
    const { path, bucket } = v.data;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { error } = await supabase.storage.from(bucket || "files").remove([path]);
    if (error) throw error;
    return new Response(JSON.stringify({ deleted: true }), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers });
  }
});
