import { useState, useCallback } from "react";
import { toast } from "sonner";

export function useWeightScale() {
  const [weight, setWeight] = useState<number>(0);
  const [isStabilized, setIsStabilized] = useState(false);
  const [isReading, setIsReading] = useState(false);

  const readWeight = useCallback(async () => {
    setIsReading(true);
    setIsStabilized(false);
    
    // Simula a leitura de uma balança via Serial/USB/Network
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const simulatedWeight = Math.floor(Math.random() * 25000) / 1000; // 0 a 25kg
    setWeight(simulatedWeight);
    setIsStabilized(true);
    setIsReading(false);
    
    return simulatedWeight;
  }, []);

  const tare = useCallback(() => {
    setWeight(0);
    toast.info("Balança zerada (Tara)");
  }, []);

  return { weight, isStabilized, isReading, readWeight, tare };
}
