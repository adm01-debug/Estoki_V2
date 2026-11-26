import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  PackageSearch,
  RefreshCw,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState, ErrorState } from "@/components/common/AsyncStates";
import { DashboardSkeleton } from "@/components/ui/loading-skeleton";
import { exportRowsToCSV } from "@/lib/export";

interface IntegrationLog {
  id: string;
  integration: string;
  action: string;
  request: unknown;
  response: unknown;
  status: string | null;
  created_at: string;
}

interface ReorderSuggestion {
  id: string;
  product_name: string | null;
  sku: string | null;
  current_stock: number;
  reorder_point: number;
  suggested_quantity: number;
  supplier_name: string | null;
  estimated_delivery: string | null;
  status: string;
  created_at: string;
}

const PERIODOS = [
  { value: "1", label: "Últimas 24h" },
  { value: "7", label: "Últimos 7 dias" },
  { value: "30", label: "Últimos 30 dias" },
];

const STATUS_REPOSICAO: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "Pendente", variant: "default" },
  approved: { label: "Aprovada", variant: "secondary" },
  dismissed: { label: "Ignorada", variant: "outline" },
};

const ROTULO_INTEGRACAO: Record<string, string> = {
  sap_b1: "SAP Business One",
  totvs_protheus: "TOTVS Protheus",
  amazon: "Amazon",
  ifood: "iFood",
  rappi: "Rappi",
  mercado_livre: "Mercado Livre",
};

const rotuloIntegracao = (slug: string) => ROTULO_INTEGRACAO[slug] ?? slug;

const falhou = (log: IntegrationLog): boolean => {
  if (log.status && ["error", "failed", "erro", "falha"].includes(log.status.toLowerCase())) {
    return true;
  }
  return Boolean(log.response && typeof log.response === "object" && "error" in log.response);
};

