import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { PrometheusRegistry, escapeLabelValue, sanitizeName } from "./prometheus.ts";
import { redact } from "./logger.ts";

Deno.test("sanitizeName troca caracteres inválidos", () => {
  assertEquals(sanitizeName("estoki.query-total"), "estoki_query_total");
  assertEquals(sanitizeName("9metric"), "_9metric");
});

Deno.test("escapeLabelValue escapa aspas, barras e quebras", () => {
  assertEquals(escapeLabelValue('a"b\\c\nd'), 'a\\"b\\\\c\\nd');
});

Deno.test("registry declara HELP/TYPE uma única vez por família", () => {
  const reg = new PrometheusRegistry();
  reg.add("m", 1, { help: "h", type: "gauge", labels: { a: "1" } });
  reg.add("m", 2, { help: "h", type: "gauge", labels: { a: "2" } });
  const out = reg.render();
  assertEquals(out.match(/# TYPE m gauge/g)?.length, 1);
  assertStringIncludes(out, 'm{a="1"} 1');
  assertStringIncludes(out, 'm{a="2"} 2');
});

Deno.test("valores não finitos viram 0 e labels vazias somem", () => {
  const reg = new PrometheusRegistry();
  reg.add("x", Number.NaN, { help: "h", type: "counter", labels: { a: "", b: null } });
  assertStringIncludes(reg.render(), "\nx 0");
});

Deno.test("logger redige campos sensíveis", () => {
  const out = redact({ password: "123", token: "abc", user_id: "u1" });
  assertEquals(out.password, "[REDACTED]");
  assertEquals(out.token, "[REDACTED]");
  assertEquals(out.user_id, "u1");
});
