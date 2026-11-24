import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useNotificationRealtime(
  user: { id: string } | null,
  onNewNotification: (payload: { new?: Record<string, unknown> }) => void,
  onAlertChange: () => void
) {
  useEffect(() => {
    if (!user) return;

    const notifChannel = supabase
      .channel(`realtime_notificacoes-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notificacoes" },
        onNewNotification
      )
      .subscribe();

    const alertChannel = supabase
      .channel(`realtime_alertas-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alertas_historico" },
        onAlertChange
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notifChannel);
      supabase.removeChannel(alertChannel);
    };
  }, [user, onNewNotification, onAlertChange]);
}
