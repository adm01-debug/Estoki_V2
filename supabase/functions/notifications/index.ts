import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  
  try {
    const { action, data } = await req.json();
    
    switch (action) {
      case "create": {
        const { user_id, type, title, message, priority = "normal", action_url, metadata } = data;
        const { data: notification, error } = await supabase.from("notifications").insert({ user_id, type, title, message, priority, action_url, metadata, read: false }).select().single();
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, notification }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      case "broadcast": {
        const { type, title, message, priority = "normal", roles } = data;
        let query = supabase.from("profiles").select("id");
        if (roles?.length) query = query.in("role", roles);
        const { data: users } = await query;
        const notifications = users?.map((u: any) => ({ user_id: u.id, type, title, message, priority, read: false })) || [];
        await supabase.from("notifications").insert(notifications);
        return new Response(JSON.stringify({ success: true, count: notifications.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      case "mark_read": {
        const { notification_id, user_id } = data;
        if (notification_id) await supabase.from("notifications").update({ read: true }).eq("id", notification_id);
        else if (user_id) await supabase.from("notifications").update({ read: true }).eq("user_id", user_id).eq("read", false);
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      case "cleanup": {
        const { days_old = 30 } = data;
        const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days_old);
        await supabase.from("notifications").delete().lt("created_at", cutoff.toISOString()).eq("read", true);
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      default: throw new Error("Unknown action: " + action);
    }
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
