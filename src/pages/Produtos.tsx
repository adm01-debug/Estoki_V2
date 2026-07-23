import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Filter, X, Download } from "lucide-react";
import { RouteLoadingFallback } from "@/components/common/RouteLoadingFallback";
import { useProdutos } from "@/hooks/useProdutos";
import { ProdutosStats } from "@/components/produtos/ProdutosStats";
import { ProdutoFormDialog } from "@/components/produtos/ProdutoFormDialog";
import { ProdutoDetailDialog } from "@/components/produtos/ProdutoDetailDialog";
import type { Produto } from "@/types/product";
import { ProductGrid } from "@/components/produtos/ProductGrid";
import { BulkImportDialog } from "@/components/produtos/BulkImportDialog";
import { useDebounce } from "@/hooks/useDebounce";
import { type ProdutoFormData } from "@/components/produtos/produtoSchema";

export default function ProdutosPage() {
  const { produtos, loading: productsLoading, createProduto, stats } = useProdutos();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [isSearching, setIsSearching] = useState(false);
  const [curvaFilter, setCurvaFilter] = useState<string>("todos");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);

  useEffect(() => {
    if (search !== debouncedSearch) {
      setIsSearching(true);
    } else {
      const timer = setTimeout(() => setIsSearching(false), 200);
      return () => clearTimeout(timer);
    }
  }, [search, debouncedSearch]);

  const handleSave = async (data: ProdutoFormData) => {
    await createProduto.mutateAsync(
      {
        ...data,
        descricao: data.descricao || null,
        peso_unitario: data.peso_unitario || null,
        fornecedor_principal: data.fornecedor_principal || null,
      },
      {
        onSuccess: () => {
          setShowAddDialog(false);
        },
      }
    );
  };

  const filtered = useMemo(() => {
    return produtos.filter((p) => {
      const matchSearch =
        !search ||
        p.nome.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCurva = curvaFilter === "todos" || p.curva_abc === curvaFilter;
      return matchSearch && matchCurva;
    });
  }, [produtos, search, curvaFilter]);

  const handleExport = () => {
    const headers = [
      "SKU",
      "Nome",
      "Unidade",
      "Curva ABC",
      "Estoque Min",
      "Estoque Max",
      "Fornecedor",
    ];
    const rows = filtered.map((p) => [
      p.sku,
      p.nome,
      p.unidade,
      p.curva_abc || "",
      p.estoque_minimo,
      p.estoque_maximo,
      p.fornecedor_principal || "",
    ]);
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `produtos_estoki_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCurvaBadge = (curva?: string | null) => {
    switch (curva) {
      case "A":
        return <Badge className="bg-primary text-primary-foreground">Curva A</Badge>;
      case "B":
        return <Badge variant="secondary">Curva B</Badge>;
      case "C":
        return <Badge variant="outline">Curva C</Badge>;
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Sem curva
          </Badge>
        );
    }
  };

  if (productsLoading) {
    return (
      <AppLayout title="Produtos" showBack>
        <RouteLoadingFallback type="table" />
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
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={handleExport}
            title="Exportar CSV"
          >
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
        <div className="space-y-4 p-4">
          <ProdutosStats
            total={stats.total}
            curvaA={stats.curvaA}
            curvaB={stats.curvaB}
            curvaC={stats.curvaC}
          />

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou SKU..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setSearch("")}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <Select value={curvaFilter} onValueChange={setCurvaFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="A">Curva A</SelectItem>
                <SelectItem value="B">Curva B</SelectItem>
                <SelectItem value="C">Curva C</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ProductGrid
            produtos={filtered}
            loading={isSearching}
            onSelect={setSelectedProduto}
            getCurvaBadge={getCurvaBadge}
          />
        </div>
      </PageTransition>

      <ProdutoFormDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        saving={createProduto.isPending}
        onSave={handleSave}
      />

      <ProdutoDetailDialog
        produto={selectedProduto}
        onClose={() => setSelectedProduto(null)}
        getCurvaBadge={getCurvaBadge}
      />
    </AppLayout>
  );
}
