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

export function TriagemListItem({
  item,
  idx,
  isSelected,
  onToggleSelection,
  onNavigate,
}: TriagemListItemProps) {
  const status = getStatus(item);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: Math.min(idx, 10) * 0.03 }}
      className={cn(
        "group/card content-visibility-auto relative overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-300 will-change-transform active:scale-[0.98]",
        isSelected
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/5 ring-1 ring-primary/20"
          : "border-border/30 hover:border-primary/40 hover:shadow-md"
      )}
      onClick={() => onNavigate(item.id)}
    >
      {/* Progress gradient background */}
      {!item.data_fim && (
        <div className="absolute left-0 top-0 h-full w-1 animate-pulse bg-primary/40" />
      )}
      <div className="flex items-start gap-4">
        <div
          className="mt-1 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelection(item.id);
          }}
        >
          <div
            className={cn(
              "flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border transition-all",
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/50 bg-muted/50 group-hover/card:border-primary/40"
            )}
          >
            {isSelected && <CheckSquare className="h-3.5 w-3.5" />}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <span className="text-sm font-black tracking-tight text-primary">
              #{item.id.slice(0, 8).toUpperCase()}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest transition-colors",
                statusConfig[status].className
              )}
            >
              {statusConfig[status].icon}
              <span className="ml-1">{statusConfig[status].label}</span>
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <span className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                Identificação do Lote
              </span>
              <p className="truncate text-sm font-black tracking-tight text-foreground">
                {item.lote_id ? item.lote_id : "Não Vinculado"}
              </p>

              {/* Chain of Custody Timeline - Strategic Visual */}
              <div className="mt-2 flex items-center gap-1">
                {[
                  { label: "Logística", done: true },
                  { label: "Qualidade", done: !!item.data_inicio },
                  { label: "Auditado", done: !!item.data_fim },
                  { label: "Stock", done: item.resultado === "aprovado" },
                ].map((step, sidx) => (
                  <div key={sidx} className="group/step flex items-center">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full border transition-all duration-500",
                        step.done
                          ? "border-primary bg-primary shadow-[0_0_5px_rgba(var(--primary-rgb),0.5)]"
                          : "border-border/40 bg-muted"
                      )}
                      title={step.label}
                    />
                    {sidx < 3 && (
                      <div
                        className={cn(
                          "h-[1px] w-3 transition-all duration-500",
                          step.done ? "bg-primary" : "bg-border/20"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-1 sm:text-right">
              <span className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                Informações da Operação
              </span>
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-muted-foreground/70 sm:justify-end">
                <div className="flex cursor-help items-center gap-1.5 transition-colors hover:text-primary">
                  <User className="h-3 w-3" />
                  {item.operador_id?.slice(0, 8) || "Sistema"}
                </div>
                <div className="h-1 w-1 rounded-full bg-border" />
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {formatDate(item.data_inicio)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-between self-stretch">
          <Button
            variant={!item.data_fim ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-9 gap-2 rounded-xl px-4 text-[11px] font-bold uppercase tracking-wider transition-all",
              !item.data_fim ? "glow-button" : "hover:border-primary/40 hover:bg-primary/5"
            )}
            onClick={() => onNavigate(item.id)}
          >
            {!item.data_fim ? (
              <>
                Continuar <ChevronRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Detalhes <CheckCircle className="h-4 w-4" />
              </>
            )}
          </Button>
          {item.data_fim && (
            <p className="mt-2 text-[9px] font-bold uppercase text-muted-foreground/60">
              Fim: {formatDate(item.data_fim)}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
