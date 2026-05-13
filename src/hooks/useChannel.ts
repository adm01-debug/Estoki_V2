 import { useEffect, useRef, useCallback, useState } from 'react';
 import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
 export function useChannel<T = unknown>(channelName: string) {
   const [messages, setMessages] = useState<T[]>([]);
   const channelRef = useRef<RealtimeChannel | null>(null);
  useEffect(() => {
    channelRef.current = supabase.channel(channelName).on('broadcast', { event: '*' }, ({ payload }) => setMessages(m => [...m, payload])).subscribe();
    return () => { channelRef.current?.unsubscribe(); };
  }, [channelName]);
  const send = useCallback((event: string, payload: unknown) => channelRef.current?.send({ type: 'broadcast', event, payload }), []);
  return { messages, send, clearMessages: () => setMessages([]) };
}
