 import { logger } from '@/utils/logger';
import { useState, useEffect } from 'react';

interface BatteryState {
  level: number;
  charging: boolean;
}

 interface BatteryManager extends EventTarget {
   readonly charging: boolean;
   readonly chargingTime: number;
   readonly dischargingTime: number;
   readonly level: number;
    onchargingchange: ((this: BatteryManager, ev: Event) => void) | null;
    onchargingtimechange: ((this: BatteryManager, ev: Event) => void) | null;
    ondischargingtimechange: ((this: BatteryManager, ev: Event) => void) | null;
    onlevelchange: ((this: BatteryManager, ev: Event) => void) | null;
 }
 
 interface NavigatorWithBattery extends Navigator {
   getBattery?: () => Promise<BatteryManager>;
 }
 
 export function useBattery() {
   const [battery, setBattery] = useState<BatteryState | null>(null);
 
   useEffect(() => {
     let batteryManager: BatteryManager | null = null;
     let updateBattery: (() => void) | null = null;
 
     const getBatteryStatus = async () => {
       const nav = navigator as NavigatorWithBattery;
       if (nav.getBattery) {
         try {
           batteryManager = await nav.getBattery();
           updateBattery = () => {
             if (batteryManager) {
               setBattery({
                 level: batteryManager.level * 100,
                 charging: batteryManager.charging,
               });
             }
           };
           
           updateBattery();
           batteryManager.addEventListener('levelchange', updateBattery);
           batteryManager.addEventListener('chargingchange', updateBattery);
          } catch (error) {
            logger.error('Erro ao acessar API de bateria', error);
          }
       }
     };
     
     getBatteryStatus();
     
     return () => {
       if (batteryManager && updateBattery) {
         batteryManager.removeEventListener('levelchange', updateBattery);
         batteryManager.removeEventListener('chargingchange', updateBattery);
       }
     };
   }, []);
 
   return battery;
 }

export default useBattery;
