import { useEffect } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseRealtimeToastOptions {
  table: string;
  onInsert?: { title: string; description?: string };
  onUpdate?: { title: string; description?: string };
  onDelete?: { title: string; description?: string };
}

export function useRealtimeToast({
  table,
  onInsert,
  onUpdate,
  onDelete,
}: UseRealtimeToastOptions) {
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel(`${table}-toast`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          if (payload.eventType === 'INSERT' && onInsert) {
            toast({ title: onInsert.title, description: onInsert.description });
          }
          if (payload.eventType === 'UPDATE' && onUpdate) {
            toast({ title: onUpdate.title, description: onUpdate.description });
          }
          if (payload.eventType === 'DELETE' && onDelete) {
            toast({ title: onDelete.title, description: onDelete.description, variant: 'destructive' });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, toast]);
}

export default useRealtimeToast;
