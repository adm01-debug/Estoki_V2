import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { exigirLinhaAfetada } from "@/lib/exigirLinhaAfetada";
import {
  categoriaSchema,
  errosPorCampo,
  ICONES_CATEGORIA,
  type IconeCategoria,
} from "@/lib/validations/cadastros";
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
  Tag,
  Plus,
  Pencil,
  Trash2,
  Search,
  RotateCcw,
  AlertCircle,
  Coffee,
  Shirt,
  Pen,
  Book,
  KeyRound,
  Briefcase,
  CupSoda,
  Smartphone,
  Package,
  Box,
  Gift,
  Palette,
  Laptop,
  Home,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

type Categoria = {
  id: string;
  nome: string;
  descricao: string | null;
  cor: string | null;
  icone: string | null;
  ativo: boolean;
};

const ICONES: Record<IconeCategoria, LucideIcon> = {
  Tag,
  Coffee,
  Shirt,
  Pen,
  Book,
  KeyRound,
  Briefcase,
  CupSoda,
  Smartphone,
  Package,
  Box,
  Gift,
  Palette,
  Laptop,
  Home,
};

const FORM_VAZIO = {
  nome: "",
  descricao: "",
  cor: "#3B82F6",
  icone: "Tag" as IconeCategoria,
};

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showInativos, setShowInativos] = useState(false);
  const [confirmando, setConfirmando] = useState<Categoria | null>(null);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [form, setForm] = useState(FORM_VAZIO);

  const {
    data: categorias = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["categorias"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categorias").select("*").order("nome");
      if (error) throw error;
      return data as Categoria[];
    },
  });

  const save = useMutation({
    mutationFn: async (payload: typeof FORM_VAZIO) => {
      if (editing) {
        const resultado = await supabase
          .from("categorias")
          .update(payload)
          .eq("id", editing.id)
          .select("id");
        exigirLinhaAfetada(resultado, "editar a categoria");
      } else {
        const { error } = await supabase.from("categorias").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categorias"] });
      toast.success(editing ? "Categoria atualizada" : "Categoria criada");
      setShowForm(false);
      setEditing(null);
      setErros({});
      setForm(FORM_VAZIO);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const desativar = useMutation({
    mutationFn: async (categoria: Categoria) => {
      const resultado = await supabase
        .from("categorias")
        .update({ ativo: false })
        .eq("id", categoria.id)
        .select("id");
      exigirLinhaAfetada(resultado, "desativar a categoria");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categorias"] });
      toast.success("Categoria desativada (os produtos continuam vinculados)");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reativar = useMutation({
    mutationFn: async (categoria: Categoria) => {
      const resultado = await supabase
        .from("categorias")
        .update({ ativo: true })
        .eq("id", categoria.id)
        .select("id");
      exigirLinhaAfetada(resultado, "reativar a categoria");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categorias"] });
      toast.success("Categoria reativada");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const termo = search.toLowerCase();
  const filtered = categorias.filter(
    (c) => (showInativos || c.ativo) && c.nome.toLowerCase().includes(termo)
  );

  const openEdit = (c: Categoria) => {
    setEditing(c);
    setErros({});
    setForm({
      nome: c.nome,
      descricao: c.descricao || "",
      cor: c.cor || "#3B82F6",
      icone: (ICONES_CATEGORIA as readonly string[]).includes(c.icone ?? "")
        ? (c.icone as IconeCategoria)
        : "Tag",
    });
    setShowForm(true);
  };

  const submit = () => {
    const parsed = categoriaSchema.safeParse(form);
    if (!parsed.success) {
      const mapa = errosPorCampo(parsed.error);
      setErros(mapa);
      toast.error(Object.values(mapa)[0] ?? "Confira os campos da categoria");
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
            <Tag className="h-6 w-6" />
            Categorias
          </h1>
          <p className="text-sm text-muted-foreground">Gerencie as categorias de produtos</p>
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
          Nova Categoria
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Editar" : "Nova"} Categoria</CardTitle>
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
                type="color"
                aria-label="Cor"
                value={form.cor}
                onChange={(e) => setForm({ ...form, cor: e.target.value })}
                className="h-10"
              />
              <Input
                placeholder="Descrição"
                aria-label="Descrição"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="col-span-2"
              />
              <select
                aria-label="Ícone"
                value={form.icone}
                onChange={(e) => setForm({ ...form, icone: e.target.value as IconeCategoria })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {ICONES_CATEGORIA.map((icone) => (
                  <option key={icone} value={icone}>
                    {icone}
                  </option>
                ))}
              </select>
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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar categorias..."
            aria-label="Buscar categorias"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Switch checked={showInativos} onCheckedChange={setShowInativos} />
          Mostrar inativas
        </label>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : isError ? (
        <div role="alert" className="rounded-md border border-destructive/40 p-4 text-sm">
          <p className="mb-2 text-destructive">
            Não foi possível carregar as categorias: {(error as Error).message}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const Icone = ICONES[(c.icone ?? "Tag") as IconeCategoria] ?? Tag;
            return (
              <Card key={c.id} className={c.ativo ? undefined : "opacity-60"}>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded"
                        style={{ backgroundColor: c.cor || "#3B82F6" }}
                      >
                        <Icone className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{c.nome}</h3>
                        {!c.ativo && <Badge variant="secondary">Inativa</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-1">
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
                  <p className="text-sm text-muted-foreground">{c.descricao}</p>
                </CardContent>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <p className="col-span-full py-8 text-center text-muted-foreground">
              Nenhuma categoria encontrada
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
              A categoria deixa de aparecer nas listas e seleções de produtos. Os produtos já
              vinculados continuam com a categoria registrada — nada é apagado. Você pode reativar
              depois.
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
