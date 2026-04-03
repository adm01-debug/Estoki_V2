import { useState, useCallback, useEffect, useRef } from 'react';
import type { SerialPort as SerialPortType } from '@/types/web-serial';

export function useWeightScale(portConfig?: { filters?: Array<{ usbVendorId?: number; usbProductId?: number }> }) {
  const [weight, setWeight] = useState<number>(0);
  const [unit, setUnit] = useState<'kg' | 'g' | 'lb'>('kg');
  const [isStable, setIsStable] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const portRef = useRef<SerialPortType | null>(null);

  const connect = useCallback(async () => {
    try {
      portRef.current = await navigator.serial.requestPort(portConfig);
      await portRef.current.open({ baudRate: 9600 });
      setIsConnected(true);
      const reader = portRef.current.readable?.getReader();
      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const text = new TextDecoder().decode(value);
          const match = text.match(/(\d+\.?\d*)\s*(kg|g|lb)/i);
          if (match) {
            setWeight(parseFloat(match[1]));
            setUnit(match[2].toLowerCase() as 'kg' | 'g' | 'lb');
            setIsStable(text.includes('ST'));
          }
        }
      }
    } catch {
      setIsConnected(false);
    }
  }, [portConfig]);

  const disconnect = useCallback(async () => {
    await portRef.current?.close();
    setIsConnected(false);
  }, []);

  return { weight, unit, isStable, isConnected, connect, disconnect };
}
