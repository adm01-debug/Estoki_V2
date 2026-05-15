import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Package, Eye } from "lucide-react";
import type { ReactNode } from "react";
import type { Produto } from "./ProdutoDetailDialog";

interface Props {
  produtos: Produto[];
  onSelect: (p: Produto) => void;
  getCurvaBadge: (curva?: string) => ReactNode;
}

export const ProdutosList = memo(({ produtos, onSelect, getCurvaBadge }: Props) => {
  if (produtos.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
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
          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => onSelect(produto)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold truncate">{produto.nome}</p>
                    {getCurvaBadge(produto.curva_abc)}
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>SKU: {produto.sku}</span>
                    {produto.unidade && <span>Unidade: {produto.unidade}</span>}
                    {produto.peso_unitario && <span>{produto.peso_unitario}kg</span>}
                  </div>
                </div>
                <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
});

ProdutosList.displayName = "ProdutosList";
