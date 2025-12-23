import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/client';
export function useChannel(channelName: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const channelRef = useRef<any>(null);
  useEffect(() => {
    channelRef.current = supabase.channel(channelName).on('broadcast', { event: '*' }, ({ payload }) => setMessages(m => [...m, payload])).subscribe();
    return () => { channelRef.current?.unsubscribe(); };
  }, [channelName]);
  const send = useCallback((event: string, payload: any) => channelRef.current?.send({ type: 'broadcast', event, payload }), []);
  return { messages, send, clearMessages: () => setMessages([]) };
}
