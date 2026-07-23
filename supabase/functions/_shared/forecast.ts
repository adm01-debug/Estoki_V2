/**
 * Biblioteca de forecasting determinística para séries temporais diárias.
 *
 * Modelos implementados:
 *   - `naive`: baseline (repete última observação)
 *   - `sma`: média móvel simples (janela configurável)
 *   - `ses`: Simple Exponential Smoothing (Brown, 1956)
 *   - `holt`: dupla exponencial (nível + tendência linear)
 *   - `holt_winters_additive`: tripla exponencial com sazonalidade aditiva
 *
 * Todas as funções recebem `series: number[]` (mais antigo → mais recente,
 * sem gaps — o chamador deve reamostrar/zero-fill antes) e devolvem
 * previsões para os próximos `horizon` passos.
 *
 * Backtest via `walkForwardBacktest` produz MAE, RMSE, MAPE e sMAPE — usados
 * para escolher automaticamente o melhor modelo em `autoForecast`.
 */

export type ForecastModel =
  | "naive"
  | "sma"
  | "ses"
  | "holt"
  | "holt_winters_additive";

export interface ForecastResult {
  model: ForecastModel;
  horizon: number;
  forecast: number[];
  params: Record<string, number>;
}

export interface AccuracyMetrics {
  mae: number;
  rmse: number;
  mape: number; // 0-100
  smape: number; // 0-100
  samples: number;
}

// ---------- Modelos ----------

export function naiveForecast(series: number[], horizon: number): ForecastResult {
  const last = series.length ? series[series.length - 1] : 0;
  return {
    model: "naive",
    horizon,
    forecast: Array(horizon).fill(last),
    params: { last },
  };
}

export function smaForecast(series: number[], horizon: number, window = 7): ForecastResult {
  if (!series.length) return { model: "sma", horizon, forecast: Array(horizon).fill(0), params: { window } };
  const w = Math.max(1, Math.min(window, series.length));
  const slice = series.slice(-w);
  const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
  return { model: "sma", horizon, forecast: Array(horizon).fill(avg), params: { window: w } };
}

export function sesForecast(series: number[], horizon: number, alpha = 0.4): ForecastResult {
  if (!series.length) return { model: "ses", horizon, forecast: Array(horizon).fill(0), params: { alpha } };
  let level = series[0];
  for (let t = 1; t < series.length; t++) {
    level = alpha * series[t] + (1 - alpha) * level;
  }
  return { model: "ses", horizon, forecast: Array(horizon).fill(level), params: { alpha, level } };
}

export function holtForecast(
  series: number[],
  horizon: number,
  alpha = 0.4,
  beta = 0.1,
): ForecastResult {
  if (series.length < 2) return naiveForecast(series, horizon) as ForecastResult & { model: "holt" } as any;
  let level = series[0];
  let trend = series[1] - series[0];
  for (let t = 1; t < series.length; t++) {
    const prevLevel = level;
    level = alpha * series[t] + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }
  const forecast = Array.from({ length: horizon }, (_, h) => level + (h + 1) * trend);
  return { model: "holt", horizon, forecast, params: { alpha, beta, level, trend } };
}

export function holtWintersAdditive(
  series: number[],
  horizon: number,
  season = 7,
  alpha = 0.3,
  beta = 0.05,
  gamma = 0.2,
): ForecastResult {
  if (series.length < 2 * season) {
    // Não há dois ciclos completos → cai para Holt.
    return { ...holtForecast(series, horizon, alpha, beta), model: "holt_winters_additive" };
  }
  const n = series.length;
  // Nível e tendência iniciais (média do 1º e 2º ciclos)
  const seasonAvg1 = mean(series.slice(0, season));
  const seasonAvg2 = mean(series.slice(season, 2 * season));
  let level = seasonAvg1;
  let trend = (seasonAvg2 - seasonAvg1) / season;
  const seasonalIdx = Array.from({ length: season }, (_, i) => series[i] - seasonAvg1);

  for (let t = 0; t < n; t++) {
    const s = seasonalIdx[t % season];
    const prevLevel = level;
    level = alpha * (series[t] - s) + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
    seasonalIdx[t % season] = gamma * (series[t] - level) + (1 - gamma) * s;
  }

  const forecast = Array.from({ length: horizon }, (_, h) =>
    level + (h + 1) * trend + seasonalIdx[(n + h) % season],
  );
  return {
    model: "holt_winters_additive",
    horizon,
    forecast,
    params: { alpha, beta, gamma, season, level, trend },
  };
}

