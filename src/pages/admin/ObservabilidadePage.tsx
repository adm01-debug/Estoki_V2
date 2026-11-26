import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, BarChart3, Bell, RefreshCw, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { ErrorState, EmptyState } from "@/components/common/AsyncStates";
import { DashboardSkeleton } from "@/components/ui/loading-skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AuditRow {
  dia: string;
  entity_type: string;
  action: string;
  total: number;
  usuarios_distintos: number;
}

interface AlertaRow {
  dia: string;
  severidade: string;
  tipo: string;
  status: string;
  total: number;
}

interface NotificacaoRow {
  dia: string;
  tipo: string;
  enviadas: number;
  lidas: number;
  taxa_leitura_pct: number | string | null;
}

interface DashboardMetrics {
  audit: AuditRow[];
  alertas: AlertaRow[];
  notificacoes: NotificacaoRow[];
  generated_at: string;
}

const SEVERIDADE_CORES: Record<string, string> = {
  critica: "hsl(var(--destructive))",
  alta: "hsl(0, 84%, 60%)",
  media: "hsl(45, 93%, 47%)",
  baixa: "hsl(var(--primary))",
  info: "hsl(var(--muted-foreground))",
};

function corSeveridade(severidade: string): string {
  return SEVERIDADE_CORES[severidade?.toLowerCase?.() ?? ""] ?? "hsl(var(--muted-foreground))";
}

