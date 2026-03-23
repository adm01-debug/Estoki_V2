import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

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

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "#eab308", "hsl(var(--muted-foreground))"];

export function TelemetryCharts({ rows, timeFilter }: TelemetryChartsProps) {
  // Duration distribution by hour
  const hourBuckets = new Map<string, { hour: string; avg: number; max: number; count: number; total: number }>();
  for (const r of rows) {
    const d = new Date(r.created_at);
    const key = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}h`;
    const prev = hourBuckets.get(key) || { hour: key, avg: 0, max: 0, count: 0, total: 0 };
    hourBuckets.set(key, {
      hour: key,
      avg: 0,
      max: Math.max(prev.max, r.duration_ms),
      count: prev.count + 1,
      total: prev.total + r.duration_ms,
    });
  }
  const timelineData = [...hourBuckets.values()]
    .map((b) => ({ ...b, avg: Math.round(b.total / b.count) }))
    .slice(-24);

  // Severity distribution
  const severityCounts = { slow: 0, very_slow: 0, error: 0, normal: 0 };
  for (const r of rows) {
    const key = r.severity as keyof typeof severityCounts;
    if (key in severityCounts) severityCounts[key]++;
    else severityCounts.normal++;
  }
  const pieData = [
    { name: "Lentas", value: severityCounts.slow },
    { name: "Muito Lentas", value: severityCounts.very_slow },
    { name: "Erros", value: severityCounts.error },
  ].filter((d) => d.value > 0);

  // Top tables by avg duration
  const tableAvg = new Map<string, { name: string; total: number; count: number }>();
  for (const r of rows) {
    const name = r.rpc_name || r.table_name || "unknown";
    const prev = tableAvg.get(name) || { name, total: 0, count: 0 };
    tableAvg.set(name, { name, total: prev.total + r.duration_ms, count: prev.count + 1 });
  }
  const barData = [...tableAvg.values()]
    .map((t) => ({ name: t.name, avg: Math.round(t.total / t.count) }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 8);

  if (rows.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Timeline */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Duração ao Longo do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timelineData}>
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} unit="ms" />
              <Tooltip formatter={(v: number) => [`${v}ms`]} />
              <Line type="monotone" dataKey="avg" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Média" />
              <Line type="monotone" dataKey="max" stroke="hsl(var(--destructive))" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Máx" />
            </LineChart>
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
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">Sem dados</p>
          )}
        </CardContent>
      </Card>

      {/* Top tables bar chart */}
      {barData.length > 0 && (
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Duração Média por Tabela/RPC (ms)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} unit="ms" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                <Tooltip formatter={(v: number) => [`${v}ms`]} />
                <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
