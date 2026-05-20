import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, User, Clock, ChevronRight, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStatus, statusConfig, formatDate } from "../formulario/triagemHelpers";

interface TriagemListItemProps {
  item: any;
  idx: number;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onNavigate: (id: string) => void;
}

export function TriagemListItem({ item, idx, isSelected, onToggleSelection, onNavigate }: TriagemListItemProps) {
  const status = getStatus(item);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: Math.min(idx, 10) * 0.03 }}
      className={cn(
        "group/card bg-card rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden content-visibility-auto will-change-transform active:scale-[0.98]",
        isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-lg shadow-primary/5" : "border-border/30 hover:border-primary/40 hover:shadow-md"
      )}
      onClick={() => onNavigate(item.id)}
    >
      {/* Progress gradient background */}
      {!item.data_fim && (
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 animate-pulse" />
      )}
      <div className="flex items-start gap-4">
        <div 
          className="mt-1 shrink-0" 
          onClick={(e) => { e.stopPropagation(); onToggleSelection(item.id); }}
        >
          <div className={cn(
            "w-5 h-5 rounded-md border transition-all flex items-center justify-center cursor-pointer",
            isSelected ? "bg-primary border-primary text-primary-foreground" : "bg-muted/50 border-border/50 group-hover/card:border-primary/40"
          )}>
            {isSelected && <CheckSquare className="h-3.5 w-3.5" />}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="font-black text-sm text-primary tracking-tight">
              #{item.id.slice(0, 8).toUpperCase()}
            </span>
            <Badge variant="outline" className={cn(
              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full transition-colors",
              statusConfig[status].className
            )}>
              {statusConfig[status].icon}
              <span className="ml-1">{statusConfig[status].label}</span>
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Identificação do Lote</span>
              <p className="text-sm font-black text-foreground tracking-tight truncate">
                {item.lote_id ? item.lote_id : "Não Vinculado"}
              </p>
            </div>
            <div className="space-y-1 sm:text-right">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Informações da Operação</span>
              <div className="flex flex-wrap sm:justify-end items-center gap-3 text-[11px] font-medium text-muted-foreground/70">
                <div className="flex items-center gap-1.5">
                  <User className="h-3 w-3" />
                  {item.operador_id?.slice(0, 8) || "Sistema"}
                </div>
                <div className="w-1 h-1 rounded-full bg-border" />
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {formatDate(item.data_inicio)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-end justify-between self-stretch">
          <Button 
            variant={!item.data_fim ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-9 px-4 rounded-xl font-bold text-[11px] uppercase tracking-wider gap-2 transition-all",
              !item.data_fim ? "glow-button" : "hover:bg-primary/5 hover:border-primary/40"
            )}
            onClick={() => onNavigate(item.id)}
          >
            {!item.data_fim ? (
              <>Continuar <ChevronRight className="h-4 w-4" /></>
            ) : (
              <>Detalhes <CheckCircle className="h-4 w-4" /></>
            )}
          </Button>
          {item.data_fim && (
            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase mt-2">
              Fim: {formatDate(item.data_fim)}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
