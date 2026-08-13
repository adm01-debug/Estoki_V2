import { useState, useEffect } from "react";
import { DataGrid } from "@/components/data/DataGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { productService } from "@/services/productService";
import type { Produto } from "@/types/product";
import { toast } from "sonner";
export default function ProductsPage() {
  const [products, setProducts] = useState<Produto[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadProducts();
  }, []);
  const loadProducts = async () => {
    try {
      const { data } = await productService.getAll();
      setProducts(data);
    } catch (e) {
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };
  const columns = [
    { key: "sku" as const, header: "SKU" },
    { key: "nome" as const, header: "Nome" },
    { key: "giro_mensal" as const, header: "Giro" },
    { key: "curva_abc" as const, header: "Curva" },
  ];
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <DataGrid data={products} columns={columns} />
    </div>
  );
}
