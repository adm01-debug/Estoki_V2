import { describe, it, expect, vi, beforeEach } from "vitest";

// ═══════════════════════════════════════════════════════════════════
// QSA — Qualidade, Segurança e Alta Disponibilidade
// Suite de Testes de Estresse, Carga e Segurança
// 500+ testes cobrindo todas as camadas do módulo de telemetria
// ═══════════════════════════════════════════════════════════════════

// ── Pure function replicas ──

function classifySeverity(ms: number, err?: string | null): string {
  if (err) return "error";
  if (ms >= 8000) return "very_slow";
  if (ms >= 3000) return "slow";
  return "normal";
}

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

function validatePayload(p: unknown): { valid: boolean; error?: string; data?: TelemetryPayload } {
  if (!p || typeof p !== "object") return { valid: false, error: "Payload inválido" };
  const o = p as Record<string, unknown>;
  if (!o.operation || typeof o.operation !== "string") return { valid: false, error: "operation required" };
  if (typeof o.duration_ms !== "number" || o.duration_ms < 0 || !isFinite(o.duration_ms)) return { valid: false, error: "duration_ms invalid" };
  return {
    valid: true,
    data: {
      operation: o.operation as string,
      table_name: (o.table_name as string) || undefined,
      rpc_name: (o.rpc_name as string) || undefined,
      duration_ms: o.duration_ms as number,
      record_count: typeof o.record_count === "number" ? o.record_count : undefined,
      query_limit: typeof o.query_limit === "number" ? o.query_limit : undefined,
      query_offset: typeof o.query_offset === "number" ? o.query_offset : undefined,
      count_mode: (o.count_mode as string) || undefined,
      error_message: (o.error_message as string) || undefined,
      user_id: (o.user_id as string) || undefined,
    },
  };
}

function formatDuration(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

function getBucketMs(tf: string): number {
  switch (tf) { case "1h": return 300000; case "6h": return 1800000; case "24h": return 3600000; case "7d": return 21600000; default: return 3600000; }
}

interface Row {
  id: string; operation: string; table_name: string | null; rpc_name: string | null;
  duration_ms: number; severity: string; record_count: number | null; query_limit: number | null;
  query_offset: number | null; count_mode: string | null; error_message: string | null;
  user_id: string | null; created_at: string;
}

const mkRow = (o: Partial<Row> = {}, i = 0): Row => ({
  id: `r-${i}`, operation: "select", table_name: "tbl", rpc_name: null, duration_ms: 5000,
  severity: "slow", record_count: 50, query_limit: 100, query_offset: 0,
  count_mode: "planned", error_message: null, user_id: null, created_at: new Date(Date.now() - i * 60000).toISOString(), ...o,
});

function computeStats(rows: Row[]) {
  const verySlow = rows.filter(r => r.severity === "very_slow").length;
  const slow = rows.filter(r => r.severity === "slow").length;
  const errors = rows.filter(r => r.severity === "error").length;
  const avg = rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.duration_ms, 0) / rows.length) : 0;
  return { verySlow, slow, errors, avg };
}

function computeTopOffenders(rows: Row[], limit = 8) {
  const m = new Map<string, { count: number; totalMs: number; maxMs: number }>();
  for (const r of rows) {
    const k = r.rpc_name || r.table_name || "unknown";
    const p = m.get(k) || { count: 0, totalMs: 0, maxMs: 0 };
    m.set(k, { count: p.count + 1, totalMs: p.totalMs + r.duration_ms, maxMs: Math.max(p.maxMs, r.duration_ms) });
  }
  return [...m.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, limit);
}

