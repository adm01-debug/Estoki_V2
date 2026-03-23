import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

interface TelemetryRow {
  id: string;
  operation: string;
  table_name: string | null;
  rpc_name: string | null;
  duration_ms: number;
  severity: string;
  created_at: string;
}

interface TelemetryChartsProps {
  rows: TelemetryRow[];
  timeFilter: string;
}

const COLORS = {
  verySlow: "hsl(var(--destructive))",
  slow: "hsl(45, 93%, 47%)",
  error: "hsl(0, 84%, 60%)",
  primary: "hsl(var(--primary))",
  muted: "hsl(var(--muted-foreground))",
};

function getBucketMs(timeFilter: string): number {
  switch (timeFilter) {
    case "1h": return 5 * 60 * 1000;      // 5 min
    case "6h": return 30 * 60 * 1000;     // 30 min
    case "24h": return 60 * 60 * 1000;    // 1 hour
    case "7d": return 6 * 60 * 60 * 1000; // 6 hours
    default: return 60 * 60 * 1000;
  }
}

function formatBucketTime(ts: number, timeFilter: string): string {
  const d = new Date(ts);
  if (timeFilter === "7d") {
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  }
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function TelemetryCharts({ rows, timeFilter }: TelemetryChartsProps) {
  if (rows.length === 0) return null;

  const bucketMs = getBucketMs(timeFilter);

  // === Chart 1: Stacked AreaChart — Alerts over time ===
  const alertBuckets = new Map<number, { ts: number; muitoLentas: number; lentas: number; erros: number }>();
  for (const r of rows) {
    const ts = Math.floor(new Date(r.created_at).getTime() / bucketMs) * bucketMs;
    const prev = alertBuckets.get(ts) || { ts, muitoLentas: 0, lentas: 0, erros: 0 };
    if (r.severity === "very_slow") prev.muitoLentas++;
    else if (r.severity === "slow") prev.lentas++;
    else if (r.severity === "error") prev.erros++;
    alertBuckets.set(ts, prev);
  }
  const alertData = [...alertBuckets.values()]
    .sort((a, b) => a.ts - b.ts)
    .map(b => ({ ...b, label: formatBucketTime(b.ts, timeFilter) }));

  // === Chart 2: AreaChart — Duration avg/max over time ===
  const durationBuckets = new Map<number, { ts: number; total: number; count: number; maxMs: number }>();
  for (const r of rows) {
    const ts = Math.floor(new Date(r.created_at).getTime() / bucketMs) * bucketMs;
    const prev = durationBuckets.get(ts) || { ts, total: 0, count: 0, maxMs: 0 };
    durationBuckets.set(ts, {
      ts,
      total: prev.total + r.duration_ms,
      count: prev.count + 1,
      maxMs: Math.max(prev.maxMs, r.duration_ms),
    });
  }
  const durationData = [...durationBuckets.values()]
    .sort((a, b) => a.ts - b.ts)
    .map(b => ({
      label: formatBucketTime(b.ts, timeFilter),
      mediaMs: Math.round(b.total / b.count),
      maxMs: b.maxMs,
    }));

  // === Chart 3: Severity Pie ===
  const severityCounts = { slow: 0, very_slow: 0, error: 0 };
  for (const r of rows) {
    if (r.severity in severityCounts) severityCounts[r.severity as keyof typeof severityCounts]++;
  }
  const pieData = [
    { name: "Lentas", value: severityCounts.slow },
    { name: "Muito Lentas", value: severityCounts.very_slow },
    { name: "Erros", value: severityCounts.error },
  ].filter(d => d.value > 0);
  const pieColors = [COLORS.slow, COLORS.verySlow, COLORS.error];

  // === Chart 4: Bar — Top tables by alert count ===
  const tableAlerts = new Map<string, number>();
  for (const r of rows) {
    const name = r.rpc_name || r.table_name || "unknown";
    tableAlerts.set(name, (tableAlerts.get(name) || 0) + 1);
  }
  const barData = [...tableAlerts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, alertas: count }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Stacked AreaChart: Alerts over time */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Alertas ao Longo do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={alertData}>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="muitoLentas" stackId="1" stroke={COLORS.verySlow} fill={COLORS.verySlow} fillOpacity={0.6} name="Muito Lentas" />
              <Area type="monotone" dataKey="lentas" stackId="1" stroke={COLORS.slow} fill={COLORS.slow} fillOpacity={0.6} name="Lentas" />
              <Area type="monotone" dataKey="erros" stackId="1" stroke={COLORS.error} fill={COLORS.error} fillOpacity={0.6} name="Erros" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Severity Pie */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Distribuição de Severidade</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">Sem dados</p>
          )}
        </CardContent>
      </Card>

      {/* Duration avg/max AreaChart */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Duração Média / Máxima ao Longo do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={durationData}>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} unit="ms" />
              <Tooltip formatter={(v: number) => [`${v}ms`]} />
              <Area type="monotone" dataKey="maxMs" stroke={COLORS.verySlow} fill={COLORS.verySlow} fillOpacity={0.15} name="Máximo" />
              <Area type="monotone" dataKey="mediaMs" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.3} name="Média" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top tables bar chart */}
      {barData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Alertas por Tabela/RPC</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                <Tooltip />
                <Bar dataKey="alertas" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
