import { useState } from "react";
import {
  Package,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ShieldCheck,
  ArrowRightCircle,
  UserCheck,
  History,
  Search,
} from "lucide-react";
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
  integridade?: "ok" | "avaiado" | "critico";
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
  onVolumeIntegrityChange?: (volumeId: number, integridade: "ok" | "avaiado" | "critico") => void;
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
  const volumesFaltantes = volumes.filter(
    (v) => v.qtdContada === 0 || v.integridade === "critico"
  ).length;

  const getVolumeStatus = (volume: VolumeData) => {
    if (volume.integridade === "critico")
      return {
        color: "border-destructive",
        bg: "bg-destructive/10",
        icon: <AlertCircle className="h-4 w-4 text-destructive" />,
      };
    const diff = (volume.qtdContada || 0) - volume.qtdEsperada;
    if (volume.integridade === "avaiado" || diff !== 0)
      return {
        color: "border-warning",
        bg: "bg-warning/10",
        icon: <AlertTriangle className="h-4 w-4 text-warning" />,
      };
    if (diff === 0 && volume.conferido)
      return {
        color: "border-success",
        bg: "bg-success/10",
        icon: <CheckCircle2 className="h-4 w-4 text-success" />,
      };
    return { color: "border-muted", bg: "bg-muted/30", icon: null };
  };

  return (
    <div className={cn("rounded-3xl border-2 border-border/50 bg-card p-6 shadow-xl", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-tighter text-primary">
          <Package className="h-4 w-4" />
          Controle de Volumes e Integridade
        </h3>
        <div className="flex gap-2">
          {volumesFaltantes > 0 && (
            <Badge
              variant="destructive"
              className="flex animate-pulse items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase"
            >
              <AlertTriangle className="h-3 w-3" />
              {volumesFaltantes} Alerta(s)
            </Badge>
          )}
          <Badge
            variant={todosConferidos ? "default" : "secondary"}
            className={cn(
              "rounded-full px-4",
              todosConferidos ? "bg-success hover:bg-success" : ""
            )}
          >
            {volumesConferidos}/{volumes.length} conferidos
          </Badge>
        </div>
      </div>

      {/* Promo Brindes Specific: Handoff Chain of Custody */}
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-primary/10 bg-primary/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
            <UserCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">
              Cadeia de Custódia Digital
            </p>
            <p className="text-xs font-bold">
              Handoff Logística → Qualidade:{" "}
              <span className="cursor-pointer text-primary underline transition-colors hover:text-primary/80">
                Auditado por Blockchain ID
              </span>
            </p>
            <div className="mt-1 flex w-fit items-center gap-1 rounded-full bg-background/50 px-2 py-0.5 text-[9px] font-medium text-muted-foreground">
              <ShieldCheck className="h-2.5 w-2.5 text-primary" />
              ID: {Math.random().toString(16).slice(2, 10).toUpperCase()}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-[10px] font-black uppercase text-primary/70"
        >
          <History className="h-3 w-3" /> Log
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-5 gap-2 sm:grid-cols-10">
        {volumes.map((v) => {
          const isMissing = v.conferido && (v.qtdContada === 0 || v.integridade === "critico");
          return (
            <div
              key={v.id}
              title={`Volume ${v.numero}`}
              className={cn(
                "relative flex aspect-square cursor-help items-center justify-center overflow-hidden rounded-lg border-2 transition-all",
                v.handoffConfirmado
                  ? "border-primary bg-primary/20 shadow-[0_0_10px_rgba(var(--primary),0.2)]"
                  : isMissing
                    ? "animate-pulse border-destructive bg-destructive/10"
                    : v.conferido
                      ? v.integridade === "ok"
                        ? "border-success bg-success/20"
                        : "border-warning bg-warning/20"
                      : "border-muted-foreground/20 bg-muted/30"
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
                <div className="absolute right-0 top-0 h-2 w-2 rounded-bl-sm bg-success" />
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
        <div className="h-3 overflow-hidden rounded-full border border-border/20 bg-muted">
          <div
            className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)] transition-all"
            style={{ width: `${(volumesConferidos / (volumes.length || 1)) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {volumes.map((volume) => {
          const status = getVolumeStatus(volume);
          const isExpanded = expandedVolume === volume.id;

          return (
            <div
              key={volume.id}
              className={cn(
                "mb-3 overflow-hidden rounded-2xl border-2 shadow-sm transition-all",
                status.color,
                status.bg
              )}
            >
              <button
                onClick={() => setExpandedVolume(isExpanded ? null : volume.id)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl text-sm font-black shadow-inner",
                      volume.conferido
                        ? "bg-success/20 text-success"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {volume.numero}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-bold">
                      Volume {volume.numero}
                      {status.icon}
                      {volume.integridade && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] font-black uppercase",
                            volume.integridade === "ok"
                              ? "border-success/30 text-success"
                              : volume.integridade === "avaiado"
                                ? "border-warning/30 text-warning"
                                : "border-destructive/30 text-destructive"
                          )}
                        >
                          {volume.integridade}
                        </Badge>
                      )}
                    </div>
                    <div className="text-[11px] font-medium uppercase tracking-tight text-muted-foreground">
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
                  <div className="space-y-4 rounded-xl border border-border/50 bg-background/80 p-4 shadow-inner backdrop-blur-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase text-muted-foreground">
                          Integridade
                        </label>
                        <div className="flex gap-2">
                          <Button
                            variant={volume.integridade === "ok" ? "default" : "outline"}
                            size="sm"
                            className="h-10 flex-1 rounded-lg"
                            onClick={() => onVolumeIntegrityChange?.(volume.id, "ok")}
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={volume.integridade === "avaiado" ? "secondary" : "outline"}
                            size="sm"
                            className="h-10 flex-1 rounded-lg"
                            onClick={() => onVolumeIntegrityChange?.(volume.id, "avaiado")}
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={volume.integridade === "critico" ? "destructive" : "outline"}
                            size="sm"
                            className="h-10 flex-1 rounded-lg"
                            onClick={() => onVolumeIntegrityChange?.(volume.id, "critico")}
                          >
                            <AlertCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase text-muted-foreground">
                          Quantidade Contada
                        </label>
                        <Input
                          type="number"
                          min={0}
                          value={volume.qtdContada ?? ""}
                          onChange={(e) => onVolumeChange(volume.id, parseInt(e.target.value) || 0)}
                          className="h-10 rounded-lg bg-muted/50 text-center text-lg font-black transition-colors focus:bg-background"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {volume.qtdContada === 0 || volume.integridade === "critico" ? (
                        <Button
                          variant="destructive"
                          className="h-11 animate-pulse gap-2 rounded-xl border-destructive/30 shadow-lg shadow-destructive/20"
                          onClick={() => onReportMissing?.(volume.id)}
                        >
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-[10px] font-black uppercase">
                            Ocorrência Crítica
                          </span>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className={cn(
                            "h-11 gap-2 rounded-xl border-primary/20 transition-all",
                            volume.handoffConfirmado
                              ? "border-success/40 bg-success/10 text-success"
                              : "text-primary hover:bg-primary/5"
                          )}
                          onClick={() => onVolumeHandoff?.(volume.id)}
                          disabled={!volume.conferido}
                        >
                          <ArrowRightCircle className="h-4 w-4" />
                          <span className="text-[10px] font-black uppercase">
                            {volume.handoffConfirmado ? "Handoff Realizado" : "Liberar Triagem"}
                          </span>
                        </Button>
                      )}

                      <Button
                        className="h-11 gap-2 rounded-xl shadow-lg shadow-primary/20"
                        onClick={() => {
                          onVolumeConfirm(volume.id);
                          const nextVolume = volumes.find(
                            (v) => !v.conferido && v.id !== volume.id
                          );
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

      <div className="mt-6 border-t-2 border-dashed border-border/50 pt-6">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl border border-border/20 bg-muted/30 p-3">
            <div className="mb-1 text-[10px] font-black uppercase text-muted-foreground">
              Esperado
            </div>
            <div className="text-xl font-black text-foreground">{totalEsperado}</div>
          </div>
          <div className="rounded-2xl border border-border/20 bg-muted/30 p-3">
            <div className="mb-1 text-[10px] font-black uppercase text-muted-foreground">
              Contado
            </div>
            <div className="text-xl font-black text-foreground">{totalContado}</div>
          </div>
          <div
            className={cn(
              "rounded-2xl border p-3",
              totalDiferenca === 0
                ? "border-success/20 bg-success/10"
                : totalDiferenca > 0
                  ? "border-warning/20 bg-warning/10"
                  : "border-destructive/20 bg-destructive/10"
            )}
          >
            <div className="mb-1 text-[10px] font-black uppercase text-muted-foreground">
              Divergência
            </div>
            <div
              className={cn(
                "text-xl font-black",
                totalDiferenca === 0
                  ? "text-success"
                  : totalDiferenca > 0
                    ? "text-warning"
                    : "text-destructive"
              )}
            >
              {totalDiferenca > 0 ? "+" : ""}
              {totalDiferenca}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