// ---------- Métricas / Backtest ----------

export function accuracy(actual: number[], predicted: number[]): AccuracyMetrics {
  const n = Math.min(actual.length, predicted.length);
  if (n === 0) return { mae: 0, rmse: 0, mape: 0, smape: 0, samples: 0 };
  let se = 0, ae = 0, ape = 0, sape = 0, apeN = 0;
  for (let i = 0; i < n; i++) {
    const err = actual[i] - predicted[i];
    ae += Math.abs(err);
    se += err * err;
    if (actual[i] !== 0) {
      ape += Math.abs(err / actual[i]);
      apeN++;
    }
    const denom = (Math.abs(actual[i]) + Math.abs(predicted[i])) / 2;
    if (denom !== 0) sape += Math.abs(err) / denom;
  }
  return {
    mae: ae / n,
    rmse: Math.sqrt(se / n),
    mape: apeN ? (ape / apeN) * 100 : 0,
    smape: (sape / n) * 100,
    samples: n,
  };
}

export function walkForwardBacktest(
  series: number[],
  model: ForecastModel,
  holdout = 14,
): AccuracyMetrics {
  const cut = Math.max(1, series.length - holdout);
  const train = series.slice(0, cut);
  const test = series.slice(cut);
  if (test.length === 0 || train.length === 0) return accuracy([], []);
  const pred = runModel(train, model, test.length).forecast;
  return accuracy(test, pred);
}

export function runModel(series: number[], model: ForecastModel, horizon: number): ForecastResult {
  switch (model) {
    case "naive": return naiveForecast(series, horizon);
    case "sma": return smaForecast(series, horizon);
    case "ses": return sesForecast(series, horizon);
    case "holt": return holtForecast(series, horizon);
    case "holt_winters_additive": return holtWintersAdditive(series, horizon);
  }
}

/**
 * Escolhe automaticamente o melhor modelo com base em MAPE via holdout.
 * Retorna a previsão do modelo vencedor + métricas de todos os candidatos.
 */
export function autoForecast(series: number[], horizon: number, holdout = 14) {
  const candidates: ForecastModel[] = series.length >= 14
    ? ["naive", "sma", "ses", "holt", "holt_winters_additive"]
    : ["naive", "sma", "ses"];

  const scored = candidates.map((m) => ({
    model: m,
    metrics: walkForwardBacktest(series, m, holdout),
  }));
  // Empate por MAPE → menor RMSE
  scored.sort((a, b) =>
    a.metrics.mape !== b.metrics.mape ? a.metrics.mape - b.metrics.mape : a.metrics.rmse - b.metrics.rmse,
  );
  const best = scored[0];
  const result = runModel(series, best.model, horizon);
  return {
    ...result,
    accuracy: best.metrics,
    candidates: scored,
  };
}

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
}

/**
 * Agrega uma lista de eventos com `data` (YYYY-MM-DD) e `quantidade` em
 * uma série diária contínua entre `from` e `to` (zero-fill nos gaps).
 */
export function bucketDaily(
  events: Array<{ data: string; quantidade: number }>,
  from: Date,
  to: Date,
): { dates: string[]; values: number[] } {
  const map = new Map<string, number>();
  for (const e of events) {
    const k = e.data.slice(0, 10);
    map.set(k, (map.get(k) ?? 0) + (e.quantidade || 0));
  }
  const dates: string[] = [];
  const values: number[] = [];
  const cur = new Date(from);
  cur.setUTCHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setUTCHours(0, 0, 0, 0);
  while (cur <= end) {
    const k = cur.toISOString().slice(0, 10);
    dates.push(k);
    values.push(map.get(k) ?? 0);
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return { dates, values };
}