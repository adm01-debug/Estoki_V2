import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import AdminTelemetriaPage from "../AdminTelemetriaPage";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() }, Toaster: () => null }));
vi.mock("@/components/admin/telemetry/TelemetryCharts", () => ({
  TelemetryCharts: ({ rows, timeFilter }: any) => <div data-testid="telemetry-charts" data-rows={rows.length} data-filter={timeFilter}>Charts</div>,
}));

let mockData: any[] = [];
let mockErr: any = null;

vi.mock("@/integrations/supabase/client", () => {
  const chain: any = new Proxy({}, {
    get: (_, prop) => {
      if (prop === "then") return (fn: any) => fn({ data: mockData, error: mockErr });
      return vi.fn(() => chain);
    },
  });
  return { supabase: { from: vi.fn(() => chain), auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }), onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })) } } };
});

function row(overrides: any = {}, i = 0): any {
  return { id: `r-${i}-${Math.random().toString(36).slice(2,6)}`, operation: "select", table_name: "tbl", rpc_name: null, duration_ms: 1000, record_count: 10, query_limit: 100, query_offset: 0, count_mode: "exact", severity: "normal", error_message: null, user_id: "u1", created_at: new Date().toISOString(), ...overrides };
}

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(<QueryClientProvider client={qc}><BrowserRouter><AdminTelemetriaPage /></BrowserRouter></QueryClientProvider>);
}

