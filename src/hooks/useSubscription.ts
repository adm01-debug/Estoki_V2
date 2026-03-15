// @ts-nocheck
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
export function useSubscription<T>(table: string, filter?: { column: string; value: any }) {
  const [data, setData] = useState<T[]>([]);
  useEffect(() => {
    let channel = supabase.channel(`${table}-changes`).on('postgres_changes', { event: '*', schema: 'public', table, ...(filter && { filter: `${filter.column}=eq.${filter.value}` }) }, payload => {
      if (payload.eventType === 'INSERT') setData(d => [...d, payload.new as T]);
      else if (payload.eventType === 'UPDATE') setData(d => d.map(item => (item as any).id === payload.new.id ? payload.new as T : item));
      else if (payload.eventType === 'DELETE') setData(d => d.filter(item => (item as any).id !== payload.old.id));
    }).subscribe();
    return () => { channel.unsubscribe(); };
  }, [table, filter?.column, filter?.value]);
  return data;
}
