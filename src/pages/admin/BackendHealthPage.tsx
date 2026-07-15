import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import { AppLayout } from "@/components/layout/AppLayout";
import { BasePageTemplate } from "@/components/templates/BasePageTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Activity, Database, AlertCircle, RefreshCw, Zap, Server, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type HealthReport = {
  generated_at: string;
  window_hours: number;
  db: {
    generated_at: string;
    database: {
      size_mb: number;
      cache_hit_ratio_pct: number;
      deadlocks_since_boot: number;
      commits_since_boot: number;
      rollbacks_since_boot: number;
    };
    connections: {
      total: number;
      active: number;
      idle: number;
      max: number;
      saturation_pct: number;
    };
    slow_queries: Array<{
      query: string;
      calls: number;
      mean_ms: number;
      total_ms: number;
      max_ms: number;
    }>;
    largest_tables: Array<{ table_name: string; size_mb: number; rows_estimate: number }>;
  };
  queries: {
    total: number;
    errors: number;
    errorRatePct: number;
    latency: { avgMs: number; p50Ms: number; p95Ms: number; p99Ms: number };
    topOperations: Array<{
      name: string;
      count: number;
      errors: number;
      avgMs: number;
      p95Ms: number;
    }>;
  };
  audit: { total_events: number; by_action: Record<string, number> };
  alerts: { total: number; by_severity: Record<string, number> };
  recentErrors: Array<{
    when: string;
    source: string;
    target: string | null;
    severity: string | null;
    message: string;
  }>;
};

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
  trend,
  trendColor = "hsl(var(--primary))",
}: {
  icon: typeof Activity;
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger";
  trend?: number[];
  trendColor?: string;
}) {
  const toneClass = {
    default: "border-border bg-card",
    success: "border-success/30 bg-success/10",
    warning: "border-warning/30 bg-warning/10",
    danger: "border-destructive/30 bg-destructive/10",
  }[tone];
  return (
    <Card className={cn("border", toneClass)}>
      <CardContent className="flex items-center gap-4 p-4">
        <Icon className="h-8 w-8 shrink-0 opacity-60" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-[10px] font-bold uppercase text-muted-foreground">{label}</span>
          <span className="text-2xl font-bold">{value}</span>
          {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
        </div>
        {trend && trend.length > 1 && (
          <div className="h-10 w-20 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend.map((v, i) => ({ i, v }))}>
                <YAxis hide domain={["dataMin", "dataMax"]} />
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={trendColor}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function BackendHealthPage() {
  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ["backend-health"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<HealthReport>("backend-health", {
        body: {},
      });
      if (error) throw error;
      if (!data) throw new Error("Sem resposta");
      return data;
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
    retry: false,
  });

  // Buffer em memória dos últimos 20 samples para sparklines de tendência.
  const [history, setHistory] = useState<{
    conn: number[];
    p95: number[];
    err: number[];
    cache: number[];
  }>({ conn: [], p95: [], err: [], cache: [] });
  const lastAtRef = useRef<string | null>(null);
  useEffect(() => {
    if (!data || data.generated_at === lastAtRef.current) return;
    lastAtRef.current = data.generated_at;
    setHistory((h) => {
      const push = (arr: number[], v: number) => [...arr.slice(-19), v];
      return {
        conn: push(h.conn, data.db.connections.total),
        p95: push(h.p95, data.queries.latency.p95Ms),
        err: push(h.err, data.queries.errorRatePct),
        cache: push(h.cache, data.db.database.cache_hit_ratio_pct),
      };
    });
  }, [data]);

  const conn = data?.db.connections;
  const dbInfo = data?.db.database;
  const lat = data?.queries.latency;

  const connTone: "success" | "warning" | "danger" =
    (conn?.saturation_pct ?? 0) > 80
      ? "danger"
      : (conn?.saturation_pct ?? 0) > 50
        ? "warning"
        : "success";
  const errorTone: "success" | "warning" | "danger" =
    (data?.queries.errorRatePct ?? 0) > 5
      ? "danger"
      : (data?.queries.errorRatePct ?? 0) > 1
        ? "warning"
        : "success";
  const cacheTone: "success" | "warning" | "danger" =
    (dbInfo?.cache_hit_ratio_pct ?? 100) < 90
      ? "warning"
      : (dbInfo?.cache_hit_ratio_pct ?? 100) < 80
        ? "danger"
        : "success";

  return (
    <AppLayout showBack>
      <BasePageTemplate
        title="Saúde do Backend"
        description="Métricas em tempo real do banco, latência de queries, erros e auditoria (últimas 24h)."
        headerActions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            Atualizar
          </Button>
        }
      >
        {error && (
          <Card className="border-destructive/40 bg-destructive/10">
            <CardContent className="flex items-center gap-2 p-4 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Erro ao carregar métricas: {(error as Error).message}
            </CardContent>
          </Card>
        )}

        {isLoading && !data && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="h-24 animate-pulse bg-muted/30" />
            ))}
          </div>
        )}

        {data && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                icon={Database}
                label="Tamanho do Banco"
                value={`${dbInfo!.size_mb} MB`}
                hint={`Cache hit: ${dbInfo!.cache_hit_ratio_pct}%`}
                tone={cacheTone}
                trend={history.cache}
                trendColor="hsl(var(--success))"
              />
              <StatCard
                icon={Server}
                label="Conexões"
                value={`${conn!.total}/${conn!.max}`}
                hint={`Ativas: ${conn!.active} · Ociosas: ${conn!.idle} · ${conn!.saturation_pct}%`}
                tone={connTone}
                trend={history.conn}
              />
              <StatCard
                icon={Zap}
                label="Queries 24h"
                value={data.queries.total.toLocaleString("pt-BR")}
                hint={`Taxa de erro: ${data.queries.errorRatePct}%`}
                tone={errorTone}
                trend={history.err}
                trendColor="hsl(var(--destructive))"
              />
              <StatCard
                icon={Clock}
                label="Latência p95"
                value={`${lat!.p95Ms}ms`}
                hint={`avg ${lat!.avgMs}ms · p99 ${lat!.p99Ms}ms`}
                tone={lat!.p95Ms > 1000 ? "warning" : "success"}
                trend={history.p95}
                trendColor="hsl(var(--warning))"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Operações mais frequentes (24h)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[320px] pr-3">
                    {data.queries.topOperations.length === 0 && (
                      <p className="py-8 text-center text-xs text-muted-foreground">
                        Sem telemetria registrada ainda.
                      </p>
                    )}
                    {data.queries.topOperations.map((op) => (
                      <div
                        key={op.name}
                        className="mb-2 flex items-center justify-between border-b border-border/40 pb-2 text-[11px] last:border-0"
                      >
                        <div className="flex flex-col">
                          <span className="font-mono font-semibold">{op.name}</span>
                          <span className="text-muted-foreground">
                            {op.count} calls · avg {op.avgMs}ms · p95 {op.p95Ms}ms
                          </span>
                        </div>
                        {op.errors > 0 && (
                          <Badge variant="destructive" className="text-[10px]">
                            {op.errors} erros
                          </Badge>
                        )}
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Queries lentas (pg_stat_statements)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[320px] pr-3">
                    {data.db.slow_queries.length === 0 && (
                      <p className="py-8 text-center text-xs text-muted-foreground">
                        Extensão pg_stat_statements indisponível.
                      </p>
                    )}
                    {data.db.slow_queries.map((q, i) => (
                      <div
                        key={i}
                        className="mb-3 rounded border border-border/40 bg-muted/20 p-2 text-[10px] last:mb-0"
                      >
                        <p className="mb-1 font-mono leading-tight">{q.query}</p>
                        <p className="text-muted-foreground">
                          {q.calls} calls · avg {q.mean_ms}ms · max {q.max_ms}ms · total{" "}
                          {q.total_ms}ms
                        </p>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Maiores tabelas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[240px] pr-3">
                    {data.db.largest_tables.map((t) => (
                      <div
                        key={t.table_name}
                        className="mb-2 flex items-center justify-between border-b border-border/40 pb-1 text-[11px] last:border-0"
                      >
                        <span className="font-mono">{t.table_name}</span>
                        <span className="text-muted-foreground">
                          {t.size_mb} MB · {t.rows_estimate.toLocaleString("pt-BR")} rows
                        </span>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Auditoria (24h)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-2xl font-bold">{data.audit.total_events}</p>
                  <p className="text-[10px] uppercase text-muted-foreground">eventos totais</p>
                  <div className="mt-3 space-y-1">
                    {Object.entries(data.audit.by_action)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 8)
                      .map(([k, v]) => (
                        <div
                          key={k}
                          className="flex justify-between text-[11px] text-muted-foreground"
                        >
                          <span className="font-mono">{k}</span>
                          <span>{v}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Alertas (24h)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-2xl font-bold">{data.alerts.total}</p>
                  <p className="text-[10px] uppercase text-muted-foreground">alertas gerados</p>
                  <div className="mt-3 space-y-1">
                    {Object.entries(data.alerts.by_severity)
                      .sort((a, b) => b[1] - a[1])
                      .map(([k, v]) => (
                        <div
                          key={k}
                          className="flex justify-between text-[11px] text-muted-foreground"
                        >
                          <span className="font-mono">{k}</span>
                          <Badge
                            variant={
                              k === "critico" || k === "erro"
                                ? "destructive"
                                : k === "aviso"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="text-[10px]"
                          >
                            {v}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Erros recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[240px] pr-3">
                  {data.recentErrors.length === 0 && (
                    <p className="py-8 text-center text-xs text-muted-foreground">
                      Nenhum erro registrado nas últimas 24h. 🎉
                    </p>
                  )}
                  {data.recentErrors.map((e, i) => (
                    <div
                      key={i}
                      className="mb-2 border-b border-border/40 pb-2 text-[11px] last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-semibold">
                          [{e.source}] {e.target ?? "-"}
                        </span>
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(new Date(e.when), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <p className="mt-1 text-muted-foreground">{e.message}</p>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            <p className="text-center text-[10px] text-muted-foreground">
              Atualizado automaticamente a cada 30s · última coleta{" "}
              {formatDistanceToNow(new Date(data.generated_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </p>
          </div>
        )}
      </BasePageTemplate>
    </AppLayout>
  );
}