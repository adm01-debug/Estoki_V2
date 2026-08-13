import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { z } from "https://esm.sh/zod@3.23.8";
import { validateInput } from "../_shared/schemas.ts";
import { autoForecast, bucketDaily, runModel, type ForecastModel } from "../_shared/forecast.ts";

/**
 * demand-forecast — previsão real de demanda diária por produto.
 *
 * Estratégia:
 *   1. Lê histórico em `rastreamento_historico` (saídas: entrega/separação/saída).
 *   2. Agrega em série diária contínua (zero-fill em gaps).
 *   3. Roda backtest walk-forward de 14 dias em 5 modelos e escolhe o de menor MAPE.
 *   4. Devolve previsão para os próximos N dias + métricas de acurácia.
 */

const RequestSchema = z.object({
  produto_id: z.string().uuid().optional(),
  horizon_days: z.number().int().min(1).max(90).default(14),
  history_days: z.number().int().min(30).max(365).default(90),
  holdout_days: z.number().int().min(7).max(60).default(14),
  model: z
    .enum(["auto", "naive", "sma", "ses", "holt", "holt_winters_additive"])
    .default("auto"),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  const headers = { ...getCorsHeaders(req), "Content-Type": "application/json" };
  try {
    const raw = await req.json().catch(() => ({}));
    const v = validateInput(RequestSchema, raw);
    if (!v.success) return new Response(JSON.stringify(v), { status: 400, headers });
    const { produto_id, horizon_days, history_days, holdout_days, model } = v.data;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const to = new Date();
    const from = new Date(to.getTime() - history_days * 86_400_000);

    let query = supabase
      .from("rastreamento_historico")
      .select("produto_id, quantidade, created_at, tipo_evento")
      .gte("created_at", from.toISOString())
      .lte("created_at", to.toISOString())
      .in("tipo_evento", ["saida_transporte", "entrega", "separacao"])
      .limit(50_000);
    if (produto_id) query = query.eq("produto_id", produto_id);

    const { data: events, error } = await query;
    if (error) throw error;

    // Agrupa por produto para forecasting individual
    const perProduct = new Map<string, Array<{ data: string; quantidade: number }>>();
    for (const e of events ?? []) {
      const pid = e.produto_id;
      if (!pid) continue;
      const arr = perProduct.get(pid) ?? [];
      arr.push({ data: e.created_at as string, quantidade: Number(e.quantidade) || 0 });
      perProduct.set(pid, arr);
    }

    const forecasts = [];
    for (const [pid, evs] of perProduct) {
      const { dates, values } = bucketDaily(evs, from, to);
      const total = values.reduce((a, b) => a + b, 0);
      if (total === 0) continue;

      const result = model === "auto"
        ? autoForecast(values, horizon_days, holdout_days)
        : { ...runModel(values, model as ForecastModel, horizon_days), accuracy: null, candidates: [] as unknown[] };

      forecasts.push({
        produto_id: pid,
        history: { first_date: dates[0], last_date: dates[dates.length - 1], total, days: values.length },
        model_used: result.model,
        horizon_days,
        forecast: result.forecast.map((v, i) => ({
          date: addDays(to, i + 1),
          value: Math.max(0, Math.round(v * 100) / 100),
        })),
        expected_total: Math.max(0, Math.round(result.forecast.reduce((a, b) => a + b, 0))),
        accuracy: (result as { accuracy: unknown }).accuracy ?? null,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        generated_at: new Date().toISOString(),
        params: v.data,
        products_analyzed: forecasts.length,
        forecasts,
      }),
      { headers },
    );
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500,
      headers,
    });
  }
});

function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
