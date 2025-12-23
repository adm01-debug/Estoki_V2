import { supabase } from '@/integrations/supabase/client';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  database: boolean;
  api: boolean;
  timestamp: string;
}

export const checkHealth = async (): Promise<HealthStatus> => {
  const timestamp = new Date().toISOString();
  
  let database = false;
  try {
    const { error } = await supabase.from('posicoes_estoque').select('id').limit(1);
    database = !error;
  } catch {
    database = false;
  }

  const api = navigator.onLine;
  const status = database && api ? 'healthy' : database || api ? 'degraded' : 'unhealthy';

  return { status, database, api, timestamp };
};
