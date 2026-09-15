import { Eye, Loader2, Package, Truck, QrCode } from "lucide-react";
import { EtiquetaData, TamanhoEtiqueta, tamanhos, LoteItem, EntregaItem, FonteData } from "./types";
import { gerarCodigoUnico } from "./etiquetaUtils";

// Re-export for compatibility
export {
  type EtiquetaData,
  type TamanhoEtiqueta,
  tamanhos,
  type LoteItem,
  type EntregaItem,
  type FonteData,
};
export { gerarCodigoUnico };

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
  totalVolumes,
}: EtiquetaPreviewProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR");
  };

  const currentTamanho = tamanhos[tamanho] || tamanhos["10x15"];

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Eye className="h-3 w-3" />
        PRÉVIA DA ETIQUETA
      </div>

      <div
        className="mx-auto overflow-hidden rounded-lg border-2 border-dashed border-border"
        style={{
          aspectRatio: `${currentTamanho.width} / ${currentTamanho.height}`,
          maxWidth: "100%",
          width: tamanho === "10x15" ? "200px" : "100%",
        }}
      >
        {/* Header */}
        <div className="bg-primary py-1.5 text-center text-[10px] font-bold text-primary-foreground">
          ESTOKI - ESTOQUE
        </div>

        {/* Conteúdo */}
        <div className="space-y-1 p-2 text-[9px]">
          <div className="font-bold">PEDIDO: {data.pedido}</div>
          <div className="truncate text-muted-foreground">PRODUTO: {data.produto}</div>
          <div className="text-muted-foreground">LOTE: {data.lote}</div>

          <div className="flex items-start gap-2 pt-1">
            {/* QR Code */}
            <div className="flex-shrink-0">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="h-12 w-12 rounded border border-border"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-0.5 pt-0.5">
              <div className="font-bold">
                📦 VOL: {currentVolume}/{totalVolumes}
              </div>
              <div>📊 QTD: ~{data.qtdPorVolume}</div>
              <div>📅 {formatDate(data.dataRecebimento)}</div>
            </div>
          </div>

          {/* Rodapé */}
          <div className="mt-1 space-y-0.5 border-t border-border pt-1 text-muted-foreground">
            <div className="truncate">FORN: {data.fornecedor}</div>
            <div>END: PP__-S__-N__</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Components used by Etiquetas.tsx
export function EtiquetaPreviewLote({
  lote,
  tamanho,
  volume,
  totalVolumes,
  qrUrl,
}: {
  lote: LoteItem;
  tamanho: TamanhoEtiqueta;
  volume: number;
  totalVolumes: number;
  qrUrl: string | null;
}) {
  const currentTamanho = tamanhos[tamanho] || tamanhos["10x15"];
  return (
    <div className="flex flex-col items-center rounded-lg border border-border bg-white p-2">
      <div
        className="w-full overflow-hidden rounded border-2 border-dashed border-muted"
        style={{
          aspectRatio: `${currentTamanho.width}/${currentTamanho.height}`,
          width: tamanho === "10x15" ? "180px" : "100%",
        }}
      >
        <div className="bg-blue-600 py-1 text-center text-[8px] font-bold text-white">
          ESTOKI — IDENTIFICAÇÃO
        </div>
        <div className="space-y-1 p-2">
          <p className="truncate text-[10px] font-bold">{lote.produto_nome || "Produto"}</p>
          <div className="flex items-start gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded border bg-slate-100">
              {qrUrl ? (
                <img src={qrUrl} alt="QR" className="h-full w-full" />
              ) : (
                <QrCode className="h-6 w-6 text-slate-400" />
              )}
            </div>
            <div className="space-y-0.5 text-[7px]">
              <p>
                <strong>Lote:</strong> {lote.numero_lote}
              </p>
              <p>
                <strong>Qtd:</strong> {lote.quantidade_atual} un
              </p>
              <p>
                <strong>Vol:</strong> {volume}/{totalVolumes}
              </p>
              <p>
                <strong>NF:</strong> {lote.nf_entrada || "—"}
              </p>
            </div>
          </div>
          <div className="mt-1 border-t pt-1 text-[6px] text-slate-500">
            <p className="truncate">Fornecedor: {lote.fornecedor || "—"}</p>
            <p>Recebido em: {new Date(lote.data_recebimento).toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
      </div>
      <p className="mt-2 text-[10px] font-medium text-muted-foreground">{currentTamanho.label}</p>
    </div>
  );
}

export function EtiquetaPreviewEntrega({
  entrega,
  tamanho,
  qrUrl,
}: {
  entrega: EntregaItem;
  tamanho: TamanhoEtiqueta;
  qrUrl: string | null;
}) {
  const currentTamanho = tamanhos[tamanho] || tamanhos["10x15"];
  return (
    <div className="flex flex-col items-center rounded-lg border border-border bg-white p-2">
      <div
        className="w-full overflow-hidden rounded border-2 border-dashed border-muted"
        style={{
          aspectRatio: `${currentTamanho.width}/${currentTamanho.height}`,
          width: tamanho === "10x15" ? "180px" : "100%",
        }}
      >
        <div className="bg-blue-600 py-1 text-center text-[8px] font-bold text-white">
          ESTOKI — ENTREGA
        </div>
        <div className="space-y-1 p-2">
          <p className="truncate text-[10px] font-bold">{entrega.cliente}</p>
          <div className="flex items-start gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded border bg-slate-100">
              {qrUrl ? (
                <img src={qrUrl} alt="QR" className="h-full w-full" />
              ) : (
                <QrCode className="h-6 w-6 text-slate-400" />
              )}
            </div>
            <div className="space-y-0.5 text-[7px]">
              <p>
                <strong>Ref:</strong> {entrega.pedido_referencia || "—"}
              </p>
              <p>
                <strong>Qtd:</strong> {entrega.quantidade} un
              </p>
              <p>
                <strong>Peso:</strong> {entrega.peso_kg ? `${entrega.peso_kg}kg` : "—"}
              </p>
              <p>
                <strong>NF:</strong> {entrega.nf_saida || "—"}
              </p>
            </div>
          </div>
          <div className="mt-1 border-t pt-1 text-[6px] text-slate-500">
            <p className="line-clamp-2">End: {entrega.endereco_entrega}</p>
            <p>Romaneio: {entrega.romaneio_codigo || "—"}</p>
          </div>
        </div>
      </div>
      <p className="mt-2 text-[10px] font-medium text-muted-foreground">{currentTamanho.label}</p>
    </div>
  );
}
