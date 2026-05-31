import { useEffect, useRef } from "react";
import { logger } from "@/utils/logger";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const useRealtime = (table: string, queryKey: string[]) => {
  const queryClient = useQueryClient();

  const queryKeyRef = useRef(queryKey);
  queryKeyRef.current = queryKey;

  useEffect(() => {
    const channelId = `${table}-realtime-${queryKey.join("-")}`;
    const channel = supabase
      .channel(channelId)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeyRef.current });
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          logger.debug(`Subscribed to realtime changes for ${table}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, queryClient]);
};
