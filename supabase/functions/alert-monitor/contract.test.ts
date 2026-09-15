import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";
import { AlertMonitorSchema, validateInput } from "../_shared/schemas.ts";

Deno.test("alert-monitor: aceita payload vazio", () => {
  const v = validateInput(AlertMonitorSchema, {});
  assertEquals(v.success, true);
});

Deno.test("alert-monitor: aceita severidade válida", () => {
  const v = validateInput(AlertMonitorSchema, { severidade: "critical", limite: 50 });
  assertEquals(v.success, true);
});

Deno.test("alert-monitor: rejeita severidade inválida", () => {
  const v = validateInput(AlertMonitorSchema, { severidade: "foo" });
  assertEquals(v.success, false);
});

Deno.test("alert-monitor: rejeita limite negativo", () => {
  const v = validateInput(AlertMonitorSchema, { limite: -1 });
  assertEquals(v.success, false);
});