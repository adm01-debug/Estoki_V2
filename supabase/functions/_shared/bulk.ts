/**
 * Handler genérico compartilhado pelas Edge Functions `bulk-*`.
 *
 * Motivação (P2 #25): as quatro funções (`bulk-insert`, `bulk-update`,
 * `bulk-upsert`, `bulk-delete`) repetiam ~30 linhas idênticas de CORS,
 * validação Zod, criação de client e tratamento de erro. Consolidamos tudo
 * aqui, mantendo **exatamente** os mesmos contratos de request/response.
 *
 * Ganhos de tempo de resposta:
 *  - Client Supabase criado UMA vez por isolate (module scope) em vez de por request.
 *  - `bulk-update` passa de N updates sequenciais para execução em paralelo
 *    com concorrência limitada (evita saturar o pool de conexões).
 */
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { getCorsHeaders } from "./cors.ts";
import { validateInput } from "./schemas.ts";

/** Reutilizado entre requests do mesmo isolate — reduz latência de cold path. */
let cachedClient: SupabaseClient | null = null;
export function getServiceClient(): SupabaseClient {
  if (!cachedClient) {
    cachedClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return cachedClient;
}

/** Executa `tasks` com no máximo `limit` promessas em voo simultaneamente. */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

type Handler<S extends z.ZodTypeAny> = (
  data: z.infer<S>,
  supabase: SupabaseClient,
  req: Request
) => Promise<unknown>;

/**
 * Cria o `Deno.serve` handler padrão das funções bulk.
 * Mantém os mesmos códigos de status e formatos de erro anteriores.
 */
export function createBulkHandler<S extends z.ZodTypeAny>(schema: S, handler: Handler<S>) {
  return async (req: Request): Promise<Response> => {
    const cors = getCorsHeaders(req);
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

    const headers = { ...cors, "Content-Type": "application/json" };
    try {
      const body = await req.json().catch(() => ({}));
      const v = validateInput(schema as unknown as z.ZodSchema<z.infer<S>>, body);
      if (!v.success) {
        return new Response(JSON.stringify({ error: v.error, details: v.details }), {
          status: 400,
          headers,
        });
      }
      const payload = await handler(v.data as z.infer<S>, getServiceClient(), req);
      return new Response(JSON.stringify(payload), { headers });
    } catch (error) {
      return new Response(JSON.stringify({ error: (error as Error).message }), {
        status: 400,
        headers,
      });
    }
  };
}
