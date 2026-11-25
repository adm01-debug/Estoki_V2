import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { exigirLinhaAfetada } from "@/lib/exigirLinhaAfetada";
import { clienteSchema, errosPorCampo, UFS } from "@/lib/validations/cadastros";
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
  Users,
  Plus,
  Pencil,
  Trash2,
  Search,
  Mail,
  Phone,
  MapPin,
  Eye,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

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
};

const FORM_VAZIO = {
  nome: "",
  cpf_cnpj: "",
  email: "",
  telefone: "",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
};

export default function CustomersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showInativos, setShowInativos] = useState(false);
  const [confirmando, setConfirmando] = useState<Cliente | null>(null);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [form, setForm] = useState(FORM_VAZIO);

  const {
    data: clientes = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clientes").select("*").order("nome");
      if (error) throw error;
      return data as Cliente[];
    },
  });

  const save = useMutation({
    mutationFn: async (payload: typeof FORM_VAZIO) => {
      if (editing) {
        const resultado = await supabase
          .from("clientes")
          .update(payload)
          .eq("id", editing.id)
          .select("id");
        exigirLinhaAfetada(resultado, "editar o cliente");
      } else {
        const { error } = await supabase.from("clientes").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientes"] });
      toast.success(editing ? "Cliente atualizado" : "Cliente criado");
      setShowForm(false);
      setEditing(null);
      setErros({});
      setForm(FORM_VAZIO);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const desativar = useMutation({
    mutationFn: async (cliente: Cliente) => {
      const resultado = await supabase
        .from("clientes")
        .update({ ativo: false })
        .eq("id", cliente.id)
        .select("id");
      exigirLinhaAfetada(resultado, "desativar o cliente");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente desativado (o histórico foi preservado)");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reativar = useMutation({
    mutationFn: async (cliente: Cliente) => {
      const resultado = await supabase
        .from("clientes")
        .update({ ativo: true })
        .eq("id", cliente.id)
        .select("id");
      exigirLinhaAfetada(resultado, "reativar o cliente");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente reativado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const termo = search.toLowerCase();
  const filtered = clientes.filter(
    (c) =>
      (showInativos || c.ativo) &&
      (c.nome.toLowerCase().includes(termo) || (c.cpf_cnpj || "").includes(search))
  );

  const openEdit = (c: Cliente) => {
    setEditing(c);
    setErros({});
    setForm({
      nome: c.nome,
      cpf_cnpj: c.cpf_cnpj || "",
      email: c.email || "",
      telefone: c.telefone || "",
      endereco: c.endereco || "",
      cidade: c.cidade || "",
      estado: c.estado || "",
      cep: c.cep || "",
    });
    setShowForm(true);
  };

  const submit = () => {
    const parsed = clienteSchema(editing?.cpf_cnpj).safeParse(form);
    if (!parsed.success) {
      const mapa = errosPorCampo(parsed.error);
      setErros(mapa);
      toast.error(Object.values(mapa)[0] ?? "Confira os campos do cliente");
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
            <Users className="h-6 w-6" />
            Clientes
          </h1>
          <p className="text-sm text-muted-foreground">Gerencie a base de clientes</p>
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
          Novo Cliente
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Editar" : "Novo"} Cliente</CardTitle>
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
                placeholder="Nome"
                aria-label="Nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
              <Input
                placeholder="CPF/CNPJ"
                aria-label="CPF ou CNPJ"
                value={form.cpf_cnpj}
                onChange={(e) => setForm({ ...form, cpf_cnpj: e.target.value })}
              />
              <Input
                placeholder="Email"
                aria-label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                placeholder="Telefone"
                aria-label="Telefone"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
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
            placeholder="Buscar clientes..."
            aria-label="Buscar clientes"
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
            Não foi possível carregar os clientes: {(error as Error).message}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} className={c.ativo ? undefined : "opacity-60"}>
              <CardContent className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <Link to={`/clientes/${c.id}`} className="font-semibold hover:underline">
                        {c.nome}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {c.cpf_cnpj}
                        {!c.ativo && <Badge variant="secondary">Inativo</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" asChild>
                      <Link to={`/clientes/${c.id}`} aria-label={`Ver detalhes de ${c.nome}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Editar ${c.nome}`}
                      onClick={() => openEdit(c)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {c.ativo ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Desativar ${c.nome}`}
                        onClick={() => setConfirmando(c)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Reativar ${c.nome}`}
                        onClick={() => reativar.mutate(c)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {c.email && (
                    <p className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {c.email}
                    </p>
                  )}
                  {c.telefone && (
                    <p className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {c.telefone}
                    </p>
                  )}
                  {c.endereco && (
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {c.cidade}/{c.estado}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-8 text-center text-muted-foreground">
              Nenhum cliente encontrado
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
              O cliente deixa de aparecer nas listas e seleções. Pedidos e movimentações já
              registrados continuam intactos — nada é apagado. Você pode reativar depois.
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
