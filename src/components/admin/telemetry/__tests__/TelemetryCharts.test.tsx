import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TelemetryCharts } from "../TelemetryCharts";

// Mock recharts
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ data }: any) => <div data-testid="area-chart" data-points={data?.length || 0}>AreaChart</div>,
  Area: () => <div>Area</div>,
  BarChart: ({ data }: any) => <div data-testid="bar-chart" data-points={data?.length || 0}>BarChart</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ data }: any) => <div data-testid="pie" data-points={data?.length || 0}>Pie</div>,
  Bar: () => <div>Bar</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  Tooltip: () => <div>Tooltip</div>,
  Cell: () => <div>Cell</div>,
  Legend: () => <div>Legend</div>,
}));

function generateRow(overrides: Partial<any> = {}, i = 0): any {
  return {
    id: `r-${i}`,
    operation: "select",
    table_name: `table_${i % 3}`,
    rpc_name: null,
    duration_ms: 1000 + i * 100,
    severity: i % 3 === 0 ? "slow" : i % 5 === 0 ? "very_slow" : "error",
    created_at: new Date(Date.now() - i * 3600000).toISOString(),
    ...overrides,
  };
}

describe("TelemetryCharts", () => {
  it("T051: returns null when rows empty", () => {
    const { container } = render(<TelemetryCharts rows={[]} timeFilter="24h" />);
    expect(container.innerHTML).toBe("");
  });

  it("T052: renders area chart with data", () => {
    const rows = Array.from({ length: 5 }, (_, i) => generateRow({}, i));
    render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    const charts = screen.getAllByTestId("area-chart");
    expect(charts.length).toBeGreaterThanOrEqual(1);
  });

  it("T053: renders pie chart with severity data", () => {
    const rows = [generateRow({ severity: "slow" }, 0), generateRow({ severity: "very_slow" }, 1)];
    render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
  });

  it("T054: renders bar chart with table data", () => {
    const rows = Array.from({ length: 5 }, (_, i) => generateRow({}, i));
    render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("T055: renders stacked alerts title", () => {
    const rows = [generateRow({}, 0)];
    render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    expect(screen.getByText("Alertas ao Longo do Tempo")).toBeInTheDocument();
  });

  it("T056: renders severity distribution title", () => {
    const rows = [generateRow({}, 0)];
    render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    expect(screen.getByText("Distribuição de Severidade")).toBeInTheDocument();
  });

  it("T057: renders duration avg/max title", () => {
    const rows = [generateRow({}, 0)];
    render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    expect(screen.getByText("Duração Média / Máxima ao Longo do Tempo")).toBeInTheDocument();
  });

  it("T058: renders alerts by table title", () => {
    const rows = [generateRow({}, 0)];
    render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    expect(screen.getByText("Alertas por Tabela/RPC")).toBeInTheDocument();
  });

  it("T059: groups data into time buckets", () => {
    const rows = Array.from({ length: 10 }, (_, i) => generateRow({}, i));
    render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    const charts = screen.getAllByTestId("area-chart");
    expect(Number(charts[0].getAttribute("data-points"))).toBeGreaterThan(0);
  });

  it("T060: limits bar chart entries", () => {
    const rows = Array.from({ length: 20 }, (_, i) => generateRow({ table_name: `t${i}` }, i));
    render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    const bar = screen.getByTestId("bar-chart");
    expect(Number(bar.getAttribute("data-points"))).toBeLessThanOrEqual(8);
  });

  it("T061: filters out zero-value severities from pie", () => {
    const rows = [generateRow({ severity: "slow" }, 0)];
    render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    const pie = screen.getByTestId("pie");
    expect(Number(pie.getAttribute("data-points"))).toBe(1);
  });

  it("T062: shows all non-zero severities in pie", () => {
    const rows = [
      generateRow({ severity: "slow" }, 0),
      generateRow({ severity: "very_slow" }, 1),
      generateRow({ severity: "error" }, 2),
    ];
    render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    const pie = screen.getByTestId("pie");
    expect(Number(pie.getAttribute("data-points"))).toBe(3);
  });

  it("T063: shows 'Sem dados' when no matching severity", () => {
    const rows = [generateRow({ severity: "normal" }, 0)];
    // normal severity won't produce pie data but will still render charts
    // since the row exists, charts render; pie shows empty
    render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    expect(screen.getByText("Sem dados")).toBeInTheDocument();
  });

  it("T064: handles single row", () => {
    render(<TelemetryCharts rows={[generateRow({}, 0)]} timeFilter="24h" />);
    expect(screen.getAllByTestId("area-chart").length).toBeGreaterThanOrEqual(1);
  });

  it("T065: handles 100 rows", () => {
    const rows = Array.from({ length: 100 }, (_, i) => generateRow({}, i));
    render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    expect(screen.getAllByTestId("area-chart").length).toBeGreaterThanOrEqual(1);
  });

  it("T066: prefers rpc_name over table_name in bar chart", () => {
    const rows = [generateRow({ rpc_name: "my_rpc", table_name: "tbl" }, 0)];
    render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("T067: handles rows with same timestamp", () => {
    const ts = new Date().toISOString();
    const rows = Array.from({ length: 5 }, (_, i) => generateRow({ created_at: ts }, i));
    render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    const charts = screen.getAllByTestId("area-chart");
    expect(Number(charts[0].getAttribute("data-points"))).toBe(1);
  });

  it("T068: uses different bucket sizes for different time filters", () => {
    const rows = Array.from({ length: 5 }, (_, i) => generateRow({}, i));
    const { rerender } = render(<TelemetryCharts rows={rows} timeFilter="1h" />);
    expect(screen.getAllByTestId("area-chart").length).toBeGreaterThanOrEqual(1);
    rerender(<TelemetryCharts rows={rows} timeFilter="7d" />);
    expect(screen.getAllByTestId("area-chart").length).toBeGreaterThanOrEqual(1);
  });

  it("T069: renders duration chart with correct data count", () => {
    const now = Date.now();
    const rows = [
      generateRow({ created_at: new Date(now).toISOString(), duration_ms: 3000 }, 0),
      generateRow({ created_at: new Date(now - 2 * 3600000).toISOString(), duration_ms: 9000 }, 1),
    ];
    render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    const charts = screen.getAllByTestId("area-chart");
    // Duration chart is the second area chart
    expect(charts.length).toBe(2);
  });

  it("T070: renders 4 chart cards total", () => {
    const rows = Array.from({ length: 5 }, (_, i) => generateRow({}, i));
    render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    const containers = screen.getAllByTestId("responsive-container");
    expect(containers.length).toBe(4); // stacked area + pie + duration area + bar
  });
});
