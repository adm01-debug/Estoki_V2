import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export const useRealtime = (table: string, queryKey: string[]) => {
  const queryClient = useQueryClient();

  const queryKeyRef = useRef(queryKey);
  queryKeyRef.current = queryKey;

  useEffect(() => {
    const channelId = `${table}-realtime-${queryKey.join('-')}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeyRef.current });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED' && import.meta.env.DEV) {
          console.log(`Subscribed to realtime changes for ${table}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, queryClient]);
};
