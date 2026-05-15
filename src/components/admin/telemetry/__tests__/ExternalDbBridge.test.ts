import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Pure function re-implementations (mirrors edge function logic) ──

function classifySeverity(duration_ms: number, error_message?: string | null): string {
  if (error_message) return "error";
  if (duration_ms >= 8000) return "very_slow";
  if (duration_ms >= 3000) return "slow";
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

function validateTelemetryPayload(payload: unknown): { valid: boolean; error?: string; data?: TelemetryPayload } {
  if (!payload || typeof payload !== "object") {
    return { valid: false, error: "Payload inválido" };
  }
  const p = payload as Record<string, unknown>;
  if (!p.operation || typeof p.operation !== "string") {
    return { valid: false, error: 'Campo "operation" é obrigatório' };
  }
  if (typeof p.duration_ms !== "number" || p.duration_ms < 0) {
    return { valid: false, error: 'Campo "duration_ms" deve ser um número não-negativo' };
  }
  return {
    valid: true,
    data: {
      operation: p.operation as string,
      table_name: (p.table_name as string) || undefined,
      rpc_name: (p.rpc_name as string) || undefined,
      duration_ms: p.duration_ms as number,
      record_count: typeof p.record_count === "number" ? p.record_count : undefined,
      query_limit: typeof p.query_limit === "number" ? p.query_limit : undefined,
      query_offset: typeof p.query_offset === "number" ? p.query_offset : undefined,
      count_mode: (p.count_mode as string) || undefined,
      error_message: (p.error_message as string) || undefined,
      user_id: (p.user_id as string) || undefined,
    },
  };
}

// ── Mock Supabase for emitTelemetry ──

function createMockSupabase(insertResult: { data: unknown; error: unknown } = { data: { id: "test-id" }, error: null }) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.select = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(insertResult);
  const from = vi.fn().mockReturnValue(chain);
  return { from, chain };
}

async function emitTelemetry(
  supabase: { from: ReturnType<typeof vi.fn> },
  payload: TelemetryPayload
): Promise<{ success: boolean; id?: string; error?: string }> {
  const severity = classifySeverity(payload.duration_ms, payload.error_message);
  if (severity === "normal") {
    return { success: true, id: undefined };
  }
  const chain = supabase.from("query_telemetry");
  const result = await chain
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
    .select("id")
    .single();

   if (result.error) {
     const errorMsg = result.error instanceof Error ? result.error.message : String(result.error);
     return { success: false, error: errorMsg };
   }
  return { success: true, id: result.data?.id };
}

// ══════════════════════════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════════════════════════

describe("external-db-bridge: classifySeverity", () => {
  // ── Error classification ──
  it("T100: returns 'error' when error_message is present", () => {
    expect(classifySeverity(100, "connection failed")).toBe("error");
  });

  it("T101: returns 'error' even with very high duration if error present", () => {
    expect(classifySeverity(99999, "timeout")).toBe("error");
  });

  it("T102: returns 'error' with 0ms duration and error message", () => {
    expect(classifySeverity(0, "syntax error")).toBe("error");
  });

  // ── Very slow classification ──
  it("T103: returns 'very_slow' at exactly 8000ms", () => {
    expect(classifySeverity(8000)).toBe("very_slow");
  });

  it("T104: returns 'very_slow' above 8000ms", () => {
    expect(classifySeverity(15000)).toBe("very_slow");
  });

  it("T105: returns 'very_slow' at 8001ms", () => {
    expect(classifySeverity(8001)).toBe("very_slow");
  });

  // ── Slow classification ──
  it("T106: returns 'slow' at exactly 3000ms", () => {
    expect(classifySeverity(3000)).toBe("slow");
  });

  it("T107: returns 'slow' at 5000ms", () => {
    expect(classifySeverity(5000)).toBe("slow");
  });

  it("T108: returns 'slow' at 7999ms", () => {
    expect(classifySeverity(7999)).toBe("slow");
  });

  // ── Normal classification ──
  it("T109: returns 'normal' at 2999ms", () => {
    expect(classifySeverity(2999)).toBe("normal");
  });

  it("T110: returns 'normal' at 0ms", () => {
    expect(classifySeverity(0)).toBe("normal");
  });

  it("T111: returns 'normal' at 1ms", () => {
    expect(classifySeverity(1)).toBe("normal");
  });

  it("T112: returns 'normal' at 1500ms", () => {
    expect(classifySeverity(1500)).toBe("normal");
  });

  // ── Edge cases with null/undefined error ──
  it("T113: returns based on duration when error_message is null", () => {
    expect(classifySeverity(4000, null)).toBe("slow");
  });

  it("T114: returns based on duration when error_message is undefined", () => {
    expect(classifySeverity(9000, undefined)).toBe("very_slow");
  });

  it("T115: empty string error_message treated as no error", () => {
    expect(classifySeverity(500, "")).toBe("normal");
  });

  // ── Boundary values ──
  it("T116: returns 'slow' at 3001ms", () => {
    expect(classifySeverity(3001)).toBe("slow");
  });

  it("T117: returns 'normal' at 2000ms", () => {
    expect(classifySeverity(2000)).toBe("normal");
  });

  it("T118: very large duration returns 'very_slow'", () => {
    expect(classifySeverity(120000)).toBe("very_slow");
  });

  it("T119: error takes priority over very_slow duration", () => {
    expect(classifySeverity(50000, "deadlock detected")).toBe("error");
  });
});

