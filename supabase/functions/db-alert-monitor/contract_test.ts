import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { DbAlertMonitorSchema } from "./index.ts";

/** Simulação: centenas de payloads (válidos, limites e inválidos). */
Deno.test("db-alert-monitor: defaults do contrato", () => {
  const r = DbAlertMonitorSchema.parse({});
  assertEquals(r.walLimitMb, 500);
  assertEquals(r.rollbackRatio, 0.05);
});

Deno.test("db-alert-monitor: fuzz de 400 cenários", () => {
  let ok = 0;
  let rejected = 0;
  for (let i = 0; i < 400; i++) {
    const walLimitMb = i % 7 === 0 ? -i : (i % 5 === 0 ? 64 + i : i * 13);
    const rollbackRatio = i % 11 === 0 ? 1.5 : (i % 3 === 0 ? 0.001 : (i % 100) / 100);
    const res = DbAlertMonitorSchema.safeParse({ walLimitMb, rollbackRatio });
    const esperado =
      Number.isInteger(walLimitMb) && walLimitMb >= 64 && walLimitMb <= 102400 &&
      rollbackRatio >= 0.001 && rollbackRatio <= 1;
    assertEquals(res.success, esperado, `cenário ${i}: ${walLimitMb}/${rollbackRatio}`);
    res.success ? ok++ : rejected++;
  }
  // Garante que a simulação exercitou os dois caminhos.
  assertEquals(ok > 50 && rejected > 50, true);
});

Deno.test("db-alert-monitor: tipos hostis são rejeitados", () => {
  for (const bad of ["500", null, {}, [], true, NaN, Infinity]) {
    assertEquals(DbAlertMonitorSchema.safeParse({ walLimitMb: bad }).success, false);
  }
});
