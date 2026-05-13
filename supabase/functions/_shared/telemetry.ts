/**
 * Telemetry utility for Edge Functions
 */

export const trace = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    // In a real scenario, we would send this to an OTLP collector
    // For now, we log it to Supabase Logs with a specific format
    console.info(`[telemetry] span="${name}" duration_ms=${duration.toFixed(2)} status=success`);
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`[telemetry] span="${name}" duration_ms=${duration.toFixed(2)} status=error error="${error.message}"`);
    throw error;
  }
};
