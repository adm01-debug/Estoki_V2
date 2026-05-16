import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, TrendingUp, Target, Search, Filter, ArrowUpDown } from "lucide-react";
import { ProdutoABC, ClassificacaoABC } from "@/features/analytics/hooks/useCurvaABC";

const curvaConfig: Record<ClassificacaoABC, { label: string; textColor: string }> = {
  A: { label: "Curva A", textColor: "text-green-600" },
  B: { label: "Curva B", textColor: "text-amber-600" },
  C: { label: "Curva C", textColor: "text-blue-600" },
};

interface ABCProductListProps {
  produtos: ProdutoABC[];
}

export function ABCProductList({ produtos }: ABCProductListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [curvaFilter, setCurvaFilter] = useState<string>("todos");
  const [sortBy, setSortBy] = useState<"valor" | "giro" | "estoque">("valor");

  const produtosFiltrados = useMemo(() => {
    return produtos
      .filter(p => {
        const matchSearch = 
          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.nome.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCurva = curvaFilter === "todos" || p.classificacao_final === curvaFilter;
        return matchSearch && matchCurva;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "valor": return b.valor_total - a.valor_total;
          case "giro": return b.giro_mensal - a.giro_mensal;
          case "estoque": return b.quantidade_estoque - a.quantidade_estoque;
          default: return 0;
        }
      });
  }, [produtos, searchTerm, curvaFilter, sortBy]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar produto ou SKU..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
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
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="w-[140px]"><ArrowUpDown className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="valor">Por Valor</SelectItem>
            <SelectItem value="giro">Por Giro</SelectItem>
            <SelectItem value="estoque">Por Estoque</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {produtosFiltrados.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum produto encontrado</p>
          </div>
        ) : (
          produtosFiltrados.slice(0, 50).map((p) => (
            <Card key={p.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={curvaConfig[p.classificacao_final].textColor}>
                        {curvaConfig[p.classificacao_final].label}
                      </Badge>
                      <span className="font-mono text-sm font-semibold">{p.sku}</span>
                    </div>
                    <h3 className="font-medium">{p.nome}</h3>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center"><Package className="h-3.5 w-3.5 mr-1" />{p.quantidade_estoque} un</span>
                      <span className="flex items-center"><TrendingUp className="h-3.5 w-3.5 mr-1" />{p.giro_mensal}/mês</span>
                      <span className="flex items-center"><Target className="h-3.5 w-3.5 mr-1" />{p.dias_cobertura} dias</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">R$ {p.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-muted-foreground font-mono">{p.percentual_acumulado.toFixed(1)}% acumulado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}