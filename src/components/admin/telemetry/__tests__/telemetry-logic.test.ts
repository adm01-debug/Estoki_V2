import { describe, it, expect } from "vitest";

// ===== Pure logic replicas (mirrors Edge Function logic) =====

const SLOW_THRESHOLD = 3000;
const VERY_SLOW_THRESHOLD = 8000;

function classifySeverity(durationMs: number, hasError: boolean): string {
  if (hasError) return "error";
  if (durationMs >= VERY_SLOW_THRESHOLD) return "very_slow";
  if (durationMs >= SLOW_THRESHOLD) return "slow";
  return "ok";
}

function formatDuration(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

function formatBucketTime(ts: number, timeFilter: string): string {
  const d = new Date(ts);
  if (timeFilter === "7d") {
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  }
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function getBucketMs(timeFilter: string): number {
  switch (timeFilter) {
    case "1h": return 5 * 60 * 1000;
    case "6h": return 30 * 60 * 1000;
    case "24h": return 60 * 60 * 1000;
    case "7d": return 6 * 60 * 60 * 1000;
    default: return 60 * 60 * 1000;
  }
}

interface TelemetryRow {
  id: string;
  operation: string;
  table_name: string | null;
  rpc_name: string | null;
  duration_ms: number;
  severity: string;
  record_count: number | null;
  query_limit: number | null;
  query_offset: number | null;
  count_mode: string | null;
  error_message: string | null;
  user_id: string | null;
  created_at: string;
}

function computeTopOffenders(rows: TelemetryRow[], limit = 8) {
  const stats = new Map<string, { count: number; totalMs: number; maxMs: number }>();
  for (const r of rows) {
    const key = r.rpc_name || r.table_name || "unknown";
    const prev = stats.get(key) || { count: 0, totalMs: 0, maxMs: 0 };
    stats.set(key, {
      count: prev.count + 1,
      totalMs: prev.totalMs + r.duration_ms,
      maxMs: Math.max(prev.maxMs, r.duration_ms),
    });
  }
  return [...stats.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, limit);
}

function buildCSVContent(rows: TelemetryRow[]): string {
  const headers = ["Data/Hora", "Operação", "Tabela/RPC", "Duração (ms)", "Severidade", "Registros", "Limit", "Offset", "Count Mode", "Erro"];
  const csvRows = rows.map(r => [
    new Date(r.created_at).toLocaleString("pt-BR"),
    r.operation,
    r.rpc_name || r.table_name || "-",
    r.duration_ms,
    r.severity,
    r.record_count ?? "-",
    r.query_limit ?? "-",
    r.query_offset ?? "-",
    r.count_mode ?? "-",
    (r.error_message || "").replace(/"/g, '""'),
  ]);
  return [headers, ...csvRows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
}

function computeAlertBuckets(rows: TelemetryRow[], bucketMs: number) {
  const buckets = new Map<number, { muitoLentas: number; lentas: number; erros: number }>();
  for (const r of rows) {
    const ts = Math.floor(new Date(r.created_at).getTime() / bucketMs) * bucketMs;
    const prev = buckets.get(ts) || { muitoLentas: 0, lentas: 0, erros: 0 };
    if (r.severity === "very_slow") prev.muitoLentas++;
    else if (r.severity === "slow") prev.lentas++;
    else if (r.severity === "error") prev.erros++;
    buckets.set(ts, prev);
  }
  return [...buckets.entries()].sort((a, b) => a[0] - b[0]);
}

function validatePayload(p: Record<string, unknown>): { valid: boolean; error?: string } {
  if (!p || typeof p !== "object") return { valid: false, error: "Payload inválido" };
  if (!p.operation || typeof p.operation !== "string") return { valid: false, error: "operation required" };
  if (typeof p.duration_ms !== "number" || p.duration_ms < 0) return { valid: false, error: "duration_ms invalid" };
  return { valid: true };
}

// ===== TESTS =====

const makeRow = (overrides: Partial<TelemetryRow> = {}): TelemetryRow => ({
  id: crypto.randomUUID(),
  operation: "select",
  table_name: "products",
  rpc_name: null,
  duration_ms: 5000,
  severity: "slow",
  record_count: 50,
  query_limit: 100,
  query_offset: 0,
  count_mode: "planned",
  error_message: null,
  user_id: null,
  created_at: new Date().toISOString(),
  ...overrides,
});

// ========== classifySeverity ==========
describe("classifySeverity", () => {
  it("returns ok for 0ms", () => expect(classifySeverity(0, false)).toBe("ok"));
  it("returns ok for 100ms", () => expect(classifySeverity(100, false)).toBe("ok"));
  it("returns ok for 1000ms", () => expect(classifySeverity(1000, false)).toBe("ok"));
  it("returns ok for 2999ms", () => expect(classifySeverity(2999, false)).toBe("ok"));
  it("returns slow for 3000ms", () => expect(classifySeverity(3000, false)).toBe("slow"));
  it("returns slow for 3001ms", () => expect(classifySeverity(3001, false)).toBe("slow"));
  it("returns slow for 5000ms", () => expect(classifySeverity(5000, false)).toBe("slow"));
  it("returns slow for 7999ms", () => expect(classifySeverity(7999, false)).toBe("slow"));
  it("returns very_slow for 8000ms", () => expect(classifySeverity(8000, false)).toBe("very_slow"));
  it("returns very_slow for 8001ms", () => expect(classifySeverity(8001, false)).toBe("very_slow"));
  it("returns very_slow for 15000ms", () => expect(classifySeverity(15000, false)).toBe("very_slow"));
  it("returns very_slow for 60000ms", () => expect(classifySeverity(60000, false)).toBe("very_slow"));
  it("returns error for 0ms with error", () => expect(classifySeverity(0, true)).toBe("error"));
  it("returns error for 100ms with error", () => expect(classifySeverity(100, true)).toBe("error"));
  it("returns error for 5000ms with error", () => expect(classifySeverity(5000, true)).toBe("error"));
  it("returns error for 10000ms with error", () => expect(classifySeverity(10000, true)).toBe("error"));
  it("error takes precedence over very_slow", () => expect(classifySeverity(99999, true)).toBe("error"));
  it("boundary: exactly at slow threshold", () => expect(classifySeverity(SLOW_THRESHOLD, false)).toBe("slow"));
  it("boundary: exactly at very_slow threshold", () => expect(classifySeverity(VERY_SLOW_THRESHOLD, false)).toBe("very_slow"));
  it("boundary: 1ms below slow threshold", () => expect(classifySeverity(SLOW_THRESHOLD - 1, false)).toBe("ok"));
});

// ========== formatDuration ==========
describe("formatDuration", () => {
  it("formats 0ms", () => expect(formatDuration(0)).toBe("0ms"));
  it("formats 1ms", () => expect(formatDuration(1)).toBe("1ms"));
  it("formats 500ms", () => expect(formatDuration(500)).toBe("500ms"));
  it("formats 999ms", () => expect(formatDuration(999)).toBe("999ms"));
  it("formats 1000ms as 1.0s", () => expect(formatDuration(1000)).toBe("1.0s"));
  it("formats 1500ms as 1.5s", () => expect(formatDuration(1500)).toBe("1.5s"));
  it("formats 3000ms as 3.0s", () => expect(formatDuration(3000)).toBe("3.0s"));
  it("formats 8500ms as 8.5s", () => expect(formatDuration(8500)).toBe("8.5s"));
  it("formats 10000ms as 10.0s", () => expect(formatDuration(10000)).toBe("10.0s"));
  it("formats 60000ms as 60.0s", () => expect(formatDuration(60000)).toBe("60.0s"));
});

// ========== getBucketMs ==========
describe("getBucketMs", () => {
  it("1h returns 5 min buckets", () => expect(getBucketMs("1h")).toBe(300000));
  it("6h returns 30 min buckets", () => expect(getBucketMs("6h")).toBe(1800000));
  it("24h returns 1 hour buckets", () => expect(getBucketMs("24h")).toBe(3600000));
  it("7d returns 6 hour buckets", () => expect(getBucketMs("7d")).toBe(21600000));
  it("custom defaults to 1 hour", () => expect(getBucketMs("custom")).toBe(3600000));
  it("unknown defaults to 1 hour", () => expect(getBucketMs("xyz")).toBe(3600000));
});

// ========== formatBucketTime ==========
describe("formatBucketTime", () => {
  const ts = new Date("2026-03-15T14:30:00Z").getTime();
  it("7d shows date format", () => {
    const result = formatBucketTime(ts, "7d");
    expect(result).toMatch(/\d{2}\/\d{2}/);
  });
  it("24h shows time format", () => {
    const result = formatBucketTime(ts, "24h");
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
  it("1h shows time format", () => {
    const result = formatBucketTime(ts, "1h");
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});

// ========== computeTopOffenders ==========
describe("computeTopOffenders", () => {
  it("returns empty for empty input", () => {
    expect(computeTopOffenders([])).toEqual([]);
  });
  it("returns single table", () => {
    const rows = [makeRow({ table_name: "products" })];
    const result = computeTopOffenders(rows);
    expect(result).toHaveLength(1);
    expect(result[0][0]).toBe("products");
  });
  it("sorts by count descending", () => {
    const rows = [
      makeRow({ table_name: "a" }),
      makeRow({ table_name: "b" }),
      makeRow({ table_name: "b" }),
      makeRow({ table_name: "b" }),
      makeRow({ table_name: "a" }),
    ];
    const result = computeTopOffenders(rows);
    expect(result[0][0]).toBe("b");
    expect(result[0][1].count).toBe(3);
    expect(result[1][0]).toBe("a");
    expect(result[1][1].count).toBe(2);
  });
  it("limits to 8 by default", () => {
    const rows = Array.from({ length: 20 }, (_, i) => makeRow({ table_name: `t${i}` }));
    expect(computeTopOffenders(rows)).toHaveLength(8);
  });
  it("custom limit", () => {
    const rows = Array.from({ length: 10 }, (_, i) => makeRow({ table_name: `t${i}` }));
    expect(computeTopOffenders(rows, 3)).toHaveLength(3);
  });
  it("prefers rpc_name over table_name", () => {
    const rows = [makeRow({ table_name: "products", rpc_name: "my_rpc" })];
    const result = computeTopOffenders(rows);
    expect(result[0][0]).toBe("my_rpc");
  });
  it("uses unknown when both null", () => {
    const rows = [makeRow({ table_name: null, rpc_name: null })];
    expect(computeTopOffenders(rows)[0][0]).toBe("unknown");
  });
  it("calculates maxMs correctly", () => {
    const rows = [
      makeRow({ table_name: "t", duration_ms: 3000 }),
      makeRow({ table_name: "t", duration_ms: 9000 }),
      makeRow({ table_name: "t", duration_ms: 5000 }),
    ];
    expect(computeTopOffenders(rows)[0][1].maxMs).toBe(9000);
  });
  it("calculates totalMs correctly", () => {
    const rows = [
      makeRow({ table_name: "t", duration_ms: 3000 }),
      makeRow({ table_name: "t", duration_ms: 5000 }),
    ];
    expect(computeTopOffenders(rows)[0][1].totalMs).toBe(8000);
  });
});

// ========== buildCSVContent ==========
describe("buildCSVContent", () => {
  it("returns headers for empty rows", () => {
    const csv = buildCSVContent([]);
    expect(csv).toContain("Data/Hora");
    expect(csv).toContain("Severidade");
    expect(csv.split("\n")).toHaveLength(1); // only headers
  });
  it("includes one data row", () => {
    const csv = buildCSVContent([makeRow()]);
    expect(csv.split("\n")).toHaveLength(2);
  });
  it("escapes double quotes in error messages", () => {
    const csv = buildCSVContent([makeRow({ error_message: 'quote "test"' })]);
    expect(csv).toContain('""test""');
  });
  it("handles null error_message", () => {
    const csv = buildCSVContent([makeRow({ error_message: null })]);
    expect(csv).not.toContain("null");
  });
  it("uses rpc_name when available", () => {
    const csv = buildCSVContent([makeRow({ rpc_name: "my_rpc", table_name: "tbl" })]);
    expect(csv).toContain("my_rpc");
  });
  it("falls back to table_name", () => {
    const csv = buildCSVContent([makeRow({ rpc_name: null, table_name: "orders" })]);
    expect(csv).toContain("orders");
  });
  it("shows dash when both null", () => {
    const csv = buildCSVContent([makeRow({ rpc_name: null, table_name: null })]);
    expect(csv).toContain('"-"');
  });
  it("handles 100 rows", () => {
    const rows = Array.from({ length: 100 }, () => makeRow());
    expect(buildCSVContent(rows).split("\n")).toHaveLength(101);
  });
});

// ========== computeAlertBuckets ==========
describe("computeAlertBuckets", () => {
  const bucketMs = 3600000; // 1 hour
  it("returns empty for empty input", () => {
    expect(computeAlertBuckets([], bucketMs)).toEqual([]);
  });
  it("counts slow correctly", () => {
    const rows = [makeRow({ severity: "slow" }), makeRow({ severity: "slow" })];
    const result = computeAlertBuckets(rows, bucketMs);
    expect(result[0][1].lentas).toBe(2);
    expect(result[0][1].muitoLentas).toBe(0);
  });
  it("counts very_slow correctly", () => {
    const rows = [makeRow({ severity: "very_slow" })];
    const result = computeAlertBuckets(rows, bucketMs);
    expect(result[0][1].muitoLentas).toBe(1);
  });
  it("counts error correctly", () => {
    const rows = [makeRow({ severity: "error" })];
    const result = computeAlertBuckets(rows, bucketMs);
    expect(result[0][1].erros).toBe(1);
  });
  it("separates different time buckets", () => {
    const now = Date.now();
    const rows = [
      makeRow({ severity: "slow", created_at: new Date(now).toISOString() }),
      makeRow({ severity: "slow", created_at: new Date(now - 2 * 3600000).toISOString() }),
    ];
    const result = computeAlertBuckets(rows, bucketMs);
    expect(result.length).toBeGreaterThanOrEqual(2);
  });
  it("sorts by timestamp ascending", () => {
    const now = Date.now();
    const rows = [
      makeRow({ created_at: new Date(now).toISOString() }),
      makeRow({ created_at: new Date(now - 5 * 3600000).toISOString() }),
    ];
    const result = computeAlertBuckets(rows, bucketMs);
    expect(result[0][0]).toBeLessThan(result[result.length - 1][0]);
  });
});

// ========== validatePayload ==========
describe("validatePayload", () => {
  it("valid complete payload", () => {
    expect(validatePayload({ operation: "select", duration_ms: 5000 }).valid).toBe(true);
  });
  it("missing operation", () => {
    expect(validatePayload({ duration_ms: 5000 } as any).valid).toBe(false);
  });
  it("non-string operation", () => {
    expect(validatePayload({ operation: 123, duration_ms: 5000 } as any).valid).toBe(false);
  });
  it("missing duration_ms", () => {
    expect(validatePayload({ operation: "select" } as any).valid).toBe(false);
  });
  it("negative duration_ms", () => {
    expect(validatePayload({ operation: "select", duration_ms: -1 }).valid).toBe(false);
  });
  it("zero duration_ms is valid", () => {
    expect(validatePayload({ operation: "select", duration_ms: 0 }).valid).toBe(true);
  });
  it("null payload", () => {
    expect(validatePayload(null as any).valid).toBe(false);
  });
  it("empty object is invalid", () => {
    expect(validatePayload({}).valid).toBe(false);
  });
  it("string operation with spaces", () => {
    expect(validatePayload({ operation: "  select  ", duration_ms: 100 }).valid).toBe(true);
  });
  it("large duration_ms is valid", () => {
    expect(validatePayload({ operation: "select", duration_ms: 999999 }).valid).toBe(true);
  });
});
