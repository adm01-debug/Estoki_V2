import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, CalendarDays, Package, ShoppingCart, User, Warehouse } from "lucide-react";
import { orderService } from "@/services/orderService";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, PageLoader } from "@/components/common/AsyncStates";

type ItemPedido = {
  id: string;
  quantidade: number;
  quantidade_atendida: number | null;
  produto: { nome: string; sku: string } | null;
};

type Pedido = {
  id: string;
  codigo: string;
  status: string;
  prioridade: number | null;
  cliente_id: string | null;
  cliente_nome: string | null;
  data_prometida: string | null;
  observacoes: string | null;
  warehouse_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  itens: ItemPedido[] | null;
};

const STATUS_PEDIDO: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pendente: { label: "Pendente", variant: "outline" },
  em_separacao: { label: "Em separação", variant: "secondary" },
  embalagem: { label: "Embalagem", variant: "secondary" },
  aguardando_transporte: { label: "Aguardando transporte", variant: "secondary" },
  enviado: { label: "Enviado", variant: "default" },
  cancelado: { label: "Cancelado", variant: "destructive" },
};

function formatarData(valor: string | null | undefined, comHora = false) {
  if (!valor) return "—";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "—";
  return format(data, comHora ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy", { locale: ptBR });
}

function formatarDataPrometida(valor: string | null) {
  if (!valor) return "—";
  const data = new Date(`${valor}T00:00:00`);
  if (Number.isNaN(data.getTime())) return "—";
  return format(data, "dd/MM/yyyy", { locale: ptBR });
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const pedidoQuery = useQuery({
    queryKey: ["pedido", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const data = (await orderService.getById(id as string)) as unknown as Pedido;
      return data;
    },
  });

  const pedido = pedidoQuery.data ?? null;

  const armazemQuery = useQuery({
    queryKey: ["pedido-armazem", pedido?.warehouse_id],
    enabled: Boolean(pedido?.warehouse_id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("armazens")
        .select("id, nome, codigo")
        .eq("id", pedido?.warehouse_id as string)
        .maybeSingle();
      if (error) throw error;
      return (data as { id: string; nome: string; codigo: string } | null) ?? null;
    },
  });

  if (!id) {
    return (
      <div className="space-y-4 p-6">
        <EmptyState
          title="Pedido inválido"
          description="O endereço acessado não contém o identificador de um pedido."
          action={
            <Button variant="outline" onClick={() => navigate("/pedidos")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para pedidos
            </Button>
          }
        />
      </div>
    );
  }

  if (pedidoQuery.isLoading) {
    return <PageLoader message="Carregando pedido..." />;
  }

  if (pedidoQuery.isError) {
    return (
      <ErrorState
        message={(pedidoQuery.error as Error)?.message}
        onRetry={() => void pedidoQuery.refetch()}
      />
    );
  }

  if (!pedido) {
    return (
      <div className="space-y-4 p-6">
        <EmptyState
          title="Pedido não encontrado"
          description="O pedido pode ter sido removido ou o identificador está incorreto."
          action={
            <Button variant="outline" onClick={() => navigate("/pedidos")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para pedidos
            </Button>
          }
        />
      </div>
    );
  }

  const itens = pedido.itens ?? [];
  const totalItens = itens.reduce((soma, item) => soma + (item.quantidade ?? 0), 0);
  const totalAtendido = itens.reduce((soma, item) => soma + (item.quantidade_atendida ?? 0), 0);
  const status = STATUS_PEDIDO[pedido.status];

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 -ml-2 gap-1"
            onClick={() => navigate("/pedidos")}
          >
            <ArrowLeft className="h-4 w-4" />
            Pedidos
          </Button>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <ShoppingCart className="h-6 w-6" />
            {pedido.codigo}
          </h1>
          <p className="text-sm text-muted-foreground">
            Criado em {formatarData(pedido.created_at, true)} · Atualizado em{" "}
            {formatarData(pedido.updated_at, true)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status?.variant ?? "secondary"}>{status?.label ?? pedido.status}</Badge>
          {pedido.prioridade != null && (
            <Badge variant="outline">Prioridade {pedido.prioridade}</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              {pedido.cliente_nome || "Cliente não informado"}
            </p>
            {pedido.cliente_id ? (
              <Link to={`/clientes/${pedido.cliente_id}`} className="text-primary underline">
                Ver cadastro do cliente
              </Link>
            ) : (
              <p className="text-muted-foreground">
                Sem cadastro de cliente vinculado; o nome foi informado livremente.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prazo e armazém</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              Prometido para {formatarDataPrometida(pedido.data_prometida)}
            </p>
            <p className="flex items-center gap-2">
              <Warehouse className="h-4 w-4 text-muted-foreground" />
              {armazemQuery.isLoading
                ? "Carregando armazém..."
                : armazemQuery.data
                  ? `${armazemQuery.data.nome} (${armazemQuery.data.codigo})`
                  : "Armazém não vinculado"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Atendimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              {totalAtendido} de {totalItens} unidades atendidas
            </p>
            <p className="text-muted-foreground">
              {itens.length === 1 ? "1 item no pedido" : `${itens.length} itens no pedido`}
            </p>
            {pedido.observacoes && (
              <p className="text-muted-foreground">Observações: {pedido.observacoes}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Itens</CardTitle>
        </CardHeader>
        <CardContent>
          {itens.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Este pedido ainda não tem itens cadastrados.
            </p>
          ) : (
            <div className="divide-y">
              {itens.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{item.produto?.nome ?? "Produto não encontrado"}</p>
                    <p className="text-xs text-muted-foreground">{item.produto?.sku ?? "—"}</p>
                  </div>
                  <span className="text-muted-foreground">
                    {item.quantidade_atendida ?? 0} / {item.quantidade} un.
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
