import { supabase } from "@/integrations/supabase/client";

export const analyticsService = {
  async trackEvent(event: string, metadata: Record<string, any> = {}): Promise<void> {
    const { error } = await supabase
      .from("analytics_events" as any)
      .insert({
        event_name: event,
        metadata,
        created_at: new Date().toISOString()
      } as any);

    if (error) {
      console.error('Failed to track event:', error);
    }
  },

  async getMetrics(type: string, dateRange: { start: string; end: string }): Promise<any[]> {
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