function formatarDia(dia: string): string {
  const d = new Date(`${dia}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dia;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default function ObservabilidadePage() {
  const [dias, setDias] = useState("30");
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["dashboard-metrics", dias],
    queryFn: async (): Promise<DashboardMetrics> => {
      const { data: bruto, error: rpcError } = await supabase.rpc("get_dashboard_metrics", {
        _dias: Number(dias),
      });
      if (rpcError) throw rpcError;
      const json = (bruto ?? {}) as Partial<DashboardMetrics>;
      return {
        audit: json.audit ?? [],
        alertas: json.alertas ?? [],
        notificacoes: json.notificacoes ?? [],
        generated_at: json.generated_at ?? new Date().toISOString(),
      };
    },
  });

  const refresh = useMutation({
    mutationFn: async () => {
      const { data: resultado, error: rpcError } = await supabase.rpc(
        "refresh_dashboard_materialized_views"
      );
      if (rpcError) throw rpcError;
      return resultado as { total_ms?: number } | null;
    },
    onSuccess: (resultado) => {
      const ms = Math.round(Number(resultado?.total_ms ?? 0));
      toast.success(`Indicadores recalculados${ms ? ` em ${ms} ms` : ""}.`);
      void queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Não foi possível recalcular os indicadores.");
    },
  });

  const auditoriaPorDia = useMemo(() => {
    const mapa = new Map<string, { dia: string; eventos: number; usuarios: number }>();
    for (const linha of data?.audit ?? []) {
      const atual = mapa.get(linha.dia) ?? { dia: formatarDia(linha.dia), eventos: 0, usuarios: 0 };
      atual.eventos += Number(linha.total ?? 0);
      atual.usuarios += Number(linha.usuarios_distintos ?? 0);
      mapa.set(linha.dia, atual);
    }
    return [...mapa.values()].sort((a, b) => a.dia.localeCompare(b.dia));
  }, [data?.audit]);

  const alertasPorSeveridade = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const linha of data?.alertas ?? []) {
      const chave = linha.severidade || "sem severidade";
      mapa.set(chave, (mapa.get(chave) ?? 0) + Number(linha.total ?? 0));
    }
    return [...mapa.entries()]
      .map(([severidade, total]) => ({ severidade, total, cor: corSeveridade(severidade) }))
      .sort((a, b) => b.total - a.total);
  }, [data?.alertas]);

  const notificacoesPorDia = useMemo(() => {
    const mapa = new Map<string, { dia: string; enviadas: number; lidas: number }>();
    for (const linha of data?.notificacoes ?? []) {
      const atual = mapa.get(linha.dia) ?? { dia: formatarDia(linha.dia), enviadas: 0, lidas: 0 };
      atual.enviadas += Number(linha.enviadas ?? 0);
      atual.lidas += Number(linha.lidas ?? 0);
      mapa.set(linha.dia, atual);
    }
    return [...mapa.values()].sort((a, b) => a.dia.localeCompare(b.dia));
  }, [data?.notificacoes]);

  const notificacoesPorTipo = useMemo(() => {
    const mapa = new Map<string, { tipo: string; enviadas: number; lidas: number }>();
    for (const linha of data?.notificacoes ?? []) {
      const chave = linha.tipo || "sem tipo";
      const atual = mapa.get(chave) ?? { tipo: chave, enviadas: 0, lidas: 0 };
      atual.enviadas += Number(linha.enviadas ?? 0);
      atual.lidas += Number(linha.lidas ?? 0);
      mapa.set(chave, atual);
    }
    return [...mapa.values()]
      .map((item) => ({
        ...item,
        taxa: item.enviadas ? Math.round((item.lidas / item.enviadas) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.enviadas - a.enviadas);
  }, [data?.notificacoes]);

  const totais = useMemo(() => {
    const eventos = (data?.audit ?? []).reduce((acc, l) => acc + Number(l.total ?? 0), 0);
    const alertas = (data?.alertas ?? []).reduce((acc, l) => acc + Number(l.total ?? 0), 0);
    const enviadas = (data?.notificacoes ?? []).reduce(
      (acc, l) => acc + Number(l.enviadas ?? 0),
      0
    );
    const lidas = (data?.notificacoes ?? []).reduce((acc, l) => acc + Number(l.lidas ?? 0), 0);
    return {
      eventos,
      alertas,
      enviadas,
      lidas,
      taxaLeitura: enviadas ? Math.round((lidas / enviadas) * 1000) / 10 : 0,
    };
  }, [data]);

  const semDados =
    !isLoading && !isError && totais.eventos + totais.alertas + totais.enviadas === 0;

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 py-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-6">
        <ErrorState
          message={(error as Error)?.message || "Erro ao carregar os indicadores."}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      <Helmet>
        <title>Observabilidade — ESTOKI WMS</title>
        <meta
          name="description"
          content="Indicadores agregados de auditoria, alertas e notificações do armazém."
        />
      </Helmet>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <BarChart3 className="h-7 w-7 text-primary" />
            Observabilidade
          </h1>
          <p className="mt-1 text-muted-foreground">
            Auditoria, alertas e notificações agregados por dia. Os números vêm de visões
            materializadas e são recalculados sob demanda ou pelo agendamento diário.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={dias} onValueChange={setDias}>
            <SelectTrigger className="w-40" aria-label="Período dos indicadores">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => refresh.mutate()} disabled={refresh.isPending}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refresh.isPending ? "animate-spin" : ""}`} />
            {refresh.isPending ? "Recalculando..." : "Recalcular agora"}
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Eventos auditados" value={totais.eventos} icon={Activity} />
        <StatCard title="Alertas" value={totais.alertas} icon={ShieldAlert} />
        <StatCard title="Notificações enviadas" value={totais.enviadas} icon={Bell} />
        <StatCard title="Taxa de leitura" value={`${totais.taxaLeitura}%`} icon={BarChart3} />
      </div>

      {semDados ? (
        <EmptyState
          title="Sem indicadores no período"
          description="Nenhum evento de auditoria, alerta ou notificação foi registrado no intervalo selecionado."
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Auditoria por dia</CardTitle>
            </CardHeader>
            <CardContent>
              {auditoriaPorDia.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Sem eventos de auditoria no período.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={auditoriaPorDia}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="dia" fontSize={12} />
                    <YAxis fontSize={12} allowDecimals={false} />
                    <Tooltip
                      formatter={(valor: number, nome: string) => [
                        valor,
                        nome === "eventos" ? "Eventos" : "Usuários distintos",
                      ]}
                    />
                    <Legend
                      formatter={(valor) =>
                        valor === "eventos" ? "Eventos" : "Usuários distintos"
                      }
                    />
                    <Bar dataKey="eventos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar
                      dataKey="usuarios"
                      fill="hsl(var(--muted-foreground))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Alertas por severidade</CardTitle>
              </CardHeader>
              <CardContent>
                {alertasPorSeveridade.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Sem alertas no período.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {alertasPorSeveridade.map((item) => (
                      <div key={item.severidade} className="flex items-center gap-3">
                        <Badge variant="outline" className="w-32 justify-center capitalize">
                          {item.severidade}
                        </Badge>
                        <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.round(
                                (item.total / (alertasPorSeveridade[0]?.total || 1)) * 100
                              )}%`,
                              backgroundColor: item.cor,
                            }}
                          />
                        </div>
                        <span className="w-12 text-right text-sm font-medium tabular-nums">
                          {item.total}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notificações por dia</CardTitle>
              </CardHeader>
              <CardContent>
                {notificacoesPorDia.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Sem notificações no período.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={notificacoesPorDia}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="dia" fontSize={12} />
                      <YAxis fontSize={12} allowDecimals={false} />
                      <Tooltip
                        formatter={(valor: number, nome: string) => [
                          valor,
                          nome === "enviadas" ? "Enviadas" : "Lidas",
                        ]}
                      />
                      <Legend
                        formatter={(valor) => (valor === "enviadas" ? "Enviadas" : "Lidas")}
                      />
                      <Line
                        type="monotone"
                        dataKey="enviadas"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="lidas"
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Leitura por tipo de notificação</CardTitle>
            </CardHeader>
            <CardContent>
              {notificacoesPorTipo.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Sem notificações no período.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Enviadas</TableHead>
                      <TableHead className="text-right">Lidas</TableHead>
                      <TableHead className="text-right">Taxa de leitura</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notificacoesPorTipo.map((item) => (
                      <TableRow key={item.tipo}>
                        <TableCell className="font-medium capitalize">{item.tipo}</TableCell>
                        <TableCell className="text-right tabular-nums">{item.enviadas}</TableCell>
                        <TableCell className="text-right tabular-nums">{item.lidas}</TableCell>
                        <TableCell className="text-right tabular-nums">{item.taxa}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        Indicadores gerados em{" "}
        {data?.generated_at ? new Date(data.generated_at).toLocaleString("pt-BR") : "—"}.
      </p>
    </div>
  );
}
