import { assertEquals, assert } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import {
  accuracy,
  autoForecast,
  bucketDaily,
  holtForecast,
  holtWintersAdditive,
  sesForecast,
  smaForecast,
  walkForwardBacktest,
} from "./forecast.ts";

// Série sintética: tendência linear + sazonalidade semanal + ruído baixo
function syntheticSeries(days = 90): number[] {
  const s = [];
  for (let t = 0; t < days; t++) {
    const trend = 10 + t * 0.3;
    const seasonal = 3 * Math.sin((2 * Math.PI * t) / 7);
    const noise = ((t * 9301 + 49297) % 233280) / 233280 - 0.5; // determinístico
    s.push(Math.max(0, trend + seasonal + noise * 0.5));
  }
  return s;
}

Deno.test("SMA sobre série constante retorna a constante", () => {
  const r = smaForecast([5, 5, 5, 5, 5, 5, 5], 3, 7);
  assertEquals(r.forecast, [5, 5, 5]);
});

Deno.test("SES converge próximo do último valor em série estacionária", () => {
  const r = sesForecast([10, 10, 10, 10, 10, 10, 10], 1, 0.5);
  assert(Math.abs(r.forecast[0] - 10) < 0.001);
});

Deno.test("Holt captura tendência linear crescente", () => {
  const trend = Array.from({ length: 20 }, (_, i) => 10 + i);
  const r = holtForecast(trend, 5);
  // O último valor observado é 29 → previsão de 5 passos deve superar 30
  assert(r.forecast[0] > 29, `forecast[0]=${r.forecast[0]}`);
  assert(r.forecast[4] > r.forecast[0]);
});

Deno.test("Holt-Winters supera Naive em série sazonal", () => {
  const s = syntheticSeries(90);
  const naiveMape = walkForwardBacktest(s, "naive", 14).mape;
  const hwMape = walkForwardBacktest(s, "holt_winters_additive", 14).mape;
  assert(hwMape < naiveMape, `HW ${hwMape} deveria bater Naive ${naiveMape}`);
});

Deno.test("autoForecast escolhe o menor MAPE e mantém acurácia < 25%", () => {
  const s = syntheticSeries(120);
  const r = autoForecast(s, 14, 14);
  assert(r.accuracy.mape < 25, `MAPE alto: ${r.accuracy.mape}`);
  assertEquals(r.forecast.length, 14);
  assert(r.candidates.length >= 3);
});

Deno.test("bucketDaily zero-fill preserva total e ordem cronológica", () => {
  const from = new Date("2026-01-01T00:00:00Z");
  const to = new Date("2026-01-07T00:00:00Z");
  const { dates, values } = bucketDaily(
    [
      { data: "2026-01-01", quantidade: 5 },
      { data: "2026-01-03", quantidade: 2 },
      { data: "2026-01-03", quantidade: 3 },
    ],
    from,
    to,
  );
  assertEquals(dates.length, 7);
  assertEquals(values[0], 5);
  assertEquals(values[1], 0);
  assertEquals(values[2], 5);
  assertEquals(values.reduce((a, b) => a + b, 0), 10);
});

Deno.test("accuracy calcula MAE/RMSE/MAPE corretamente", () => {
  const m = accuracy([100, 200, 300], [110, 190, 330]);
  assertEquals(m.mae, (10 + 10 + 30) / 3);
  assert(Math.abs(m.mape - ((10 / 100 + 10 / 200 + 30 / 300) / 3) * 100) < 0.001);
});

Deno.test("Holt-Winters não explode com série curta (< 2 ciclos)", () => {
  const r = holtWintersAdditive([1, 2, 3, 4, 5], 3);
  assertEquals(r.forecast.length, 3);
  assert(Number.isFinite(r.forecast[0]));
});