import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity, ShieldAlert, ShieldCheck } from "lucide-react";
import { circuits } from "@/lib/circuit-breaker";
import { getAiBreakerStats } from "@/lib/ai-invoke";

type Row = {
  name: string;
  state: "CLOSED" | "OPEN" | "HALF_OPEN";
  failures: number;
  totalCalls: number;
  totalFailures: number;
  totalSuccesses: number;
  lastFailure: number | null;
  reset?: () => void;
};

function collect(): Row[] {
  const rows: Row[] = Object.entries(circuits).map(([key, cb]) => ({
    name: key,
    reset: () => cb.reset(),
    ...cb.getStats(),
  }));
  rows.push({ name: "ai-gateway (invoke)", ...getAiBreakerStats() });
  return rows;
}

const stateColor: Record<Row["state"], string> = {
  CLOSED: "bg-emerald-500/20 text-emerald-500 border-emerald-500/40",
  HALF_OPEN: "bg-amber-500/20 text-amber-500 border-amber-500/40",
  OPEN: "bg-red-500/20 text-red-500 border-red-500/40",
};

export default function CircuitBreakersPage() {
  const [rows, setRows] = useState<Row[]>(collect());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setRows(collect()), 2_000);
    return () => clearInterval(id);
  }, [tick]);

  const totalOpen = rows.filter((r) => r.state === "OPEN").length;

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Activity className="h-8 w-8 text-primary" />
            Circuit Breakers
          </h1>
          <p className="mt-1 text-muted-foreground">
            Monitoramento em tempo real das integrações externas com fast-fail.
          </p>
        </div>
        <Button variant="outline" onClick={() => setTick((t) => t + 1)}>
          <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          {totalOpen > 0 ? (
            <ShieldAlert className="h-5 w-5 text-red-500" />
          ) : (
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          )}
          <CardTitle>
            {totalOpen > 0
              ? `${totalOpen} circuito(s) aberto(s)`
              : "Todos os circuitos operacionais"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((r) => {
              const successRate =
                r.totalCalls > 0 ? ((r.totalSuccesses / r.totalCalls) * 100).toFixed(1) : "—";
              return (
                <div key={r.name} className="space-y-2 rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{r.name}</span>
                    <Badge variant="outline" className={stateColor[r.state]}>
                      {r.state}
                    </Badge>
                  </div>
                  <dl className="grid grid-cols-2 gap-y-1 text-xs text-muted-foreground">
                    <dt>Chamadas</dt>
                    <dd className="text-right text-foreground">{r.totalCalls}</dd>
                    <dt>Sucessos</dt>
                    <dd className="text-right text-foreground">{r.totalSuccesses}</dd>
                    <dt>Falhas</dt>
                    <dd className="text-right text-foreground">{r.totalFailures}</dd>
                    <dt>Falhas seguidas</dt>
                    <dd className="text-right text-foreground">{r.failures}</dd>
                    <dt>Taxa de sucesso</dt>
                    <dd className="text-right text-foreground">{successRate}%</dd>
                    <dt>Última falha</dt>
                    <dd className="text-right text-foreground">
                      {r.lastFailure ? new Date(r.lastFailure).toLocaleTimeString("pt-BR") : "—"}
                    </dd>
                  </dl>
                  {r.reset && r.state !== "CLOSED" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full"
                      onClick={() => {
                        r.reset?.();
                        setRows(collect());
                      }}
                    >
                      Forçar reset
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
