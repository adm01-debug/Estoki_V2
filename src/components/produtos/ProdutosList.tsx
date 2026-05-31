import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Package, Eye } from "lucide-react";
import type { ReactNode } from "react";
import type { Produto } from "@/types/product";

interface Props {
  produtos: Produto[];
  onSelect: (p: Produto) => void;
  getCurvaBadge: (curva?: string | null) => ReactNode;
}

export const ProdutosList = memo(({ produtos, onSelect, getCurvaBadge }: Props) => {
  if (produtos.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhum produto encontrado</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-3">
      {produtos.map((produto) => (
        <motion.div
          key={produto.id}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card
            className="cursor-pointer transition-colors hover:border-primary/50"
            onClick={() => onSelect(produto)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="truncate font-semibold">{produto.nome}</p>
                    {getCurvaBadge(produto.curva_abc)}
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>SKU: {produto.sku}</span>
                    {produto.unidade && <span>Unidade: {produto.unidade}</span>}
                    {produto.peso_unitario && <span>{produto.peso_unitario}kg</span>}
                  </div>
                </div>
                <Eye className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
});

ProdutosList.displayName = "ProdutosList";
