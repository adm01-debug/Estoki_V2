import { useState, useEffect, useCallback, useRef } from 'react';
type ReadyState = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED';
export function useWebSocket(url: string) {
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [readyState, setReadyState] = useState<ReadyState>('CONNECTING');
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;
    ws.onopen = () => setReadyState('OPEN');
    ws.onclose = () => setReadyState('CLOSED');
    ws.onmessage = (e) => setLastMessage(e);
    return () => { ws.close(); };
  }, [url]);
  const sendMessage = useCallback((msg: string) => { wsRef.current?.send(msg); }, []);
  return { lastMessage, readyState, sendMessage };
}
