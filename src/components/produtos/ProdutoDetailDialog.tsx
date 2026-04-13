import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Produto {
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
}

interface ProdutoDetailDialogProps {
  produto: Produto | null;
  onClose: () => void;
}

const getCurvaBadge = (curva?: string) => {
  switch (curva) {
    case "A": return <Badge className="bg-primary text-primary-foreground">Curva A</Badge>;
    case "B": return <Badge variant="secondary">Curva B</Badge>;
    case "C": return <Badge variant="outline">Curva C</Badge>;
    default: return <Badge variant="outline" className="text-muted-foreground">Sem curva</Badge>;
  }
};

export function ProdutoDetailDialog({ produto, onClose }: ProdutoDetailDialogProps) {
  return (
    <Dialog open={!!produto} onOpenChange={() => onClose()}>
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
              <div className="col-span-2"><span className="text-muted-foreground">Fornecedor:</span> <span className="font-medium">{produto.fornecedor_principal || "-"}</span></div>
            </div>
            {produto.descricao && (
              <div className="text-sm">
                <span className="text-muted-foreground">Descrição:</span>
                <p className="font-medium mt-1">{produto.descricao}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
