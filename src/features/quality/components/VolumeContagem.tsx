import { useState } from "react";
 import { Package, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, AlertTriangle, ShieldCheck, ArrowRightCircle, UserCheck, History, Search } from "lucide-react";
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
  integridade?: 'ok' | 'avaiado' | 'critico';
  handoffConfirmado?: boolean;
  responsavelHandoff?: string;
  timestampHandoff?: string;
}

interface VolumeContagemProps {
  volumes: VolumeData[];
  onVolumeChange: (volumeId: number, qtdContada: number) => void;
  onVolumeConfirm: (volumeId: number) => void;
  onReportMissing?: (volumeId: number) => void;
  totalEsperado: number;
  className?: string;
  onVolumeIntegrityChange?: (volumeId: number, integridade: 'ok' | 'avaiado' | 'critico') => void;
  onVolumeHandoff?: (volumeId: number) => void;
}

export function VolumeContagem({
  volumes,
  onVolumeChange,
  onVolumeConfirm,
  onReportMissing,
  onVolumeIntegrityChange,
  onVolumeHandoff,
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
  const volumesFaltantes = volumes.filter(v => v.qtdContada === 0 || v.integridade === 'critico').length;

  const getVolumeStatus = (volume: VolumeData) => {
    if (volume.integridade === 'critico') return { color: "border-destructive", bg: "bg-destructive/10", icon: <AlertCircle className="h-4 w-4 text-destructive" /> };
    const diff = (volume.qtdContada || 0) - volume.qtdEsperada;
    if (volume.integridade === 'avaiado' || diff !== 0) return { color: "border-warning", bg: "bg-warning/10", icon: <AlertTriangle className="h-4 w-4 text-warning" /> };
    if (diff === 0 && volume.conferido) return { color: "border-success", bg: "bg-success/10", icon: <CheckCircle2 className="h-4 w-4 text-success" /> };
    return { color: "border-muted", bg: "bg-muted/30", icon: null };
  };

  return (
    <div className={cn("bg-card rounded-3xl p-6 border-2 border-border/50 shadow-xl", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-primary flex items-center gap-2 uppercase tracking-tighter">
          <Package className="h-4 w-4" />
          Controle de Volumes e Integridade
        </h3>
        <Badge variant={todosConferidos ? "default" : "secondary"} className={cn("rounded-full px-4", todosConferidos ? "bg-success hover:bg-success" : "")}>
          {volumesConferidos}/{volumes.length} conferidos
        </Badge>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-primary flex items-center gap-2 uppercase tracking-tighter">
          <Package className="h-4 w-4" />
          Controle de Volumes e Integridade
        </h3>
        <div className="flex gap-2">
          {volumesFaltantes > 0 && (
            <Badge variant="destructive" className="animate-pulse rounded-full px-3 py-1 text-[10px] font-black uppercase flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3" />
              {volumesFaltantes} Alerta(s)
            </Badge>
          )}
          <Badge variant={todosConferidos ? "default" : "secondary"} className={cn("rounded-full px-4", todosConferidos ? "bg-success hover:bg-success" : "")}>
            {volumesConferidos}/{volumes.length} conferidos
          </Badge>
        </div>
      </div>

      {/* Promo Brindes Specific: Handoff Chain of Custody */}
      <div className="mb-6 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <UserCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-primary/60 tracking-widest">Cadeia de Custódia</p>
            <p className="text-xs font-bold">Responsável pela Entrega: <span className="text-primary underline cursor-pointer">Definir</span></p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase gap-1.5 text-primary/70">
          <History className="h-3 w-3" /> Log
        </Button>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-6">
        {volumes.map((v) => {
          const isMissing = v.conferido && (v.qtdContada === 0 || v.integridade === 'critico');
          return (
            <div 
              key={v.id}
              title={`Volume ${v.numero}`}
              className={cn(
                "aspect-square rounded-lg border-2 flex items-center justify-center transition-all cursor-help relative overflow-hidden",
                v.handoffConfirmado ? "bg-primary/20 border-primary shadow-[0_0_10px_rgba(var(--primary),0.2)]" :
                isMissing ? "bg-destructive/10 border-destructive animate-pulse" :
                v.conferido ? (v.integridade === 'ok' ? "bg-success/20 border-success" : "bg-warning/20 border-warning") :
                "bg-muted/30 border-muted-foreground/20"
              )}
            >
              {v.handoffConfirmado ? (
                <ArrowRightCircle className="h-4 w-4 text-primary" />
              ) : isMissing ? (
                <AlertCircle className="h-4 w-4 text-destructive" />
              ) : (
                <span className="text-[10px] font-bold opacity-50">{v.numero}</span>
              )}
              {v.conferido && !v.handoffConfirmado && !isMissing && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-success rounded-bl-sm" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mb-6 space-y-1.5">
        <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
          <span>Fluxo de Recebimento</span>
          <span>{Math.round((volumesConferidos / (volumes.length || 1)) * 100)}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden border border-border/20">
          <div
            className="h-full bg-primary transition-all shadow-[0_0_10px_rgba(var(--primary),0.5)]"
            style={{ width: `${(volumesConferidos / (volumes.length || 1)) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {volumes.map((volume) => {
          const status = getVolumeStatus(volume);
          const isExpanded = expandedVolume === volume.id;

          return (
            <div key={volume.id} className={cn("rounded-2xl border-2 transition-all overflow-hidden mb-3 shadow-sm", status.color, status.bg)}>
              <button onClick={() => setExpandedVolume(isExpanded ? null : volume.id)} className="w-full p-4 flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shadow-inner", volume.conferido ? "bg-success/20 text-success" : "bg-muted text-muted-foreground")}>
                    {volume.numero}
                  </div>
                  <div>
                    <div className="font-bold flex items-center gap-2">
                      Volume {volume.numero}
                      {status.icon}
                      {volume.integridade && (
                        <Badge variant="outline" className={cn(
                          "text-[9px] uppercase font-black",
                          volume.integridade === 'ok' ? "text-success border-success/30" : 
                          volume.integridade === 'avaiado' ? "text-warning border-warning/30" : "text-destructive border-destructive/30"
                        )}>
                          {volume.integridade}
                        </Badge>
                      )}
                    </div>
                    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-tight">
                      Esperado: {volume.qtdEsperada} un
                    </div>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-0">
                  <div className="bg-background/80 backdrop-blur-sm rounded-xl p-4 space-y-4 border border-border/50 shadow-inner">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-muted-foreground block">Integridade</label>
                        <div className="flex gap-2">
                          <Button 
                            variant={volume.integridade === 'ok' ? 'default' : 'outline'} 
                            size="sm" 
                            className="flex-1 rounded-lg h-10"
                            onClick={() => onVolumeIntegrityChange?.(volume.id, 'ok')}
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant={volume.integridade === 'avaiado' ? 'secondary' : 'outline'} 
                            size="sm" 
                            className="flex-1 rounded-lg h-10"
                            onClick={() => onVolumeIntegrityChange?.(volume.id, 'avaiado')}
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant={volume.integridade === 'critico' ? 'destructive' : 'outline'} 
                            size="sm" 
                            className="flex-1 rounded-lg h-10"
                            onClick={() => onVolumeIntegrityChange?.(volume.id, 'critico')}
                          >
                            <AlertCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-muted-foreground block">Quantidade Contada</label>
                        <Input
                          type="number"
                          min={0}
                          value={volume.qtdContada ?? ""}
                          onChange={(e) => onVolumeChange(volume.id, parseInt(e.target.value) || 0)}
                          className="text-lg font-black h-10 text-center rounded-lg bg-muted/50 focus:bg-background transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {volume.qtdContada === 0 ? (
                        <Button
                          variant="destructive"
                          className="gap-2 rounded-xl h-11 shadow-lg shadow-destructive/20 border-destructive/30"
                          onClick={() => onReportMissing?.(volume.id)}
                        >
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-[10px] font-black uppercase">Reportar Extravio</span>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="gap-2 rounded-xl h-11 border-primary/20 hover:bg-primary/5 text-primary"
                          onClick={() => onVolumeHandoff?.(volume.id)}
                          disabled={!volume.conferido}
                        >
                          <ArrowRightCircle className="h-4 w-4" />
                          <span className="text-[10px] font-black uppercase">Liberar Triagem</span>
                        </Button>
                      )}

                      <Button
                        className="gap-2 rounded-xl h-11 shadow-lg shadow-primary/20"
                        onClick={() => {
                          onVolumeConfirm(volume.id);
                          const nextVolume = volumes.find((v) => !v.conferido && v.id !== volume.id);
                          setExpandedVolume(nextVolume?.id ?? null);
                        }}
                        disabled={volume.qtdContada === null || !volume.integridade}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase">Confirmar Volume</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t-2 border-dashed border-border/50">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted/30 rounded-2xl p-3 border border-border/20">
            <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">Esperado</div>
            <div className="text-xl font-black text-foreground">{totalEsperado}</div>
          </div>
          <div className="bg-muted/30 rounded-2xl p-3 border border-border/20">
            <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">Contado</div>
            <div className="text-xl font-black text-foreground">{totalContado}</div>
          </div>
          <div className={cn(
            "rounded-2xl p-3 border",
            totalDiferenca === 0 ? "bg-success/10 border-success/20" : totalDiferenca > 0 ? "bg-warning/10 border-warning/20" : "bg-destructive/10 border-destructive/20"
          )}>
            <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">Divergência</div>
            <div className={cn(
              "text-xl font-black",
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
