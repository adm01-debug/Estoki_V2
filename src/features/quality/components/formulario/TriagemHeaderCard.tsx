import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Timer,
  Truck,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Layers,
  Zap,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TriagemHeaderCardProps {
  id?: string;
  loteId?: string;
  produtoNome?: string;
  quantidadeTotal: number;
  formattedTime: string;
  isRunning: boolean;
  onPausar: () => void;
  onIniciar: () => void;
  taktTime?: string;
  tempoEstimado?: string;
}

export function TriagemHeaderCard({
  id,
  loteId,
  produtoNome,
  quantidadeTotal,
  formattedTime,
  isRunning,
  onPausar,
  onIniciar,
  taktTime = "00:45",
  tempoEstimado = "12:30",
}: TriagemHeaderCardProps) {
  return (
    <Card className="overflow-hidden border-2 border-primary/10 bg-gradient-to-br from-card to-primary/5 shadow-xl">
      <div className="relative h-1.5 w-full bg-primary/20">
        <div
          className={cn(
            "h-full bg-primary transition-all duration-500",
            isRunning ? "w-full animate-pulse" : "w-1/3"
          )}
        />
      </div>
      <CardHeader className="pb-4">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-primary/20 bg-primary/10 shadow-inner">
              <Layers className="h-7 w-7 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tighter text-primary">
                Lote #{loteId || (id ? id.slice(0, 8).toUpperCase() : "NOVO")}
              </CardTitle>
              <CardDescription className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground/80">
                <Package className="h-4 w-4" />
                {produtoNome || "Produto não identificado"}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="h-10 rounded-xl border-primary/20 bg-background/50 px-4 font-black text-primary shadow-sm"
            >
              {quantidadeTotal} UNIDADES
            </Badge>
            <Badge
              variant="outline"
              className="flex h-10 items-center gap-2 rounded-xl border-indigo-200 bg-indigo-50/50 px-4 font-black text-indigo-600 shadow-sm"
            >
              <Truck className="h-4 w-4" /> ORIGEM: LOGÍSTICA
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-border/50 bg-background/40 p-5 shadow-inner backdrop-blur-sm md:flex-row">
          <div className="flex w-full items-center gap-8 md:w-auto">
            <div className="space-y-1">
              <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <Timer className="h-3 w-3" /> Tempo Operacional
              </p>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "font-mono text-3xl font-black tracking-tighter",
                    isRunning ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {formattedTime}
                </span>
                <div className="flex gap-1">
                  {isRunning ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-lg text-amber-600 hover:bg-amber-100"
                      onClick={onPausar}
                    >
                      <PauseCircle className="h-5 w-5" />
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10"
                      onClick={onIniciar}
                    >
                      <PlayCircle className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden h-10 w-px bg-border/50 md:block" />

            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Status da Inspeção
              </p>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-3 w-3 animate-pulse rounded-full",
                    isRunning ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)]" : "bg-muted"
                  )}
                />
                <span className="text-sm font-black uppercase tracking-tight">
                  {isRunning ? "Em Conferência Ativa" : "Pausado / Aguardando"}
                </span>
              </div>
            </div>

            <div className="hidden h-10 w-px bg-border/50 lg:block" />

            <div className="hidden space-y-1 lg:block">
              <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <Zap className="h-3 w-3 text-yellow-500" /> Takt Time
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-foreground">
                  {taktTime}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground">seg/un</span>
              </div>
            </div>

            <div className="hidden h-10 w-px bg-border/50 lg:block" />

            <div className="hidden space-y-1 lg:block">
              <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <Clock className="h-3 w-3 text-primary" /> Est. Conclusão
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-foreground">
                  {tempoEstimado}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground">min</span>
              </div>
            </div>
          </div>

          <div className="flex w-full gap-2 md:w-auto">
            <Button
              variant="outline"
              className="h-11 flex-1 gap-2 rounded-xl border-border/40 text-[10px] font-bold uppercase tracking-wider md:flex-none"
            >
              Salvar Rascunho
            </Button>
            <Button className="glow-button h-11 flex-1 gap-2 rounded-xl bg-primary text-[10px] font-bold uppercase tracking-wider hover:bg-primary/90 md:flex-none">
              <Button
                variant="default"
                className="glow-button h-11 flex-1 gap-2 rounded-xl bg-primary text-[10px] font-bold uppercase tracking-wider hover:bg-primary/90 md:flex-none"
                onClick={() => {}}
              >
                <CheckCircle2 className="h-4 w-4" /> Validar Parcial
              </Button>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
