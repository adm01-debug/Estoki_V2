import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LoteKanban } from "./types";

interface LoteDetailDialogProps {
  lote: LoteKanban | null;
  open: boolean;
  onClose: () => void;
}

export function LoteDetailDialog({ lote, open, onClose }: LoteDetailDialogProps) {
  if (!lote) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Lote {lote.numero_lote}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Produto</p>
              <p className="text-sm font-medium">{lote.produto?.nome || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">SKU</p>
              <p className="text-sm font-medium">{lote.produto?.sku || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fornecedor</p>
              <p className="text-sm font-medium">{lote.fornecedor || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">NF Entrada</p>
              <p className="text-sm font-medium">{lote.nf_entrada || "—"}</p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Qtd. Inicial</p>
              <p className="text-sm font-medium">{lote.quantidade_inicial} un</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Qtd. Atual</p>
              <p className="text-sm font-medium">{lote.quantidade_atual} un</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Recebimento</p>
              <p className="text-sm font-medium">{format(new Date(lote.data_recebimento), "dd/MM/yyyy", { locale: ptBR })}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Validade</p>
              <p className="text-sm font-medium">{lote.data_validade ? format(new Date(lote.data_validade), "dd/MM/yyyy", { locale: ptBR }) : "—"}</p>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge className="mt-1">{lote.status}</Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
