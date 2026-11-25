import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, CalendarDays, Mail, MapPin, Phone, ShoppingCart, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, PageLoader } from "@/components/common/AsyncStates";

type Cliente = {
  id: string;
  nome: string;
  cpf_cnpj: string | null;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  ativo: boolean;
  created_at: string | null;
  updated_at: string | null;
};

type Pedido = {
  id: string;
  codigo: string;
  status: string;
  data_prometida: string | null;
  created_at: string;
};

const STATUS_PEDIDO: Record<string, string> = {
  pendente: "Pendente",
  em_separacao: "Em separação",
  embalagem: "Embalagem",
  aguardando_transporte: "Aguardando transporte",
  enviado: "Enviado",
  cancelado: "Cancelado",
};

const CAMPOS_PEDIDO = "id, codigo, status, data_prometida, created_at";

function formatarData(valor: string | null | undefined) {
  if (!valor) return "—";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "—";
  return format(data, "dd/MM/yyyy", { locale: ptBR });
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const clienteQuery = useQuery({
    queryKey: ["cliente", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", id as string)
        .maybeSingle();
      if (error) throw error;
      return (data as Cliente | null) ?? null;
    },
  });

  const cliente = clienteQuery.data ?? null;

  const pedidosQuery = useQuery({
    queryKey: ["cliente-pedidos", id, cliente?.nome],
    enabled: Boolean(id && cliente?.nome),
    queryFn: async () => {
      const porId = await supabase
        .from("orders")
        .select(CAMPOS_PEDIDO)
        .eq("cliente_id", id as string);
      if (porId.error) throw porId.error;

      const porNome = await supabase
        .from("orders")
        .select(CAMPOS_PEDIDO)
        .eq("cliente_nome", cliente?.nome as string);
      if (porNome.error) throw porNome.error;

      const unicos = new Map<string, Pedido>();
      [...(porId.data ?? []), ...(porNome.data ?? [])].forEach((pedido) => {
        unicos.set(pedido.id, pedido as Pedido);
      });
      return [...unicos.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
  });

  const pedidos = useMemo(() => pedidosQuery.data ?? [], [pedidosQuery.data]);

  if (!id) {
    return (
      <div className="space-y-4 p-6">
        <EmptyState
          title="Cliente inválido"
          description="O endereço acessado não contém o identificador de um cliente."
          action={
            <Button variant="outline" onClick={() => navigate("/clientes")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para clientes
            </Button>
          }
        />
      </div>
    );
  }

  if (clienteQuery.isLoading) {
    return <PageLoader message="Carregando cliente..." />;
  }

  if (clienteQuery.isError) {
    return (
      <ErrorState
        message={(clienteQuery.error as Error)?.message}
        onRetry={() => void clienteQuery.refetch()}
      />
    );
  }

  if (!cliente) {
    return (
      <div className="space-y-4 p-6">
        <EmptyState
          title="Cliente não encontrado"
          description="O cliente pode ter sido removido ou o identificador está incorreto."
          action={
            <Button variant="outline" onClick={() => navigate("/clientes")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para clientes
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 -ml-2 gap-1"
            onClick={() => navigate("/clientes")}
          >
            <ArrowLeft className="h-4 w-4" />
            Clientes
          </Button>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Users className="h-6 w-6" />
            {cliente.nome}
          </h1>
          <p className="text-sm text-muted-foreground">
            {cliente.cpf_cnpj || "CPF/CNPJ não informado"}
          </p>
        </div>
        <Badge variant={cliente.ativo ? "default" : "secondary"}>
          {cliente.ativo ? "Ativo" : "Inativo"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contato e endereço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {cliente.email || "E-mail não informado"}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {cliente.telefone || "Telefone não informado"}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {cliente.endereco || "Endereço não informado"}
            </p>
            <p className="pl-6 text-muted-foreground">
              {[cliente.cidade, cliente.estado].filter(Boolean).join("/") || "Cidade não informada"}
              {cliente.cep ? ` · CEP ${cliente.cep}` : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              Cadastrado em {formatarData(cliente.created_at)}
            </p>
            <p className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              Última alteração em {formatarData(cliente.updated_at)}
            </p>
            <p className="text-muted-foreground">Identificador: {cliente.id}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="h-4 w-4" />
            Pedidos do cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pedidosQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando pedidos...</p>
          ) : pedidosQuery.isError ? (
            <ErrorState
              message={(pedidosQuery.error as Error)?.message}
              onRetry={() => void pedidosQuery.refetch()}
            />
          ) : pedidos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum pedido vinculado a este cliente. Pedidos antigos podem ter sido registrados
              apenas com o nome do cliente.
            </p>
          ) : (
            <div className="divide-y">
              {pedidos.map((pedido) => (
                <Link
                  key={pedido.id}
                  to={`/pedidos/${pedido.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm hover:bg-muted/50"
                >
                  <span className="font-medium">{pedido.codigo}</span>
                  <Badge variant="secondary">{STATUS_PEDIDO[pedido.status] ?? pedido.status}</Badge>
                  <span className="text-muted-foreground">
                    Prometido para {formatarData(pedido.data_prometida)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
