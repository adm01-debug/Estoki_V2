import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { LoteKanban } from "./types";

interface LoteCardProps {
  lote: LoteKanban;
  onClick: () => void;
}

export function LoteCard({ lote, onClick }: LoteCardProps) {
  const isOverdue = lote.data_validade && new Date(lote.data_validade) < new Date();
  const isDivergent = lote.quantidade_atual !== lote.quantidade_inicial;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
        onClick={onClick}
      >
        <CardContent className="p-3 space-y-2">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{lote.numero_lote}</p>
              <p className="text-xs text-muted-foreground truncate">
                {lote.produto?.nome || "Produto não vinculado"}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
              <Eye className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-1">
            {lote.fornecedor && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {lote.fornecedor}
              </Badge>
            )}
            {lote.nf_entrada && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                NF {lote.nf_entrada}
              </Badge>
            )}
            {isOverdue && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                Vencido
              </Badge>
            )}
            {isDivergent && (
              <Badge className="text-[10px] px-1.5 py-0 bg-warning/20 text-warning border-warning/30">
                Divergente
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{lote.quantidade_atual} un</span>
            <span>{formatDistanceToNow(new Date(lote.updated_at), { addSuffix: true, locale: ptBR })}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
