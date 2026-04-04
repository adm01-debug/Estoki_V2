import { useState, useEffect, useCallback } from 'react';
export function useBroadcast(channelName: string) {
  const [channel] = useState(() => new BroadcastChannel(channelName));
  const [lastMessage, setLastMessage] = useState<any>(null);
  useEffect(() => { channel.onmessage = (e) => setLastMessage(e.data); return () => channel.close(); }, [channel]);
  const send = useCallback((message: unknown) => channel.postMessage(message), [channel]);
  return { lastMessage, send };
}