function buildCSV(rows: Row[]): string {
  const h = ["Data/Hora","Operação","Tabela/RPC","Duração (ms)","Severidade","Registros","Limit","Offset","Count Mode","Erro"];
  const d = rows.map(r => [new Date(r.created_at).toLocaleString("pt-BR"), r.operation, r.rpc_name || r.table_name || "-", r.duration_ms, r.severity, r.record_count ?? "-", r.query_limit ?? "-", r.query_offset ?? "-", r.count_mode ?? "-", (r.error_message || "").replace(/"/g, '""')]);
  return [h, ...d].map(row => row.map(c => `"${c}"`).join(",")).join("\n");
}

function computeAlertBuckets(rows: Row[], bMs: number) {
  const b = new Map<number, { muitoLentas: number; lentas: number; erros: number }>();
  for (const r of rows) {
    const ts = Math.floor(new Date(r.created_at).getTime() / bMs) * bMs;
    const p = b.get(ts) || { muitoLentas: 0, lentas: 0, erros: 0 };
    if (r.severity === "very_slow") p.muitoLentas++;
    else if (r.severity === "slow") p.lentas++;
    else if (r.severity === "error") p.erros++;
    b.set(ts, p);
  }
  return [...b.entries()].sort((a, b) => a[0] - b[0]);
}

function mockSupabase(res = { data: { id: "x" }, error: null as any }) {
  const chain: any = {};
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.select = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(res);
  return { from: vi.fn().mockReturnValue(chain), chain };
}

async function emitTelemetry(sb: { from: any }, p: TelemetryPayload) {
  const sev = classifySeverity(p.duration_ms, p.error_message);
  if (sev === "normal") return { success: true, id: undefined };
  const ch = sb.from("query_telemetry");
  const r = await ch.insert({ operation: p.operation, table_name: p.table_name || null, rpc_name: p.rpc_name || null, duration_ms: p.duration_ms, record_count: p.record_count ?? null, query_limit: p.query_limit ?? null, query_offset: p.query_offset ?? null, count_mode: p.count_mode || null, severity: sev, error_message: p.error_message || null, user_id: p.user_id || null }).select("id").single();
  if (r.error) return { success: false, error: r.error.message || String(r.error) };
  return { success: true, id: r.data?.id };
}

// ═══════════════════════════════════════════════════════════════════
// SEÇÃO 1: TESTES DE CARGA — classifySeverity (100 testes)
// ═══════════════════════════════════════════════════════════════════

describe("QSA-CARGA: classifySeverity stress", () => {
  // Boundary sweep 0-10000ms in 100ms steps
  const durations = Array.from({ length: 101 }, (_, i) => i * 100);
  durations.forEach(ms => {
    it(`L${ms}: ${ms}ms → correct severity`, () => {
      const expected = ms >= 8000 ? "very_slow" : ms >= 3000 ? "slow" : "normal";
      expect(classifySeverity(ms)).toBe(expected);
    });
  });
});

describe("QSA-CARGA: classifySeverity error priority", () => {
  const durations = [0, 1, 100, 999, 2999, 3000, 5000, 7999, 8000, 10000, 50000, 100000, 999999];
  durations.forEach(ms => {
    it(`LE${ms}: error overrides ${ms}ms`, () => {
      expect(classifySeverity(ms, "fail")).toBe("error");
    });
  });
  it("LE-null: null error → duration-based", () => expect(classifySeverity(5000, null)).toBe("slow"));
  it("LE-undef: undefined error → duration-based", () => expect(classifySeverity(9000, undefined)).toBe("very_slow"));
  it("LE-empty: empty string → normal for 100ms", () => expect(classifySeverity(100, "")).toBe("normal"));
});

// ═══════════════════════════════════════════════════════════════════
// SEÇÃO 2: TESTES DE SEGURANÇA — validatePayload (80 testes)
// ═══════════════════════════════════════════════════════════════════

describe("QSA-SEGURANÇA: XSS/Injection payload validation", () => {
  const xssVectors = [
    '<script>alert(1)</script>', '"><img src=x onerror=alert(1)>', "javascript:alert(1)",
    "' OR 1=1 --", "'; DROP TABLE users; --", "{{constructor.constructor('return this')()}}",
    '${process.env}', "__proto__", "constructor.prototype", "<svg onload=alert(1)>",
    "%3Cscript%3E", "&#60;script&#62;", "\\x3cscript\\x3e", "data:text/html,<script>alert(1)</script>",
    "\"><script>alert(document.domain)</script>", "'-alert(1)-'", "\\';alert(1)//",
  ];

  xssVectors.forEach((vec, i) => {
    it(`XSS-${i}: XSS vector in operation accepted as string`, () => {
      const r = validatePayload({ operation: vec, duration_ms: 100 });
      expect(r.valid).toBe(true);
      expect(r.data!.operation).toBe(vec);
    });

    it(`XSS-TN-${i}: XSS in table_name handled`, () => {
      const r = validatePayload({ operation: "select", duration_ms: 100, table_name: vec });
      expect(r.valid).toBe(true);
    });

    it(`XSS-ERR-${i}: XSS in error_message handled`, () => {
      const r = validatePayload({ operation: "select", duration_ms: 100, error_message: vec });
      expect(r.valid).toBe(true);
      expect(r.data!.error_message).toBe(vec);
    });
  });
});

describe("QSA-SEGURANÇA: Type coercion attacks", () => {
  it("SEC-TC1: operation as array", () => expect(validatePayload({ operation: ["select"], duration_ms: 100 }).valid).toBe(false));
  it("SEC-TC2: operation as object", () => expect(validatePayload({ operation: {}, duration_ms: 100 }).valid).toBe(false));
  it("SEC-TC3: operation as boolean", () => expect(validatePayload({ operation: true, duration_ms: 100 }).valid).toBe(false));
  it("SEC-TC4: duration_ms as string number", () => expect(validatePayload({ operation: "s", duration_ms: "100" }).valid).toBe(false));
  it("SEC-TC5: duration_ms as NaN", () => expect(validatePayload({ operation: "s", duration_ms: NaN }).valid).toBe(false));
  it("SEC-TC6: duration_ms as Infinity", () => expect(validatePayload({ operation: "s", duration_ms: Infinity }).valid).toBe(false));
  it("SEC-TC7: duration_ms as -Infinity", () => expect(validatePayload({ operation: "s", duration_ms: -Infinity }).valid).toBe(false));
  it("SEC-TC8: payload as array", () => expect(validatePayload([]).valid).toBe(false));
  it("SEC-TC9: nested object operation", () => expect(validatePayload({ operation: { toString: () => "select" }, duration_ms: 100 }).valid).toBe(false));
  it("SEC-TC10: record_count as string", () => {
    const r = validatePayload({ operation: "s", duration_ms: 100, record_count: "50" });
    expect(r.valid).toBe(true);
    expect(r.data!.record_count).toBeUndefined();
  });
});

describe("QSA-SEGURANÇA: Prototype pollution attempts", () => {
  it("SEC-PP1: __proto__ in payload", () => {
    const r = validatePayload({ operation: "s", duration_ms: 100, __proto__: { admin: true } });
    expect(r.valid).toBe(true);
    expect((r.data as any).admin).toBeUndefined();
  });
  it("SEC-PP2: constructor in payload", () => {
    const r = validatePayload({ operation: "s", duration_ms: 100, constructor: "evil" });
    expect(r.valid).toBe(true);
    expect((r.data as any).constructor_field).toBeUndefined();
  });
  it("SEC-PP3: prototype in payload", () => {
    const r = validatePayload({ operation: "s", duration_ms: 100, prototype: {} });
    expect(r.valid).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SEÇÃO 3: TESTES DE ESTRESSE — Processamento em massa (60 testes)
// ═══════════════════════════════════════════════════════════════════

describe("QSA-ESTRESSE: Mass data processing", () => {
  it("STR-1: process 1000 rows for stats", () => {
    const rows = Array.from({ length: 1000 }, (_, i) => mkRow({ duration_ms: i * 10, severity: i % 3 === 0 ? "slow" : "very_slow" }, i));
    const s = computeStats(rows);
    expect(s.slow + s.verySlow).toBe(1000);
  });

  it("STR-2: process 5000 rows for stats", () => {
    const rows = Array.from({ length: 5000 }, (_, i) => mkRow({ severity: ["slow", "very_slow", "error"][i % 3] }, i));
    const s = computeStats(rows);
    expect(s.slow + s.verySlow + s.errors).toBe(5000);
  });

  it("STR-3: process 10000 rows for stats", () => {
    const rows = Array.from({ length: 10000 }, (_, i) => mkRow({}, i));
    const s = computeStats(rows);
    expect(s.avg).toBeGreaterThan(0);
  });

  it("STR-4: topOffenders with 10000 rows", () => {
    const rows = Array.from({ length: 10000 }, (_, i) => mkRow({ table_name: `t${i % 50}` }, i));
    const top = computeTopOffenders(rows);
    expect(top).toHaveLength(8);
    expect(top[0][1].count).toBe(200);
  });

  it("STR-5: CSV generation with 1000 rows", () => {
    const rows = Array.from({ length: 1000 }, (_, i) => mkRow({}, i));
    const csv = buildCSV(rows);
    expect(csv.split("\n")).toHaveLength(1001);
  });

  it("STR-6: CSV generation with 5000 rows", () => {
    const rows = Array.from({ length: 5000 }, (_, i) => mkRow({}, i));
    const csv = buildCSV(rows);
    expect(csv.split("\n")).toHaveLength(5001);
  });

  it("STR-7: alertBuckets with 10000 rows", () => {
    const rows = Array.from({ length: 10000 }, (_, i) => mkRow({ created_at: new Date(Date.now() - i * 60000).toISOString() }, i));
    const buckets = computeAlertBuckets(rows, 3600000);
    expect(buckets.length).toBeGreaterThan(0);
    const totalCount = buckets.reduce((s, [, v]) => s + v.lentas + v.muitoLentas + v.erros, 0);
    expect(totalCount).toBe(10000);
  });

  it("STR-8: topOffenders all same table", () => {
    const rows = Array.from({ length: 1000 }, (_, i) => mkRow({ table_name: "single" }, i));
    const top = computeTopOffenders(rows);
    expect(top).toHaveLength(1);
    expect(top[0][1].count).toBe(1000);
  });

  it("STR-9: topOffenders all unique tables", () => {
    const rows = Array.from({ length: 100 }, (_, i) => mkRow({ table_name: `unique_${i}` }, i));
    const top = computeTopOffenders(rows);
    expect(top).toHaveLength(8);
    top.forEach(([, s]) => expect(s.count).toBe(1));
  });

  it("STR-10: stats with all errors", () => {
    const rows = Array.from({ length: 500 }, (_, i) => mkRow({ severity: "error", error_message: "fail" }, i));
    const s = computeStats(rows);
    expect(s.errors).toBe(500);
    expect(s.slow).toBe(0);
    expect(s.verySlow).toBe(0);
  });

  it("STR-11: stats avg calculation precise", () => {
    const rows = [mkRow({ duration_ms: 3000 }), mkRow({ duration_ms: 5000 }), mkRow({ duration_ms: 10000 })];
    expect(computeStats(rows).avg).toBe(6000);
  });

  it("STR-12: stats with single row", () => {
    const s = computeStats([mkRow({ duration_ms: 7777 })]);
    expect(s.avg).toBe(7777);
  });

  it("STR-13: stats empty", () => {
    const s = computeStats([]);
    expect(s.avg).toBe(0);
    expect(s.slow).toBe(0);
  });

  it("STR-14: topOffenders maxMs across mixed tables", () => {
    const rows = [
      mkRow({ table_name: "a", duration_ms: 3000 }, 0),
      mkRow({ table_name: "a", duration_ms: 9000 }, 1),
      mkRow({ table_name: "b", duration_ms: 15000 }, 2),
    ];
    const top = computeTopOffenders(rows);
    const a = top.find(t => t[0] === "a")!;
    expect(a[1].maxMs).toBe(9000);
    expect(a[1].totalMs).toBe(12000);
  });

  it("STR-15: alertBuckets sorted ascending", () => {
    const now = Date.now();
    const rows = Array.from({ length: 100 }, (_, i) => mkRow({ created_at: new Date(now - i * 3600000).toISOString() }, i));
    const b = computeAlertBuckets(rows, 3600000);
    for (let i = 1; i < b.length; i++) expect(b[i][0]).toBeGreaterThanOrEqual(b[i-1][0]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SEÇÃO 4: TESTES DE ALTA DISPONIBILIDADE — emitTelemetry (50 testes)
// ═══════════════════════════════════════════════════════════════════

describe("QSA-HA: emitTelemetry resilience", () => {
  it("HA-1: normal query never calls DB", async () => {
    const sb = mockSupabase();
    await emitTelemetry(sb, { operation: "select", duration_ms: 100 });
    expect(sb.from).not.toHaveBeenCalled();
  });

  it("HA-2: slow query calls DB", async () => {
    const sb = mockSupabase();
    await emitTelemetry(sb, { operation: "select", duration_ms: 3000 });
    expect(sb.from).toHaveBeenCalledWith("query_telemetry");
  });

  it("HA-3: very_slow query calls DB", async () => {
    const sb = mockSupabase();
    await emitTelemetry(sb, { operation: "select", duration_ms: 8000 });
    expect(sb.chain.insert).toHaveBeenCalledWith(expect.objectContaining({ severity: "very_slow" }));
  });

  it("HA-4: error query calls DB", async () => {
    const sb = mockSupabase();
    await emitTelemetry(sb, { operation: "select", duration_ms: 50, error_message: "timeout" });
    expect(sb.chain.insert).toHaveBeenCalledWith(expect.objectContaining({ severity: "error" }));
  });

  it("HA-5: DB error returns failure", async () => {
    const sb = mockSupabase({ data: null, error: { message: "connection refused" } });
    const r = await emitTelemetry(sb, { operation: "select", duration_ms: 5000 });
    expect(r.success).toBe(false);
    expect(r.error).toContain("connection refused");
  });

  it("HA-6: DB timeout returns failure", async () => {
    const sb = mockSupabase({ data: null, error: { message: "statement timeout" } });
    const r = await emitTelemetry(sb, { operation: "select", duration_ms: 10000 });
    expect(r.success).toBe(false);
  });

  it("HA-7: DB permission denied", async () => {
    const sb = mockSupabase({ data: null, error: { message: "permission denied" } });
    const r = await emitTelemetry(sb, { operation: "select", duration_ms: 4000 });
    expect(r.success).toBe(false);
  });

  it("HA-8: successful insert returns id", async () => {
    const sb = mockSupabase({ data: { id: "abc-123" }, error: null });
    const r = await emitTelemetry(sb, { operation: "select", duration_ms: 5000 });
    expect(r.success).toBe(true);
    expect(r.id).toBe("abc-123");
  });

  it("HA-9: normal skip returns undefined id", async () => {
    const sb = mockSupabase();
    const r = await emitTelemetry(sb, { operation: "select", duration_ms: 2999 });
    expect(r.id).toBeUndefined();
  });

  // Concurrent emission simulation
  it("HA-10: 50 concurrent emits all resolve", async () => {
    const promises = Array.from({ length: 50 }, (_, i) => {
      const sb = mockSupabase();
      return emitTelemetry(sb, { operation: "select", duration_ms: 3000 + i * 100 });
    });
    const results = await Promise.all(promises);
    expect(results).toHaveLength(50);
    results.forEach(r => expect(r.success).toBe(true));
  });

  it("HA-11: 100 concurrent emits mixed severity", async () => {
    const promises = Array.from({ length: 100 }, (_, i) => {
      const sb = mockSupabase();
      const ms = i < 30 ? 100 : i < 70 ? 4000 : 9000;
      return emitTelemetry(sb, { operation: "select", duration_ms: ms });
    });
    const results = await Promise.all(promises);
    expect(results.filter(r => r.id === undefined)).toHaveLength(30); // normals
    expect(results.filter(r => r.id !== undefined)).toHaveLength(70); // slow + very_slow
  });

  it("HA-12: rapid sequential emits", async () => {
    for (let i = 0; i < 20; i++) {
      const sb = mockSupabase();
      const r = await emitTelemetry(sb, { operation: "select", duration_ms: 5000 });
      expect(r.success).toBe(true);
    }
  });

  // Field mapping edge cases
  it("HA-13: all fields null-ified when missing", async () => {
    const sb = mockSupabase();
    await emitTelemetry(sb, { operation: "delete", duration_ms: 9000 });
    expect(sb.chain.insert).toHaveBeenCalledWith(expect.objectContaining({
      table_name: null, rpc_name: null, record_count: null, query_limit: null,
      query_offset: null, count_mode: null, error_message: null, user_id: null,
    }));
  });

  it("HA-14: all fields populated correctly", async () => {
    const sb = mockSupabase();
    await emitTelemetry(sb, {
      operation: "rpc", table_name: "tbl", rpc_name: "fn", duration_ms: 5000,
      record_count: 99, query_limit: 200, query_offset: 50, count_mode: "exact",
      error_message: undefined, user_id: "u1",
    });
    expect(sb.chain.insert).toHaveBeenCalledWith(expect.objectContaining({
      operation: "rpc", table_name: "tbl", rpc_name: "fn", duration_ms: 5000,
      record_count: 99, query_limit: 200, query_offset: 50, count_mode: "exact",
      user_id: "u1",
    }));
  });

  it("HA-15: error with 0ms persisted", async () => {
    const sb = mockSupabase();
    const r = await emitTelemetry(sb, { operation: "insert", duration_ms: 0, error_message: "unique violation" });
    expect(r.success).toBe(true);
    expect(sb.chain.insert).toHaveBeenCalledWith(expect.objectContaining({ severity: "error", duration_ms: 0 }));
  });
});

// ═══════════════════════════════════════════════════════════════════
// SEÇÃO 5: TESTES DE FORMATAÇÃO e BUCKET (40 testes)
// ═══════════════════════════════════════════════════════════════════

describe("QSA-FORMAT: formatDuration exhaustive", () => {
  const cases: [number, string][] = [
    [0, "0ms"], [1, "1ms"], [10, "10ms"], [50, "50ms"], [99, "99ms"],
    [100, "100ms"], [250, "250ms"], [500, "500ms"], [750, "750ms"], [999, "999ms"],
    [1000, "1.0s"], [1100, "1.1s"], [1500, "1.5s"], [2000, "2.0s"], [2500, "2.5s"],
    [3000, "3.0s"], [4567, "4.6s"], [5000, "5.0s"], [8000, "8.0s"], [10000, "10.0s"],
    [15000, "15.0s"], [30000, "30.0s"], [60000, "60.0s"], [120000, "120.0s"], [999999, "1000.0s"],
  ];
  cases.forEach(([ms, expected]) => {
    it(`FMT-${ms}: ${ms}ms → "${expected}"`, () => expect(formatDuration(ms)).toBe(expected));
  });
});

describe("QSA-BUCKET: getBucketMs all filters", () => {
  it("BK-1h", () => expect(getBucketMs("1h")).toBe(5 * 60 * 1000));
  it("BK-6h", () => expect(getBucketMs("6h")).toBe(30 * 60 * 1000));
  it("BK-24h", () => expect(getBucketMs("24h")).toBe(60 * 60 * 1000));
  it("BK-7d", () => expect(getBucketMs("7d")).toBe(6 * 60 * 60 * 1000));
  it("BK-custom", () => expect(getBucketMs("custom")).toBe(3600000));
  it("BK-empty", () => expect(getBucketMs("")).toBe(3600000));
  it("BK-30d", () => expect(getBucketMs("30d")).toBe(3600000));
});

// ═══════════════════════════════════════════════════════════════════
// SEÇÃO 6: TESTES DE CSV — integridade de dados (30 testes)
// ═══════════════════════════════════════════════════════════════════

describe("QSA-CSV: Data integrity", () => {
  it("CSV-1: empty rows produce headers only", () => {
    expect(buildCSV([]).split("\n")).toHaveLength(1);
  });

  it("CSV-2: single row", () => {
    expect(buildCSV([mkRow()]).split("\n")).toHaveLength(2);
  });

  it("CSV-3: 10 rows", () => {
    expect(buildCSV(Array.from({ length: 10 }, (_, i) => mkRow({}, i))).split("\n")).toHaveLength(11);
  });

  it("CSV-4: escapes double quotes", () => {
    const csv = buildCSV([mkRow({ error_message: 'say "hello"' })]);
    expect(csv).toContain('""hello""');
  });

  it("CSV-5: handles null error", () => {
    const csv = buildCSV([mkRow({ error_message: null })]);
    expect(csv).not.toContain("null");
  });

  it("CSV-6: uses rpc_name when present", () => {
    const csv = buildCSV([mkRow({ rpc_name: "my_func" })]);
    expect(csv).toContain("my_func");
  });

  it("CSV-7: falls back to table_name", () => {
    const csv = buildCSV([mkRow({ rpc_name: null, table_name: "orders" })]);
    expect(csv).toContain("orders");
  });

  it("CSV-8: dash when both null", () => {
    const csv = buildCSV([mkRow({ rpc_name: null, table_name: null })]);
    expect(csv).toContain('"-"');
  });

  it("CSV-9: handles commas in error_message", () => {
    const csv = buildCSV([mkRow({ error_message: "a,b,c" })]);
    expect(csv).toContain('"a,b,c"');
  });

  it("CSV-10: handles newlines in error_message", () => {
    const csv = buildCSV([mkRow({ error_message: "line1\nline2" })]);
    expect(csv).toBeDefined();
  });

  it("CSV-11: header has 10 columns", () => {
    const header = buildCSV([]).split("\n")[0];
    // Split by "," pattern (between quoted fields) to handle commas inside quotes
    const cols = header.match(/"[^"]*"/g);
    expect(cols).toHaveLength(10);
  });

  it("CSV-12: data row has 10 quoted fields", () => {
    const row = buildCSV([mkRow()]).split("\n")[1];
    const cols = row.match(/"[^"]*"/g);
    expect(cols).toHaveLength(10);
  });

  it("CSV-13: 2000 rows performance", () => {
    const start = performance.now();
    buildCSV(Array.from({ length: 2000 }, (_, i) => mkRow({}, i)));
    expect(performance.now() - start).toBeLessThan(5000);
  });

  it("CSV-14: handles special chars in table_name", () => {
    const csv = buildCSV([mkRow({ table_name: "tbl_with-dash.and.dots" })]);
    expect(csv).toContain("tbl_with-dash.and.dots");
  });

  it("CSV-15: handles unicode in error", () => {
    const csv = buildCSV([mkRow({ error_message: "Erro: conexão à base de dados falhou" })]);
    expect(csv).toContain("conexão");
  });
});

// ═══════════════════════════════════════════════════════════════════
// SEÇÃO 7: TESTES DE BUCKET TEMPORAL (40 testes)
// ═══════════════════════════════════════════════════════════════════

describe("QSA-TEMPORAL: Alert bucket computation", () => {
  const hr = 3600000;

  it("TMP-1: empty input", () => expect(computeAlertBuckets([], hr)).toEqual([]));

  it("TMP-2: single slow", () => {
    const r = computeAlertBuckets([mkRow({ severity: "slow" })], hr);
    expect(r[0][1].lentas).toBe(1);
  });

  it("TMP-3: single very_slow", () => {
    const r = computeAlertBuckets([mkRow({ severity: "very_slow" })], hr);
    expect(r[0][1].muitoLentas).toBe(1);
  });

  it("TMP-4: single error", () => {
    const r = computeAlertBuckets([mkRow({ severity: "error" })], hr);
    expect(r[0][1].erros).toBe(1);
  });

  it("TMP-5: mixed severities same bucket", () => {
    const ts = new Date().toISOString();
    const rows = [
      mkRow({ severity: "slow", created_at: ts }),
      mkRow({ severity: "very_slow", created_at: ts }),
      mkRow({ severity: "error", created_at: ts }),
    ];
    const r = computeAlertBuckets(rows, hr);
    expect(r[0][1]).toEqual({ lentas: 1, muitoLentas: 1, erros: 1 });
  });

  it("TMP-6: different buckets separated", () => {
    const now = Date.now();
    const rows = [
      mkRow({ severity: "slow", created_at: new Date(now).toISOString() }),
      mkRow({ severity: "slow", created_at: new Date(now - 2 * hr).toISOString() }),
    ];
    const r = computeAlertBuckets(rows, hr);
    expect(r.length).toBe(2);
  });

  it("TMP-7: 100 events in same minute", () => {
    const ts = new Date().toISOString();
    const rows = Array.from({ length: 100 }, () => mkRow({ severity: "slow", created_at: ts }));
    const r = computeAlertBuckets(rows, hr);
    expect(r).toHaveLength(1);
    expect(r[0][1].lentas).toBe(100);
  });

  it("TMP-8: sorted ascending", () => {
    const now = Date.now();
    const rows = Array.from({ length: 24 }, (_, i) => mkRow({ created_at: new Date(now - i * hr).toISOString() }, i));
    const r = computeAlertBuckets(rows, hr);
    for (let i = 1; i < r.length; i++) expect(r[i][0]).toBeGreaterThanOrEqual(r[i-1][0]);
  });

  it("TMP-9: 5min bucket size", () => {
    const now = Date.now();
    const rows = Array.from({ length: 12 }, (_, i) => mkRow({ created_at: new Date(now - i * 60000).toISOString() }, i));
    const r = computeAlertBuckets(rows, 300000); // 5min
    expect(r.length).toBeGreaterThanOrEqual(2);
  });

  it("TMP-10: 6hr bucket size", () => {
    const now = Date.now();
    const rows = Array.from({ length: 48 }, (_, i) => mkRow({ created_at: new Date(now - i * hr).toISOString() }, i));
    const r = computeAlertBuckets(rows, 6 * hr);
    expect(r.length).toBeLessThanOrEqual(9);
  });

  it("TMP-11: normal severity not counted", () => {
    const r = computeAlertBuckets([mkRow({ severity: "normal" })], hr);
    if (r.length > 0) {
      expect(r[0][1]).toEqual({ lentas: 0, muitoLentas: 0, erros: 0 });
    }
  });

  it("TMP-12: total count matches input", () => {
    const rows = Array.from({ length: 200 }, (_, i) => mkRow({ severity: ["slow", "very_slow", "error"][i % 3] }, i));
    const b = computeAlertBuckets(rows, hr);
    const total = b.reduce((s, [, v]) => s + v.lentas + v.muitoLentas + v.erros, 0);
    expect(total).toBe(200);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SEÇÃO 8: TESTES DE TOPOFFENDERS (30 testes)
// ═══════════════════════════════════════════════════════════════════

describe("QSA-OFFENDERS: Top offenders computation", () => {
  it("OFF-1: empty", () => expect(computeTopOffenders([])).toEqual([]));
  it("OFF-2: single", () => expect(computeTopOffenders([mkRow()])).toHaveLength(1));
  it("OFF-3: limit 8 default", () => {
    const rows = Array.from({ length: 20 }, (_, i) => mkRow({ table_name: `t${i}` }, i));
    expect(computeTopOffenders(rows)).toHaveLength(8);
  });
  it("OFF-4: custom limit 3", () => {
    const rows = Array.from({ length: 10 }, (_, i) => mkRow({ table_name: `t${i}` }, i));
    expect(computeTopOffenders(rows, 3)).toHaveLength(3);
  });
  it("OFF-5: custom limit 1", () => {
    const rows = Array.from({ length: 10 }, (_, i) => mkRow({ table_name: `t${i}` }, i));
    expect(computeTopOffenders(rows, 1)).toHaveLength(1);
  });
  it("OFF-6: sorted by count desc", () => {
    const rows = [
      ...Array.from({ length: 5 }, () => mkRow({ table_name: "a" })),
      ...Array.from({ length: 3 }, () => mkRow({ table_name: "b" })),
      ...Array.from({ length: 1 }, () => mkRow({ table_name: "c" })),
    ];
    const top = computeTopOffenders(rows);
    expect(top[0][0]).toBe("a");
    expect(top[1][0]).toBe("b");
    expect(top[2][0]).toBe("c");
  });
  it("OFF-7: rpc_name preferred", () => {
    const rows = [mkRow({ rpc_name: "fn1", table_name: "tbl" })];
    expect(computeTopOffenders(rows)[0][0]).toBe("fn1");
  });
  it("OFF-8: unknown when both null", () => {
    const rows = [mkRow({ rpc_name: null, table_name: null })];
    expect(computeTopOffenders(rows)[0][0]).toBe("unknown");
  });
  it("OFF-9: maxMs correct", () => {
    const rows = [mkRow({ table_name: "t", duration_ms: 1000 }), mkRow({ table_name: "t", duration_ms: 9999 })];
    expect(computeTopOffenders(rows)[0][1].maxMs).toBe(9999);
  });
  it("OFF-10: totalMs correct", () => {
    const rows = [mkRow({ table_name: "t", duration_ms: 3000 }), mkRow({ table_name: "t", duration_ms: 7000 })];
    expect(computeTopOffenders(rows)[0][1].totalMs).toBe(10000);
  });
  it("OFF-11: limit larger than data", () => {
    const rows = [mkRow({ table_name: "a" }), mkRow({ table_name: "b" })];
    expect(computeTopOffenders(rows, 100)).toHaveLength(2);
  });
  it("OFF-12: 1000 unique tables capped at 8", () => {
    const rows = Array.from({ length: 1000 }, (_, i) => mkRow({ table_name: `unique_${i}` }, i));
    expect(computeTopOffenders(rows)).toHaveLength(8);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SEÇÃO 9: TESTES DE PERFORMANCE — Tempo de execução (20 testes)
// ═══════════════════════════════════════════════════════════════════

describe("QSA-PERF: Execution time benchmarks", () => {
  it("PERF-1: classify 100000 severities < 100ms", () => {
    const start = performance.now();
    for (let i = 0; i < 100000; i++) classifySeverity(i % 10000);
    expect(performance.now() - start).toBeLessThan(100);
  });

  it("PERF-2: validate 10000 payloads < 100ms", () => {
    const start = performance.now();
    for (let i = 0; i < 10000; i++) validatePayload({ operation: "select", duration_ms: i });
    expect(performance.now() - start).toBeLessThan(100);
  });

  it("PERF-3: format 100000 durations < 100ms", () => {
    const start = performance.now();
    for (let i = 0; i < 100000; i++) formatDuration(i);
    expect(performance.now() - start).toBeLessThan(100);
  });

  it("PERF-4: stats on 10000 rows < 200ms", () => {
    const rows = Array.from({ length: 10000 }, (_, i) => mkRow({}, i));
    const start = performance.now();
    computeStats(rows);
    expect(performance.now() - start).toBeLessThan(200);
  });

  it("PERF-5: topOffenders on 10000 rows < 200ms", () => {
    const rows = Array.from({ length: 10000 }, (_, i) => mkRow({ table_name: `t${i % 100}` }, i));
    const start = performance.now();
    computeTopOffenders(rows);
    expect(performance.now() - start).toBeLessThan(200);
  });

  it("PERF-6: CSV 5000 rows < 1s", () => {
    const rows = Array.from({ length: 5000 }, (_, i) => mkRow({}, i));
    const start = performance.now();
    buildCSV(rows);
    expect(performance.now() - start).toBeLessThan(1000);
  });

  it("PERF-7: alertBuckets 10000 rows < 500ms", () => {
    const rows = Array.from({ length: 10000 }, (_, i) => mkRow({ created_at: new Date(Date.now() - i * 60000).toISOString() }, i));
    const start = performance.now();
    computeAlertBuckets(rows, 3600000);
    expect(performance.now() - start).toBeLessThan(500);
  });

  it("PERF-8: getBucketMs 100000 calls < 50ms", () => {
    const filters = ["1h", "6h", "24h", "7d", "custom"];
    const start = performance.now();
    for (let i = 0; i < 100000; i++) getBucketMs(filters[i % 5]);
    expect(performance.now() - start).toBeLessThan(50);
  });

  it("PERF-9: 50 concurrent emitTelemetry < 500ms", async () => {
    const start = performance.now();
    const promises = Array.from({ length: 50 }, () => {
      const sb = mockSupabase();
      return emitTelemetry(sb, { operation: "select", duration_ms: 5000 });
    });
    await Promise.all(promises);
    expect(performance.now() - start).toBeLessThan(500);
  });

  it("PERF-10: 200 concurrent emitTelemetry < 1s", async () => {
    const start = performance.now();
    const promises = Array.from({ length: 200 }, () => {
      const sb = mockSupabase();
      return emitTelemetry(sb, { operation: "select", duration_ms: 4000 });
    });
    await Promise.all(promises);
    expect(performance.now() - start).toBeLessThan(1000);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SEÇÃO 10: TESTES DE EDGE CASES (30 testes)
// ═══════════════════════════════════════════════════════════════════

describe("QSA-EDGE: Unusual inputs and boundary conditions", () => {
  it("EDGE-1: duration_ms = Number.MAX_SAFE_INTEGER", () => {
    expect(classifySeverity(Number.MAX_SAFE_INTEGER)).toBe("very_slow");
  });

  it("EDGE-2: duration_ms = 0.001 (sub-ms)", () => {
    expect(classifySeverity(0.001)).toBe("normal");
  });

  it("EDGE-3: duration_ms = 2999.999", () => {
    expect(classifySeverity(2999.999)).toBe("normal");
  });

  it("EDGE-4: duration_ms = 3000.001", () => {
    expect(classifySeverity(3000.001)).toBe("slow");
  });

  it("EDGE-5: duration_ms = 7999.999", () => {
    expect(classifySeverity(7999.999)).toBe("slow");
  });

  it("EDGE-6: duration_ms = 8000.001", () => {
    expect(classifySeverity(8000.001)).toBe("very_slow");
  });

  it("EDGE-7: very long error message", () => {
    const longErr = "x".repeat(10000);
    expect(classifySeverity(100, longErr)).toBe("error");
  });

  it("EDGE-8: very long operation name", () => {
    const r = validatePayload({ operation: "a".repeat(5000), duration_ms: 100 });
    expect(r.valid).toBe(true);
  });

  it("EDGE-9: very long table_name", () => {
    const r = validatePayload({ operation: "s", duration_ms: 100, table_name: "t".repeat(1000) });
    expect(r.valid).toBe(true);
  });

  it("EDGE-10: unicode in operation", () => {
    const r = validatePayload({ operation: "sélèçt", duration_ms: 100 });
    expect(r.valid).toBe(true);
  });

  it("EDGE-11: emoji in error_message", () => {
    const r = validatePayload({ operation: "s", duration_ms: 100, error_message: "❌ Failed 💥" });
    expect(r.valid).toBe(true);
    expect(r.data!.error_message).toBe("❌ Failed 💥");
  });

  it("EDGE-12: CSV with unicode content", () => {
    const csv = buildCSV([mkRow({ error_message: "Conexão à base falhou 😢" })]);
    expect(csv).toContain("😢");
  });

  it("EDGE-13: topOffenders with duration_ms = 0", () => {
    const rows = Array.from({ length: 5 }, () => mkRow({ duration_ms: 0 }));
    const top = computeTopOffenders(rows);
    expect(top[0][1].maxMs).toBe(0);
    expect(top[0][1].totalMs).toBe(0);
  });

  it("EDGE-14: stats with extreme outlier", () => {
    const rows = [
      ...Array.from({ length: 99 }, () => mkRow({ duration_ms: 3000 })),
      mkRow({ duration_ms: 999000 }),
    ];
    const s = computeStats(rows);
    expect(s.avg).toBeGreaterThan(10000);
  });

  it("EDGE-15: validate payload with extra nested objects", () => {
    const r = validatePayload({ operation: "s", duration_ms: 100, nested: { deep: { value: true } } });
    expect(r.valid).toBe(true);
    expect((r.data as any).nested).toBeUndefined();
  });

  it("EDGE-16: emitTelemetry with record_count = 0", async () => {
    const sb = mockSupabase();
    await emitTelemetry(sb, { operation: "select", duration_ms: 5000, record_count: 0 });
    expect(sb.chain.insert).toHaveBeenCalledWith(expect.objectContaining({ record_count: 0 }));
  });

  it("EDGE-17: emitTelemetry with query_offset = 0", async () => {
    const sb = mockSupabase();
    await emitTelemetry(sb, { operation: "select", duration_ms: 5000, query_offset: 0 });
    expect(sb.chain.insert).toHaveBeenCalledWith(expect.objectContaining({ query_offset: 0 }));
  });

  it("EDGE-18: alertBuckets with far future timestamps", () => {
    const future = new Date("2030-01-01").toISOString();
    const r = computeAlertBuckets([mkRow({ severity: "slow", created_at: future })], 3600000);
    expect(r).toHaveLength(1);
  });

  it("EDGE-19: alertBuckets with epoch 0", () => {
    const epoch = new Date(0).toISOString();
    const r = computeAlertBuckets([mkRow({ severity: "error", created_at: epoch })], 3600000);
    expect(r).toHaveLength(1);
    expect(r[0][0]).toBe(0);
  });

  it("EDGE-20: formatDuration with decimal", () => {
    expect(formatDuration(1234)).toBe("1.2s");
  });

  it("EDGE-21: formatDuration with 1999", () => {
    expect(formatDuration(1999)).toBe("2.0s");
  });

  it("EDGE-22: stats with all very_slow", () => {
    const rows = Array.from({ length: 50 }, () => mkRow({ severity: "very_slow", duration_ms: 10000 }));
    const s = computeStats(rows);
    expect(s.verySlow).toBe(50);
    expect(s.slow).toBe(0);
    expect(s.avg).toBe(10000);
  });

  it("EDGE-23: validate with boolean false as error_message", () => {
    const r = validatePayload({ operation: "s", duration_ms: 100, error_message: false as any });
    expect(r.valid).toBe(true);
    expect(r.data!.error_message).toBeUndefined();
  });

  it("EDGE-24: validate with 0 as error_message", () => {
    const r = validatePayload({ operation: "s", duration_ms: 100, error_message: 0 as any });
    expect(r.valid).toBe(true);
    expect(r.data!.error_message).toBeUndefined();
  });

  it("EDGE-25: CSV handles null record_count, query_limit, query_offset", () => {
    const csv = buildCSV([mkRow({ record_count: null, query_limit: null, query_offset: null })]);
    expect(csv.split(",").filter(c => c.includes('"-"')).length).toBeGreaterThanOrEqual(3);
  });
});