describe("AdminTelemetriaPage", () => {
  beforeEach(() => { mockData = []; mockErr = null; });

  // Layout (7)
  it("T01: title", async () => { renderPage(); await waitFor(() => expect(screen.getByText("Telemetria de Queries")).toBeInTheDocument()); });
  it("T02: subtitle", async () => { renderPage(); await waitFor(() => expect(screen.getByText("Monitoramento de performance do banco externo")).toBeInTheDocument()); });
  it("T03: cleanup btn", async () => { renderPage(); await waitFor(() => expect(screen.getByText("Limpar +7d")).toBeInTheDocument()); });
  it("T04: refresh btn", async () => { renderPage(); await waitFor(() => expect(screen.getByText("Atualizar")).toBeInTheDocument()); });
  it("T05: stat labels", async () => { renderPage(); await waitFor(() => { expect(screen.getByText("Muito Lentas (>8s)")).toBeInTheDocument(); expect(screen.getByText("Lentas (>3s)")).toBeInTheDocument(); expect(screen.getByText("Erros")).toBeInTheDocument(); expect(screen.getByText("Média de duração")).toBeInTheDocument(); }); });
  it("T06: severity filter", async () => { renderPage(); await waitFor(() => expect(screen.getByText("Todas")).toBeInTheDocument()); });
  it("T07: time filter", async () => { renderPage(); await waitFor(() => expect(screen.getByText("Últimas 24h")).toBeInTheDocument()); });

  // Empty state (6)
  it("T08: empty msg", async () => { renderPage(); await waitFor(() => expect(screen.getByText("Nenhuma query lenta registrada")).toBeInTheDocument()); });
  it("T09: positive msg", async () => { renderPage(); await waitFor(() => expect(screen.getByText("Isso é bom! O sistema está performando bem.")).toBeInTheDocument()); });
  it("T10: zeros on empty", async () => { renderPage(); await waitFor(() => expect(screen.getAllByText("0").length).toBeGreaterThanOrEqual(3)); });
  it("T11: 0ms avg", async () => { renderPage(); await waitFor(() => expect(screen.getByText("0ms")).toBeInTheDocument()); });
  it("T12: no offenders", async () => { renderPage(); await waitFor(() => expect(screen.queryByText("Tabelas Mais Problemáticas")).not.toBeInTheDocument()); });
  it("T13: charts 0 rows", async () => { renderPage(); await waitFor(() => expect(screen.getByTestId("telemetry-charts").getAttribute("data-rows")).toBe("0")); });

  // Data display (5)
  it("T14: headers", async () => { mockData = [row()]; renderPage(); await waitFor(() => { expect(screen.getByText("Quando")).toBeInTheDocument(); expect(screen.getByText("Duração")).toBeInTheDocument(); }); });
  it("T15: row count", async () => { mockData = Array.from({length:20},(_,i)=>row({},i)); renderPage(); await waitFor(() => expect(screen.getByText(/20 registros/)).toBeInTheDocument()); });
  it("T16: auto-refresh", async () => { renderPage(); await waitFor(() => expect(screen.getByText(/auto-refresh 30s/)).toBeInTheDocument()); });
  it("T17: charts rows", async () => { mockData = Array.from({length:15},(_,i)=>row({},i)); renderPage(); await waitFor(() => expect(screen.getByTestId("telemetry-charts").getAttribute("data-rows")).toBe("15")); });
  it("T18: charts filter", async () => { renderPage(); await waitFor(() => expect(screen.getByTestId("telemetry-charts").getAttribute("data-filter")).toBe("24h")); });

  // Offenders (1)
  it("T19: shows offenders", async () => { mockData = Array.from({length:5},(_,i)=>row({},i)); renderPage(); await waitFor(() => expect(screen.getByText("Tabelas Mais Problemáticas")).toBeInTheDocument()); });

  // Badges (4)
  it("T20: very_slow badge", async () => { mockData = [row({severity:"very_slow"})]; renderPage(); await waitFor(() => expect(screen.getByText("🔴 Muito Lenta")).toBeInTheDocument()); });
  it("T21: slow badge", async () => { mockData = [row({severity:"slow"})]; renderPage(); await waitFor(() => expect(screen.getByText("🟡 Lenta")).toBeInTheDocument()); });
  it("T22: error badge", async () => { mockData = [row({severity:"error"})]; renderPage(); await waitFor(() => expect(screen.getByText("❌ Erro")).toBeInTheDocument()); });
  it("T23: custom badge", async () => { mockData = [row({severity:"custom"})]; renderPage(); await waitFor(() => expect(screen.getByText("custom")).toBeInTheDocument()); });

  // Cells (3)
  it("T24: operation", async () => { mockData = [row({operation:"select"})]; renderPage(); await waitFor(() => expect(screen.getByText("select")).toBeInTheDocument()); });
  it("T25: null dashes", async () => { mockData = [row({table_name:null,rpc_name:null,record_count:null,query_limit:null,query_offset:null,count_mode:null})]; renderPage(); await waitFor(() => expect(screen.getAllByText("-").length).toBeGreaterThanOrEqual(4)); });
  it("T26: count mode", async () => { mockData = [row({count_mode:"exact"})]; renderPage(); await waitFor(() => expect(screen.getByText("exact")).toBeInTheDocument()); });

  // Large/Edge (5)
  it("T27: 200 rows", async () => { mockData = Array.from({length:200},(_,i)=>row({},i)); renderPage(); await waitFor(() => expect(screen.getByText(/200 registros/)).toBeInTheDocument()); });
  it("T28: max 8 offenders", async () => { mockData = Array.from({length:50},(_,i)=>row({table_name:`t${i}`,rpc_name:null},i)); renderPage(); await waitFor(() => { const o = document.querySelectorAll(".font-mono.text-sm.font-medium.truncate"); expect(o.length).toBeLessThanOrEqual(8); }); });
  it("T29: single row", async () => { mockData = [row()]; renderPage(); await waitFor(() => expect(screen.getByText(/1 registros/)).toBeInTheDocument()); });
  it("T30: query error", async () => { mockErr = {message:"fail"}; renderPage(); await waitFor(() => expect(screen.getByText("Telemetria de Queries")).toBeInTheDocument()); });
  it("T31: all null optional", async () => { mockData = [row({table_name:null,rpc_name:null,record_count:null,query_limit:null,query_offset:null,count_mode:null,error_message:null,user_id:null})]; renderPage(); await waitFor(() => expect(screen.getAllByText("-").length).toBeGreaterThanOrEqual(4)); });
});
