import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { exigirLinhaAfetada } from "@/lib/exigirLinhaAfetada";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

type Categoria = {
  id: string;
  nome: string;
  descricao: string | null;
  cor: string | null;
  icone: string | null;
  ativo: boolean;
};

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    cor: "#3B82F6",
    icone: "Tag",
  });

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ["categorias"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categorias").select("*").order("nome");
      if (error) throw error;
      return data as Categoria[];
    },
  });

  const save = useMutation({
    mutationFn: async (payload: typeof form) => {
      if (editing) {
        const resultado = await supabase
          .from("categorias")
          .update({ ...payload, ativo: true })
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
      setForm({ nome: "", descricao: "", cor: "#3B82F6", icone: "Tag" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const resultado = await supabase.from("categorias").delete().eq("id", id).select("id");
      exigirLinhaAfetada(resultado, "remover a categoria");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categorias"] });
      toast.success("Categoria removida");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = categorias.filter((c) => c.nome.toLowerCase().includes(search.toLowerCase()));

  const openEdit = (c: Categoria) => {
    setEditing(c);
    setForm({
      nome: c.nome,
      descricao: c.descricao || "",
      cor: c.cor || "#3B82F6",
      icone: c.icone || "Tag",
    });
    setShowForm(true);
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
                save.mutate(form);
              }}
              className="grid grid-cols-2 gap-3"
            >
              <Input
                placeholder="Nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
              <Input
                type="color"
                value={form.cor}
                onChange={(e) => setForm({ ...form, cor: e.target.value })}
                className="h-10"
              />
              <Input
                placeholder="Descrição"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="col-span-2"
              />
              <Input
                placeholder="Ícone (lucide)"
                value={form.icone}
                onChange={(e) => setForm({ ...form, icone: e.target.value })}
              />
              <div className="col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit">{editing ? "Atualizar" : "Criar"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar categorias..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded"
                      style={{ backgroundColor: c.cor || "#3B82F6" }}
                    >
                      <Tag className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-semibold">{c.nome}</h3>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => confirm(`Remover "${c.nome}"?`) && remove.mutate(c.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{c.descricao}</p>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-8 text-center text-muted-foreground">
              Nenhuma categoria encontrada
            </p>
          )}
        </div>
      )}
    </div>
  );
}
