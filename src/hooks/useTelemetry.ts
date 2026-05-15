 import { useEffect, useRef } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { logger } from '@/utils/logger';
 
 /**
  * Hook para monitoramento de métricas de performance e estabilidade (DORA-lite).
  * Rastreia tempo de sessão, erros e tempo de carregamento inicial.
  */
 export function useTelemetry() {
   const startTime = useRef(performance.now());
 
   useEffect(() => {
     const loadTime = performance.now();
     
     // Log boot time em desenvolvimento
     if (import.meta.env.DEV) {
       console.log(`[Telemetry] App Boot Time: ${loadTime.toFixed(2)}ms`);
     }
 
     // Handler para erros não tratados para métrica de MTTR/Estabilidade
     const handleError = (event: ErrorEvent) => {
       logger.error('Runtime Error:', event.error);
     };
 
     window.addEventListener('error', handleError);
     return () => window.removeEventListener('error', handleError);
   }, []);
 
   const trackAction = async (actionName: string, metadata: Record<string, unknown> = {}) => {
     try {
       const duration = performance.now() - startTime.current;
       await supabase.rpc('log_audit_event', {
         p_action: actionName,
         p_entity_type: 'telemetry',
         p_metadata: { ...metadata, duration_ms: duration }
       });
     } catch (err) {
       // Silently fail telemetry to not block user
     }
   };
 
   return { trackAction };
 }