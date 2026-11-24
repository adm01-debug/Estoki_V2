import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ClipboardList, MapPin, Package, ShoppingCart, Warehouse } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, PageLoader } from "@/components/common/AsyncStates";

type Armazem = {
  id: string;
  codigo: string;
  nome: string;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  capacidade_total: number | null;
  ativo: boolean;
};

type Indicadores = {
  posicoes: number;
  posicoesOcupadas: number;
  pedidosAbertos: number;
  tarefasPendentes: number;
  lotes: number;
  pedidos: { id: string; codigo: string; status: string | null }[];
};

const STATUS_PEDIDO: Record<string, string> = {
  pendente: "Pendente",
  em_separacao: "Em separação",
  embalagem: "Embalagem",
  aguardando_transporte: "Aguardando transporte",
  enviado: "Enviado",
  cancelado: "Cancelado",
};

export default function WarehouseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const armazemQuery = useQuery({
    queryKey: ["armazem", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("armazens")
        .select("*")
        .eq("id", id as string)
        .maybeSingle();
      if (error) throw error;
      return (data as Armazem | null) ?? null;
    },
  });

  const armazem = armazemQuery.data ?? null;

  const indicadoresQuery = useQuery<Indicadores>({
    queryKey: ["armazem-indicadores", id],
    enabled: Boolean(id && armazem),
    queryFn: async () => {
      const armazemId = id as string;
      const [posicoes, ocupadas, pedidosAbertos, tarefas, lotes, pedidos] = await Promise.all([
        supabase
          .from("posicoes_estoque")
          .select("id", { count: "exact", head: true })
          .filter("warehouse_id", "eq", armazemId),
        supabase
          .from("posicoes_estoque")
          .select("id", { count: "exact", head: true })
          .filter("warehouse_id", "eq", armazemId)
          .eq("status", "ocupado"),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .filter("warehouse_id", "eq", armazemId)
          .neq("status", "enviado")
          .neq("status", "cancelado"),
        supabase
          .from("tarefas")
          .select("id", { count: "exact", head: true })
          .filter("warehouse_id", "eq", armazemId)
          .eq("status", "pendente"),
        supabase
          .from("lotes")
          .select("id", { count: "exact", head: true })
          .filter("warehouse_id", "eq", armazemId),
        supabase
          .from("orders")
          .select("id, codigo, status")
          .filter("warehouse_id", "eq", armazemId)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      if (posicoes.error) throw posicoes.error;
      if (ocupadas.error) throw ocupadas.error;
      if (pedidosAbertos.error) throw pedidosAbertos.error;
      if (tarefas.error) throw tarefas.error;
      if (lotes.error) throw lotes.error;
      if (pedidos.error) throw pedidos.error;

      return {
        posicoes: posicoes.count ?? 0,
        posicoesOcupadas: ocupadas.count ?? 0,
        pedidosAbertos: pedidosAbertos.count ?? 0,
        tarefasPendentes: tarefas.count ?? 0,
        lotes: lotes.count ?? 0,
        pedidos: pedidos.data ?? [],
      };
    },
  });

  if (!id) {
    return (
      <div className="space-y-4 p-6">
        <EmptyState
          title="Armazém inválido"
          description="O endereço acessado não contém o identificador de um armazém."
          action={
            <Button variant="outline" onClick={() => navigate("/armazens")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para armazéns
            </Button>
          }
        />
      </div>
    );
  }

  if (armazemQuery.isLoading) {
    return <PageLoader message="Carregando armazém..." />;
  }

  if (armazemQuery.isError) {
    return (
      <ErrorState
        message={(armazemQuery.error as Error)?.message}
        onRetry={() => void armazemQuery.refetch()}
      />
    );
  }

  if (!armazem) {
    return (
      <div className="space-y-4 p-6">
        <EmptyState
          title="Armazém não encontrado"
          description="O armazém pode ter sido removido ou o identificador está incorreto."
          action={
            <Button variant="outline" onClick={() => navigate("/armazens")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para armazéns
            </Button>
          }
        />
      </div>
    );
  }

  const indicadores = indicadoresQuery.data;
  const ocupacao =
    indicadores && indicadores.posicoes > 0
      ? Math.round((indicadores.posicoesOcupadas / indicadores.posicoes) * 100)
      : null;

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-2 gap-1"
            onClick={() => navigate("/armazens")}
          >
            <ArrowLeft className="h-4 w-4" />
            Armazéns
          </Button>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Warehouse className="h-6 w-6" />
            {armazem.nome}
          </h1>
          <p className="text-sm text-muted-foreground">Código {armazem.codigo}</p>
        </div>
        <Badge variant={armazem.ativo ? "default" : "secondary"}>
          {armazem.ativo ? "Ativo" : "Inativo"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Endereço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {armazem.endereco || "Endereço não informado"}
            </p>
            <p className="pl-6 text-muted-foreground">
              {[armazem.cidade, armazem.estado].filter(Boolean).join("/") || "Cidade não informada"}
              {armazem.cep ? ` · CEP ${armazem.cep}` : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Capacidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              {armazem.capacidade_total != null
                ? `${armazem.capacidade_total.toLocaleString("pt-BR")} kg`
                : "Capacidade não informada"}
            </p>
            <p className="text-muted-foreground">
              {ocupacao === null
                ? "Sem posições cadastradas para este armazém"
                : `Ocupação de posições: ${ocupacao}% (${indicadores?.posicoesOcupadas} de ${indicadores?.posicoes})`}
            </p>
          </CardContent>
        </Card>
      </div>

      {indicadoresQuery.isError ? (
        <ErrorState
          message={(indicadoresQuery.error as Error)?.message}
          onRetry={() => void indicadoresQuery.refetch()}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Posições</p>
              <p className="text-2xl font-bold">
                {indicadoresQuery.isLoading ? "…" : (indicadores?.posicoes ?? 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Posições ocupadas</p>
              <p className="text-2xl font-bold">
                {indicadoresQuery.isLoading ? "…" : (indicadores?.posicoesOcupadas ?? 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Pedidos em aberto</p>
              <p className="text-2xl font-bold">
                {indicadoresQuery.isLoading ? "…" : (indicadores?.pedidosAbertos ?? 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Tarefas pendentes</p>
              <p className="text-2xl font-bold">
                {indicadoresQuery.isLoading ? "…" : (indicadores?.tarefasPendentes ?? 0)}
              </p>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Lotes</p>
              <p className="text-2xl font-bold">
                {indicadoresQuery.isLoading ? "…" : (indicadores?.lotes ?? 0)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="h-4 w-4" />
            Últimos pedidos do armazém
          </CardTitle>
        </CardHeader>
        <CardContent>
          {indicadoresQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando pedidos...</p>
          ) : !indicadores || indicadores.pedidos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum pedido registrado para este armazém.
            </p>
          ) : (
            <div className="divide-y">
              {indicadores.pedidos.map((pedido) => (
                <Link
                  key={pedido.id}
                  to={`/pedidos/${pedido.id}`}
                  className="flex items-center justify-between gap-2 py-2 text-sm hover:bg-muted/50"
                >
                  <span className="font-medium">{pedido.codigo}</span>
                  <Badge variant="secondary">
                    {pedido.status ? (STATUS_PEDIDO[pedido.status] ?? pedido.status) : "—"}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => navigate("/pedidos")}
            >
              <ClipboardList className="h-4 w-4" />
              Ver todos os pedidos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
