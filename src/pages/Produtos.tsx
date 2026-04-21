import { useState, useMemo, useEffect } from "react";
import { produtoSchema, validateForm } from "@/lib/validations";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus, Filter, X } from "lucide-react";
import { ProdutosStats } from "@/components/produtos/ProdutosStats";
import { ProdutoFormDialog, ProdutoFormData } from "@/components/produtos/ProdutoFormDialog";
import { ProdutoDetailDialog, Produto } from "@/components/produtos/ProdutoDetailDialog";
import { ProdutosList } from "@/components/produtos/ProdutosList";

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [curvaFilter, setCurvaFilter] = useState<string>("todos");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [formData, setFormData] = useState<ProdutoFormData>({
    sku: "", nome: "", descricao: "", unidade: "UN",
    estoque_minimo: 0, estoque_maximo: 0, ponto_pedido: 0,
    peso_unitario: 0, fornecedor_principal: "",
  });
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => { loadProdutos(); }, []);

  const loadProdutos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("produtos").select("*").order("nome");
      if (error) throw error;
      setProdutos((data || []) as Produto[]);
    } catch (err) {
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const validation = validateForm(produtoSchema, formData);
    if (!validation.success) { setFormErrors(validation.errors); return; }
    setFormErrors({});
    try {
      setSaving(true);
      const { error } = await supabase.from("produtos").insert({
        sku: formData.sku, nome: formData.nome,
        descricao: formData.descricao || null,
        unidade: formData.unidade,
        estoque_minimo: formData.estoque_minimo,
        estoque_maximo: formData.estoque_maximo,
        ponto_pedido: formData.ponto_pedido,
        peso_unitario: formData.peso_unitario || null,
        fornecedor_principal: formData.fornecedor_principal || null,
      });
      if (error) throw error;
      toast.success("Produto cadastrado com sucesso!");
      setShowAddDialog(false);
      setFormData({ sku: "", nome: "", descricao: "", unidade: "UN", estoque_minimo: 0, estoque_maximo: 0, ponto_pedido: 0, peso_unitario: 0, fornecedor_principal: "" });
      setFormErrors({});
      loadProdutos();
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : String(err)) || "Erro ao salvar produto");
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    return produtos.filter((p) => {
      const matchSearch = !search || p.nome.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCurva = curvaFilter === "todos" || p.curva_abc === curvaFilter;
      return matchSearch && matchCurva;
    });
  }, [produtos, search, curvaFilter]);

  const stats = useMemo(() => {
    const total = produtos.length;
    const curvaA = produtos.filter((p) => p.curva_abc === "A").length;
    const curvaB = produtos.filter((p) => p.curva_abc === "B").length;
    const curvaC = produtos.filter((p) => p.curva_abc === "C").length;
    return { total, curvaA, curvaB, curvaC };
  }, [produtos]);

  const getCurvaBadge = (curva?: string) => {
    switch (curva) {
      case "A": return <Badge className="bg-primary text-primary-foreground">Curva A</Badge>;
      case "B": return <Badge variant="secondary">Curva B</Badge>;
      case "C": return <Badge variant="outline">Curva C</Badge>;
      default: return <Badge variant="outline" className="text-muted-foreground">Sem curva</Badge>;
    }
  };

  if (loading) {
    return (
      <AppLayout title="Produtos" showBack>
        <PageTransition>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
              ))}
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-20 w-full" /></CardContent></Card>
            ))}
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Produtos"
      showBack
      rightAction={
        <Button size="sm" className="gap-2" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo Produto</span>
        </Button>
      }
    >
      <PageTransition>
        <div className="p-4 space-y-4">
          <ProdutosStats total={stats.total} curvaA={stats.curvaA} curvaB={stats.curvaB} curvaC={stats.curvaC} />

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou SKU..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
              {search && (
                <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearch("")}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <Select value={curvaFilter} onValueChange={setCurvaFilter}>
              <SelectTrigger className="w-[130px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="A">Curva A</SelectItem>
                <SelectItem value="B">Curva B</SelectItem>
                <SelectItem value="C">Curva C</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ProdutosList produtos={filtered} onSelect={setSelectedProduto} getCurvaBadge={getCurvaBadge} />
        </div>
      </PageTransition>

      <ProdutoFormDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        saving={saving}
        onSave={handleSave}
      />

      <ProdutoDetailDialog produto={selectedProduto} onClose={() => setSelectedProduto(null)} getCurvaBadge={getCurvaBadge} />
    </AppLayout>
  );
}
