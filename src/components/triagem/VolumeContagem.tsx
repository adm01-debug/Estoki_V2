import { useState } from "react";
import { Package, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface VolumeData {
  id: number;
  numero: string;
  qtdEsperada: number;
  qtdContada: number | null;
  conferido: boolean;
}

interface VolumeContagemProps {
  volumes: VolumeData[];
  onVolumeChange: (volumeId: number, qtdContada: number) => void;
  onVolumeConfirm: (volumeId: number) => void;
  totalEsperado: number;
  className?: string;
}

export function VolumeContagem({
  volumes,
  onVolumeChange,
  onVolumeConfirm,
  totalEsperado,
  className,
}: VolumeContagemProps) {
  const [expandedVolume, setExpandedVolume] = useState<number | null>(
    volumes.find((v) => !v.conferido)?.id ?? null
  );

  const volumesConferidos = volumes.filter((v) => v.conferido).length;
  const totalContado = volumes.reduce((acc, v) => acc + (v.qtdContada || 0), 0);
  const totalDiferenca = totalContado - totalEsperado;
  const todosConferidos = volumesConferidos === volumes.length;

  const getVolumeStatus = (volume: VolumeData) => {
    if (!volume.conferido) return { color: "border-muted", bg: "bg-muted/30", icon: null };
    
    const diff = (volume.qtdContada || 0) - volume.qtdEsperada;
    if (diff === 0) return { color: "border-success", bg: "bg-success/10", icon: <CheckCircle2 className="h-4 w-4 text-success" /> };
    return { color: "border-warning", bg: "bg-warning/10", icon: <AlertCircle className="h-4 w-4 text-warning" /> };
  };

  return (
    <div className={cn("bg-card rounded-xl p-4 border border-border", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Package className="h-4 w-4" />
          CONTAGEM POR VOLUME
        </h3>
        <Badge variant={todosConferidos ? "default" : "secondary"} className={todosConferidos ? "bg-success" : ""}>
          {volumesConferidos}/{volumes.length} conferidos
        </Badge>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-success transition-all"
            style={{ width: `${(volumesConferidos / volumes.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Lista de Volumes */}
      <div className="space-y-2">
        {volumes.map((volume) => {
          const status = getVolumeStatus(volume);
          const isExpanded = expandedVolume === volume.id;
          const diferenca = volume.conferido ? (volume.qtdContada || 0) - volume.qtdEsperada : null;

          return (
            <div
              key={volume.id}
              className={cn(
                "rounded-lg border transition-all",
                status.color,
                status.bg
              )}
            >
              {/* Header do Volume */}
              <button
                onClick={() => setExpandedVolume(isExpanded ? null : volume.id)}
                className="w-full p-3 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm",
                    volume.conferido ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                  )}>
                    {volume.numero}
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      Volume {volume.numero}
                      {status.icon}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Esperado: {volume.qtdEsperada} un
                      {volume.conferido && (
                        <span className={cn(
                          "ml-2",
                          diferenca === 0 ? "text-success" : "text-warning"
                        )}>
                          | Contado: {volume.qtdContada} un
                          {diferenca !== null && diferenca !== 0 && (
                            <span className="ml-1">
                              ({diferenca > 0 ? "+" : ""}{diferenca})
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              {/* Conteúdo Expandido */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-0">
                  <div className="bg-background rounded-lg p-3 space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">
                        Quantidade Contada
                      </label>
                      <Input
                        type="number"
                        min={0}
                        value={volume.qtdContada ?? ""}
                        onChange={(e) => onVolumeChange(volume.id, parseInt(e.target.value) || 0)}
                        placeholder={`Esperado: ${volume.qtdEsperada}`}
                        className="text-lg font-bold h-12 text-center"
                      />
                    </div>
                    
                    {volume.qtdContada !== null && volume.qtdContada !== volume.qtdEsperada && (
                      <div className={cn(
                        "text-sm p-2 rounded-lg text-center",
                        (volume.qtdContada || 0) > volume.qtdEsperada 
                          ? "bg-warning/10 text-warning" 
                          : "bg-destructive/10 text-destructive"
                      )}>
                        {(volume.qtdContada || 0) > volume.qtdEsperada 
                          ? `+${(volume.qtdContada || 0) - volume.qtdEsperada} unidades a mais`
                          : `${volume.qtdEsperada - (volume.qtdContada || 0)} unidades faltando`
                        }
                      </div>
                    )}

                    <Button
                      className="w-full gap-2"
                      onClick={() => {
                        onVolumeConfirm(volume.id);
                        // Avançar para próximo volume não conferido
                        const nextVolume = volumes.find((v) => !v.conferido && v.id !== volume.id);
                        setExpandedVolume(nextVolume?.id ?? null);
                      }}
                      disabled={volume.qtdContada === null}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Confirmar Volume
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Resumo Total */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="text-xs text-muted-foreground">Esperado</div>
            <div className="text-lg font-bold">{totalEsperado}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="text-xs text-muted-foreground">Contado</div>
            <div className="text-lg font-bold">{totalContado}</div>
          </div>
          <div className={cn(
            "rounded-lg p-2",
            totalDiferenca === 0 ? "bg-success/10" : totalDiferenca > 0 ? "bg-warning/10" : "bg-destructive/10"
          )}>
            <div className="text-xs text-muted-foreground">Diferença</div>
            <div className={cn(
              "text-lg font-bold",
              totalDiferenca === 0 ? "text-success" : totalDiferenca > 0 ? "text-warning" : "text-destructive"
            )}>
              {totalDiferenca > 0 ? "+" : ""}{totalDiferenca}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
