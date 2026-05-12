  import { useState, useMemo } from "react";
  import { AppLayout } from "@/components/layout/AppLayout";
  import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { Skeleton } from "@/components/ui/skeleton";
 import { Search, Plus, Filter, X, Download } from "lucide-react";
 import { useProdutos } from "@/hooks/useProdutos";
 import { produtoSchema, validateForm } from "@/lib/validations";
import { ProdutosStats } from "@/components/produtos/ProdutosStats";
import { ProdutoFormDialog, ProdutoFormData } from "@/components/produtos/ProdutoFormDialog";
import { ProdutoDetailDialog, Produto } from "@/components/produtos/ProdutoDetailDialog";
import { ProdutosList } from "@/components/produtos/ProdutosList";
import { BulkImportDialog } from "@/components/produtos/BulkImportDialog";

 export default function ProdutosPage() {
    const { produtos, loading, createProduto, stats } = useProdutos();
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

   const handleSave = async () => {
     const validation = validateForm(produtoSchema, formData);
     if (!validation.success) { setFormErrors(validation.errors); return; }
     setFormErrors({});
     await createProduto.mutateAsync({
       sku: formData.sku, 
       nome: formData.nome,
       descricao: formData.descricao || null,
       unidade: formData.unidade,
       estoque_minimo: formData.estoque_minimo,
       estoque_maximo: formData.estoque_maximo,
       ponto_pedido: formData.ponto_pedido,
       peso_unitario: formData.peso_unitario || null,
       fornecedor_principal: formData.fornecedor_principal || null,
     }, {
       onSuccess: () => {
         setShowAddDialog(false);
         setFormData({ sku: "", nome: "", descricao: "", unidade: "UN", estoque_minimo: 0, estoque_maximo: 0, ponto_pedido: 0, peso_unitario: 0, fornecedor_principal: "" });
         setFormErrors({});
       }
     });
   };

  const filtered = useMemo(() => {
    return produtos.filter((p) => {
      const matchSearch = !search || p.nome.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCurva = curvaFilter === "todos" || p.curva_abc === curvaFilter;
      return matchSearch && matchCurva;
    });
  }, [produtos, search, curvaFilter]);

   const handleExport = () => {
     const headers = ["SKU", "Nome", "Unidade", "Curva ABC", "Estoque Min", "Estoque Max", "Fornecedor"];
     const rows = filtered.map(p => [p.sku, p.nome, p.unidade, p.curva_abc || "", p.estoque_minimo, p.estoque_maximo, p.fornecedor_principal || ""]);
     const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
     const link = document.createElement("a");
     link.href = URL.createObjectURL(blob);
     link.setAttribute("download", `produtos_estoki_${new Date().toISOString().split('T')[0]}.csv`);
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
   };

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
         <div className="flex gap-2">
            <BulkImportDialog />
           <Button size="sm" variant="outline" className="gap-2" onClick={handleExport} title="Exportar CSV">
             <Download className="h-4 w-4" />
             <span className="hidden sm:inline">Exportar</span>
           </Button>
           <Button size="sm" className="gap-2" onClick={() => setShowAddDialog(true)}>
             <Plus className="h-4 w-4" />
             <span className="hidden sm:inline">Novo Produto</span>
           </Button>
         </div>
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
         saving={createProduto.isPending}
         onSave={handleSave}
       />

      <ProdutoDetailDialog produto={selectedProduto} onClose={() => setSelectedProduto(null)} getCurvaBadge={getCurvaBadge} />
    </AppLayout>
  );
}
