import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { exigirLinhaAfetada } from "@/lib/exigirLinhaAfetada";
import { armazemSchema, errosPorCampo, UFS } from "@/lib/validations/cadastros";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Warehouse,
  Plus,
  Pencil,
  Trash2,
  Search,
  MapPin,
  Eye,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

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

type Vinculos = { posicoes: number; tarefas: number; pedidos: number };

const FORM_VAZIO = {
  codigo: "",
  nome: "",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
  capacidade_total: 0,
};

async function contarVinculosAtivos(armazemId: string): Promise<Vinculos> {
  const [posicoes, tarefas, pedidos] = await Promise.all([
    supabase
      .from("posicoes_estoque")
      .select("id", { count: "exact", head: true })
      .filter("warehouse_id", "eq", armazemId)
      .filter("status", "neq", "livre"),
    supabase
      .from("tarefas")
      .select("id", { count: "exact", head: true })
      .filter("warehouse_id", "eq", armazemId)
      .filter("status", "not.in", "(concluida,cancelada)"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .filter("warehouse_id", "eq", armazemId)
      .filter("status", "not.in", "(enviado,cancelado)"),
  ]);

  for (const resultado of [posicoes, tarefas, pedidos]) {
    if (resultado.error) throw resultado.error;
  }

  return {
    posicoes: posicoes.count ?? 0,
    tarefas: tarefas.count ?? 0,
    pedidos: pedidos.count ?? 0,
  };
}

function descreverVinculos(vinculos: Vinculos): string {
  return [
    vinculos.posicoes > 0 ? `${vinculos.posicoes} posição(ões) ocupada(s)` : null,
    vinculos.tarefas > 0 ? `${vinculos.tarefas} tarefa(s) em aberto` : null,
    vinculos.pedidos > 0 ? `${vinculos.pedidos} pedido(s) em andamento` : null,
  ]
    .filter(Boolean)
    .join(", ");
}

export default function WarehousesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Armazem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showInativos, setShowInativos] = useState(false);
  const [confirmando, setConfirmando] = useState<Armazem | null>(null);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [form, setForm] = useState(FORM_VAZIO);

  const {
    data: armazens = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["armazens"],
    queryFn: async () => {
      const { data, error } = await supabase.from("armazens").select("*").order("codigo");
      if (error) throw error;
      return data as Armazem[];
    },
  });

  const save = useMutation({
    mutationFn: async (payload: typeof FORM_VAZIO) => {
      if (editing) {
        const resultado = await supabase
          .from("armazens")
          .update(payload)
          .eq("id", editing.id)
          .select("id");
        exigirLinhaAfetada(resultado, "editar o armazém");
      } else {
        const { error } = await supabase.from("armazens").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["armazens"] });
      toast.success(editing ? "Armazém atualizado" : "Armazém criado");
      setShowForm(false);
      setEditing(null);
      setErros({});
      setForm(FORM_VAZIO);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const desativar = useMutation({
    mutationFn: async (armazem: Armazem) => {
      const vinculos = await contarVinculosAtivos(armazem.id);
      const total = vinculos.posicoes + vinculos.tarefas + vinculos.pedidos;
      if (total > 0) {
        throw new Error(
          `Não é possível desativar "${armazem.nome}": ${descreverVinculos(vinculos)}. ` +
            "Conclua ou mova esses registros antes."
        );
      }
      const resultado = await supabase
        .from("armazens")
        .update({ ativo: false })
        .eq("id", armazem.id)
        .select("id");
      exigirLinhaAfetada(resultado, "desativar o armazém");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["armazens"] });
      toast.success("Armazém desativado (o histórico foi preservado)");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reativar = useMutation({
    mutationFn: async (armazem: Armazem) => {
      const resultado = await supabase
        .from("armazens")
        .update({ ativo: true })
        .eq("id", armazem.id)
        .select("id");
      exigirLinhaAfetada(resultado, "reativar o armazém");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["armazens"] });
      toast.success("Armazém reativado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const termo = search.toLowerCase();
  const filtered = armazens.filter(
    (a) =>
      (showInativos || a.ativo) &&
      (a.nome.toLowerCase().includes(termo) || (a.codigo || "").toLowerCase().includes(termo))
  );

  const openEdit = (a: Armazem) => {
    setEditing(a);
    setErros({});
    setForm({
      codigo: a.codigo,
      nome: a.nome,
      endereco: a.endereco || "",
      cidade: a.cidade || "",
      estado: a.estado || "",
      cep: a.cep || "",
      capacidade_total: a.capacidade_total || 0,
    });
    setShowForm(true);
  };

  const submit = () => {
    const parsed = armazemSchema.safeParse(form);
    if (!parsed.success) {
      const mapa = errosPorCampo(parsed.error);
      setErros(mapa);
      toast.error(Object.values(mapa)[0] ?? "Confira os campos do armazém");
      return;
    }
    setErros({});
    save.mutate(parsed.data);
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Warehouse className="h-6 w-6" />
            Armazéns
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os armazéns e centros de distribuição
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setErros({});
            setForm(FORM_VAZIO);
            setShowForm(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Armazém
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Editar" : "Novo"} Armazém</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="grid grid-cols-2 gap-3"
            >
              <Input
                placeholder="Código (ex.: ARM-05)"
                aria-label="Código"
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
              />
              <Input
                placeholder="Nome"
                aria-label="Nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
              <Input
                placeholder="Endereço"
                aria-label="Endereço"
                value={form.endereco}
                onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                className="col-span-2"
              />
              <Input
                placeholder="Cidade"
                aria-label="Cidade"
                value={form.cidade}
                onChange={(e) => setForm({ ...form, cidade: e.target.value })}
              />
              <select
                aria-label="Estado (UF)"
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">UF</option>
                {UFS.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
              <Input
                placeholder="CEP (00000-000)"
                aria-label="CEP"
                value={form.cep}
                onChange={(e) => setForm({ ...form, cep: e.target.value })}
              />
              <Input
                type="number"
                min={0}
                placeholder="Capacidade (kg)"
                aria-label="Capacidade em kg"
                value={form.capacidade_total}
                onChange={(e) => setForm({ ...form, capacidade_total: Number(e.target.value) })}
              />
              {Object.keys(erros).length > 0 && (
                <div
                  role="alert"
                  className="col-span-2 space-y-1 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
                >
                  {Object.entries(erros).map(([campo, mensagem]) => (
                    <p key={campo} className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {mensagem}
                    </p>
                  ))}
                </div>
              )}
              <div className="col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={save.isPending}>
                  {editing ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar armazéns..."
            aria-label="Buscar armazéns"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Switch checked={showInativos} onCheckedChange={setShowInativos} />
          Mostrar inativos
        </label>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : isError ? (
        <div role="alert" className="rounded-md border border-destructive/40 p-4 text-sm">
          <p className="mb-2 text-destructive">
            Não foi possível carregar os armazéns: {(error as Error).message}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((a) => (
            <Card key={a.id} className={a.ativo ? undefined : "opacity-60"}>
              <CardContent className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Warehouse className="h-5 w-5 text-primary" />
                    <div>
                      <Link to={`/armazens/${a.id}`} className="font-semibold hover:underline">
                        {a.nome}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {a.codigo}
                        {!a.ativo && <Badge variant="secondary">Inativo</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" asChild>
                      <Link to={`/armazens/${a.id}`} aria-label={`Ver detalhes de ${a.nome}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Editar ${a.nome}`}
                      onClick={() => openEdit(a)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {a.ativo ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Desativar ${a.nome}`}
                        onClick={() => setConfirmando(a)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Reativar ${a.nome}`}
                        onClick={() => reativar.mutate(a)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {a.endereco}, {a.cidade}/{a.estado}
                  </p>
                  <p>CEP: {a.cep}</p>
                  <p>Capacidade: {a.capacidade_total?.toLocaleString("pt-BR")} kg</p>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-8 text-center text-muted-foreground">
              Nenhum armazém encontrado
            </p>
          )}
        </div>
      )}

      <AlertDialog
        open={confirmando !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setConfirmando(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar {confirmando?.nome}?</AlertDialogTitle>
            <AlertDialogDescription>
              O armazém deixa de aparecer nas listas e seleções de filial. Lotes, tarefas, posições
              e pedidos vinculados são preservados — nada é apagado do histórico. Armazéns com
              vínculos ativos não podem ser desativados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmando) desativar.mutate(confirmando);
                setConfirmando(null);
              }}
            >
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
