 import { supabase } from "@/integrations/supabase/client";
 import { logger } from "@/utils/logger";
 import { Json } from "@/integrations/supabase/types";

export const analyticsService = {
   async trackEvent(event: string, metadata: Record<string, unknown> = {}): Promise<void> {
    const { error } = await supabase
       .from("analytics_events" as "audit_log") // Fallback for typing or use actual table if exists
      .insert({
         action: event,
         metadata: metadata as Json,
         entity_type: 'analytics'
       } as any); // Cast to any because the table might not exist in the types yet

    if (error) {
       logger.error('Falha ao registrar evento de analytics', error, { event, metadata });
    }
  },

   async getMetrics(type: string, dateRange: { start: string; end: string }): Promise<unknown[]> {
    const { data, error } = await supabase
      .from("analytics_events" as any)
      .select("*")
      .eq("event_name", type)
      .gte("created_at", dateRange.start)
      .lte("created_at", dateRange.end);

    if (error) throw error;
    return data || [];
  }
};
