import { useState, useCallback, useRef } from 'react';
import type { SerialPort as SerialPortType } from '@/types/web-serial';

export function useRFID() {
  const [lastRead, setLastRead] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const portRef = useRef<SerialPortType | null>(null);

  const connect = useCallback(async () => {
    try {
      portRef.current = await navigator.serial.requestPort();
      await portRef.current.open({ baudRate: 115200 });
      setIsReading(true);
      const reader = portRef.current.readable?.getReader();
      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const tag = new TextDecoder().decode(value).trim();
          if (tag && !tags.includes(tag)) {
            setTags(t => [...t, tag]);
            setLastRead(tag);
          }
        }
      }
    } catch {
      setIsReading(false);
    }
  }, [tags]);

  const disconnect = useCallback(async () => {
    await portRef.current?.close();
    setIsReading(false);
  }, []);

  return { lastRead, isReading, tags, connect, disconnect, clearTags: () => setTags([]) };
}
