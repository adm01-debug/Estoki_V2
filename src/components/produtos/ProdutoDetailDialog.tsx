import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";

export interface Produto {
  id: string;
  sku: string;
  nome: string;
  descricao?: string;
  unidade?: string;
  curva_abc?: string;
  estoque_minimo?: number;
  estoque_maximo?: number;
  ponto_pedido?: number;
  peso_unitario?: number;
  fornecedor_principal?: string;
  giro_mensal?: number;
  created_at: string;
}

interface Props {
  produto: Produto | null;
  onClose: () => void;
  getCurvaBadge: (curva?: string) => ReactNode;
}

export function ProdutoDetailDialog({ produto, onClose, getCurvaBadge }: Props) {
  return (
    <Dialog open={!!produto} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{produto?.nome}</DialogTitle></DialogHeader>
        {produto && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">SKU:</span> <span className="font-medium">{produto.sku}</span></div>
              <div><span className="text-muted-foreground">Unidade:</span> <span className="font-medium">{produto.unidade || "-"}</span></div>
              <div><span className="text-muted-foreground">Curva ABC:</span> {getCurvaBadge(produto.curva_abc)}</div>
              <div><span className="text-muted-foreground">Peso:</span> <span className="font-medium">{produto.peso_unitario ? `${produto.peso_unitario}kg` : "-"}</span></div>
              <div><span className="text-muted-foreground">Est. Mínimo:</span> <span className="font-medium">{produto.estoque_minimo ?? "-"}</span></div>
              <div><span className="text-muted-foreground">Est. Máximo:</span> <span className="font-medium">{produto.estoque_maximo ?? "-"}</span></div>
              <div><span className="text-muted-foreground">Ponto Pedido:</span> <span className="font-medium">{produto.ponto_pedido ?? "-"}</span></div>
              <div><span className="text-muted-foreground">Giro Mensal:</span> <span className="font-medium">{produto.giro_mensal ?? "-"}</span></div>
            </div>
            {produto.descricao && (
              <div>
                <span className="text-sm text-muted-foreground">Descrição:</span>
                <p className="text-sm mt-1">{produto.descricao}</p>
              </div>
            )}
            {produto.fornecedor_principal && (
              <div>
                <span className="text-sm text-muted-foreground">Fornecedor:</span>
                <p className="text-sm font-medium mt-1">{produto.fornecedor_principal}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
