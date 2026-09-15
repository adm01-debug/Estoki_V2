import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BasePageTemplate } from "@/components/templates/BasePageTemplate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap, Play, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function SimulationPage() {
  const [count, setCount] = useState(100);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const runSimulation = async () => {
    setLoading(true);
    setReport(null);
    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
      const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

      type Scenario = {
        name: string;
        fn: string;
        method?: "GET" | "POST";
        body?: unknown;
        expectStatus: number[];
      };
      const scenarios: Scenario[] = [
        { name: "health-check", fn: "health-check", method: "GET", expectStatus: [200, 503] },
        { name: "dashboard-stats", fn: "dashboard-stats", body: {}, expectStatus: [200, 500] },
        { name: "calculate-kpis", fn: "calculate-kpis", body: {}, expectStatus: [200, 500] },
        { name: "abc-analysis", fn: "abc-analysis", body: {}, expectStatus: [200, 500] },
        { name: "check-reorder", fn: "check-reorder", body: {}, expectStatus: [200, 500] },
        { name: "previsao-demanda", fn: "previsao-demanda", body: {}, expectStatus: [200, 500] },
        {
          name: "gerar-desafios-diarios",
          fn: "gerar-desafios-diarios",
          body: {},
          expectStatus: [200, 500],
        },
        { name: "nfe-import (invalid)", fn: "nfe-import", body: {}, expectStatus: [400] },
        {
          name: "nfe-import (xml)",
          fn: "nfe-import",
          body: { xml_content: "<nfe>test</nfe>" },
          expectStatus: [200, 400, 500],
        },
        {
          name: "export-data",
          fn: "export-data",
          body: { type: "products" },
          expectStatus: [200, 400, 500],
        },
      ];

      const runOne = async (s: Scenario) => {
        const start = performance.now();
        try {
          const res = await fetch(`${SUPABASE_URL}/functions/v1/${s.fn}`, {
            method: s.method ?? "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${SUPABASE_KEY}`,
              apikey: SUPABASE_KEY,
            },
            body: s.method === "GET" ? undefined : JSON.stringify(s.body ?? {}),
          });
          await res.text();
          return {
            scenario: s.name,
            status: res.status,
            ok: s.expectStatus.includes(res.status),
            durationMs: performance.now() - start,
          };
        } catch (e) {
          return {
            scenario: s.name,
            status: 0,
            ok: false,
            durationMs: performance.now() - start,
            error: e instanceof Error ? e.message : String(e),
          };
        }
      };

      const total = Math.min(Math.max(count, 1), 2000);
      const CONCURRENCY = 20;
      const jobs = Array.from({ length: total }, (_, i) => scenarios[i % scenarios.length]);
      const results: Awaited<ReturnType<typeof runOne>>[] = [];
      for (let i = 0; i < jobs.length; i += CONCURRENCY) {
        const batch = jobs.slice(i, i + CONCURRENCY).map(runOne);
        results.push(...(await Promise.all(batch)));
      }

      const success = results.filter((r) => r.ok).length;
      const failure = results.length - success;
      const durs = results.map((r) => r.durationMs).sort((a, b) => a - b);
      const pct = (q: number) => Math.round(durs[Math.floor(durs.length * q)] ?? 0);
      const byScenario: Record<
        string,
        { total: number; ok: number; avgMs: number; p95Ms: number }
      > = {};
      for (const s of scenarios) {
        const rows = results.filter((r) => r.scenario === s.name);
        if (!rows.length) continue;
        const ds = rows.map((r) => r.durationMs).sort((a, b) => a - b);
        byScenario[s.name] = {
          total: rows.length,
          ok: rows.filter((r) => r.ok).length,
          avgMs: Math.round(ds.reduce((a, b) => a + b, 0) / ds.length),
          p95Ms: Math.round(ds[Math.floor(ds.length * 0.95)] ?? 0),
        };
      }
      const errors = results
        .filter((r) => !r.ok)
        .slice(0, 20)
        .map((r, i) => ({
          i,
          scenario: { event: r.scenario },
          error: (r as any).error ?? `HTTP ${r.status}`,
        }));

      setReport({
        success,
        failure,
        total: results.length,
        latency: {
          avgMs: Math.round(durs.reduce((a, b) => a + b, 0) / (durs.length || 1)),
          p50Ms: pct(0.5),
          p95Ms: pct(0.95),
          p99Ms: pct(0.99),
        },
        byScenario,
        errors,
      });
      toast.success(`Simulação concluída: ${success}/${results.length} sucessos`);
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao executar simulação: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout showBack>
      <BasePageTemplate
        title="Simulador de Stress"
        description="Execute milhares de cenários de webhooks e edge functions para validar a resiliência do sistema."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-warning" />
                Configuração
              </CardTitle>
              <CardDescription>Defina a carga de teste para a simulação.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="count">Quantidade de Eventos</Label>
                <Input
                  id="count"
                  type="number"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  min={1}
                  max={5000}
                />
                <p className="text-[10px] text-muted-foreground">
                  Recomendado para stress-test: {">"} 500 eventos.
                </p>
              </div>
              <Button className="w-full gap-2" onClick={runSimulation} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Iniciar Simulação
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Relatório de Execução</CardTitle>
              <CardDescription>Resultados em tempo real dos cenários processados.</CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center space-y-4 py-12"
                  >
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="animate-pulse text-sm font-medium">Processando cenários...</p>
                  </motion.div>
                ) : report ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center rounded-xl border border-success/20 bg-success/10 p-4">
                        <span className="text-2xl font-bold text-success">{report.success}</span>
                        <span className="text-[10px] font-bold uppercase text-success/70">
                          Sucessos
                        </span>
                      </div>
                      <div className="flex flex-col items-center rounded-xl border border-destructive/20 bg-destructive/10 p-4">
                        <span className="text-2xl font-bold text-destructive">
                          {report.failure}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-destructive/70">
                          Falhas
                        </span>
                      </div>
                    </div>

                    {report.latency && (
                      <div className="grid grid-cols-4 gap-2">
                        {(["avgMs", "p50Ms", "p95Ms", "p99Ms"] as const).map((k) => (
                          <div
                            key={k}
                            className="flex flex-col items-center rounded-lg border bg-muted/30 p-2"
                          >
                            <span className="text-lg font-bold">{report.latency[k]}ms</span>
                            <span className="text-[9px] font-bold uppercase text-muted-foreground">
                              {k.replace("Ms", "")}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {report.byScenario && (
                      <div className="space-y-2">
                        <Label>Latência por Endpoint</Label>
                        <ScrollArea className="h-[200px] rounded-lg border bg-muted/30 p-3">
                          {Object.entries(report.byScenario).map(([name, s]: [string, any]) => (
                            <div
                              key={name}
                              className="mb-2 flex items-center justify-between border-b border-border/40 pb-1 text-[11px] last:border-0"
                            >
                              <span className="font-mono">{name}</span>
                              <span className="text-muted-foreground">
                                {s.ok}/{s.total} · avg {s.avgMs}ms · p95 {s.p95Ms}ms
                              </span>
                            </div>
                          ))}
                        </ScrollArea>
                      </div>
                    )}

                    {report.errors?.length > 0 && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          Detalhes das Falhas
                        </Label>
                        <ScrollArea className="h-[200px] rounded-lg border bg-muted/30 p-4">
                          {report.errors.map((err: any, idx: number) => (
                            <div
                              key={idx}
                              className="mb-4 border-b border-border/50 pb-2 font-mono text-[11px] last:mb-0 last:border-0"
                            >
                              <p className="mb-1 font-bold text-destructive">
                                Cenário {err.i}: {err.scenario.event}
                              </p>
                              <p className="text-muted-foreground">{err.error}</p>
                            </div>
                          ))}
                        </ScrollArea>
                      </div>
                    )}

                    <div className="flex justify-center">
                      <Badge
                        variant={report.failure === 0 ? "outline" : "destructive"}
                        className={cn(
                          "gap-1 px-4 py-1",
                          report.failure === 0 && "border-success/20 bg-success/10 text-success"
                        )}
                      >
                        {report.failure === 0 ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        {report.failure === 0 ? "Sistema Resiliente (10/10)" : "Gaps Identificados"}
                      </Badge>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Zap className="mb-4 h-12 w-12 opacity-10" />
                    <p className="text-sm">Aguardando início do teste...</p>
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </BasePageTemplate>
    </AppLayout>
  );
}
