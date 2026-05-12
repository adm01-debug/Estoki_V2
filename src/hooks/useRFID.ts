import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface RFIDTag {
  id: string;
  rssi: number;
  timestamp: number;
}

export function useRFID() {
  const [tags, setTags] = useState<RFIDTag[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const scanTags = useCallback(async (durationMs = 3000) => {
    setIsScanning(true);
    setTags([]);
    
    // Simula scan de múltiplos portais RFID
    const interval = setInterval(() => {
      const newTag = {
        id: `E200${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
        rssi: -Math.floor(Math.random() * 40 + 40),
        timestamp: Date.now()
      };
      setTags(prev => {
        if (prev.find(t => t.id === newTag.id)) return prev;
        return [...prev, newTag];
      });
    }, 300);

    await new Promise(resolve => setTimeout(resolve, durationMs));
    clearInterval(interval);
    setIsScanning(false);
    
    toast.success("Scan RFID concluído!");
  }, []);

  return { tags, isScanning, scanTags };
}