import { useState, useEffect, useMemo } from "react";
import { SEO } from "@/components/common/SEO";
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
import { Search, Plus, Filter, X, Download, AlertCircle } from "lucide-react";
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
import { exportRowsToCSV } from "@/lib/export";

const PAGE_SIZE = 50;

export default function ProdutosPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [isSearching, setIsSearching] = useState(false);
  const [curvaFilter, setCurvaFilter] = useState<string>("todos");
  const [page, setPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);

  const {
    produtos,
    total,
    loading: productsLoading,
    isFetching,
    error,
    refetch,
    createProduto,
    updateProduto,
    stats,
  } = useProdutos({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    curva: curvaFilter,
  });

  useEffect(() => {
    if (search !== debouncedSearch) {
      setIsSearching(true);
    } else {
      const timer = setTimeout(() => setIsSearching(false), 200);
      return () => clearTimeout(timer);
    }
  }, [search, debouncedSearch]);

  const initialData = useMemo<Partial<ProdutoFormData> | undefined>(() => {
    if (!editingProduto) return undefined;
    return {
      sku: editingProduto.sku,
      nome: editingProduto.nome,
      descricao: editingProduto.descricao ?? "",
      unidade: editingProduto.unidade ?? "UN",
      estoque_minimo: editingProduto.estoque_minimo ?? 0,
      estoque_maximo: editingProduto.estoque_maximo ?? 0,
      ponto_pedido: editingProduto.ponto_pedido ?? 0,
      peso_unitario: editingProduto.peso_unitario ?? 0,
      fornecedor_principal: editingProduto.fornecedor_principal ?? "",
    };
  }, [editingProduto]);

  const handleSave = async (data: ProdutoFormData) => {
    const payload = {
      ...data,
      descricao: data.descricao || null,
      peso_unitario: data.peso_unitario || null,
      fornecedor_principal: data.fornecedor_principal || null,
    };

    if (editingProduto) {
      await updateProduto.mutateAsync(
        { id: editingProduto.id, ...payload },
        {
          onSuccess: () => {
            setEditingProduto(null);
            setSelectedProduto(null);
          },
        }
      );
      return;
    }

    await createProduto.mutateAsync(payload, {
      onSuccess: () => {
        setShowAddDialog(false);
      },
    });
  };

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
    const rows = produtos.map((p) => [
      p.sku,
      p.nome,
      p.unidade,
      p.curva_abc || "",
      p.estoque_minimo,
      p.estoque_maximo,
      p.fornecedor_principal || "",
    ]);
    exportRowsToCSV(headers, rows, `produtos_estoki_${new Date().toISOString().split("T")[0]}`);
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

  const primeiro = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const ultimo = Math.min(page * PAGE_SIZE, total);

  return (
    <>
      <SEO
        title="Produtos"
        path="/produtos"
        description="Cadastro e gestão de produtos, SKUs e categorias no ESTOKI WMS."
      />
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
              disabled={produtos.length === 0}
              title="Exportar a página atual em CSV"
            >
              <Download className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:inline">Exportar</span>
            </Button>
            <Button size="sm" className="gap-2" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:inline">Novo Produto</span>
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
                  aria-label="Buscar por nome ou SKU"
                  placeholder="Buscar por nome ou SKU..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
                {search && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                    }}
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
              <Select
                value={curvaFilter}
                onValueChange={(valor) => {
                  setCurvaFilter(valor);
                  setPage(1);
                }}
              >
                <SelectTrigger aria-label="Filtrar por curva ABC" className="w-[130px]">
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

            {error && (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
                <span className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  Não foi possível carregar os produtos.
                </span>
                <Button size="sm" variant="outline" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              </div>
            )}

            <ProductGrid
              produtos={produtos}
              loading={isSearching || isFetching}
              onSelect={setSelectedProduto}
              getCurvaBadge={getCurvaBadge}
            />

            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
              <span data-testid="produtos-contagem">
                {total === 0
                  ? "Nenhum produto encontrado"
                  : `Mostrando ${primeiro}–${ultimo} de ${total}`}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((atual) => Math.max(1, atual - 1))}
                >
                  Anterior
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={ultimo >= total}
                  onClick={() => setPage((atual) => atual + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </div>
        </PageTransition>

        <ProdutoFormDialog
          open={showAddDialog || !!editingProduto}
          onOpenChange={(aberto) => {
            if (!aberto) {
              setShowAddDialog(false);
              setEditingProduto(null);
            }
          }}
          initialData={initialData}
          saving={createProduto.isPending || updateProduto.isPending}
          onSave={handleSave}
        />

        <ProdutoDetailDialog
          produto={selectedProduto}
          onClose={() => setSelectedProduto(null)}
          getCurvaBadge={getCurvaBadge}
          onEdit={(produto) => {
            setEditingProduto(produto);
            setSelectedProduto(null);
          }}
        />
      </AppLayout>
    </>
  );
}
