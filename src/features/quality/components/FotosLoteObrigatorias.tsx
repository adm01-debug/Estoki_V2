import { useState, useRef } from "react";
import { Camera, X, CheckCircle2, AlertCircle, ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTriagemFotos, type FotoTriagem } from "@/hooks/useTriagemFotos";

interface FotosLoteProps {
  triagemId?: string;
  fotos: FotoTriagem[];
  onAddFoto: (file: File, tipo: FotoTriagem['tipo']) => Promise<FotoTriagem | null>;
  onRemoveFoto: (id: string) => void;
  uploading?: boolean;
  minFotos?: number;
  className?: string;
}

const tiposFoto = [
  { tipo: "geral" as const, label: "Visão Geral", emoji: "📦", descricao: "Foto geral do lote/volumes" },
  { tipo: "etiqueta" as const, label: "Etiqueta/NF", emoji: "🏷️", descricao: "Etiqueta ou nota fiscal visível" },
  { tipo: "detalhe" as const, label: "Detalhe", emoji: "🔍", descricao: "Detalhe do produto (opcional)" },
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
  const [tipoSelecionado, setTipoSelecionado] = useState<FotoTriagem['tipo']>("geral");

  const fotosCompletas = fotos.filter(f => !f.uploading).length >= minFotos;
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

  const handleCapture = (tipo: FotoTriagem['tipo']) => {
    setTipoSelecionado(tipo);
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("bg-card rounded-xl p-4 border border-border", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-muted-foreground">
            FOTOS DO LOTE
          </h3>
          <Badge variant="destructive" className="text-[10px]">
            Obrigatório
          </Badge>
          {uploading && (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          )}
        </div>
        <Badge variant={requisitosAtendidos ? "default" : "secondary"} className={requisitosAtendidos ? "bg-success" : ""}>
          {fotos.filter(f => !f.uploading).length}/{minFotos} mín.
        </Badge>
      </div>

      {/* Status de Requisitos */}
      <div className="bg-muted/50 rounded-lg p-3 mb-4 space-y-2">
        <div className="text-xs text-muted-foreground mb-2">Fotos necessárias:</div>
        <div className="flex flex-wrap gap-2">
          <div className={cn(
            "flex items-center gap-1.5 text-xs px-2 py-1 rounded-full",
            temFotoGeral ? "bg-success/20 text-success" : "bg-destructive/10 text-destructive"
          )}>
            {temFotoGeral ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            📦 Visão Geral
          </div>
          <div className={cn(
            "flex items-center gap-1.5 text-xs px-2 py-1 rounded-full",
            temFotoEtiqueta ? "bg-success/20 text-success" : "bg-destructive/10 text-destructive"
          )}>
            {temFotoEtiqueta ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
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
      <div className="grid grid-cols-3 gap-2 mb-4">
        {tiposFoto.map((tipo) => {
          const temFoto = fotos.some((f) => f.tipo === tipo.tipo && !f.uploading);
          const isObrigatorio = tipo.tipo !== "detalhe";

          return (
            <button
              key={tipo.tipo}
              onClick={() => handleCapture(tipo.tipo)}
              disabled={uploading}
              className={cn(
                "p-3 rounded-lg border-2 border-dashed flex flex-col items-center gap-1 transition-all disabled:opacity-50",
                temFoto
                  ? "border-success bg-success/5 hover:bg-success/10"
                  : isObrigatorio
                  ? "border-destructive/50 bg-destructive/5 hover:border-destructive hover:bg-destructive/10"
                  : "border-border hover:border-primary hover:bg-primary/5"
              )}
            >
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
                <div key={foto.id} className="relative group">
                  <img
                    src={foto.url}
                    alt={tipoInfo?.label || "Foto"}
                    loading="lazy"
                    decoding="async"
                    className={cn(
                      "w-full aspect-square object-cover rounded-lg border border-border",
                      foto.uploading && "opacity-50"
                    )}
                  />
                  {foto.uploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                  <div className="absolute bottom-1 left-1 bg-background/90 rounded px-1.5 py-0.5 text-[10px] font-medium">
                    {tipoInfo?.emoji} {tipoInfo?.label}
                  </div>
                  {!foto.uploading && (
                    <button
                      onClick={() => onRemoveFoto(foto.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
              className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
            >
              <ImagePlus className="h-6 w-6" />
              <span className="text-[10px] mt-1">Adicionar</span>
            </button>
          </div>
        </div>
      )}

      {/* Mensagem quando não tem fotos */}
      {fotos.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          <Camera className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Capture as fotos obrigatórias do lote</p>
          <p className="text-xs mt-1">Fotos são salvas automaticamente na nuvem</p>
        </div>
      )}

      {/* Alerta se não atende requisitos */}
      {!requisitosAtendidos && fotos.length > 0 && (
        <div className="mt-3 bg-warning/10 border border-warning/30 rounded-lg p-2 text-center text-warning text-xs">
          ⚠️ Capture pelo menos a foto geral e da etiqueta/NF para continuar
        </div>
      )}
    </div>
  );
}

// Re-export hook for convenience
export { useTriagemFotos } from "@/hooks/useTriagemFotos";
export type { FotoTriagem } from "@/hooks/useTriagemFotos";
