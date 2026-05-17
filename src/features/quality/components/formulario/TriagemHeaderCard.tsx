 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
 import { Package, Timer, Truck, CheckCircle2, PauseCircle, PlayCircle, Layers } from "lucide-react";
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
}

export function TriagemHeaderCard({
  id,
  loteId,
  produtoNome,
  quantidadeTotal,
  formattedTime,
  isRunning,
  onPausar,
  onIniciar
}: TriagemHeaderCardProps) {
  return (
    <Card className="border-2 border-primary/10 overflow-hidden bg-gradient-to-br from-card to-primary/5 shadow-xl">
      <div className="h-1.5 w-full bg-primary/20 relative">
        <div className={cn("h-full bg-primary transition-all duration-500", isRunning ? "w-full animate-pulse" : "w-1/3")} />
      </div>
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center shadow-inner">
              <Layers className="h-7 w-7 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-primary tracking-tighter uppercase">
                Lote #{loteId || (id ? id.slice(0, 8).toUpperCase() : "NOVO")}
              </CardTitle>
              <CardDescription className="text-sm font-bold flex items-center gap-1.5 text-muted-foreground/80">
                <Package className="h-4 w-4" />
                {produtoNome || "Produto não identificado"}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-10 px-4 rounded-xl border-primary/20 bg-background/50 font-black text-primary shadow-sm">
              {quantidadeTotal} UNIDADES
            </Badge>
            <Badge variant="outline" className="h-10 px-4 rounded-xl border-indigo-200 bg-indigo-50/50 text-indigo-600 font-black shadow-sm flex items-center gap-2">
              <Truck className="h-4 w-4" /> ORIGEM: LOGÍSTICA
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-background/40 backdrop-blur-sm rounded-2xl p-5 border border-border/50 flex flex-col md:flex-row items-center justify-between gap-6 shadow-inner">
          <div className="flex items-center gap-8 w-full md:w-auto">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1">
                <Timer className="h-3 w-3" /> Tempo Operacional
              </p>
              <div className="flex items-center gap-3">
                <span className={cn("text-3xl font-black font-mono tracking-tighter", isRunning ? "text-primary" : "text-muted-foreground")}>
                  {formattedTime}
                </span>
                <div className="flex gap-1">
                  {isRunning ? (
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-amber-600 hover:bg-amber-100" onClick={onPausar}>
                      <PauseCircle className="h-5 w-5" />
                    </Button>
                  ) : (
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10" onClick={onIniciar}>
                      <PlayCircle className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="h-10 w-px bg-border/50 hidden md:block" />

            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Status da Inspeção</p>
              <div className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-full animate-pulse", isRunning ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)]" : "bg-muted")} />
                <span className="text-sm font-black uppercase tracking-tight">
                  {isRunning ? "Em Conferência Ativa" : "Pausado / Aguardando"}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto flex gap-2">
             <Button variant="outline" className="flex-1 md:flex-none h-11 rounded-xl border-border/40 gap-2 font-bold text-[10px] uppercase tracking-wider">
                Salvar Rascunho
             </Button>
             <Button className="flex-1 md:flex-none h-11 rounded-xl glow-button gap-2 font-bold text-[10px] uppercase tracking-wider bg-primary hover:bg-primary/90">
              <Button variant="default" className="flex-1 md:flex-none h-11 rounded-xl glow-button gap-2 font-bold text-[10px] uppercase tracking-wider bg-primary hover:bg-primary/90" onClick={() => {}}>
                <CheckCircle2 className="h-4 w-4" /> Validar Parcial
              </Button>
             </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
