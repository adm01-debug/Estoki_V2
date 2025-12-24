import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { pick_list_id, picker_id, auto_assign } = await req.json();

    if (auto_assign) {
      // Buscar picker disponível
      const { data: availablePickers } = await supabase
        .from("users")
        .select("id, current_tasks")
        .eq("role", "picker")
        .eq("status", "available")
        .order("current_tasks", { ascending: true })
        .limit(1);

      if (!availablePickers?.length) {
        return new Response(JSON.stringify({ error: "No available pickers" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const assignedPicker = availablePickers[0];

      // Buscar pick lists pendentes
      const { data: pendingLists } = await supabase
        .from("pick_lists")
        .select("*")
        .eq("status", "pending")
        .order("priority", { ascending: false })
        .limit(5);

      if (!pendingLists?.length) {
        return new Response(JSON.stringify({ success: true, message: "No pending pick lists" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Atribuir ao picker
      await supabase
        .from("pick_lists")
        .update({ assigned_to: assignedPicker.id, status: "assigned", assigned_at: new Date().toISOString() })
        .in("id", pendingLists.map((p: any) => p.id));

      return new Response(
        JSON.stringify({ success: true, assigned_to: assignedPicker.id, lists_assigned: pendingLists.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!pick_list_id || !picker_id) {
      return new Response(JSON.stringify({ error: "pick_list_id and picker_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    await supabase
      .from("pick_lists")
      .update({ assigned_to: picker_id, status: "assigned", assigned_at: new Date().toISOString() })
      .eq("id", pick_list_id);

    return new Response(
      JSON.stringify({ success: true, pick_list_id, assigned_to: picker_id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
