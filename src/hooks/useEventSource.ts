import { useState, useEffect, useRef } from 'react';
export function useEventSource(url: string, events: string[] = ['message']) {
  const [messages, setMessages] = useState<Record<string, string>>({});
  const esRef = useRef<EventSource | null>(null);
  const eventsKey = events.join(',');
  useEffect(() => {
    esRef.current = new EventSource(url);
    events.forEach(ev => { esRef.current?.addEventListener(ev, (e: any) => setMessages(m => ({ ...m, [ev]: e.data }))); });
    return () => esRef.current?.close();
    // reconecta quando url ou a lista de eventos (serializada) muda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, eventsKey]);
  return messages;
}
