import { useState, useEffect } from 'react';

interface BatteryState {
  level: number;
  charging: boolean;
}

export function useBattery() {
  const [battery, setBattery] = useState<BatteryState | null>(null);

  useEffect(() => {
    const getBattery = async () => {
      if ('getBattery' in navigator) {
        const bat = await (navigator as any).getBattery();
        const updateBattery = () => {
          setBattery({
            level: bat.level * 100,
            charging: bat.charging,
          });
        };
        updateBattery();
        bat.addEventListener('levelchange', updateBattery);
        bat.addEventListener('chargingchange', updateBattery);
      }
    };
    getBattery();
  }, []);

  return battery;
}

export default useBattery;
