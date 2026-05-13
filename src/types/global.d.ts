 interface GTag {
   (command: 'event', eventName: string, eventParams?: Record<string, unknown>): void;
   (command: 'config', targetId: string, config?: Record<string, unknown>): void;
 }
 
 interface Window {
   gtag?: GTag;
 }