import { useState, useEffect, useMemo, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import {
  Search, Printer, Download, Eye, Loader2, Tag,
  Package, QrCode, ChevronRight, CheckCircle2, RefreshCw
} from "lucide-react";

// ── Types ──
interface LoteItem {
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

type TamanhoEtiqueta = "10x15" | "10x7" | "8x5";

const tamanhos: Record<TamanhoEtiqueta, { width: number; height: number; label: string }> = {
  "10x15": { width: 100, height: 150, label: "10 × 15 cm" },
  "10x7": { width: 100, height: 70, label: "10 × 7 cm" },
  "8x5": { width: 80, height: 50, label: "8 × 5 cm" },
};

// ── Preview Component ──
function EtiquetaPreview({ lote, tamanho, volume, totalVolumes, qrUrl }: {
  lote: LoteItem;
  tamanho: TamanhoEtiqueta;
  volume: number;
  totalVolumes: number;
  qrUrl: string | null;
}) {
  const formatDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");
  const dims = tamanhos[tamanho];
  const isLarge = tamanho === "10x15";

  return (
    <div
      className="border-2 border-dashed border-border rounded-lg overflow-hidden bg-white text-foreground mx-auto"
      style={{ aspectRatio: `${dims.width} / ${dims.height}`, maxWidth: isLarge ? 320 : 280 }}
    >
      {/* Header */}
      <div className="bg-primary text-primary-foreground text-center py-2 font-bold tracking-wider" style={{ fontSize: isLarge ? 14 : 10 }}>
        ESTOKI — IDENTIFICAÇÃO
      </div>

      <div className={`p-${isLarge ? 4 : 3} flex flex-col h-full`} style={{ padding: isLarge ? 16 : 10 }}>
        {/* Product Info */}
        <div className="space-y-1 mb-3">
          <p className="font-bold text-sm truncate">{lote.produto_nome || "Produto"}</p>
          {lote.produto_sku && <p className="text-xs text-muted-foreground">SKU: {lote.produto_sku}</p>}
        </div>

        <Separator className="mb-3" />

        {/* QR + Details */}
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0">
            {qrUrl ? (
              <img src={qrUrl} alt="QR" className="rounded" style={{ width: isLarge ? 90 : 56, height: isLarge ? 90 : 56 }} />
            ) : (
              <div className="bg-muted rounded flex items-center justify-center" style={{ width: isLarge ? 90 : 56, height: isLarge ? 90 : 56 }}>
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="space-y-1.5 text-xs flex-1 min-w-0">
            <div><span className="font-semibold">Lote:</span> {lote.numero_lote}</div>
            <div><span className="font-semibold">NF:</span> {lote.nf_entrada || "—"}</div>
            <div><span className="font-semibold">Qtd:</span> {lote.quantidade_atual} un</div>
            <div><span className="font-semibold">Volume:</span> {volume}/{totalVolumes}</div>
            {lote.fornecedor && <div className="truncate"><span className="font-semibold">Fornec:</span> {lote.fornecedor}</div>}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-2 border-t border-border text-xs text-muted-foreground flex justify-between">
          <span>Recebido: {formatDate(lote.data_recebimento)}</span>
          <span>Impresso: {new Date().toLocaleDateString("pt-BR")}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──
export default function Etiquetas() {
  const { toast } = useToast();
  const [lotes, setLotes] = useState<LoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLotes, setSelectedLotes] = useState<Set<string>>(new Set());
  const [tamanho, setTamanho] = useState<TamanhoEtiqueta>("10x15");
  const [volumesPorLote, setVolumesPorLote] = useState(1);
  const [previewLote, setPreviewLote] = useState<LoteItem | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // ── Fetch lotes with product info ──
  const fetchLotes = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("lotes")
        .select("id, numero_lote, produto_id, quantidade_atual, fornecedor, data_recebimento, nf_entrada, produtos(nome, sku)")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;

      const mapped: LoteItem[] = (data || []).map((l: any) => ({
        id: l.id,
        numero_lote: l.numero_lote,
        produto_id: l.produto_id,
        quantidade_atual: l.quantidade_atual,
        fornecedor: l.fornecedor,
        data_recebimento: l.data_recebimento,
        nf_entrada: l.nf_entrada,
        produto_nome: l.produtos?.nome,
        produto_sku: l.produtos?.sku,
      }));

      setLotes(mapped);
      if (mapped.length > 0 && !previewLote) setPreviewLote(mapped[0]);
    } catch (err: any) {
      toast({ title: "Erro ao carregar lotes", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast, previewLote]);

  useEffect(() => { fetchLotes(); }, []);

  // ── Generate QR for preview ──
  useEffect(() => {
    if (!previewLote) return;
    const gen = async () => {
      const qrData = JSON.stringify({
        type: "material",
        lote: previewLote.numero_lote,
        produto: previewLote.produto_sku || previewLote.produto_id,
        qty: previewLote.quantidade_atual,
        url: `${window.location.origin}/lotes?id=${previewLote.id}`,
      });
      const url = await QRCode.toDataURL(qrData, { width: 300, margin: 1 });
      setQrUrl(url);
    };
    gen();
  }, [previewLote]);

  // ── Filter ──
  const filteredLotes = useMemo(() => {
    if (!searchTerm) return lotes;
    const term = searchTerm.toLowerCase();
    return lotes.filter(l =>
      l.numero_lote.toLowerCase().includes(term) ||
      (l.produto_nome || "").toLowerCase().includes(term) ||
      (l.produto_sku || "").toLowerCase().includes(term) ||
      (l.nf_entrada || "").toLowerCase().includes(term)
    );
  }, [lotes, searchTerm]);

  // ── Selection ──
  const toggleSelect = (id: string) => {
    setSelectedLotes(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const selectAll = () => {
    if (selectedLotes.size === filteredLotes.length) {
      setSelectedLotes(new Set());
    } else {
      setSelectedLotes(new Set(filteredLotes.map(l => l.id)));
    }
  };

  // ── PDF Generation ──
  const generatePDF = async () => {
    const lotesToPrint = selectedLotes.size > 0
      ? lotes.filter(l => selectedLotes.has(l.id))
      : previewLote ? [previewLote] : [];

    if (lotesToPrint.length === 0) {
      toast({ title: "Selecione ao menos um lote", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const { width, height } = tamanhos[tamanho];
      const doc = new jsPDF({
        orientation: width > height ? "landscape" : "portrait",
        unit: "mm",
        format: [width, height],
      });

      let pageIndex = 0;

      for (const lote of lotesToPrint) {
        for (let vol = 1; vol <= volumesPorLote; vol++) {
          if (pageIndex > 0) doc.addPage([width, height]);
          pageIndex++;

          const qrData = JSON.stringify({
            type: "material",
            lote: lote.numero_lote,
            produto: lote.produto_sku || lote.produto_id,
            qty: lote.quantidade_atual,
            volume: vol,
            totalVolumes: volumesPorLote,
            url: `${window.location.origin}/lotes?id=${lote.id}`,
          });

          const qrDataUrl = await QRCode.toDataURL(qrData, { width: 400, margin: 1 });

          // Background
          doc.setFillColor(255, 255, 255);
          doc.rect(0, 0, width, height, "F");

          // Header
          const headerH = tamanho === "10x15" ? 12 : 8;
          doc.setFillColor(37, 99, 235);
          doc.rect(0, 0, width, headerH, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(tamanho === "10x15" ? 12 : 8);
          doc.setFont("helvetica", "bold");
          doc.text("ESTOKI — IDENTIFICAÇÃO", width / 2, headerH * 0.65, { align: "center" });

          doc.setTextColor(0, 0, 0);

          const margin = 5;
          let y = headerH + 6;

          // Product name
          doc.setFontSize(tamanho === "10x15" ? 11 : 7);
          doc.setFont("helvetica", "bold");
          const prodName = (lote.produto_nome || "Produto").substring(0, 40);
          doc.text(prodName, margin, y);
          y += tamanho === "10x15" ? 5 : 4;

          if (lote.produto_sku) {
            doc.setFontSize(tamanho === "10x15" ? 8 : 6);
            doc.setFont("helvetica", "normal");
            doc.text(`SKU: ${lote.produto_sku}`, margin, y);
            y += tamanho === "10x15" ? 5 : 3;
          }

          // Separator line
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, y, width - margin, y);
          y += tamanho === "10x15" ? 5 : 3;

          // QR Code
          const qrSize = tamanho === "10x15" ? 40 : 22;
          doc.addImage(qrDataUrl, "PNG", margin, y, qrSize, qrSize);

          // Info beside QR
          const infoX = margin + qrSize + 5;
          let infoY = y + 2;
          const lineH = tamanho === "10x15" ? 6 : 4;
          doc.setFontSize(tamanho === "10x15" ? 9 : 6);

          const fields = [
            { label: "Lote", value: lote.numero_lote },
            { label: "NF", value: lote.nf_entrada || "—" },
            { label: "Qtd", value: `${lote.quantidade_atual} un` },
            { label: "Volume", value: `${vol}/${volumesPorLote}` },
          ];
          if (lote.fornecedor) fields.push({ label: "Fornec", value: lote.fornecedor.substring(0, 20) });

          for (const f of fields) {
            doc.setFont("helvetica", "bold");
            doc.text(`${f.label}: `, infoX, infoY);
            const labelW = doc.getTextWidth(`${f.label}: `);
            doc.setFont("helvetica", "normal");
            doc.text(f.value, infoX + labelW, infoY);
            infoY += lineH;
          }

          // Footer
          const footerY = height - 8;
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, footerY - 2, width - margin, footerY - 2);
          doc.setFontSize(tamanho === "10x15" ? 7 : 5);
          doc.setFont("helvetica", "normal");
          const recDate = new Date(lote.data_recebimento).toLocaleDateString("pt-BR");
          const printDate = new Date().toLocaleDateString("pt-BR");
          doc.text(`Recebido: ${recDate}`, margin, footerY + 1);
          doc.text(`Impresso: ${printDate}`, width - margin, footerY + 1, { align: "right" });
        }
      }

      const fileName = `etiquetas_${tamanho}_${Date.now()}.pdf`;
      doc.save(fileName);

      toast({
        title: "PDF gerado!",
        description: `${pageIndex} etiqueta(s) em formato ${tamanhos[tamanho].label}`,
      });
    } catch (err: any) {
      toast({ title: "Erro ao gerar PDF", description: err.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppLayout title="Etiquetas QR Code" showBack>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              Impressão de Etiquetas
            </h2>
            <p className="text-sm text-muted-foreground">
              Gere etiquetas 10×15 com QR Code para identificação de materiais
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchLotes} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search + Filters */}
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar lote, produto, SKU, NF..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" onClick={selectAll}>
                {selectedLotes.size === filteredLotes.length && filteredLotes.length > 0 ? "Desmarcar todos" : "Selecionar todos"}
              </Button>
            </div>

            {/* Lotes List */}
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Lotes disponíveis ({filteredLotes.length})</span>
                  {selectedLotes.size > 0 && (
                    <Badge variant="secondary">{selectedLotes.size} selecionado(s)</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : filteredLotes.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground text-sm">Nenhum lote encontrado</p>
                ) : (
                  filteredLotes.map(lote => (
                    <div
                      key={lote.id}
                      className={`flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 cursor-pointer transition-colors hover:bg-accent/50 ${
                        previewLote?.id === lote.id ? "bg-accent/30" : ""
                      }`}
                      onClick={() => setPreviewLote(lote)}
                    >
                      <Checkbox
                        checked={selectedLotes.has(lote.id)}
                        onCheckedChange={() => toggleSelect(lote.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{lote.produto_nome || "Produto"}</p>
                        <p className="text-xs text-muted-foreground">
                          Lote: {lote.numero_lote} • {lote.quantidade_atual} un
                          {lote.nf_entrada && ` • NF: ${lote.nf_entrada}`}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Config + Preview */}
          <div className="space-y-4">
            {/* Config */}
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  Configuração
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs">Tamanho da etiqueta</Label>
                  <Select value={tamanho} onValueChange={(v) => setTamanho(v as TamanhoEtiqueta)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(tamanhos).map(([key, val]) => (
                        <SelectItem key={key} value={key}>
                          {val.label} {key === "10x15" && "⭐"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Volumes por lote</Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={volumesPorLote}
                    onChange={(e) => setVolumesPorLote(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Total: {(selectedLotes.size || 1) * volumesPorLote} etiqueta(s)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Prévia
                </CardTitle>
              </CardHeader>
              <CardContent>
                {previewLote ? (
                  <EtiquetaPreview
                    lote={previewLote}
                    tamanho={tamanho}
                    volume={1}
                    totalVolumes={volumesPorLote}
                    qrUrl={qrUrl}
                  />
                ) : (
                  <p className="text-sm text-center text-muted-foreground py-8">
                    Selecione um lote para visualizar
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={generatePDF}
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Baixar PDF
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={generatePDF}
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                Imprimir
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
