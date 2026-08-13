import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
export function useSubscription<T>(
  table: string,
  filter?: { column: string; value: string | number }
) {
  const [data, setData] = useState<T[]>([]);
  const filterRef = useRef(filter);
  filterRef.current = filter;

  useEffect(() => {
    const filterStr = filterRef.current
      ? `${filterRef.current.column}=eq.${filterRef.current.value}`
      : undefined;

    const channelId = `${table}-changes-${filterStr || "all"}`;

    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          ...(filterStr && { filter: filterStr }),
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setData((d) => [...d, payload.new as T]);
          } else if (payload.eventType === "UPDATE") {
            setData((d) =>
              d.map((item) => ((item as any).id === payload.new.id ? (payload.new as T) : item))
            );
          } else if (payload.eventType === "DELETE") {
            setData((d) => d.filter((item) => (item as any).id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table]);

  return data;
}
