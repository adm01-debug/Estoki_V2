import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { KanbanBoard, type KanbanColumn } from "@/components/ui/kanban/KanbanBoard";
import { orderService } from "@/services/orderService";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, ErrorState, PageLoader } from "@/components/common/AsyncStates";
import {
  podeTransicionar,
  ROTULO_STATUS_PEDIDO,
  pedidoFormSchema,
  type PedidoStatus,
} from "@/lib/schemas/pedidoFormSchema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, ShoppingCart, Clock, User, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type PedidoItem = {
  id: string;
  produto_id: string | null;
  quantidade: number;
  quantidade_atendida: number | null;
};

type Pedido = {
  id: string;
  codigo: string;
  cliente_nome: string;
  status: PedidoStatus | null;
  prioridade: number | null;
  created_at: string | null;
  data_prometida: string | null;
  observacoes: string | null;
  itens?: PedidoItem[] | null;
};

type Produto = { id: string; nome: string; sku: string | null };
type Armazem = { id: string; codigo: string; nome: string };

const COLUNAS: KanbanColumn[] = [
  { id: "pendente", title: "Pendente", color: "bg-slate-400" },
  { id: "em_separacao", title: "Picking", color: "bg-blue-500" },
  { id: "embalagem", title: "Embalagem", color: "bg-purple-500" },
  { id: "aguardando_transporte", title: "Expedição", color: "bg-orange-500" },
  { id: "enviado", title: "Enviado", color: "bg-success" },
  { id: "cancelado", title: "Cancelado", color: "bg-destructive" },
];

const LIMITE_PEDIDOS = 500;

const ITEM_VAZIO = { produto_id: "", quantidade: 1 };
const FORM_VAZIO = {
  codigo: "",
  cliente_nome: "",
  prioridade: 1,
  data_prometida: "",
  observacoes: "",
  warehouse_id: "",
};

function mensagemDeErro(erro: unknown): string {
  const texto = erro instanceof Error ? erro.message : String(erro);
  if (texto.includes("duplicate key") || texto.includes("orders_codigo_key")) {
    return "Já existe um pedido com esse código.";
  }
  return texto;
}

