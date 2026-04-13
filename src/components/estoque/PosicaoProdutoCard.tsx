import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Package, Barcode, Truck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProdutoDetalhes {
  nome: string;
  descricao?: string;
  sku: string;
  unidade?: string;
  curva_abc?: string;
  peso_unitario?: number;
  fornecedor_principal?: string;
}

interface PosicaoProdutoCardProps {
  produto: ProdutoDetalhes;
  quantidade: number;
  diasArmazenado: number;
}

export function PosicaoProdutoCard({ produto, quantidade, diasArmazenado }: PosicaoProdutoCardProps) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Package className="h-4 w-4" />Produto Armazenado
        </div>
        <div className="space-y-3">
          <div>
            <p className="font-semibold text-lg">{produto.nome}</p>
            {produto.descricao && <p className="text-sm text-muted-foreground">{produto.descricao}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Barcode className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground">SKU</span>
                <p className="font-mono font-medium">{produto.sku}</p>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Quantidade</span>
              <p className="font-bold text-lg">{quantidade} {produto.unidade || 'un'}</p>
            </div>
            {produto.curva_abc && (
              <div>
                <span className="text-muted-foreground">Curva ABC</span>
                <Badge variant="outline" className="ml-2">{produto.curva_abc}</Badge>
              </div>
            )}
            {produto.peso_unitario && (
              <div>
                <span className="text-muted-foreground">Peso Unitário</span>
                <p className="font-medium">{produto.peso_unitario} kg</p>
              </div>
            )}
          </div>
          {produto.fornecedor_principal && (
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Fornecedor:</span>
              <span className="font-medium">{produto.fornecedor_principal}</span>
            </div>
          )}
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Armazenado há</span>
            </div>
            <Badge className={cn(
              diasArmazenado > 30
                ? "bg-warning/10 text-warning border-warning/30"
                : "bg-muted text-muted-foreground"
            )}>
              {diasArmazenado} dias
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
