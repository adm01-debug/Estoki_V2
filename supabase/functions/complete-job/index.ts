import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { CompleteJobSchema, validateInput } from "../_shared/schemas.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const body = await req.json().catch(() => ({}));
    const v = validateInput(CompleteJobSchema, body);
    if (!v.success) {
      return new Response(JSON.stringify(v), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }
    const { jobId, status, result, error: jobError } = v.data;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const updateData: any = { status, completed_at: new Date().toISOString() };
    if (result) updateData.result = result;
    if (jobError) updateData.error = jobError;
    const { data, error } = await supabase
      .from("job_queue")
      .update(updateData)
      .eq("id", jobId)
      .select()
      .single();
    if (error) throw error;
    return new Response(JSON.stringify({ job: data }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
