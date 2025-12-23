import { useState, useEffect, useRef } from 'react';
export function useEventSource(url: string, events: string[] = ['message']) {
  const [messages, setMessages] = useState<Record<string, string>>({});
  const esRef = useRef<EventSource | null>(null);
  useEffect(() => {
    esRef.current = new EventSource(url);
    events.forEach(ev => { esRef.current?.addEventListener(ev, (e: any) => setMessages(m => ({ ...m, [ev]: e.data }))); });
    return () => esRef.current?.close();
  }, [url, events.join(',')]);
  return messages;
}
