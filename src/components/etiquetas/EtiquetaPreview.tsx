import { Eye, Loader2 } from "lucide-react";
import { EtiquetaData, TamanhoEtiqueta, tamanhos } from "./types";

interface EtiquetaPreviewProps {
  data: EtiquetaData;
  tamanho: TamanhoEtiqueta;
  qrCodeUrl: string;
  currentVolume: number;
  totalVolumes: number;
}

export function EtiquetaPreview({
  data,
  tamanho,
  qrCodeUrl,
  currentVolume,
  totalVolumes
}: EtiquetaPreviewProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-white">
      <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
        <Eye className="h-3 w-3" />
        PRÉVIA DA ETIQUETA
      </div>
      
      <div 
        className="border-2 border-dashed border-border rounded-lg overflow-hidden"
        style={{ 
          aspectRatio: `${tamanhos[tamanho].width} / ${tamanhos[tamanho].height}`,
          maxWidth: "100%",
        }}
      >
        {/* Header */}
        <div className="bg-primary text-primary-foreground text-center py-1.5 text-xs font-bold">
          ESTOKI - ESTOQUE
        </div>
        
        {/* Conteúdo */}
        <div className="p-3 text-xs space-y-1">
          <div className="font-bold">PEDIDO: {data.pedido}</div>
          <div className="truncate text-muted-foreground">PRODUTO: {data.produto}</div>
          <div className="text-muted-foreground">LOTE: {data.lote}</div>
          
          <div className="flex items-start gap-3 pt-2">
            {/* QR Code */}
            <div className="flex-shrink-0">
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="w-16 h-16 border border-border rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="space-y-1 pt-1">
              <div className="font-bold">📦 VOLUME: {currentVolume}/{totalVolumes}</div>
              <div>📊 QTD: ~{data.qtdPorVolume} un</div>
              <div>📅 {formatDate(data.dataRecebimento)}</div>
            </div>
          </div>
          
          {/* Rodapé */}
          <div className="pt-2 mt-2 border-t border-border space-y-0.5 text-muted-foreground">
            <div>FORNECEDOR: {data.fornecedor}</div>
            <div>ENDEREÇO: PP__-S__-N__</div>
          </div>
        </div>
      </div>
    </div>
  );
}