describe("external-db-bridge: validateTelemetryPayload", () => {
  // ── Invalid payloads ──
  it("T120: rejects null payload", () => {
    const result = validateTelemetryPayload(null);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Payload inválido");
  });

  it("T121: rejects undefined payload", () => {
    const result = validateTelemetryPayload(undefined);
    expect(result.valid).toBe(false);
  });

  it("T122: rejects string payload", () => {
    const result = validateTelemetryPayload("not an object");
    expect(result.valid).toBe(false);
  });

  it("T123: rejects number payload", () => {
    const result = validateTelemetryPayload(42);
    expect(result.valid).toBe(false);
  });

  it("T124: rejects empty object (missing operation)", () => {
    const result = validateTelemetryPayload({});
    expect(result.valid).toBe(false);
    expect(result.error).toContain("operation");
  });

  it("T125: rejects missing duration_ms", () => {
    const result = validateTelemetryPayload({ operation: "select" });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("duration_ms");
  });

  it("T126: rejects negative duration_ms", () => {
    const result = validateTelemetryPayload({ operation: "select", duration_ms: -1 });
    expect(result.valid).toBe(false);
  });

  it("T127: rejects non-string operation", () => {
    const result = validateTelemetryPayload({ operation: 123, duration_ms: 100 });
    expect(result.valid).toBe(false);
  });

  it("T128: rejects non-number duration_ms", () => {
    const result = validateTelemetryPayload({ operation: "select", duration_ms: "fast" });
    expect(result.valid).toBe(false);
  });

  // ── Valid payloads ──
  it("T129: accepts minimal valid payload", () => {
    const result = validateTelemetryPayload({ operation: "select", duration_ms: 100 });
    expect(result.valid).toBe(true);
    expect(result.data!.operation).toBe("select");
    expect(result.data!.duration_ms).toBe(100);
  });

  it("T130: accepts full payload with all fields", () => {
    const result = validateTelemetryPayload({
      operation: "select",
      table_name: "produtos",
      rpc_name: "get_stats",
      duration_ms: 5000,
      record_count: 150,
      query_limit: 200,
      query_offset: 0,
      count_mode: "exact",
      error_message: null,
      user_id: "abc-123",
    });
    expect(result.valid).toBe(true);
    expect(result.data!.table_name).toBe("produtos");
    expect(result.data!.rpc_name).toBe("get_stats");
    expect(result.data!.record_count).toBe(150);
    expect(result.data!.query_limit).toBe(200);
    expect(result.data!.query_offset).toBe(0);
    expect(result.data!.count_mode).toBe("exact");
    expect(result.data!.user_id).toBe("abc-123");
  });

  it("T131: accepts zero duration_ms", () => {
    const result = validateTelemetryPayload({ operation: "insert", duration_ms: 0 });
    expect(result.valid).toBe(true);
    expect(result.data!.duration_ms).toBe(0);
  });

  it("T132: optional fields default to undefined", () => {
    const result = validateTelemetryPayload({ operation: "update", duration_ms: 500 });
    expect(result.valid).toBe(true);
    expect(result.data!.table_name).toBeUndefined();
    expect(result.data!.rpc_name).toBeUndefined();
    expect(result.data!.record_count).toBeUndefined();
    expect(result.data!.error_message).toBeUndefined();
    expect(result.data!.user_id).toBeUndefined();
  });

  it("T133: accepts error_message string", () => {
    const result = validateTelemetryPayload({ operation: "select", duration_ms: 100, error_message: "timeout" });
    expect(result.valid).toBe(true);
    expect(result.data!.error_message).toBe("timeout");
  });

  it("T134: accepts 'delete' operation", () => {
    const result = validateTelemetryPayload({ operation: "delete", duration_ms: 200 });
    expect(result.valid).toBe(true);
    expect(result.data!.operation).toBe("delete");
  });

  it("T135: accepts 'rpc' operation", () => {
    const result = validateTelemetryPayload({ operation: "rpc", duration_ms: 4000, rpc_name: "calculate_kpis" });
    expect(result.valid).toBe(true);
    expect(result.data!.rpc_name).toBe("calculate_kpis");
  });

  it("T136: accepts very large duration_ms", () => {
    const result = validateTelemetryPayload({ operation: "select", duration_ms: 999999 });
    expect(result.valid).toBe(true);
    expect(result.data!.duration_ms).toBe(999999);
  });

  it("T137: ignores extra unknown fields", () => {
    const result = validateTelemetryPayload({ operation: "select", duration_ms: 50, extra_field: "ignored" });
    expect(result.valid).toBe(true);
    expect((result.data as any).extra_field).toBeUndefined();
  });

  it("T138: record_count of 0 is accepted", () => {
    const result = validateTelemetryPayload({ operation: "select", duration_ms: 100, record_count: 0 });
    expect(result.valid).toBe(true);
    expect(result.data!.record_count).toBe(0);
  });

  it("T139: query_limit of 1000 accepted", () => {
    const result = validateTelemetryPayload({ operation: "select", duration_ms: 100, query_limit: 1000 });
    expect(result.valid).toBe(true);
    expect(result.data!.query_limit).toBe(1000);
  });
});

