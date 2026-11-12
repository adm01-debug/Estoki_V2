import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Warehouse, Plus, Pencil, Trash2, Search, MapPin } from "lucide-react";
import { toast } from "sonner";

type Armazem = {
  id: string;
  codigo: string;
  nome: string;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  capacidade_total_kg: number | null;
  ativo: boolean;
};

export default function WarehousesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Armazem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    codigo: "",
    nome: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    capacidade_total_kg: 0,
  });

  const { data: armazens = [], isLoading } = useQuery({
    queryKey: ["armazens"],
    queryFn: async () => {
      const { data, error } = await supabase.from("armazens").select("*").order("codigo");
      if (error) throw error;
      return data as Armazem[];
    },
  });

  const save = useMutation({
    mutationFn: async (payload: typeof form) => {
      if (editing) {
        const { error } = await supabase
          .from("armazens")
          .update({ ...payload, ativo: true })
          .eq("id", editing.id);
        if (error) throw error;
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
      setForm({
        codigo: "",
        nome: "",
        endereco: "",
        cidade: "",
        estado: "",
        cep: "",
        capacidade_total_kg: 0,
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("armazens").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["armazens"] });
      toast.success("Armazém removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = armazens.filter(
    (a) =>
      a.nome.toLowerCase().includes(search.toLowerCase()) ||
      (a.codigo || "").toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (a: Armazem) => {
    setEditing(a);
    setForm({
      codigo: a.codigo,
      nome: a.nome,
      endereco: a.endereco || "",
      cidade: a.cidade || "",
      estado: a.estado || "",
      cep: a.cep || "",
      capacidade_total_kg: a.capacidade_total_kg || 0,
    });
    setShowForm(true);
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
                save.mutate(form);
              }}
              className="grid grid-cols-2 gap-3"
            >
              <Input
                placeholder="Código"
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                required
              />
              <Input
                placeholder="Nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
              <Input
                placeholder="Endereço"
                value={form.endereco}
                onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                className="col-span-2"
              />
              <Input
                placeholder="Cidade"
                value={form.cidade}
                onChange={(e) => setForm({ ...form, cidade: e.target.value })}
              />
              <Input
                placeholder="Estado"
                maxLength={2}
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value.toUpperCase() })}
              />
              <Input
                placeholder="CEP"
                value={form.cep}
                onChange={(e) => setForm({ ...form, cep: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Capacidade (kg)"
                value={form.capacidade_total_kg}
                onChange={(e) => setForm({ ...form, capacidade_total_kg: Number(e.target.value) })}
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
          placeholder="Buscar armazéns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Warehouse className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-semibold">{a.nome}</h3>
                      <p className="text-xs text-muted-foreground">{a.codigo}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(a)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => confirm(`Remover "${a.nome}"?`) && remove.mutate(a.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {a.endereco}, {a.cidade}/{a.estado}
                  </p>
                  <p>CEP: {a.cep}</p>
                  <p>Capacidade: {a.capacidade_total_kg?.toLocaleString("pt-BR")} kg</p>
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
    </div>
  );
}
