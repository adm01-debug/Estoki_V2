import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Warehouse,
  Layers,
  ShoppingCart,
  ListTodo,
  MapPin,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { SEO } from "@/components/common/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMultiWarehouseDashboard, type FilialResumo } from "../hooks/useMultiWarehouseDashboard";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function formatPercent(value: number): string {
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value)}%`;
}

function totais(filiais: FilialResumo[]) {
  return filiais.reduce(
    (acc, f) => ({
      posicoes: acc.posicoes + f.total_posicoes,
      ocupadas: acc.ocupadas + f.posicoes_ocupadas,
      lotes: acc.lotes + f.total_lotes,
      quantidade: acc.quantidade + f.quantidade_estoque,
      pedidosPendentes: acc.pedidosPendentes + f.orders_pendentes,
      tarefasAbertas: acc.tarefasAbertas + f.tarefas_abertas,
    }),
    { posicoes: 0, ocupadas: 0, lotes: 0, quantidade: 0, pedidosPendentes: 0, tarefasAbertas: 0 }
  );
}

function KpiCard({
  titulo,
  valor,
  detalhe,
  icon: Icon,
}: {
  titulo: string;
  valor: string;
  detalhe: string;
  icon: typeof Warehouse;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{titulo}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{valor}</div>
        <p className="text-xs text-muted-foreground">{detalhe}</p>
      </CardContent>
    </Card>
  );
}

export default function MultiWarehouseDashboardPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { filiais, loading, error, refetch, isRefetching } = useMultiWarehouseDashboard();

  const resumo = useMemo(() => totais(filiais), [filiais]);
  const taxaGlobal = resumo.posicoes > 0 ? (resumo.ocupadas * 100) / resumo.posicoes : 0;
  const filiaisAtivas = useMemo(() => filiais.filter((f) => f.ativo).length, [filiais]);
  const filiaisSemDados = useMemo(
    () => filiais.filter((f) => f.total_posicoes === 0 && f.total_lotes === 0).length,
    [filiais]
  );

  const seo = (
    <SEO
      title={t("dashboard.multiWarehouse.seoTitle")}
      description={t("dashboard.multiWarehouse.seoDescription")}
    />
  );

  if (loading) {
    return (
      <>
        {seo}
        <div className="container mx-auto space-y-6 p-6">
          <Skeleton className="h-10 w-80" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {seo}
        <div className="container mx-auto p-6">
          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" aria-hidden="true" />
                {t("dashboard.multiWarehouse.errorTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {error.message || t("dashboard.multiWarehouse.errorUnknown")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("dashboard.multiWarehouse.errorPermission")}
              </p>
              <Button onClick={() => void refetch()} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                {t("dashboard.multiWarehouse.retry")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (filiais.length === 0) {
    return (
      <>
        {seo}
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
              <h2 className="text-lg font-semibold">{t("dashboard.multiWarehouse.emptyTitle")}</h2>
              <p className="max-w-md text-sm text-muted-foreground">
                {t("dashboard.multiWarehouse.emptyDescription")}
              </p>
              <Button onClick={() => navigate("/armazens")}>
                {t("dashboard.multiWarehouse.goToWarehouses")}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      {seo}
      <div className="container mx-auto space-y-6 p-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <Building2 className="h-6 w-6 text-primary" aria-hidden="true" />
              {t("dashboard.multiWarehouse.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.multiWarehouse.subtitle")}
            </p>
          </div>
          <Button variant="outline" onClick={() => void refetch()} disabled={isRefetching}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            {t("dashboard.multiWarehouse.refresh")}
          </Button>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            titulo={t("dashboard.multiWarehouse.branches")}
            valor={formatNumber(filiais.length)}
            detalhe={[
              t("dashboard.multiWarehouse.branchesActive", { active: filiaisAtivas }),
              filiaisSemDados > 0
                ? t("dashboard.multiWarehouse.branchesNoData", { count: filiaisSemDados })
                : null,
            ]
              .filter(Boolean)
              .join(" - ")}
            icon={Building2}
          />
          <KpiCard
            titulo={t("dashboard.multiWarehouse.globalOccupancy")}
            valor={formatPercent(taxaGlobal)}
            detalhe={t("dashboard.multiWarehouse.occupancyDetail", {
              occupied: formatNumber(resumo.ocupadas),
              total: formatNumber(resumo.posicoes),
            })}
            icon={Warehouse}
          />
          <KpiCard
            titulo={t("dashboard.multiWarehouse.consolidatedStock")}
            valor={formatNumber(resumo.quantidade)}
            detalhe={t("dashboard.multiWarehouse.lotsDetail", { count: resumo.lotes })}
            icon={Layers}
          />
          <KpiCard
            titulo={t("dashboard.multiWarehouse.operationalPendings")}
            valor={formatNumber(resumo.pedidosPendentes + resumo.tarefasAbertas)}
            detalhe={t("dashboard.multiWarehouse.pendingsDetail", {
              orders: formatNumber(resumo.pedidosPendentes),
              tasks: formatNumber(resumo.tarefasAbertas),
            })}
            icon={ListTodo}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filiais.map((filial) => (
            <Card key={filial.armazem_id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{filial.nome}</CardTitle>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" aria-hidden="true" />
                      {filial.cidade || t("dashboard.multiWarehouse.noCity")}
                      {filial.estado ? ` / ${filial.estado}` : ""}
                    </p>
                  </div>
                  <Badge variant={filial.ativo ? "default" : "secondary"}>
                    {filial.ativo
                      ? t("dashboard.multiWarehouse.active")
                      : t("dashboard.multiWarehouse.inactive")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("dashboard.multiWarehouse.occupancy")}</span>
                    <span className="font-medium text-foreground">
                      {formatPercent(filial.taxa_ocupacao)}
                    </span>
                  </div>
                  <Progress value={Math.min(filial.taxa_ocupacao, 100)} className="h-2" />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("dashboard.multiWarehouse.positionsDetail", {
                      occupied: formatNumber(filial.posicoes_ocupadas),
                      total: formatNumber(filial.total_posicoes),
                    })}
                  </p>
                </div>
                <dl className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-muted-foreground">{t("dashboard.multiWarehouse.lots")}</dt>
                    <dd className="font-semibold">{formatNumber(filial.total_lotes)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t("dashboard.multiWarehouse.units")}</dt>
                    <dd className="font-semibold">{formatNumber(filial.quantidade_estoque)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">
                      {t("dashboard.multiWarehouse.pendingOrders")}
                    </dt>
                    <dd className="font-semibold">{formatNumber(filial.orders_pendentes)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">
                      {t("dashboard.multiWarehouse.openTasks")}
                    </dt>
                    <dd className="font-semibold">{formatNumber(filial.tarefas_abertas)}</dd>
                  </div>
                </dl>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-auto justify-between"
                  onClick={() => navigate(`/armazens/${filial.armazem_id}`)}
                >
                  {t("dashboard.multiWarehouse.viewBranch")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              {t("dashboard.multiWarehouse.comparative")}
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("dashboard.multiWarehouse.colBranch")}</TableHead>
                  <TableHead>{t("dashboard.multiWarehouse.colLocation")}</TableHead>
                  <TableHead className="text-right">
                    {t("dashboard.multiWarehouse.colPositions")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("dashboard.multiWarehouse.colOccupied")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("dashboard.multiWarehouse.colOccupancy")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("dashboard.multiWarehouse.colLots")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("dashboard.multiWarehouse.colUnits")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("dashboard.multiWarehouse.colPendingOrders")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("dashboard.multiWarehouse.colOpenTasks")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filiais.map((filial) => (
                  <TableRow key={filial.armazem_id}>
                    <TableCell className="font-medium">
                      {filial.codigo} - {filial.nome}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {filial.cidade || "-"}
                      {filial.estado ? ` / ${filial.estado}` : ""}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(filial.total_posicoes)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(filial.posicoes_ocupadas)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPercent(filial.taxa_ocupacao)}
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(filial.total_lotes)}</TableCell>
                    <TableCell className="text-right">
                      {formatNumber(filial.quantidade_estoque)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(filial.orders_pendentes)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(filial.tarefas_abertas)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