describe("external-db-bridge: emitTelemetry", () => {
  // ── Normal queries (not persisted) ──
  it("T140: does NOT persist normal severity queries", async () => {
    const { from } = createMockSupabase();
    const result = await emitTelemetry({ from }, { operation: "select", duration_ms: 100 });
    expect(result.success).toBe(true);
    expect(result.id).toBeUndefined();
    expect(from).not.toHaveBeenCalled();
  });

  it("T141: does NOT persist 2999ms query", async () => {
    const { from } = createMockSupabase();
    const result = await emitTelemetry({ from }, { operation: "select", duration_ms: 2999 });
    expect(result.success).toBe(true);
    expect(from).not.toHaveBeenCalled();
  });

  it("T142: does NOT persist 0ms query", async () => {
    const { from } = createMockSupabase();
    const result = await emitTelemetry({ from }, { operation: "insert", duration_ms: 0 });
    expect(result.success).toBe(true);
    expect(from).not.toHaveBeenCalled();
  });

  // ── Slow queries (persisted) ──
  it("T143: persists slow query (3000ms)", async () => {
    const { from, chain } = createMockSupabase();
    const result = await emitTelemetry({ from }, { operation: "select", duration_ms: 3000, table_name: "produtos" });
    expect(result.success).toBe(true);
    expect(result.id).toBe("test-id");
    expect(from).toHaveBeenCalledWith("query_telemetry");
    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({
      severity: "slow",
      operation: "select",
      table_name: "produtos",
      duration_ms: 3000,
    }));
  });

  it("T144: persists slow query at 5000ms", async () => {
    const { from, chain } = createMockSupabase();
    await emitTelemetry({ from }, { operation: "select", duration_ms: 5000 });
    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ severity: "slow" }));
  });

  // ── Very slow queries (persisted) ──
  it("T145: persists very_slow query (8000ms)", async () => {
    const { from, chain } = createMockSupabase();
    const result = await emitTelemetry({ from }, { operation: "select", duration_ms: 8000, table_name: "lotes" });
    expect(result.success).toBe(true);
    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ severity: "very_slow" }));
  });

  it("T146: persists very_slow query (15000ms)", async () => {
    const { from, chain } = createMockSupabase();
    await emitTelemetry({ from }, { operation: "rpc", duration_ms: 15000, rpc_name: "heavy_report" });
    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({
      severity: "very_slow",
      rpc_name: "heavy_report",
    }));
  });

  // ── Error queries (persisted) ──
  it("T147: persists error query", async () => {
    const { from, chain } = createMockSupabase();
    const result = await emitTelemetry({ from }, {
      operation: "select",
      duration_ms: 200,
      error_message: "connection refused",
    });
    expect(result.success).toBe(true);
    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({
      severity: "error",
      error_message: "connection refused",
    }));
  });

  it("T148: persists error query even with fast duration", async () => {
    const { from, chain } = createMockSupabase();
    await emitTelemetry({ from }, { operation: "insert", duration_ms: 10, error_message: "unique violation" });
    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ severity: "error" }));
  });

  // ── Field mapping ──
  it("T149: maps all optional fields correctly", async () => {
    const { from, chain } = createMockSupabase();
    await emitTelemetry({ from }, {
      operation: "select",
      table_name: "estoque_posicao",
      rpc_name: undefined,
      duration_ms: 4000,
      record_count: 500,
      query_limit: 1000,
      query_offset: 200,
      count_mode: "exact",
      user_id: "user-abc",
    });
    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({
      table_name: "estoque_posicao",
      rpc_name: null,
      record_count: 500,
      query_limit: 1000,
      query_offset: 200,
      count_mode: "exact",
      user_id: "user-abc",
    }));
  });

  it("T150: null-ifies missing optional fields", async () => {
    const { from, chain } = createMockSupabase();
    await emitTelemetry({ from }, { operation: "delete", duration_ms: 9000 });
    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({
      table_name: null,
      rpc_name: null,
      record_count: null,
      query_limit: null,
      query_offset: null,
      count_mode: null,
      error_message: null,
      user_id: null,
    }));
  });

  // ── Database error handling ──
  it("T151: returns error on insert failure", async () => {
    const { from } = createMockSupabase({ data: null, error: { message: "insert failed" } });
    const result = await emitTelemetry({ from }, { operation: "select", duration_ms: 5000 });
    expect(result.success).toBe(false);
    expect(result.error).toBe("insert failed");
  });

  it("T152: returns error when DB returns permission denied", async () => {
    const { from } = createMockSupabase({ data: null, error: { message: "permission denied for table query_telemetry" } });
    const result = await emitTelemetry({ from }, { operation: "select", duration_ms: 10000 });
    expect(result.success).toBe(false);
    expect(result.error).toContain("permission denied");
  });

  it("T153: returns success with id on successful insert", async () => {
    const { from } = createMockSupabase({ data: { id: "uuid-123-456" }, error: null });
    const result = await emitTelemetry({ from }, { operation: "update", duration_ms: 4500 });
    expect(result.success).toBe(true);
    expect(result.id).toBe("uuid-123-456");
  });

  // ── Calls correct table ──
  it("T154: always queries 'query_telemetry' table", async () => {
    const { from } = createMockSupabase();
    await emitTelemetry({ from }, { operation: "select", duration_ms: 3500 });
    expect(from).toHaveBeenCalledWith("query_telemetry");
  });

  it("T155: calls .select('id') after insert", async () => {
    const { from, chain } = createMockSupabase();
    await emitTelemetry({ from }, { operation: "select", duration_ms: 4000 });
    expect(chain.select).toHaveBeenCalledWith("id");
  });

  it("T156: calls .single() to get single record", async () => {
    const { from, chain } = createMockSupabase();
    await emitTelemetry({ from }, { operation: "select", duration_ms: 4000 });
    expect(chain.single).toHaveBeenCalled();
  });

  // ── Multiple calls ──
  it("T157: can emit multiple telemetry entries sequentially", async () => {
    const { from } = createMockSupabase();
    const r1 = await emitTelemetry({ from }, { operation: "select", duration_ms: 3500 });
    const r2 = await emitTelemetry({ from }, { operation: "insert", duration_ms: 9000 });
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
    expect(from).toHaveBeenCalledTimes(2);
  });

  // ── Specific operations ──
  it("T158: handles 'select' operation", async () => {
    const { from, chain } = createMockSupabase();
    await emitTelemetry({ from }, { operation: "select", duration_ms: 4000 });
    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ operation: "select" }));
  });

  it("T159: handles 'insert' operation", async () => {
    const { from, chain } = createMockSupabase();
    await emitTelemetry({ from }, { operation: "insert", duration_ms: 4000 });
    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ operation: "insert" }));
  });

  it("T160: handles 'update' operation", async () => {
    const { from, chain } = createMockSupabase();
    await emitTelemetry({ from }, { operation: "update", duration_ms: 4000 });
    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ operation: "update" }));
  });

  it("T161: handles 'delete' operation", async () => {
    const { from, chain } = createMockSupabase();
    await emitTelemetry({ from }, { operation: "delete", duration_ms: 4000 });
    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ operation: "delete" }));
  });

  it("T162: handles 'rpc' operation", async () => {
    const { from, chain } = createMockSupabase();
    await emitTelemetry({ from }, { operation: "rpc", duration_ms: 4000, rpc_name: "calculate_kpis" });
    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ operation: "rpc", rpc_name: "calculate_kpis" }));
  });

  // ── Edge cases ──
  it("T163: record_count 0 persisted as 0, not null", async () => {
    const { from, chain } = createMockSupabase();
    await emitTelemetry({ from }, { operation: "select", duration_ms: 4000, record_count: 0 });
    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ record_count: 0 }));
  });

  it("T164: query_offset 0 persisted as 0", async () => {
    const { from, chain } = createMockSupabase();
    await emitTelemetry({ from }, { operation: "select", duration_ms: 4000, query_offset: 0 });
    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ query_offset: 0 }));
  });

  it("T165: handles boundary 3000ms correctly as 'slow'", async () => {
    const { from, chain } = createMockSupabase();
    await emitTelemetry({ from }, { operation: "select", duration_ms: 3000 });
    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ severity: "slow" }));
  });

  it("T166: handles boundary 8000ms correctly as 'very_slow'", async () => {
    const { from, chain } = createMockSupabase();
    await emitTelemetry({ from }, { operation: "select", duration_ms: 8000 });
    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ severity: "very_slow" }));
  });
});