export default function OrdersPage() {
  const qc = useQueryClient();
  const [dialogAberto, setDialogAberto] = useState(false);
  const [form, setForm] = useState({ ...FORM_VAZIO });
  const [itens, setItens] = useState<{ produto_id: string; quantidade: number }[]>([
    { ...ITEM_VAZIO },
  ]);

  const pedidosQuery = useQuery({
    queryKey: ["pedidos"],
    queryFn: async () => {
      const resultado = await orderService.getAll({ pageSize: LIMITE_PEDIDOS });
      return { pedidos: (resultado.data ?? []) as unknown as Pedido[], total: resultado.total };
    },
  });

  const produtosQuery = useQuery({
    queryKey: ["produtos-para-pedido"],
    enabled: dialogAberto,
    queryFn: async () => {
      const { data, error } = await supabase.from("produtos").select("id, nome, sku").order("nome");
      if (error) throw error;
      return (data ?? []) as Produto[];
    },
  });

  const armazensQuery = useQuery({
    queryKey: ["armazens-para-pedido"],
    enabled: dialogAberto,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("armazens")
        .select("id, codigo, nome")
        .eq("ativo", true)
        .order("codigo");
      if (error) throw error;
      return (data ?? []) as Armazem[];
    },
  });

  const mover = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PedidoStatus }) =>
      orderService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      toast.success("Status do pedido atualizado");
    },
    onError: (erro: Error) => toast.error(mensagemDeErro(erro)),
  });

  const criar = useMutation({
    mutationFn: async () => {
      const validado = pedidoFormSchema.safeParse({ ...form, itens });
      if (!validado.success) throw new Error(validado.error.issues[0].message);

      const valor = validado.data;
      return orderService.create(
        {
          codigo: valor.codigo,
          cliente_nome: valor.cliente_nome,
          prioridade: valor.prioridade,
          status: "pendente",
          data_prometida: valor.data_prometida ? valor.data_prometida : null,
          observacoes: valor.observacoes ? valor.observacoes : null,
          ...(valor.warehouse_id ? { warehouse_id: valor.warehouse_id } : {}),
        },
        valor.itens.map((item) => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
        }))
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      toast.success("Pedido criado");
      setDialogAberto(false);
      setForm({ ...FORM_VAZIO });
      setItens([{ ...ITEM_VAZIO }]);
    },
    onError: (erro: Error) => toast.error(mensagemDeErro(erro)),
  });

  const pedidos = pedidosQuery.data?.pedidos ?? [];
  const total = pedidosQuery.data?.total ?? 0;

  const aoMover = (itemId: string, novaColuna: string) => {
    const pedido = pedidos.find((p) => p.id === itemId);
    if (!pedido) return;
    const atual = pedido.status ?? "pendente";
    if (!podeTransicionar(atual, novaColuna)) {
      toast.error(
        `Transição não permitida: ${ROTULO_STATUS_PEDIDO[atual]} → ${
          ROTULO_STATUS_PEDIDO[novaColuna as PedidoStatus] ?? novaColuna
        }`
      );
      return;
    }
    mover.mutate({ id: itemId, status: novaColuna as PedidoStatus });
  };

  const atualizarItem = (
    indice: number,
    dados: Partial<{ produto_id: string; quantidade: number }>
  ) => {
    setItens((atual) => atual.map((item, i) => (i === indice ? { ...item, ...dados } : item)));
  };

  return (
    <AppLayout title="Gestão de Pedidos" showBack>
      <PageTransition>
        <div className="space-y-6 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Pedidos de Saída</h2>
              <p className="text-sm text-muted-foreground">
                Acompanhe o fluxo de vendas e expedição
              </p>
            </div>
            <Button className="gap-2" onClick={() => setDialogAberto(true)}>
              <Plus className="h-4 w-4" /> Novo Pedido
            </Button>
          </div>

          {pedidosQuery.isLoading ? (
            <PageLoader />
          ) : pedidosQuery.isError ? (
            <ErrorState
              message={mensagemDeErro(pedidosQuery.error)}
              onRetry={() => pedidosQuery.refetch()}
            />
          ) : pedidos.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart className="h-8 w-8 text-muted-foreground" />}
              title="Nenhum pedido cadastrado"
              description="Crie o primeiro pedido para acompanhar separação, embalagem e expedição."
              action={
                <Button className="gap-2" onClick={() => setDialogAberto(true)}>
                  <Plus className="h-4 w-4" /> Novo Pedido
                </Button>
              }
            />
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Mostrando {pedidos.length} de {total} pedidos.
              </p>
              <KanbanBoard
                columns={COLUNAS}
                items={pedidos.map((pedido) => ({
                  id: pedido.id,
                  columnId: pedido.status ?? "pendente",
                  title: pedido.codigo,
                  description: pedido.cliente_nome,
                  priority:
                    (pedido.prioridade ?? 1) >= 3
                      ? "critical"
                      : (pedido.prioridade ?? 1) >= 2
                        ? "high"
                        : "medium",
                  tags: [`${pedido.itens?.length ?? 0} itens`],
                }))}
                onMoveItem={aoMover}
                renderItem={(item) => {
                  const pedido = pedidos.find((p) => p.id === item.id);
                  if (!pedido) return null;
                  return (
                    <Card className="group shadow-xs transition-all hover:border-primary/50">
                      <CardContent className="space-y-3 p-4">
                        <div className="flex items-start justify-between">
                          <span className="font-mono text-sm font-bold text-primary">
                            {pedido.codigo}
                          </span>
                          {(pedido.prioridade ?? 1) >= 2 && (
                            <Badge variant="destructive" className="h-4 px-1 text-[9px]">
                              URGENTE
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span className="line-clamp-1">{pedido.cliente_nome}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {pedido.created_at
                                ? format(new Date(pedido.created_at), "dd MMM HH:mm", {
                                    locale: ptBR,
                                  })
                                : "—"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t pt-2">
                          <span className="text-[10px] font-bold tracking-tighter text-muted-foreground uppercase">
                            {pedido.itens?.length ?? 0} Itens
                          </span>
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px]"
                          >
                            <Link
                              to={`/pedidos/${pedido.id}`}
                              aria-label={`Gerenciar ${pedido.codigo}`}
                            >
                              Gerenciar
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }}
              />
            </>
          )}
        </div>

        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Pedido</DialogTitle>
              <DialogDescription>
                O pedido entra como Pendente e segue o fluxo do kanban.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (criar.isPending) return;
                criar.mutate();
              }}
            >
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="pedido-codigo">Código</Label>
                    <Input
                      id="pedido-codigo"
                      value={form.codigo}
                      onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                      placeholder="PED-20261201-001"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="pedido-cliente">Cliente</Label>
                    <Input
                      id="pedido-cliente"
                      value={form.cliente_nome}
                      onChange={(e) => setForm({ ...form, cliente_nome: e.target.value })}
                      placeholder="Nome do cliente"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="pedido-prioridade">Prioridade</Label>
                    <Select
                      value={String(form.prioridade)}
                      onValueChange={(valor) => setForm({ ...form, prioridade: Number(valor) })}
                    >
                      <SelectTrigger id="pedido-prioridade">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Normal</SelectItem>
                        <SelectItem value="2">Alta</SelectItem>
                        <SelectItem value="3">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="pedido-data">Data prometida</Label>
                    <Input
                      id="pedido-data"
                      type="date"
                      value={form.data_prometida}
                      onChange={(e) => setForm({ ...form, data_prometida: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="pedido-filial">Filial</Label>
                    <Select
                      value={form.warehouse_id || "sem-filial"}
                      onValueChange={(valor) =>
                        setForm({ ...form, warehouse_id: valor === "sem-filial" ? "" : valor })
                      }
                    >
                      <SelectTrigger id="pedido-filial">
                        <SelectValue placeholder="Sem filial" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sem-filial">Sem filial</SelectItem>
                        {(armazensQuery.data ?? []).map((armazem) => (
                          <SelectItem key={armazem.id} value={armazem.id}>
                            {armazem.codigo} · {armazem.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="pedido-observacoes">Observações</Label>
                    <Input
                      id="pedido-observacoes"
                      value={form.observacoes}
                      onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Itens</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => setItens([...itens, { ...ITEM_VAZIO }])}
                    >
                      <Plus className="h-3 w-3" /> Item
                    </Button>
                  </div>

                  {itens.map((item, indice) => (
                    <div key={indice} className="flex items-center gap-2">
                      <Select
                        value={item.produto_id || "sem-produto"}
                        onValueChange={(valor) =>
                          atualizarItem(indice, {
                            produto_id: valor === "sem-produto" ? "" : valor,
                          })
                        }
                      >
                        <SelectTrigger
                          aria-label={`Produto do item ${indice + 1}`}
                          className="flex-1"
                        >
                          <SelectValue placeholder="Produto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sem-produto">Selecione o produto</SelectItem>
                          {(produtosQuery.data ?? []).map((produto) => (
                            <SelectItem key={produto.id} value={produto.id}>
                              {produto.sku ? `${produto.sku} · ${produto.nome}` : produto.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        aria-label={`Quantidade do item ${indice + 1}`}
                        type="number"
                        min={1}
                        className="w-24"
                        value={item.quantidade}
                        onChange={(e) =>
                          atualizarItem(indice, { quantidade: Number(e.target.value) })
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remover item ${indice + 1}`}
                        disabled={itens.length === 1}
                        onClick={() => setItens(itens.filter((_, i) => i !== indice))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogAberto(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={criar.isPending}>
                  Criar pedido
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageTransition>
    </AppLayout>
  );
}
