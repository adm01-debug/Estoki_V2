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
  ArrowUpRight
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
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
  const stockProgress = Math.min(100, (produto.estoque_atual / ((produto.estoque_minimo || 1) * 2)) * 100);

  return (
    <Card className={`group overflow-hidden transition-all hover:shadow-lg ${isLowStock ? 'border-destructive/30' : ''}`}>
      <div className="relative h-40 bg-muted flex items-center justify-center overflow-hidden">
        {produto.imagem_url ? (
          <img 
            src={produto.imagem_url} 
            alt={produto.nome} 
            className="w-full h-full object-cover transition-transform group-hover:scale-110" 
          />
        ) : (
          <Package className="h-16 w-16 text-muted-foreground/20" />
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          <Badge className={
            produto.curva_abc === 'A' ? 'bg-success' : 
            produto.curva_abc === 'B' ? 'bg-primary' : 'bg-secondary'
          }>
            Curva {produto.curva_abc || 'C'}
          </Badge>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="secondary" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end">
               <DropdownMenuItem><QrCode className="h-4 w-4 mr-2" /> Gerar Etiqueta</DropdownMenuItem>
               <DropdownMenuItem><History className="h-4 w-4 mr-2" /> Ver Histórico</DropdownMenuItem>
               <DropdownMenuItem><BarChart3 className="h-4 w-4 mr-2" /> Analisar Demanda</DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
        </div>
      </div>
      
      <CardHeader className="p-4 pb-2">
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{produto.sku}</p>
        <CardTitle className="text-sm line-clamp-1">{produto.nome}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 space-y-4">
        <div className="flex justify-between items-end">
           <div>
              <p className="text-[10px] text-muted-foreground uppercase">Estoque Disponível</p>
              <p className={`text-xl font-bold ${isLowStock ? 'text-destructive' : 'text-primary'}`}>
                {produto.estoque_atual} 
                <span className="text-xs font-normal text-muted-foreground ml-1">un</span>
              </p>
           </div>
           {isLowStock && (
              <Badge variant="destructive" className="flex items-center gap-1 animate-pulse">
                <AlertTriangle className="h-3 w-3" /> Crítico
              </Badge>
           )}
        </div>
        
        <div className="space-y-1">
           <div className="flex justify-between text-[10px]">
              <span>Nível de Segurança</span>
              <span>{produto.estoque_minimo} un</span>
           </div>
           <Progress value={stockProgress} className={`h-1 ${isLowStock ? 'bg-destructive/20' : ''}`} />
        </div>
      </CardContent>
      
      <CardFooter className="p-2 border-t bg-muted/30">
         <Button variant="ghost" className="w-full text-xs h-8 flex items-center justify-between" onClick={() => onViewDetails?.(produto.id)}>
            Ver detalhes
            <ArrowUpRight className="h-3 w-3" />
         </Button>
      </CardFooter>
    </Card>
  );
}