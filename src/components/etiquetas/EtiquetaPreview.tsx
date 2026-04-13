import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

export interface LoteItem {
  id: string;
  numero_lote: string;
  produto_id: string;
  quantidade_atual: number;
  fornecedor: string | null;
  data_recebimento: string;
  nf_entrada: string | null;
  produto_nome?: string;
  produto_sku?: string;
}

export interface EntregaItem {
  id: string;
  cliente: string;
  endereco_entrega: string;
  pedido_referencia: string | null;
  nf_saida: string | null;
  quantidade: number;
  peso_kg: number | null;
  ordem_entrega: number | null;
  romaneio_id: string;
  romaneio_codigo?: string;
  produto_nome?: string;
}

export type FonteData = "lotes" | "entregas";
export type TamanhoEtiqueta = "10x15" | "10x7" | "8x5";

export const tamanhos: Record<TamanhoEtiqueta, { width: number; height: number; label: string }> = {
  "10x15": { width: 100, height: 150, label: "10 × 15 cm" },
  "10x7": { width: 100, height: 70, label: "10 × 7 cm" },
  "8x5": { width: 80, height: 50, label: "8 × 5 cm" },
};

export function gerarCodigoUnico(prefix: string, id: string): string {
  const hash = id.replace(/-/g, "").substring(0, 8).toUpperCase();
  return `${prefix}-${hash}`;
}

export function EtiquetaPreviewLote({ lote, tamanho, volume, totalVolumes, qrUrl }: { lote: LoteItem; tamanho: TamanhoEtiqueta; volume: number; totalVolumes: number; qrUrl: string | null }) {
  const formatDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");
  const dims = tamanhos[tamanho];
  const isLarge = tamanho === "10x15";

  return (
    <div className="border-2 border-dashed border-border rounded-lg overflow-hidden bg-white text-foreground mx-auto" style={{ aspectRatio: `${dims.width} / ${dims.height}`, maxWidth: isLarge ? 320 : 280 }}>
      <div className="bg-primary text-primary-foreground text-center py-2 font-bold tracking-wider" style={{ fontSize: isLarge ? 14 : 10 }}>ESTOKI — IDENTIFICAÇÃO</div>
      <div style={{ padding: isLarge ? 16 : 10 }} className="flex flex-col h-full">
        <div className="space-y-1 mb-3">
          <p className="font-bold text-sm truncate">{lote.produto_nome || "Produto"}</p>
          {lote.produto_sku && <p className="text-xs text-muted-foreground">SKU: {lote.produto_sku}</p>}
        </div>
        <Separator className="mb-3" />
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0">
            {qrUrl ? <img src={qrUrl} alt="QR" className="rounded" style={{ width: isLarge ? 90 : 56, height: isLarge ? 90 : 56 }} /> : <div className="bg-muted rounded flex items-center justify-center" style={{ width: isLarge ? 90 : 56, height: isLarge ? 90 : 56 }}><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}
          </div>
          <div className="space-y-1.5 text-xs flex-1 min-w-0">
            <div><span className="font-semibold">Lote:</span> {lote.numero_lote}</div>
            <div><span className="font-semibold">NF:</span> {lote.nf_entrada || "—"}</div>
            <div><span className="font-semibold">Qtd:</span> {lote.quantidade_atual} un</div>
            <div><span className="font-semibold">Volume:</span> {volume}/{totalVolumes}</div>
            {lote.fornecedor && <div className="truncate"><span className="font-semibold">Fornec:</span> {lote.fornecedor}</div>}
          </div>
        </div>
        <div className="mt-auto pt-2 border-t border-border text-xs text-muted-foreground flex justify-between">
          <span>Recebido: {formatDate(lote.data_recebimento)}</span>
          <span>{new Date().toLocaleDateString("pt-BR")}</span>
        </div>
      </div>
    </div>
  );
}

export function EtiquetaPreviewEntrega({ entrega, tamanho, qrUrl }: { entrega: EntregaItem; tamanho: TamanhoEtiqueta; qrUrl: string | null }) {
  const dims = tamanhos[tamanho];
  const isLarge = tamanho === "10x15";
  const codigo = gerarCodigoUnico("ENT", entrega.id);

  return (
    <div className="border-2 border-dashed border-border rounded-lg overflow-hidden bg-white text-foreground mx-auto" style={{ aspectRatio: `${dims.width} / ${dims.height}`, maxWidth: isLarge ? 320 : 280 }}>
      <div className="bg-primary text-primary-foreground text-center py-2 font-bold tracking-wider" style={{ fontSize: isLarge ? 14 : 10 }}>ESTOKI — ENTREGA</div>
      <div style={{ padding: isLarge ? 16 : 10 }} className="flex flex-col h-full">
        <div className="space-y-1 mb-2">
          <p className="font-bold text-sm truncate">{entrega.cliente}</p>
          <p className="text-xs text-muted-foreground font-mono">{codigo}</p>
        </div>
        <Separator className="mb-3" />
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0">
            {qrUrl ? <img src={qrUrl} alt="QR" className="rounded" style={{ width: isLarge ? 90 : 56, height: isLarge ? 90 : 56 }} /> : <div className="bg-muted rounded flex items-center justify-center" style={{ width: isLarge ? 90 : 56, height: isLarge ? 90 : 56 }}><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}
          </div>
          <div className="space-y-1.5 text-xs flex-1 min-w-0">
            {entrega.pedido_referencia && <div><span className="font-semibold">Pedido:</span> {entrega.pedido_referencia}</div>}
            {entrega.nf_saida && <div><span className="font-semibold">NF:</span> {entrega.nf_saida}</div>}
            <div><span className="font-semibold">Qtd:</span> {entrega.quantidade} un</div>
            {entrega.peso_kg && <div><span className="font-semibold">Peso:</span> {entrega.peso_kg} kg</div>}
            {entrega.ordem_entrega && <div><span className="font-semibold">Ordem:</span> #{entrega.ordem_entrega}</div>}
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground truncate">📍 {entrega.endereco_entrega}</div>
        <div className="mt-auto pt-2 border-t border-border text-xs text-muted-foreground flex justify-between">
          <span>Romaneio: {entrega.romaneio_codigo || "—"}</span>
          <span>{new Date().toLocaleDateString("pt-BR")}</span>
        </div>
      </div>
    </div>
  );
}