export default function AutomacoesPage() {
  const [dias, setDias] = useState("7");
  const [integracao, setIntegracao] = useState("todas");
  const queryClient = useQueryClient();

  const desde = useMemo(() => subDays(new Date(), Number(dias)).toISOString(), [dias]);

  const integracoesQuery = useQuery({
    queryKey: ["automacoes-integracoes"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integration_logs")
        .select("integration")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return Array.from(new Set((data ?? []).map((row) => row.integration as string))).sort();
    },
  });

  const logsQuery = useQuery({
    queryKey: ["automacoes-logs", integracao, desde],
    queryFn: async () => {
      let consulta = supabase
        .from("integration_logs")
        .select("id, integration, action, request, response, status, created_at")
        .gte("created_at", desde)
        .order("created_at", { ascending: false })
        .limit(200);
      if (integracao !== "todas") consulta = consulta.eq("integration", integracao);
      const { data, error } = await consulta;
      if (error) throw error;
      return (data ?? []) as IntegrationLog[];
    },
  });

  const reposicaoQuery = useQuery({
    queryKey: ["automacoes-reposicao"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reorder_suggestions")
        .select(
          "id, product_name, sku, current_stock, reorder_point, suggested_quantity, supplier_name, estimated_delivery, status, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as ReorderSuggestion[];
    },
  });

  const alterarStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("reorder_suggestions").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automacoes-reposicao"] });
      toast.success("Sugestão de reposição atualizada");
    },
    onError: (erro: Error) => toast.error(erro.message),
  });

  const logs = logsQuery.data ?? [];
  const sugestoes = reposicaoQuery.data ?? [];
  const falhas = logs.filter(falhou);
  const pendentes = sugestoes.filter((s) => s.status === "pending");
  const ultimaExecucao = logs[0]?.created_at;

  const recarregarTudo = () => {
    queryClient.invalidateQueries({ queryKey: ["automacoes-logs"] });
    queryClient.invalidateQueries({ queryKey: ["automacoes-reposicao"] });
    queryClient.invalidateQueries({ queryKey: ["automacoes-integracoes"] });
  };

  const exportarLogs = () => {
    if (logs.length === 0) return toast.info("Nada para exportar no período");
    exportRowsToCSV(
      ["Integração", "Ação", "Resultado", "Quando"],
      logs.map((log) => [
        rotuloIntegracao(log.integration),
        log.action,
        falhou(log) ? "erro" : "ok",
        format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
      ]),
      `logs-integracao-${dias}d`
    );
  };

  const exportarReposicao = () => {
    if (sugestoes.length === 0) return toast.info("Nenhuma sugestão para exportar");
    exportRowsToCSV(
      [
        "SKU",
        "Produto",
        "Estoque atual",
        "Ponto de reposição",
        "Quantidade sugerida",
        "Fornecedor",
        "Entrega estimada",
        "Status",
      ],
      sugestoes.map((s) => [
        s.sku ?? "",
        s.product_name ?? "",
        String(s.current_stock),
        String(s.reorder_point),
        String(s.suggested_quantity),
        s.supplier_name ?? "",
        s.estimated_delivery ?? "",
        STATUS_REPOSICAO[s.status]?.label ?? s.status,
      ]),
      "reposicao-sugerida"
    );
  };

  const carregando = logsQuery.isLoading || reposicaoQuery.isLoading;
  const erro = logsQuery.error ?? reposicaoQuery.error;

  if (carregando) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Automações · Estoki WMS</title>
        <meta
          name="description"
          content="Histórico das integrações ERP/marketplace e sugestões automáticas de reposição de estoque."
        />
      </Helmet>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Workflow className="h-6 w-6 text-primary" aria-hidden="true" />
            Automações
          </h1>
          <p className="text-sm text-muted-foreground">
            O que os jobs e integrações executaram, e o que eles recomendam fazer agora.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={dias} onValueChange={setDias}>
            <SelectTrigger className="w-[150px]" aria-label="Período dos logs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODOS.map((periodo) => (
                <SelectItem key={periodo.value} value={periodo.value}>
                  {periodo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={recarregarTudo}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Atualizar
          </Button>
        </div>
      </div>

      {erro && <ErrorState message={erro.message} onRetry={recarregarTudo} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Execuções registradas" value={logs.length} icon={Workflow} />
        <StatCard title="Execuções com erro" value={falhas.length} icon={AlertTriangle} />
        <StatCard title="Sugestões pendentes" value={pendentes.length} icon={PackageSearch} />
        <StatCard
          title="Última execução"
          value={
            ultimaExecucao
              ? formatDistanceToNow(new Date(ultimaExecucao), { addSuffix: true, locale: ptBR })
              : "—"
          }
          icon={RefreshCw}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Execuções das integrações</CardTitle>
            <CardDescription>
              Cada chamada às edges de ERP e marketplace deixa um registro aqui. Hoje a tabela
              <code className="mx-1 rounded bg-muted px-1">integration_logs</code>
              não tem nenhuma tela que a exiba.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={integracao} onValueChange={setIntegracao}>
              <SelectTrigger className="w-[190px]" aria-label="Filtrar por integração">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as integrações</SelectItem>
                {(integracoesQuery.data ?? []).map((slug) => (
                  <SelectItem key={slug} value={slug}>
                    {rotuloIntegracao(slug)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={exportarLogs}>
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {logsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando execuções…</p>
          ) : logs.length === 0 ? (
            <EmptyState
              title="Nenhuma execução no período"
              description="As integrações não registraram chamadas neste intervalo. Amplie o período ou dispare uma sincronização."
              icon={<Workflow className="h-8 w-8" />}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Integração</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Detalhe</TableHead>
                    <TableHead>Quando</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        {rotuloIntegracao(log.integration)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{log.action}</TableCell>
                      <TableCell>
                        {falhou(log) ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                            Erro
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                            OK
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[280px]">
                        <details>
                          <summary className="cursor-pointer text-xs text-muted-foreground">
                            ver payload
                          </summary>
                          <pre className="mt-1 max-h-40 overflow-auto rounded bg-muted p-2 text-[11px] leading-tight">
                            {JSON.stringify(
                              { request: log.request, response: log.response },
                              null,
                              2
                            )}
                          </pre>
                        </details>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                        {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Reposição sugerida</CardTitle>
            <CardDescription>
              Gerada pelo job diário de ponto de pedido. Aprovar aqui não compra nada — registra a
              decisão para o comprador.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={exportarReposicao}>
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            CSV
          </Button>
        </CardHeader>
        <CardContent>
          {reposicaoQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando sugestões…</p>
          ) : sugestoes.length === 0 ? (
            <EmptyState
              title="Nenhuma sugestão de reposição"
              description="O job ainda não encontrou produto abaixo do ponto de pedido."
              icon={<PackageSearch className="h-8 w-8" />}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Ponto</TableHead>
                    <TableHead>Sugerido</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sugestoes.map((sugestao) => {
                    const meta = STATUS_REPOSICAO[sugestao.status] ?? {
                      label: sugestao.status,
                      variant: "outline" as const,
                    };
                    return (
                      <TableRow key={sugestao.id}>
                        <TableCell className="font-mono text-xs">{sugestao.sku ?? "—"}</TableCell>
                        <TableCell className="font-medium">
                          {sugestao.product_name ?? "—"}
                        </TableCell>
                        <TableCell>{sugestao.current_stock}</TableCell>
                        <TableCell>{sugestao.reorder_point}</TableCell>
                        <TableCell className="font-semibold">
                          {sugestao.suggested_quantity}
                        </TableCell>
                        <TableCell>{sugestao.supplier_name ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant={meta.variant}>{meta.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {sugestao.status === "pending" ? (
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={alterarStatus.isPending}
                                onClick={() =>
                                  alterarStatus.mutate({ id: sugestao.id, status: "approved" })
                                }
                              >
                                Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={alterarStatus.isPending}
                                onClick={() =>
                                  alterarStatus.mutate({ id: sugestao.id, status: "dismissed" })
                                }
                              >
                                Ignorar
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