describe("external-db-bridge: integration scenarios", () => {
  it("T167: validate + classify + emit slow query end-to-end", async () => {
    const payload = { operation: "select", duration_ms: 5000, table_name: "produtos" };
    const validation = validateTelemetryPayload(payload);
    expect(validation.valid).toBe(true);
    expect(classifySeverity(validation.data!.duration_ms)).toBe("slow");
    const { from } = createMockSupabase();
    const result = await emitTelemetry({ from }, validation.data!);
    expect(result.success).toBe(true);
  });

  it("T168: validate + classify + skip normal query", async () => {
    const payload = { operation: "select", duration_ms: 500 };
    const validation = validateTelemetryPayload(payload);
    expect(validation.valid).toBe(true);
    expect(classifySeverity(validation.data!.duration_ms)).toBe("normal");
    const { from } = createMockSupabase();
    const result = await emitTelemetry({ from }, validation.data!);
    expect(result.success).toBe(true);
    expect(from).not.toHaveBeenCalled();
  });

  it("T169: validate + classify + emit error query", async () => {
    const payload = { operation: "insert", duration_ms: 50, error_message: "FK violation" };
    const validation = validateTelemetryPayload(payload);
    expect(validation.valid).toBe(true);
    expect(classifySeverity(validation.data!.duration_ms, validation.data!.error_message)).toBe("error");
    const { from } = createMockSupabase();
    const result = await emitTelemetry({ from }, validation.data!);
    expect(result.success).toBe(true);
  });

  it("T170: invalid payload does not reach emitTelemetry", () => {
    const validation = validateTelemetryPayload({ operation: "" });
    expect(validation.valid).toBe(false);
    // emitTelemetry should not be called
  });

  it("T171: validate rpc payload + classify very_slow + emit", async () => {
    const payload = { operation: "rpc", rpc_name: "heavy_calc", duration_ms: 12000, record_count: 50000 };
    const validation = validateTelemetryPayload(payload);
    expect(validation.valid).toBe(true);
    expect(classifySeverity(validation.data!.duration_ms)).toBe("very_slow");
    const { from, chain } = createMockSupabase();
    await emitTelemetry({ from }, validation.data!);
    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({
      severity: "very_slow",
      rpc_name: "heavy_calc",
      record_count: 50000,
    }));
  });

  it("T172: DB failure on emit returns structured error", async () => {
    const payload = { operation: "select", duration_ms: 4000 };
    const validation = validateTelemetryPayload(payload);
    const { from } = createMockSupabase({ data: null, error: { message: "disk full" } });
    const result = await emitTelemetry({ from }, validation.data!);
    expect(result.success).toBe(false);
    expect(result.error).toBe("disk full");
  });
});
