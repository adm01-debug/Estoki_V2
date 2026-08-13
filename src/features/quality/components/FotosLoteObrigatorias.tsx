import { useState, useRef } from "react";
import { Camera, X, CheckCircle2, AlertCircle, ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTriagemFotos, type FotoTriagem } from "@/hooks/useTriagemFotos";

interface FotosLoteProps {
  triagemId?: string;
  fotos: FotoTriagem[];
  onAddFoto: (file: File, tipo: FotoTriagem["tipo"]) => Promise<FotoTriagem | null>;
  onRemoveFoto: (id: string) => void;
  uploading?: boolean;
  minFotos?: number;
  className?: string;
}

const tiposFoto = [
  {
    tipo: "geral" as const,
    label: "Visão Geral",
    emoji: "📦",
    descricao: "Foto geral do lote/volumes",
  },
  {
    tipo: "etiqueta" as const,
    label: "Etiqueta/NF",
    emoji: "🏷️",
    descricao: "Etiqueta ou nota fiscal visível",
  },
  {
    tipo: "detalhe" as const,
    label: "Detalhe",
    emoji: "🔍",
    descricao: "Detalhe do produto (opcional)",
  },
];

export function FotosLoteObrigatorias({
  triagemId,
  fotos,
  onAddFoto,
  onRemoveFoto,
  uploading = false,
  minFotos = 2,
  className,
}: FotosLoteProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tipoSelecionado, setTipoSelecionado] = useState<FotoTriagem["tipo"]>("geral");

  const fotosCompletas = fotos.filter((f) => !f.uploading).length >= minFotos;
  const temFotoGeral = fotos.some((f) => f.tipo === "geral" && !f.uploading);
  const temFotoEtiqueta = fotos.some((f) => f.tipo === "etiqueta" && !f.uploading);
  const requisitosAtendidos = temFotoGeral && temFotoEtiqueta;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      await onAddFoto(file, tipoSelecionado);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCapture = (tipo: FotoTriagem["tipo"]) => {
    setTipoSelecionado(tipo);
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-muted-foreground">FOTOS DO LOTE</h3>
          <Badge variant="destructive" className="text-[10px]">
            Obrigatório
          </Badge>
          {uploading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        </div>
        <Badge
          variant={requisitosAtendidos ? "default" : "secondary"}
          className={requisitosAtendidos ? "bg-success" : ""}
        >
          {fotos.filter((f) => !f.uploading).length}/{minFotos} mín.
        </Badge>
      </div>

      {/* Status de Requisitos */}
      <div className="mb-4 space-y-2 rounded-lg bg-muted/50 p-3">
        <div className="mb-2 text-xs text-muted-foreground">Fotos necessárias:</div>
        <div className="flex flex-wrap gap-2">
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2 py-1 text-xs",
              temFotoGeral ? "bg-success/20 text-success" : "bg-destructive/10 text-destructive"
            )}
          >
            {temFotoGeral ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            📦 Visão Geral
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2 py-1 text-xs",
              temFotoEtiqueta ? "bg-success/20 text-success" : "bg-destructive/10 text-destructive"
            )}
          >
            {temFotoEtiqueta ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            🏷️ Etiqueta/NF
          </div>
        </div>
      </div>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Botões de Captura */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {tiposFoto.map((tipo) => {
          const temFoto = fotos.some((f) => f.tipo === tipo.tipo && !f.uploading);
          const isObrigatorio = tipo.tipo !== "detalhe";

          return (
            <button
              key={tipo.tipo}
              onClick={() => handleCapture(tipo.tipo)}
              disabled={uploading}
              className={cn(
                "group/btn relative flex flex-col items-center gap-1 overflow-hidden rounded-lg border-2 border-dashed p-3 transition-all disabled:opacity-50",
                temFoto
                  ? "border-success bg-success/5 hover:bg-success/10"
                  : isObrigatorio
                    ? "border-destructive/50 bg-destructive/5 hover:border-destructive hover:bg-destructive/10"
                    : "border-border hover:border-primary hover:bg-primary/5"
              )}
            >
              {/* Overlay Guideline Grid - Implementation forlegible capture */}
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover/btn:opacity-40">
                {/* Horizontal lines */}
                <div className="absolute top-1/3 h-px w-full bg-primary" />
                <div className="absolute top-2/3 h-px w-full bg-primary" />
                {/* Vertical lines */}
                <div className="absolute left-1/3 h-full w-px bg-primary" />
                <div className="absolute left-2/3 h-full w-px bg-primary" />

                {/* Focus box for Labels/Seals */}
                <div className="absolute left-1/2 top-1/2 flex h-1/4 w-1/3 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border-2 border-primary/50">
                  <div className="text-[6px] font-black uppercase text-primary/40">
                    Enquadrar Etiqueta
                  </div>
                </div>
              </div>

              <span className="text-2xl">{tipo.emoji}</span>
              <span className="text-xs font-medium">{tipo.label}</span>
              {temFoto && <CheckCircle2 className="h-4 w-4 text-success" />}
            </button>
          );
        })}
      </div>

      {/* Galeria de Fotos */}
      {fotos.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Fotos capturadas:</div>
          <div className="grid grid-cols-3 gap-2">
            {fotos.map((foto) => {
              const tipoInfo = tiposFoto.find((t) => t.tipo === foto.tipo);
              return (
                <div key={foto.id} className="group relative">
                  <img
                    src={foto.url}
                    alt={tipoInfo?.label || "Foto"}
                    loading="lazy"
                    decoding="async"
                    className={cn(
                      "aspect-square w-full rounded-lg border border-border object-cover",
                      foto.uploading && "opacity-50"
                    )}
                  />
                  {foto.uploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                  <div className="absolute bottom-1 left-1 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium">
                    {tipoInfo?.emoji} {tipoInfo?.label}
                  </div>
                  {!foto.uploading && (
                    <button
                      onClick={() => onRemoveFoto(foto.id)}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Botão adicionar mais */}
            <button
              onClick={() => handleCapture("detalhe")}
              disabled={uploading}
              className="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
            >
              <ImagePlus className="h-6 w-6" />
              <span className="mt-1 text-[10px]">Adicionar</span>
            </button>
          </div>
        </div>
      )}

      {/* Mensagem quando não tem fotos */}
      {fotos.length === 0 && (
        <div className="py-4 text-center text-muted-foreground">
          <Camera className="mx-auto mb-2 h-10 w-10 opacity-50" />
          <p className="text-sm">Capture as fotos obrigatórias do lote</p>
          <p className="mt-1 text-xs">Fotos são salvas automaticamente na nuvem</p>
        </div>
      )}

      {/* Alerta se não atende requisitos */}
      {!requisitosAtendidos && fotos.length > 0 && (
        <div className="mt-3 rounded-lg border border-warning/30 bg-warning/10 p-2 text-center text-xs text-warning">
          ⚠️ Capture pelo menos a foto geral e da etiqueta/NF para continuar
        </div>
      )}
    </div>
  );
}

// Re-export hook for convenience
export { useTriagemFotos } from "@/hooks/useTriagemFotos";
export type { FotoTriagem } from "@/hooks/useTriagemFotos";
