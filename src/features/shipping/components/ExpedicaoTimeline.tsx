import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  Truck,
  Package,
  FileText,
  AlertCircle,
  MoreHorizontal,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RomaneioLike {
  id: string;
  codigo: string;
  status: string;
  motorista?: string;
  placa_veiculo?: string;
  rota?: string;
  data_criacao?: string;
  data_prevista_entrega?: string;
  data_saida?: string;
}

type TimelineStatus = "success" | "pending" | "current" | "alert";

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  time: Date;
  status: TimelineStatus;
  icon: any;
}

const STATUS_META: Record<string, { label: string; status: TimelineStatus; icon: any }> = {
  rascunho: { label: "Rascunho criado", status: "pending", icon: FileText },
  confirmado: { label: "Rota confirmada", status: "pending", icon: Package },
  em_transito: { label: "Em trânsito", status: "current", icon: Truck },
  entregue: { label: "Entrega concluída", status: "success", icon: CheckCircle2 },
  parcial: { label: "Entrega parcial", status: "alert", icon: AlertCircle },
  cancelado: { label: "Romaneio cancelado", status: "alert", icon: AlertCircle },
};

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function eventDate(r: RomaneioLike): Date | null {
  return parseDate(r.data_saida) || parseDate(r.data_prevista_entrega) || parseDate(r.data_criacao);
}

export function ExpedicaoTimeline({ romaneios = [] }: { romaneios?: RomaneioLike[] }) {
  const shouldReduceMotion = useReducedMotion();

  const events: TimelineEvent[] = romaneios
    .map((r) => ({ r, when: eventDate(r) }))
    .filter((item): item is { r: RomaneioLike; when: Date } => item.when !== null)
    .sort((a, b) => b.when.getTime() - a.when.getTime())
    .slice(0, 6)
    .map(({ r, when }) => {
      const meta = STATUS_META[r.status] || STATUS_META.rascunho;
      const detalhe = [r.motorista, r.placa_veiculo, r.rota].filter(Boolean).join(" · ");
      return {
        id: r.id,
        title: meta.label,
        description: detalhe ? `${r.codigo} · ${detalhe}` : r.codigo,
        time: when,
        status: meta.status,
        icon: meta.icon,
      };
    });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Clock className="h-4 w-4 text-primary" />
          Timeline de Expedição
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {events.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            Nenhum romaneio para exibir.
          </p>
        ) : (
          <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-primary/20 before:via-primary/10 before:to-transparent">
            <TooltipProvider>
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative flex items-start gap-4"
                >
                  <div
                    className={`z-10 mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-background shadow-sm transition-transform ${
                      !shouldReduceMotion ? "group-hover:scale-110" : ""
                    } ${
                      event.status === "success"
                        ? "border-success text-success"
                        : event.status === "current"
                          ? "border-primary text-primary"
                          : event.status === "alert"
                            ? "border-destructive text-destructive"
                            : "border-muted text-muted-foreground"
                    }`}
                  >
                    {event.status === "current" && !shouldReduceMotion ? (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary/20"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    ) : null}
                    <event.icon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 pt-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold transition-colors group-hover:text-primary">
                          {event.title}
                        </span>
                        <Badge variant="outline" className="h-5 font-mono text-[10px]">
                          {format(event.time, "dd/MM HH:mm", { locale: ptBR })}
                        </Badge>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            aria-label="Mais ações"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-[10px]">Ver detalhes do evento</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {event.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </TooltipProvider>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
