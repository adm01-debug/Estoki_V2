import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import AdminTelemetriaPage from "../AdminTelemetriaPage";

// ── Mock dependencies ──
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
  Toaster: () => null,
}));

vi.mock("@/components/admin/telemetry/TelemetryCharts", () => ({
  TelemetryCharts: ({ rows, timeFilter }: any) => (
    <div data-testid="telemetry-charts" data-rows={rows.length} data-filter={timeFilter}>
      Charts Mock
    </div>
  ),
}));

// ── Mock Supabase with fluent chain ──
let mockResolvedData: any[] = [];
let mockError: any = null;

const chainObj: any = {};
chainObj.select = vi.fn(() => chainObj);
chainObj.gte = vi.fn(() => chainObj);
chainObj.order = vi.fn(() => chainObj);
chainObj.limit = vi.fn(() => chainObj);
chainObj.eq = vi.fn(() => chainObj);
chainObj.lt = vi.fn(() => Promise.resolve({ data: null, error: null }));
chainObj.delete = vi.fn(() => chainObj);
chainObj.then = vi.fn((resolve: any) => resolve({ data: mockResolvedData, error: mockError }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => chainObj),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

// ── Helper ──
function generateRows(count: number, overrides: Partial<any> = {}): any[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `row-${i}-${Math.random().toString(36).slice(2, 6)}`,
    operation: i % 3 === 0 ? "select" : i % 3 === 1 ? "rpc" : "insert",
    table_name: `table_${i % 5}`,
    rpc_name: i % 3 === 1 ? `rpc_${i % 4}` : null,
    duration_ms: 1000 + i * 500 + (i % 7 === 0 ? 8000 : 0),
    record_count: i * 10,
    query_limit: 100,
    query_offset: i * 100,
    count_mode: i % 2 === 0 ? "exact" : null,
    severity: i % 7 === 0 ? "very_slow" : i % 5 === 0 ? "slow" : i % 11 === 0 ? "error" : "normal",
    error_message: i % 11 === 0 ? `Error at row ${i}` : null,
    user_id: `user-${i % 3}`,
    created_at: new Date(Date.now() - i * 60000).toISOString(),
    ...overrides,
  }));
}

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AdminTelemetriaPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function setMockData(data: any[], error: any = null) {
  mockResolvedData = data;
  mockError = error;
}

