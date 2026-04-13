import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tag, Calendar, AlertTriangle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LoteDetalhes {
  numero_lote: string;
  quantidade_inicial: number;
  quantidade_atual: number;
  data_recebimento: string;
  data_validade?: string;
  data_fabricacao?: string;
  fornecedor?: string;
  nf_entrada?: string;
  pedido_compra?: string;
  status: string;
}

interface PosicaoLoteCardProps {
  lote: LoteDetalhes;
  diasParaVencer: number | null;
}

export function PosicaoLoteCard({ lote, diasParaVencer }: PosicaoLoteCardProps) {
  return (
    <Card className={cn(diasParaVencer !== null && diasParaVencer <= 30 && "border-warning")}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Tag className="h-4 w-4" />Informações do Lote
          </div>
          {diasParaVencer !== null && diasParaVencer <= 30 && (
            <Badge variant="outline" className="border-warning text-warning gap-1">
              <AlertTriangle className="h-3 w-3" />Vence em {diasParaVencer} dias
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Número do Lote</span>
            <p className="font-mono font-medium">{lote.numero_lote}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Status</span>
            <Badge variant="outline" className="capitalize">{lote.status.replace('_', ' ')}</Badge>
          </div>
          <div>
            <span className="text-muted-foreground">Qtd. Inicial</span>
            <p className="font-medium">{lote.quantidade_inicial}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Qtd. Atual</span>
            <p className="font-medium">{lote.quantidade_atual}</p>
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="text-muted-foreground">Recebimento</span>
              <p className="font-medium">{format(new Date(lote.data_recebimento), 'dd/MM/yyyy', { locale: ptBR })}</p>
            </div>
          </div>
          {lote.data_validade && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground">Validade</span>
                <p className={cn("font-medium", diasParaVencer !== null && diasParaVencer <= 30 && "text-warning")}>
                  {format(new Date(lote.data_validade), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            </div>
          )}
          {lote.data_fabricacao && (
            <div>
              <span className="text-muted-foreground">Fabricação</span>
              <p className="font-medium">{format(new Date(lote.data_fabricacao), 'dd/MM/yyyy', { locale: ptBR })}</p>
            </div>
          )}
          {lote.fornecedor && (
            <div>
              <span className="text-muted-foreground">Fornecedor</span>
              <p className="font-medium">{lote.fornecedor}</p>
            </div>
          )}
        </div>
        {(lote.nf_entrada || lote.pedido_compra) && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-3 text-sm">
              {lote.nf_entrada && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">NF Entrada</span>
                    <p className="font-mono font-medium">{lote.nf_entrada}</p>
                  </div>
                </div>
              )}
              {lote.pedido_compra && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Pedido Compra</span>
                    <p className="font-mono font-medium">{lote.pedido_compra}</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
