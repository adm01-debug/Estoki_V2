import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

const SLOW_QUERY_THRESHOLD_MS = 3000;
const VERY_SLOW_QUERY_THRESHOLD_MS = 8000;

interface TelemetryPayload {
  operation: string;
  table_name?: string;
  rpc_name?: string;
  duration_ms: number;
  record_count?: number;
  query_limit?: number;
  query_offset?: number;
  count_mode?: string;
  error_message?: string;
  user_id?: string;
}

export function classifySeverity(duration_ms: number, error_message?: string | null): string {
  if (error_message) return 'error';
  if (duration_ms >= VERY_SLOW_QUERY_THRESHOLD_MS) return 'very_slow';
  if (duration_ms >= SLOW_QUERY_THRESHOLD_MS) return 'slow';
  return 'normal';
}

export function validateTelemetryPayload(payload: unknown): { valid: boolean; error?: string; data?: TelemetryPayload } {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Payload inválido' };
  }

  const p = payload as Record<string, unknown>;

  if (!p.operation || typeof p.operation !== 'string') {
    return { valid: false, error: 'Campo "operation" é obrigatório' };
  }

  if (typeof p.duration_ms !== 'number' || p.duration_ms < 0) {
    return { valid: false, error: 'Campo "duration_ms" deve ser um número não-negativo' };
  }

  return {
    valid: true,
    data: {
      operation: p.operation as string,
      table_name: (p.table_name as string) || undefined,
      rpc_name: (p.rpc_name as string) || undefined,
      duration_ms: p.duration_ms as number,
      record_count: typeof p.record_count === 'number' ? p.record_count : undefined,
      query_limit: typeof p.query_limit === 'number' ? p.query_limit : undefined,
      query_offset: typeof p.query_offset === 'number' ? p.query_offset : undefined,
      count_mode: (p.count_mode as string) || undefined,
      error_message: (p.error_message as string) || undefined,
      user_id: (p.user_id as string) || undefined,
    },
  };
}

/**
 * Emit structured telemetry log and persist to query_telemetry table.
 * Uses fire-and-forget pattern: persistence NEVER blocks the response.
 */
export function emitTelemetry(
  supabase: ReturnType<typeof createClient>,
  payload: TelemetryPayload
): { severity: string; persisted: boolean } {
  const severity = classifySeverity(payload.duration_ms, payload.error_message);

  // Structured console logging
  const icon = severity === 'very_slow' ? '🔴'
    : severity === 'slow' ? '🟡'
    : severity === 'error' ? '❌'
    : '✅';

  const target = payload.rpc_name || payload.table_name || 'unknown';
  const line = `${icon} [telemetry] ${payload.operation}:${target} ${payload.duration_ms}ms`
    + ` | records=${payload.record_count ?? '-'}`
    + ` limit=${payload.query_limit ?? '-'}`
    + ` offset=${payload.query_offset ?? '-'}`
    + ` count=${payload.count_mode ?? '-'}`;

  if (severity === 'very_slow') {
    console.warn(`⚠️ VERY SLOW QUERY: ${line}`);
  } else if (severity === 'slow') {
    console.warn(`⚠️ SLOW QUERY: ${line}`);
  } else if (severity === 'error') {
    console.error(line + ` error=${payload.error_message}`);
  } else {
    console.info(line);
  }

  // Only persist slow, very_slow, or error queries — fire-and-forget
  if (severity === 'normal') {
    return { severity, persisted: false };
  }

  // Fire-and-forget: do NOT await
  supabase
    .from('query_telemetry')
    .insert({
      operation: payload.operation,
      table_name: payload.table_name || null,
      rpc_name: payload.rpc_name || null,
      duration_ms: payload.duration_ms,
      record_count: payload.record_count ?? null,
      query_limit: payload.query_limit ?? null,
      query_offset: payload.query_offset ?? null,
      count_mode: payload.count_mode || null,
      severity,
      error_message: payload.error_message || null,
      user_id: payload.user_id || null,
    })
    .then(({ error: insertErr }) => {
      if (insertErr) console.warn('[telemetry-persist] Insert failed:', insertErr.message);
    });

  return { severity, persisted: true };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { action } = body;

    // Action: emit telemetry
    if (action === 'emit_telemetry') {
      const validation = validateTelemetryPayload(body.payload);
      if (!validation.valid) {
        return new Response(JSON.stringify({ error: validation.error }), {
          status: 400,
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        });
      }

      const result = emitTelemetry(supabase, validation.data!);
      return new Response(JSON.stringify({ success: true, ...result }), {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    // Action: query telemetry
    if (action === 'query_telemetry') {
      const { severity, since, limit: queryLimit = 200 } = body;
      let query = supabase
        .from('query_telemetry')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(Math.min(queryLimit, 500));

      if (since) {
        query = query.gte('created_at', since);
      }
      if (severity && severity !== 'all') {
        query = query.eq('severity', severity);
      }

      const { data, error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, data, count: data?.length || 0 }), {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    // Action: cleanup old telemetry
    if (action === 'cleanup_telemetry') {
      const daysOld = body.days_old || 7;
      const threshold = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString();

      const { error, count } = await supabase
        .from('query_telemetry')
        .delete()
        .lt('created_at', threshold);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, deleted: count || 0 }), {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Ação não reconhecida' }), {
      status: 400,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
});