// ── Tests ──
describe("AdminTelemetriaPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockData([]);
    // Re-wire .then after clearAllMocks
    chainObj.then = vi.fn((resolve: any) => resolve({ data: mockResolvedData, error: mockError }));
    chainObj.select = vi.fn(() => chainObj);
    chainObj.gte = vi.fn(() => chainObj);
    chainObj.order = vi.fn(() => chainObj);
    chainObj.limit = vi.fn(() => chainObj);
    chainObj.eq = vi.fn(() => chainObj);
    chainObj.lt = vi.fn(() => Promise.resolve({ data: null, error: null }));
    chainObj.delete = vi.fn(() => chainObj);
  });

  // ═══════ RENDERING & LAYOUT ═══════
  it("T001: renders page title", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText("Telemetria de Queries")).toBeInTheDocument());
  });

  it("T002: renders subtitle", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText("Monitoramento de performance do banco externo")).toBeInTheDocument());
  });

  it("T003: renders cleanup button", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText("Limpar +7d")).toBeInTheDocument());
  });

  it("T004: renders refresh button", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText("Atualizar")).toBeInTheDocument());
  });

  it("T005: renders stat card labels", async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Muito Lentas (>8s)")).toBeInTheDocument();
      expect(screen.getByText("Lentas (>3s)")).toBeInTheDocument();
      expect(screen.getByText("Erros")).toBeInTheDocument();
      expect(screen.getByText("Média de duração")).toBeInTheDocument();
    });
  });

  it("T006: renders severity filter", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText("Todas")).toBeInTheDocument());
  });

  it("T007: renders time filter", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText("Últimas 24h")).toBeInTheDocument());
  });

  // ═══════ EMPTY STATE ═══════
  it("T008: shows empty state when no data", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText("Nenhuma query lenta registrada")).toBeInTheDocument());
  });

  it("T009: shows positive message on empty", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText("Isso é bom! O sistema está performando bem.")).toBeInTheDocument());
  });

  it("T010: stat cards show 0 on empty data", async () => {
    renderPage();
    await waitFor(() => {
      const zeros = screen.getAllByText("0");
      expect(zeros.length).toBeGreaterThanOrEqual(3);
    });
  });

  it("T011: avg duration shows 0ms on empty", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText("0ms")).toBeInTheDocument());
  });

  it("T012: does not render top offenders on empty", async () => {
    renderPage();
    await waitFor(() => expect(screen.queryByText("Tabelas Mais Problemáticas")).not.toBeInTheDocument());
  });

  it("T013: charts get 0 rows on empty", async () => {
    renderPage();
    await waitFor(() => {
      const charts = screen.getByTestId("telemetry-charts");
      expect(charts.getAttribute("data-rows")).toBe("0");
    });
  });

  // ═══════ DATA DISPLAY ═══════
  it("T014: renders table headers", async () => {
    setMockData(generateRows(5));
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Quando")).toBeInTheDocument();
      expect(screen.getByText("Operação")).toBeInTheDocument();
      expect(screen.getByText("Duração")).toBeInTheDocument();
      expect(screen.getByText("Tabela/RPC")).toBeInTheDocument();
      expect(screen.getByText("Records")).toBeInTheDocument();
      expect(screen.getByText("Severidade")).toBeInTheDocument();
    });
  });

  it("T015: shows row count in footer", async () => {
    setMockData(generateRows(20));
    renderPage();
    await waitFor(() => expect(screen.getByText(/20 registros/)).toBeInTheDocument());
  });

  it("T016: shows auto-refresh indicator", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText(/auto-refresh 30s/)).toBeInTheDocument());
  });

  it("T017: passes rows to TelemetryCharts", async () => {
    setMockData(generateRows(15));
    renderPage();
    await waitFor(() => {
      const charts = screen.getByTestId("telemetry-charts");
      expect(charts.getAttribute("data-rows")).toBe("15");
    });
  });

  it("T018: passes timeFilter to TelemetryCharts", async () => {
    renderPage();
    await waitFor(() => {
      const charts = screen.getByTestId("telemetry-charts");
      expect(charts.getAttribute("data-filter")).toBe("24h");
    });
  });

  // ═══════ STAT CALCULATIONS ═══════
  it("T019: counts very_slow correctly", async () => {
    setMockData([
      ...generateRows(1, { severity: "very_slow", id: "vs1" }),
      ...generateRows(1, { severity: "very_slow", id: "vs2" }),
      ...generateRows(1, { severity: "normal", id: "n1" }),
    ]);
    renderPage();
    await waitFor(() => {
      const cards = document.querySelectorAll(".text-2xl.font-bold");
      expect(cards[0]?.textContent).toBe("2");
    });
  });

  it("T020: counts slow correctly", async () => {
    setMockData([
      ...generateRows(1, { severity: "slow", id: "s1" }),
      ...generateRows(1, { severity: "slow", id: "s2" }),
      ...generateRows(1, { severity: "slow", id: "s3" }),
    ]);
    renderPage();
    await waitFor(() => {
      const cards = document.querySelectorAll(".text-2xl.font-bold");
      expect(cards[1]?.textContent).toBe("3");
    });
  });

  it("T021: counts errors correctly", async () => {
    setMockData(generateRows(1, { severity: "error", id: "e1" }));
    renderPage();
    await waitFor(() => {
      const cards = document.querySelectorAll(".text-2xl.font-bold");
      expect(cards[2]?.textContent).toBe("1");
    });
  });

  it("T022: calculates avg duration (ms)", async () => {
    setMockData([
      { ...generateRows(1)[0], id: "a1", duration_ms: 500 },
      { ...generateRows(1)[0], id: "a2", duration_ms: 500 },
    ]);
    renderPage();
    await waitFor(() => {
      const cards = document.querySelectorAll(".text-2xl.font-bold");
      expect(cards[3]?.textContent).toBe("500ms");
    });
  });

  it("T023: calculates avg duration (seconds)", async () => {
    setMockData([
      { ...generateRows(1)[0], id: "a1", duration_ms: 1000 },
      { ...generateRows(1)[0], id: "a2", duration_ms: 3000 },
    ]);
    renderPage();
    await waitFor(() => {
      const cards = document.querySelectorAll(".text-2xl.font-bold");
      expect(cards[3]?.textContent).toBe("2.0s");
    });
  });

  // ═══════ TOP OFFENDERS ═══════
  it("T024: shows top offenders when data exists", async () => {
    setMockData(generateRows(10));
    renderPage();
    await waitFor(() => expect(screen.getByText("Tabelas Mais Problemáticas")).toBeInTheDocument());
  });

  it("T025: groups by table name", async () => {
    setMockData([
      { ...generateRows(1)[0], id: "p1", table_name: "products", rpc_name: null },
      { ...generateRows(1)[0], id: "p2", table_name: "products", rpc_name: null },
      { ...generateRows(1)[0], id: "o1", table_name: "orders", rpc_name: null },
    ]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("products")).toBeInTheDocument();
      expect(screen.getByText("orders")).toBeInTheDocument();
    });
  });

  it("T026: prioritizes rpc_name over table_name", async () => {
    setMockData([{ ...generateRows(1)[0], table_name: "tbl", rpc_name: "my_rpc" }]);
    renderPage();
    await waitFor(() => expect(screen.getByText("my_rpc")).toBeInTheDocument());
  });

  // ═══════ SEVERITY BADGES ═══════
  it("T027: renders very_slow badge", async () => {
    setMockData(generateRows(1, { severity: "very_slow" }));
    renderPage();
    await waitFor(() => expect(screen.getByText("🔴 Muito Lenta")).toBeInTheDocument());
  });

  it("T028: renders slow badge", async () => {
    setMockData(generateRows(1, { severity: "slow" }));
    renderPage();
    await waitFor(() => expect(screen.getByText("🟡 Lenta")).toBeInTheDocument());
  });

  it("T029: renders error badge", async () => {
    setMockData(generateRows(1, { severity: "error" }));
    renderPage();
    await waitFor(() => expect(screen.getByText("❌ Erro")).toBeInTheDocument());
  });

  it("T030: renders unknown severity", async () => {
    setMockData(generateRows(1, { severity: "custom" }));
    renderPage();
    await waitFor(() => expect(screen.getByText("custom")).toBeInTheDocument());
  });

  // ═══════ DURATION FORMATTING IN TABLE ═══════
  it("T031: destructive class for >= 8000ms", async () => {
    setMockData(generateRows(1, { duration_ms: 9000 }));
    renderPage();
    await waitFor(() => {
      const el = screen.getByText("9.0s");
      expect(el.className).toContain("text-destructive");
    });
  });

  it("T032: yellow class for >= 3000ms", async () => {
    setMockData(generateRows(1, { duration_ms: 4000 }));
    renderPage();
    await waitFor(() => {
      const el = screen.getByText("4.0s");
      expect(el.className).toContain("text-yellow-600");
    });
  });

  it("T033: no color class for < 3000ms in table", async () => {
    setMockData(generateRows(1, { duration_ms: 2000, severity: "normal" }));
    renderPage();
    await waitFor(() => {
      const el = screen.getByText("2.0s");
      expect(el.className).not.toContain("text-destructive");
      expect(el.className).not.toContain("text-yellow-600");
    });
  });

  // ═══════ TABLE CELL VALUES ═══════
  it("T034: shows operation badge", async () => {
    setMockData(generateRows(1, { operation: "select" }));
    renderPage();
    await waitFor(() => expect(screen.getByText("select")).toBeInTheDocument());
  });

  it("T035: shows dash for null fields", async () => {
    setMockData(generateRows(1, { table_name: null, rpc_name: null, record_count: null, query_limit: null, query_offset: null, count_mode: null }));
    renderPage();
    await waitFor(() => {
      const dashes = screen.getAllByText("-");
      expect(dashes.length).toBeGreaterThanOrEqual(4);
    });
  });

  it("T036: shows count mode", async () => {
    setMockData(generateRows(1, { count_mode: "exact" }));
    renderPage();
    await waitFor(() => expect(screen.getByText("exact")).toBeInTheDocument());
  });

  // ═══════ LARGE DATASETS ═══════
  it("T037: handles 200 rows", async () => {
    setMockData(generateRows(200));
    renderPage();
    await waitFor(() => expect(screen.getByText(/200 registros/)).toBeInTheDocument());
  });

  it("T038: limits top offenders to 8", async () => {
    setMockData(Array.from({ length: 50 }, (_, i) => ({
      ...generateRows(1, { table_name: `tbl_${i}`, rpc_name: null })[0],
      id: `big-${i}`,
    })));
    renderPage();
    await waitFor(() => {
      const offenders = document.querySelectorAll(".font-mono.text-sm.font-medium.truncate");
      expect(offenders.length).toBeLessThanOrEqual(8);
    });
  });

  // ═══════ EDGE CASES ═══════
  it("T039: handles all null optional fields", async () => {
    setMockData(generateRows(1, { table_name: null, rpc_name: null, record_count: null, query_limit: null, query_offset: null, count_mode: null, error_message: null, user_id: null }));
    renderPage();
    await waitFor(() => {
      const dashes = screen.getAllByText("-");
      expect(dashes.length).toBeGreaterThanOrEqual(4);
    });
  });

  it("T040: handles 0ms duration", async () => {
    setMockData(generateRows(1, { duration_ms: 0 }));
    renderPage();
    await waitFor(() => expect(screen.getByText("0ms")).toBeInTheDocument());
  });

  it("T041: handles very large duration", async () => {
    setMockData(generateRows(1, { duration_ms: 120000, severity: "very_slow" }));
    renderPage();
    await waitFor(() => expect(screen.getByText("120.0s")).toBeInTheDocument());
  });

  it("T042: single row dataset", async () => {
    setMockData(generateRows(1));
    renderPage();
    await waitFor(() => expect(screen.getByText(/1 registros/)).toBeInTheDocument());
  });

  // ═══════ MIXED SEVERITIES ═══════
  it("T043: mixed severity counts all correct", async () => {
    setMockData([
      { ...generateRows(1)[0], id: "m1", severity: "very_slow" },
      { ...generateRows(1)[0], id: "m2", severity: "very_slow" },
      { ...generateRows(1)[0], id: "m3", severity: "slow" },
      { ...generateRows(1)[0], id: "m4", severity: "error" },
      { ...generateRows(1)[0], id: "m5", severity: "normal" },
    ]);
    renderPage();
    await waitFor(() => {
      const cards = document.querySelectorAll(".text-2xl.font-bold");
      expect(cards[0]?.textContent).toBe("2"); // very_slow
      expect(cards[1]?.textContent).toBe("1"); // slow
      expect(cards[2]?.textContent).toBe("1"); // error
    });
  });

  it("T044: all normal severity shows 0 for alerts", async () => {
    setMockData(generateRows(5, { severity: "normal" }));
    renderPage();
    await waitFor(() => {
      const cards = document.querySelectorAll(".text-2xl.font-bold");
      expect(cards[0]?.textContent).toBe("0");
      expect(cards[1]?.textContent).toBe("0");
      expect(cards[2]?.textContent).toBe("0");
    });
  });

  it("T045: error handling - query error gracefully", async () => {
    setMockData([], { message: "DB error" });
    renderPage();
    await waitFor(() => expect(screen.getByText("Telemetria de Queries")).toBeInTheDocument());
  });
});
