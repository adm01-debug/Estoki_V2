import { Timer, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TriagemTimerProps {
  formattedTime: string;
  elapsedSeconds: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  startTime: Date | null;
  className?: string;
}

export function TriagemTimer({
  formattedTime,
  elapsedSeconds,
  isRunning,
  onStart,
  onPause,
  onReset,
  startTime,
  className,
}: TriagemTimerProps) {
  // Determina a cor baseada no tempo (alertas visuais)
  const getTimerColor = () => {
    if (elapsedSeconds < 300) return "text-success"; // < 5 min - verde
    if (elapsedSeconds < 600) return "text-warning"; // < 10 min - amarelo
    return "text-destructive"; // > 10 min - vermelho
  };

  const getTimerBg = () => {
    if (elapsedSeconds < 300) return "bg-success/10 border-success/30";
    if (elapsedSeconds < 600) return "bg-warning/10 border-warning/30";
    return "bg-destructive/10 border-destructive/30";
  };

  return (
    <div className={cn("bg-card rounded-xl p-4 border border-border", className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Timer className="h-4 w-4" />
          TEMPO DE TRIAGEM
        </h3>
        {startTime && (
          <span className="text-xs text-muted-foreground">
            Início: {startTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>

      {/* Display do Timer */}
      <div className={cn(
        "rounded-lg p-4 border flex items-center justify-center transition-colors",
        getTimerBg()
      )}>
        <div className="text-center">
          <div className={cn(
            "font-mono text-4xl font-bold tracking-wider transition-colors",
            getTimerColor(),
            isRunning && "animate-pulse"
          )}>
            {formattedTime}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {isRunning ? "⏱️ Em andamento" : elapsedSeconds > 0 ? "⏸️ Pausado" : "⏹️ Aguardando início"}
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="flex gap-2 mt-3">
        {!isRunning ? (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2 border-success text-success hover:bg-success/10"
            onClick={onStart}
          >
            <Play className="h-4 w-4" />
            {elapsedSeconds > 0 ? "Continuar" : "Iniciar"}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2 border-warning text-warning hover:bg-warning/10"
            onClick={onPause}
          >
            <Pause className="h-4 w-4" />
            Pausar
          </Button>
        )}
        
        {elapsedSeconds > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onReset}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Indicadores de Tempo */}
      <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
        <div className={cn(
          "rounded-lg py-1 px-2",
          elapsedSeconds < 300 ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
        )}>
          &lt; 5 min
        </div>
        <div className={cn(
          "rounded-lg py-1 px-2",
          elapsedSeconds >= 300 && elapsedSeconds < 600 ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"
        )}>
          5-10 min
        </div>
        <div className={cn(
          "rounded-lg py-1 px-2",
          elapsedSeconds >= 600 ? "bg-destructive/20 text-destructive" : "bg-muted text-muted-foreground"
        )}>
          &gt; 10 min
        </div>
      </div>
    </div>
  );
}
