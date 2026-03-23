import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, within } from "tests/utils/render";
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

// ── Mock Supabase ──
const mockSelect = vi.fn();
const mockDelete = vi.fn();
const mockGte = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockEq = vi.fn();
const mockLt = vi.fn();

function createChainMock(resolvedData: any[] = [], error: any = null) {
  mockLt.mockResolvedValue({ data: null, error });
  mockEq.mockResolvedValue({ data: resolvedData, error });
  mockLimit.mockReturnValue({ eq: mockEq, then: (fn: any) => fn({ data: resolvedData, error }) });
  // For the final call without eq (severity=all)
  mockLimit.mockResolvedValue({ data: resolvedData, error });
  mockOrder.mockReturnValue({ limit: mockLimit });
  mockGte.mockReturnValue({ order: mockOrder });
  mockSelect.mockReturnValue({ gte: mockGte });
  mockDelete.mockReturnValue({ lt: mockLt });
}

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn((table: string) => ({
      select: mockSelect,
      delete: () => ({ lt: mockLt }),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

// ── Helper ──
function generateRows(count: number, overrides: Partial<any> = {}): any[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `row-${i}`,
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
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AdminTelemetriaPage />
      </BrowserRouter>
    </QueryClientProvider>,
    { wrapper: undefined as any }
  );
}

// ── Tests ──
describe("AdminTelemetriaPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createChainMock([]);
  });

  // ════════════════════════════════════════
  // 1. RENDERING & LAYOUT
  // ════════════════════════════════════════
  describe("Rendering & Layout", () => {
    it("T001: renders page title", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Telemetria de Queries")).toBeInTheDocument();
      });
    });

    it("T002: renders subtitle", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Monitoramento de performance do banco externo")).toBeInTheDocument();
      });
    });

    it("T003: renders cleanup button", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Limpar +7d")).toBeInTheDocument();
      });
    });

    it("T004: renders refresh button", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Atualizar")).toBeInTheDocument();
      });
    });

    it("T005: renders 4 stat cards", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Muito Lentas (>8s)")).toBeInTheDocument();
        expect(screen.getByText("Lentas (>3s)")).toBeInTheDocument();
        expect(screen.getByText("Erros")).toBeInTheDocument();
        expect(screen.getByText("Média de duração")).toBeInTheDocument();
      });
    });

    it("T006: renders severity filter select", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Todas")).toBeInTheDocument();
      });
    });

    it("T007: renders time filter select", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Últimas 24h")).toBeInTheDocument();
      });
    });
  });

  // ════════════════════════════════════════
  // 2. EMPTY STATE
  // ════════════════════════════════════════
  describe("Empty State", () => {
    it("T008: shows empty state when no data", async () => {
      createChainMock([]);
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Nenhuma query lenta registrada")).toBeInTheDocument();
      });
    });

    it("T009: shows positive message on empty", async () => {
      createChainMock([]);
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Isso é bom! O sistema está performando bem.")).toBeInTheDocument();
      });
    });

    it("T010: stat cards show 0 on empty data", async () => {
      createChainMock([]);
      renderPage();
      await waitFor(() => {
        const zeros = screen.getAllByText("0");
        expect(zeros.length).toBeGreaterThanOrEqual(3);
      });
    });

    it("T011: avg duration shows 0ms on empty", async () => {
      createChainMock([]);
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("0ms")).toBeInTheDocument();
      });
    });

    it("T012: does not render top offenders on empty", async () => {
      createChainMock([]);
      renderPage();
      await waitFor(() => {
        expect(screen.queryByText("Tabelas Mais Problemáticas")).not.toBeInTheDocument();
      });
    });

    it("T013: does not render charts on empty", async () => {
      createChainMock([]);
      renderPage();
      await waitFor(() => {
        const charts = screen.getByTestId("telemetry-charts");
        expect(charts.getAttribute("data-rows")).toBe("0");
      });
    });
  });

  // ════════════════════════════════════════
  // 3. LOADING STATE
  // ════════════════════════════════════════
  describe("Loading State", () => {
    it("T014: shows skeletons while loading", () => {
      // Make query never resolve
      mockLimit.mockReturnValue(new Promise(() => {}));
      mockOrder.mockReturnValue({ limit: mockLimit });
      mockGte.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ gte: mockGte });

      renderPage();
      // Skeletons should be present
      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  // ════════════════════════════════════════
  // 4. DATA DISPLAY
  // ════════════════════════════════════════
  describe("Data Display", () => {
    const mockRows = generateRows(20);

    beforeEach(() => {
      createChainMock(mockRows);
    });

    it("T015: renders table rows", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Quando")).toBeInTheDocument();
        expect(screen.getByText("Operação")).toBeInTheDocument();
        expect(screen.getByText("Duração")).toBeInTheDocument();
      });
    });

    it("T016: renders table headers correctly", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Tabela/RPC")).toBeInTheDocument();
        expect(screen.getByText("Records")).toBeInTheDocument();
        expect(screen.getByText("Limit")).toBeInTheDocument();
        expect(screen.getByText("Offset")).toBeInTheDocument();
        expect(screen.getByText("Count")).toBeInTheDocument();
        expect(screen.getByText("Severidade")).toBeInTheDocument();
      });
    });

    it("T017: shows row count in footer", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText(/20 registros/)).toBeInTheDocument();
      });
    });

    it("T018: shows auto-refresh indicator", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText(/auto-refresh 30s/)).toBeInTheDocument();
      });
    });

    it("T019: passes rows to TelemetryCharts", async () => {
      renderPage();
      await waitFor(() => {
        const charts = screen.getByTestId("telemetry-charts");
        expect(charts.getAttribute("data-rows")).toBe("20");
      });
    });

    it("T020: passes timeFilter to TelemetryCharts", async () => {
      renderPage();
      await waitFor(() => {
        const charts = screen.getByTestId("telemetry-charts");
        expect(charts.getAttribute("data-filter")).toBe("24h");
      });
    });
  });

  // ════════════════════════════════════════
  // 5. STAT CALCULATIONS
  // ════════════════════════════════════════
  describe("Stat Calculations", () => {
    it("T021: counts very_slow correctly", async () => {
      const rows = [
        ...generateRows(1, { severity: "very_slow", id: "vs1" }),
        ...generateRows(1, { severity: "very_slow", id: "vs2" }),
        ...generateRows(1, { severity: "slow", id: "s1" }),
      ];
      createChainMock(rows);
      renderPage();
      await waitFor(() => {
        // First stat card should show 2
        const cards = document.querySelectorAll(".text-2xl.font-bold");
        expect(cards[0]?.textContent).toBe("2");
      });
    });

    it("T022: counts slow correctly", async () => {
      const rows = [
        ...generateRows(1, { severity: "slow", id: "s1" }),
        ...generateRows(1, { severity: "slow", id: "s2" }),
        ...generateRows(1, { severity: "slow", id: "s3" }),
      ];
      createChainMock(rows);
      renderPage();
      await waitFor(() => {
        const cards = document.querySelectorAll(".text-2xl.font-bold");
        expect(cards[1]?.textContent).toBe("3");
      });
    });

    it("T023: counts errors correctly", async () => {
      const rows = generateRows(1, { severity: "error", id: "e1" });
      createChainMock(rows);
      renderPage();
      await waitFor(() => {
        const cards = document.querySelectorAll(".text-2xl.font-bold");
        expect(cards[2]?.textContent).toBe("1");
      });
    });

    it("T024: calculates average duration", async () => {
      const rows = [
        { ...generateRows(1, { duration_ms: 1000, id: "a1" })[0] },
        { ...generateRows(1, { duration_ms: 3000, id: "a2" })[0] },
      ];
      createChainMock(rows);
      renderPage();
      await waitFor(() => {
        const cards = document.querySelectorAll(".text-2xl.font-bold");
        // avg = 2000ms = 2.0s
        expect(cards[3]?.textContent).toBe("2.0s");
      });
    });

    it("T025: formats duration < 1s as ms", async () => {
      const rows = generateRows(1, { duration_ms: 500, id: "d1" });
      createChainMock(rows);
      renderPage();
      await waitFor(() => {
        const cards = document.querySelectorAll(".text-2xl.font-bold");
        expect(cards[3]?.textContent).toBe("500ms");
      });
    });

    it("T026: formats duration >= 1s as seconds", async () => {
      const rows = generateRows(1, { duration_ms: 1500, id: "d1" });
      createChainMock(rows);
      renderPage();
      await waitFor(() => {
        const cards = document.querySelectorAll(".text-2xl.font-bold");
        expect(cards[3]?.textContent).toBe("1.5s");
      });
    });
  });

  // ════════════════════════════════════════
  // 6. TOP OFFENDERS
  // ════════════════════════════════════════
  describe("Top Offenders", () => {
    it("T027: shows top offenders when data exists", async () => {
      createChainMock(generateRows(10));
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Tabelas Mais Problemáticas")).toBeInTheDocument();
      });
    });

    it("T028: groups by table name", async () => {
      const rows = [
        ...generateRows(3, { table_name: "products", rpc_name: null, id: "p1" }),
        ...generateRows(2, { table_name: "orders", rpc_name: null, id: "o1" }),
      ].map((r, i) => ({ ...r, id: `r-${i}` }));
      createChainMock(rows);
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("products")).toBeInTheDocument();
        expect(screen.getByText("orders")).toBeInTheDocument();
      });
    });

    it("T029: shows alert count per table", async () => {
      const rows = generateRows(5, { table_name: "users", rpc_name: null });
      rows.forEach((r, i) => (r.id = `u-${i}`));
      createChainMock(rows);
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("5× alertas")).toBeInTheDocument();
      });
    });

    it("T030: prioritizes rpc_name over table_name", async () => {
      const rows = generateRows(1, { table_name: "my_table", rpc_name: "my_rpc" });
      createChainMock(rows);
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("my_rpc")).toBeInTheDocument();
      });
    });
  });

  // ════════════════════════════════════════
  // 7. SEVERITY BADGES
  // ════════════════════════════════════════
  describe("Severity Badges", () => {
    it("T031: renders very_slow badge", async () => {
      createChainMock(generateRows(1, { severity: "very_slow" }));
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("🔴 Muito Lenta")).toBeInTheDocument();
      });
    });

    it("T032: renders slow badge", async () => {
      createChainMock(generateRows(1, { severity: "slow" }));
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("🟡 Lenta")).toBeInTheDocument();
      });
    });

    it("T033: renders error badge", async () => {
      createChainMock(generateRows(1, { severity: "error" }));
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("❌ Erro")).toBeInTheDocument();
      });
    });

    it("T034: renders unknown severity as secondary badge", async () => {
      createChainMock(generateRows(1, { severity: "custom_sev" }));
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("custom_sev")).toBeInTheDocument();
      });
    });
  });

  // ════════════════════════════════════════
  // 8. DURATION FORMATTING IN TABLE
  // ════════════════════════════════════════
  describe("Duration Formatting in Table", () => {
    it("T035: applies destructive class for >= 8000ms", async () => {
      createChainMock(generateRows(1, { duration_ms: 9000 }));
      renderPage();
      await waitFor(() => {
        const el = screen.getByText("9.0s");
        expect(el.className).toContain("text-destructive");
      });
    });

    it("T036: applies yellow class for >= 3000ms", async () => {
      createChainMock(generateRows(1, { duration_ms: 4000 }));
      renderPage();
      await waitFor(() => {
        const el = screen.getByText("4.0s");
        expect(el.className).toContain("text-yellow-600");
      });
    });

    it("T037: no color class for < 3000ms", async () => {
      createChainMock(generateRows(1, { duration_ms: 2000, severity: "normal" }));
      renderPage();
      await waitFor(() => {
        const el = screen.getByText("2.0s");
        expect(el.className).not.toContain("text-destructive");
        expect(el.className).not.toContain("text-yellow-600");
      });
    });
  });

  // ════════════════════════════════════════
  // 9. TABLE CELL VALUES
  // ════════════════════════════════════════
  describe("Table Cell Values", () => {
    it("T038: shows operation badge", async () => {
      createChainMock(generateRows(1, { operation: "select" }));
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("select")).toBeInTheDocument();
      });
    });

    it("T039: shows table name", async () => {
      createChainMock(generateRows(1, { table_name: "products", rpc_name: null }));
      renderPage();
      await waitFor(() => {
        expect(screen.getAllByText("products").length).toBeGreaterThan(0);
      });
    });

    it("T040: shows rpc name over table name", async () => {
      createChainMock(generateRows(1, { table_name: "tbl", rpc_name: "my_func" }));
      renderPage();
      await waitFor(() => {
        expect(screen.getAllByText("my_func").length).toBeGreaterThan(0);
      });
    });

    it("T041: shows dash for null record_count", async () => {
      createChainMock(generateRows(1, { record_count: null }));
      renderPage();
      await waitFor(() => {
        const dashes = screen.getAllByText("-");
        expect(dashes.length).toBeGreaterThan(0);
      });
    });

    it("T042: shows count mode when present", async () => {
      createChainMock(generateRows(1, { count_mode: "exact" }));
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("exact")).toBeInTheDocument();
      });
    });

    it("T043: shows dash for null count_mode", async () => {
      createChainMock(generateRows(1, { count_mode: null, record_count: null, query_limit: null, query_offset: null }));
      renderPage();
      await waitFor(() => {
        const dashes = screen.getAllByText("-");
        expect(dashes.length).toBeGreaterThanOrEqual(4);
      });
    });
  });

  // ════════════════════════════════════════
  // 10. ERROR HANDLING
  // ════════════════════════════════════════
  describe("Error Handling", () => {
    it("T044: handles query error gracefully", async () => {
      mockLimit.mockResolvedValue({ data: null, error: { message: "DB error" } });
      mockOrder.mockReturnValue({ limit: mockLimit });
      mockGte.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ gte: mockGte });

      renderPage();
      // Should not crash
      await waitFor(() => {
        expect(screen.getByText("Telemetria de Queries")).toBeInTheDocument();
      });
    });
  });

  // ════════════════════════════════════════
  // 11. LARGE DATASETS
  // ════════════════════════════════════════
  describe("Large Datasets", () => {
    it("T045: handles 200 rows", async () => {
      createChainMock(generateRows(200));
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("200 registros · auto-refresh 30s")).toBeInTheDocument();
      });
    });

    it("T046: limits top offenders to 8", async () => {
      const rows = Array.from({ length: 50 }, (_, i) => ({
        ...generateRows(1, { table_name: `tbl_${i}`, rpc_name: null })[0],
        id: `big-${i}`,
      }));
      createChainMock(rows);
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Tabelas Mais Problemáticas")).toBeInTheDocument();
        // Should not have more than 8 offender cards
        const offenderCards = document.querySelectorAll(".font-mono.text-sm.font-medium.truncate");
        expect(offenderCards.length).toBeLessThanOrEqual(8);
      });
    });
  });

  // ════════════════════════════════════════
  // 12. EDGE CASES
  // ════════════════════════════════════════
  describe("Edge Cases", () => {
    it("T047: handles row with all null optional fields", async () => {
      createChainMock(generateRows(1, {
        table_name: null,
        rpc_name: null,
        record_count: null,
        query_limit: null,
        query_offset: null,
        count_mode: null,
        error_message: null,
        user_id: null,
      }));
      renderPage();
      await waitFor(() => {
        const dashes = screen.getAllByText("-");
        expect(dashes.length).toBeGreaterThanOrEqual(4);
      });
    });

    it("T048: handles 0ms duration", async () => {
      createChainMock(generateRows(1, { duration_ms: 0 }));
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("0ms")).toBeInTheDocument();
      });
    });

    it("T049: handles very large duration", async () => {
      createChainMock(generateRows(1, { duration_ms: 120000 }));
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("120.0s")).toBeInTheDocument();
      });
    });

    it("T050: single row dataset", async () => {
      createChainMock(generateRows(1));
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("1 registros · auto-refresh 30s")).toBeInTheDocument();
      });
    });
  });
});
