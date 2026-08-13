import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  BarChart3,
  AlertTriangle,
  History,
  QrCode,
  MoreHorizontal,
  ArrowUpRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProductCardProps {
  produto: {
    id: string;
    nome: string;
    sku: string;
    categoria?: string;
    estoque_atual: number;
    estoque_minimo: number;
    curva_abc?: string;
    imagem_url?: string;
  };
  onViewDetails?: (id: string) => void;
}

export function ProductCardAvancado({ produto, onViewDetails }: ProductCardProps) {
  const isLowStock = produto.estoque_atual <= (produto.estoque_minimo || 0);
  const stockProgress = Math.min(
    100,
    (produto.estoque_atual / ((produto.estoque_minimo || 1) * 2)) * 100
  );

  return (
    <Card
      className={`group overflow-hidden transition-all hover:shadow-lg ${isLowStock ? "border-destructive/30" : ""}`}
    >
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-muted">
        {produto.imagem_url ? (
          <img
            src={produto.imagem_url}
            alt={produto.nome}
            className="h-full w-full object-cover transition-transform group-hover:scale-110"
          />
        ) : (
          <Package className="h-16 w-16 text-muted-foreground/20" />
        )}
        <div className="absolute left-2 top-2 flex gap-1">
          <Badge
            className={
              produto.curva_abc === "A"
                ? "bg-success"
                : produto.curva_abc === "B"
                  ? "bg-primary"
                  : "bg-secondary"
            }
          >
            Curva {produto.curva_abc || "C"}
          </Badge>
        </div>
        <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <QrCode className="mr-2 h-4 w-4" /> Gerar Etiqueta
              </DropdownMenuItem>
              <DropdownMenuItem>
                <History className="mr-2 h-4 w-4" /> Ver Histórico
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BarChart3 className="mr-2 h-4 w-4" /> Analisar Demanda
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardHeader className="p-4 pb-2">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {produto.sku}
        </p>
        <CardTitle className="line-clamp-1 text-sm">{produto.nome}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 p-4 pt-0">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase text-muted-foreground">Estoque Disponível</p>
            <p className={`text-xl font-bold ${isLowStock ? "text-destructive" : "text-primary"}`}>
              {produto.estoque_atual}
              <span className="ml-1 text-xs font-normal text-muted-foreground">un</span>
            </p>
          </div>
          {isLowStock && (
            <Badge variant="destructive" className="flex animate-pulse items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Crítico
            </Badge>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span>Nível de Segurança</span>
            <span>{produto.estoque_minimo} un</span>
          </div>
          <Progress
            value={stockProgress}
            className={`h-1 ${isLowStock ? "bg-destructive/20" : ""}`}
          />
        </div>
      </CardContent>

      <CardFooter className="border-t bg-muted/30 p-2">
        <Button
          variant="ghost"
          className="flex h-8 w-full items-center justify-between text-xs"
          onClick={() => onViewDetails?.(produto.id)}
        >
          Ver detalhes
          <ArrowUpRight className="h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}
