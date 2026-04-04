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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";
// jsPDF loaded dynamically when needed
import {
  Search, Printer, Download, Eye, Loader2, Tag,
  Package, QrCode, ChevronRight, RefreshCw, Truck
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

interface EntregaItem {
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

type FonteData = "lotes" | "entregas";
type TamanhoEtiqueta = "10x15" | "10x7" | "8x5";

const tamanhos: Record<TamanhoEtiqueta, { width: number; height: number; label: string }> = {
  "10x15": { width: 100, height: 150, label: "10 × 15 cm" },
  "10x7": { width: 100, height: 70, label: "10 × 7 cm" },
  "8x5": { width: 80, height: 50, label: "8 × 5 cm" },
};

// Simple unique code generator
function gerarCodigoUnico(prefix: string, id: string): string {
  const hash = id.replace(/-/g, "").substring(0, 8).toUpperCase();
  return `${prefix}-${hash}`;
}

// ── Preview: Lote ──
function EtiquetaPreviewLote({ lote, tamanho, volume, totalVolumes, qrUrl }: {
  lote: LoteItem; tamanho: TamanhoEtiqueta; volume: number; totalVolumes: number; qrUrl: string | null;
}) {
  const formatDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");
  const dims = tamanhos[tamanho];
  const isLarge = tamanho === "10x15";

  return (
    <div className="border-2 border-dashed border-border rounded-lg overflow-hidden bg-white text-foreground mx-auto"
      style={{ aspectRatio: `${dims.width} / ${dims.height}`, maxWidth: isLarge ? 320 : 280 }}>
      <div className="bg-primary text-primary-foreground text-center py-2 font-bold tracking-wider" style={{ fontSize: isLarge ? 14 : 10 }}>
        ESTOKI — IDENTIFICAÇÃO
      </div>
      <div style={{ padding: isLarge ? 16 : 10 }} className="flex flex-col h-full">
        <div className="space-y-1 mb-3">
          <p className="font-bold text-sm truncate">{lote.produto_nome || "Produto"}</p>
          {lote.produto_sku && <p className="text-xs text-muted-foreground">SKU: {lote.produto_sku}</p>}
        </div>
        <Separator className="mb-3" />
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
        <div className="mt-auto pt-2 border-t border-border text-xs text-muted-foreground flex justify-between">
          <span>Recebido: {formatDate(lote.data_recebimento)}</span>
          <span>{new Date().toLocaleDateString("pt-BR")}</span>
        </div>
      </div>
    </div>
  );
}

// ── Preview: Entrega ──
function EtiquetaPreviewEntrega({ entrega, tamanho, qrUrl }: {
  entrega: EntregaItem; tamanho: TamanhoEtiqueta; qrUrl: string | null;
}) {
  const dims = tamanhos[tamanho];
  const isLarge = tamanho === "10x15";
  const codigo = gerarCodigoUnico("ENT", entrega.id);

  return (
    <div className="border-2 border-dashed border-border rounded-lg overflow-hidden bg-white text-foreground mx-auto"
      style={{ aspectRatio: `${dims.width} / ${dims.height}`, maxWidth: isLarge ? 320 : 280 }}>
      <div className="bg-primary text-primary-foreground text-center py-2 font-bold tracking-wider" style={{ fontSize: isLarge ? 14 : 10 }}>
        ESTOKI — ENTREGA
      </div>
      <div style={{ padding: isLarge ? 16 : 10 }} className="flex flex-col h-full">
        <div className="space-y-1 mb-2">
          <p className="font-bold text-sm truncate">{entrega.cliente}</p>
          <p className="text-xs text-muted-foreground font-mono">{codigo}</p>
        </div>
        <Separator className="mb-3" />
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
            {entrega.pedido_referencia && <div><span className="font-semibold">Pedido:</span> {entrega.pedido_referencia}</div>}
            {entrega.nf_saida && <div><span className="font-semibold">NF:</span> {entrega.nf_saida}</div>}
            <div><span className="font-semibold">Qtd:</span> {entrega.quantidade} un</div>
            {entrega.peso_kg && <div><span className="font-semibold">Peso:</span> {entrega.peso_kg} kg</div>}
            {entrega.ordem_entrega && <div><span className="font-semibold">Ordem:</span> #{entrega.ordem_entrega}</div>}
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground truncate">
          📍 {entrega.endereco_entrega}
        </div>
        <div className="mt-auto pt-2 border-t border-border text-xs text-muted-foreground flex justify-between">
          <span>Romaneio: {entrega.romaneio_codigo || "—"}</span>
          <span>{new Date().toLocaleDateString("pt-BR")}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──
export default function Etiquetas() {
  const { toast } = useToast();
  const [fonte, setFonte] = useState<FonteData>("lotes");
  const [lotes, setLotes] = useState<LoteItem[]>([]);
  const [entregas, setEntregas] = useState<EntregaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [tamanho, setTamanho] = useState<TamanhoEtiqueta>("10x15");
  const [volumesPorLote, setVolumesPorLote] = useState(1);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // ── Fetch lotes ──
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
        id: l.id, numero_lote: l.numero_lote, produto_id: l.produto_id,
        quantidade_atual: l.quantidade_atual, fornecedor: l.fornecedor,
        data_recebimento: l.data_recebimento, nf_entrada: l.nf_entrada,
        produto_nome: l.produtos?.nome, produto_sku: l.produtos?.sku,
      }));
      setLotes(mapped);
      if (mapped.length > 0 && !previewId) setPreviewId(mapped[0].id);
    } catch (err: any) {
      toast({ title: "Erro ao carregar lotes", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // ── Fetch entregas ──
  const fetchEntregas = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("romaneio_itens")
        .select("id, cliente, endereco_entrega, pedido_referencia, nf_saida, quantidade, peso_kg, ordem_entrega, romaneio_id, romaneios(codigo), produtos(nome)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      const mapped: EntregaItem[] = (data || []).map((e: any) => ({
        id: e.id, cliente: e.cliente, endereco_entrega: e.endereco_entrega,
        pedido_referencia: e.pedido_referencia, nf_saida: e.nf_saida,
        quantidade: e.quantidade, peso_kg: e.peso_kg, ordem_entrega: e.ordem_entrega,
        romaneio_id: e.romaneio_id, romaneio_codigo: e.romaneios?.codigo,
        produto_nome: e.produtos?.nome,
      }));
      setEntregas(mapped);
      if (mapped.length > 0 && !previewId) setPreviewId(mapped[0].id);
    } catch (err: any) {
      toast({ title: "Erro ao carregar entregas", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    setSelectedIds(new Set());
    setPreviewId(null);
    setQrUrl(null);
    if (fonte === "lotes") fetchLotes();
    else fetchEntregas();
  }, [fonte]);

  // ── QR for preview ──
  useEffect(() => {
    if (!previewId) { setQrUrl(null); return; }
    const gen = async () => {
      if (fonte === "lotes") {
        const lote = lotes.find(l => l.id === previewId);
        if (!lote) return;
        const code = gerarCodigoUnico("MAT", lote.id);
        const url = await QRCode.toDataURL(code, { width: 300, margin: 1 });
        setQrUrl(url);
      } else {
        const entrega = entregas.find(e => e.id === previewId);
        if (!entrega) return;
        const code = gerarCodigoUnico("ENT", entrega.id);
        const url = await QRCode.toDataURL(code, { width: 300, margin: 1 });
        setQrUrl(url);
      }
    };
    gen();
  }, [previewId, fonte, lotes, entregas]);

  // ── Filter ──
  const filteredLotes = useMemo(() => {
    if (!searchTerm) return lotes;
    const t = searchTerm.toLowerCase();
    return lotes.filter(l =>
      l.numero_lote.toLowerCase().includes(t) || (l.produto_nome || "").toLowerCase().includes(t) ||
      (l.produto_sku || "").toLowerCase().includes(t) || (l.nf_entrada || "").toLowerCase().includes(t)
    );
  }, [lotes, searchTerm]);

  const filteredEntregas = useMemo(() => {
    if (!searchTerm) return entregas;
    const t = searchTerm.toLowerCase();
    return entregas.filter(e =>
      e.cliente.toLowerCase().includes(t) || (e.pedido_referencia || "").toLowerCase().includes(t) ||
      (e.nf_saida || "").toLowerCase().includes(t) || (e.romaneio_codigo || "").toLowerCase().includes(t)
    );
  }, [entregas, searchTerm]);

  const currentItems = fonte === "lotes" ? filteredLotes : filteredEntregas;

  // ── Selection ──
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const selectAll = () => {
    if (selectedIds.size === currentItems.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(currentItems.map(i => i.id)));
  };

  // ── PDF for Lotes ──
  const generateLotePDF = async (doc: jsPDF, lotesToPrint: LoteItem[]) => {
    const { width, height } = tamanhos[tamanho];
    let pageIndex = 0;
    for (const lote of lotesToPrint) {
      for (let vol = 1; vol <= volumesPorLote; vol++) {
        if (pageIndex > 0) doc.addPage([width, height]);
        pageIndex++;
        const code = gerarCodigoUnico("MAT", lote.id);
        const qrDataUrl = await QRCode.toDataURL(code, { width: 400, margin: 1 });

        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, width, height, "F");
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
        doc.setFontSize(tamanho === "10x15" ? 11 : 7);
        doc.setFont("helvetica", "bold");
        doc.text((lote.produto_nome || "Produto").substring(0, 40), margin, y);
        y += tamanho === "10x15" ? 5 : 4;
        if (lote.produto_sku) {
          doc.setFontSize(tamanho === "10x15" ? 8 : 6);
          doc.setFont("helvetica", "normal");
          doc.text(`SKU: ${lote.produto_sku}`, margin, y);
          y += tamanho === "10x15" ? 5 : 3;
        }
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, width - margin, y);
        y += tamanho === "10x15" ? 5 : 3;

        const qrSize = tamanho === "10x15" ? 40 : 22;
        doc.addImage(qrDataUrl, "PNG", margin, y, qrSize, qrSize);

        const infoX = margin + qrSize + 5;
        let infoY = y + 2;
        const lineH = tamanho === "10x15" ? 6 : 4;
        doc.setFontSize(tamanho === "10x15" ? 9 : 6);

        const fields = [
          { label: "Código", value: code },
          { label: "Lote", value: lote.numero_lote },
          { label: "NF", value: lote.nf_entrada || "—" },
          { label: "Qtd", value: `${lote.quantidade_atual} un` },
          { label: "Volume", value: `${vol}/${volumesPorLote}` },
        ];
        if (lote.fornecedor) fields.push({ label: "Fornec", value: lote.fornecedor.substring(0, 20) });

        for (const f of fields) {
          doc.setFont("helvetica", "bold");
          doc.text(`${f.label}: `, infoX, infoY);
          const lw = doc.getTextWidth(`${f.label}: `);
          doc.setFont("helvetica", "normal");
          doc.text(f.value, infoX + lw, infoY);
          infoY += lineH;
        }

        const footerY = height - 8;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, footerY - 2, width - margin, footerY - 2);
        doc.setFontSize(tamanho === "10x15" ? 7 : 5);
        doc.setFont("helvetica", "normal");
        doc.text(`Recebido: ${new Date(lote.data_recebimento).toLocaleDateString("pt-BR")}`, margin, footerY + 1);
        doc.text(`Impresso: ${new Date().toLocaleDateString("pt-BR")}`, width - margin, footerY + 1, { align: "right" });
      }
    }
    return pageIndex;
  };

  // ── PDF for Entregas ──
  const generateEntregaPDF = async (doc: jsPDF, entregasToPrint: EntregaItem[]) => {
    const { width, height } = tamanhos[tamanho];
    let pageIndex = 0;
    for (const ent of entregasToPrint) {
      if (pageIndex > 0) doc.addPage([width, height]);
      pageIndex++;
      const code = gerarCodigoUnico("ENT", ent.id);
      const qrDataUrl = await QRCode.toDataURL(code, { width: 400, margin: 1 });

      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, width, height, "F");
      const headerH = tamanho === "10x15" ? 12 : 8;
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, width, headerH, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(tamanho === "10x15" ? 12 : 8);
      doc.setFont("helvetica", "bold");
      doc.text("ESTOKI — ENTREGA", width / 2, headerH * 0.65, { align: "center" });
      doc.setTextColor(0, 0, 0);

      const margin = 5;
      let y = headerH + 6;

      // Cliente
      doc.setFontSize(tamanho === "10x15" ? 11 : 7);
      doc.setFont("helvetica", "bold");
      doc.text(ent.cliente.substring(0, 40), margin, y);
      y += tamanho === "10x15" ? 5 : 4;

      // Código único
      doc.setFontSize(tamanho === "10x15" ? 8 : 6);
      doc.setFont("courier", "normal");
      doc.text(code, margin, y);
      doc.setFont("helvetica", "normal");
      y += tamanho === "10x15" ? 5 : 3;

      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, width - margin, y);
      y += tamanho === "10x15" ? 5 : 3;

      const qrSize = tamanho === "10x15" ? 40 : 22;
      doc.addImage(qrDataUrl, "PNG", margin, y, qrSize, qrSize);

      const infoX = margin + qrSize + 5;
      let infoY = y + 2;
      const lineH = tamanho === "10x15" ? 6 : 4;
      doc.setFontSize(tamanho === "10x15" ? 9 : 6);

      const fields: { label: string; value: string }[] = [];
      if (ent.pedido_referencia) fields.push({ label: "Pedido", value: ent.pedido_referencia });
      if (ent.nf_saida) fields.push({ label: "NF", value: ent.nf_saida });
      fields.push({ label: "Qtd", value: `${ent.quantidade} un` });
      if (ent.peso_kg) fields.push({ label: "Peso", value: `${ent.peso_kg} kg` });
      if (ent.ordem_entrega) fields.push({ label: "Ordem", value: `#${ent.ordem_entrega}` });

      for (const f of fields) {
        doc.setFont("helvetica", "bold");
        doc.text(`${f.label}: `, infoX, infoY);
        const lw = doc.getTextWidth(`${f.label}: `);
        doc.setFont("helvetica", "normal");
        doc.text(f.value, infoX + lw, infoY);
        infoY += lineH;
      }

      // Endereço
      const addrY = y + qrSize + 4;
      if (addrY < height - 15) {
        doc.setFontSize(tamanho === "10x15" ? 8 : 5);
        doc.setFont("helvetica", "normal");
        const addrLines = doc.splitTextToSize(ent.endereco_entrega, width - margin * 2);
        doc.text(addrLines.slice(0, 2), margin, addrY);
      }

      const footerY = height - 8;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, footerY - 2, width - margin, footerY - 2);
      doc.setFontSize(tamanho === "10x15" ? 7 : 5);
      doc.setFont("helvetica", "normal");
      doc.text(`Romaneio: ${ent.romaneio_codigo || "—"}`, margin, footerY + 1);
      doc.text(`Impresso: ${new Date().toLocaleDateString("pt-BR")}`, width - margin, footerY + 1, { align: "right" });
    }
    return pageIndex;
  };

  // ── Generate PDF (both download & print) ──
  const handleGenerate = async (action: "download" | "print") => {
    const ids = selectedIds.size > 0 ? selectedIds : previewId ? new Set([previewId]) : new Set<string>();
    if (ids.size === 0) {
      toast({ title: "Selecione ao menos um item", variant: "destructive" });
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

      let total = 0;
      if (fonte === "lotes") {
        const items = lotes.filter(l => ids.has(l.id));
        total = await generateLotePDF(doc, items);
      } else {
        const items = entregas.filter(e => ids.has(e.id));
        total = await generateEntregaPDF(doc, items);
      }

      if (action === "download") {
        doc.save(`etiquetas_${fonte}_${tamanho}_${Date.now()}.pdf`);
      } else {
        const blob = doc.output("blob");
        const url = URL.createObjectURL(blob);
        const printWin = window.open(url);
        if (printWin) {
          printWin.addEventListener("load", () => { printWin.print(); });
        }
      }

      toast({ title: "Etiquetas geradas!", description: `${total} etiqueta(s) em ${tamanhos[tamanho].label}` });
    } catch (err: any) {
      toast({ title: "Erro ao gerar", description: err.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const previewLote = lotes.find(l => l.id === previewId) || null;
  const previewEntrega = entregas.find(e => e.id === previewId) || null;

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
              Gere etiquetas com QR Code para identificação de materiais e entregas
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => fonte === "lotes" ? fetchLotes() : fetchEntregas()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        {/* Tabs fonte de dados */}
        <Tabs value={fonte} onValueChange={(v) => setFonte(v as FonteData)}>
          <TabsList>
            <TabsTrigger value="lotes" className="gap-2">
              <Package className="h-4 w-4" /> Lotes / Materiais
            </TabsTrigger>
            <TabsTrigger value="entregas" className="gap-2">
              <Truck className="h-4 w-4" /> Entregas
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={fonte === "lotes" ? "Buscar lote, produto, SKU, NF..." : "Buscar cliente, pedido, NF, romaneio..."}
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" onClick={selectAll}>
                {selectedIds.size === currentItems.length && currentItems.length > 0 ? "Desmarcar todos" : "Selecionar todos"}
              </Button>
            </div>

            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{fonte === "lotes" ? "Lotes" : "Entregas"} ({currentItems.length})</span>
                  {selectedIds.size > 0 && <Badge variant="secondary">{selectedIds.size} selecionado(s)</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : currentItems.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground text-sm">Nenhum registro encontrado</p>
                ) : fonte === "lotes" ? (
                  filteredLotes.map(lote => (
                    <div key={lote.id}
                      className={`flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 cursor-pointer transition-colors hover:bg-accent/50 ${previewId === lote.id ? "bg-accent/30" : ""}`}
                      onClick={() => setPreviewId(lote.id)}>
                      <Checkbox checked={selectedIds.has(lote.id)} onCheckedChange={() => toggleSelect(lote.id)} onClick={(e) => e.stopPropagation()} />
                      <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{lote.produto_nome || "Produto"}</p>
                        <p className="text-xs text-muted-foreground">
                          Lote: {lote.numero_lote} • {lote.quantidade_atual} un{lote.nf_entrada && ` • NF: ${lote.nf_entrada}`}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  ))
                ) : (
                  filteredEntregas.map(ent => (
                    <div key={ent.id}
                      className={`flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 cursor-pointer transition-colors hover:bg-accent/50 ${previewId === ent.id ? "bg-accent/30" : ""}`}
                      onClick={() => setPreviewId(ent.id)}>
                      <Checkbox checked={selectedIds.has(ent.id)} onCheckedChange={() => toggleSelect(ent.id)} onClick={(e) => e.stopPropagation()} />
                      <Truck className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{ent.cliente}</p>
                        <p className="text-xs text-muted-foreground">
                          {ent.pedido_referencia && `Pedido: ${ent.pedido_referencia} • `}{ent.quantidade} un{ent.nf_saida && ` • NF: ${ent.nf_saida}`}
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
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2"><QrCode className="h-4 w-4" />Configuração</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs">Tamanho da etiqueta</Label>
                  <Select value={tamanho} onValueChange={(v) => setTamanho(v as TamanhoEtiqueta)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(tamanhos).map(([key, val]) => (
                        <SelectItem key={key} value={key}>{val.label} {key === "10x15" && "⭐"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {fonte === "lotes" && (
                  <div>
                    <Label className="text-xs">Volumes por lote</Label>
                    <Input type="number" min={1} max={50} value={volumesPorLote}
                      onChange={(e) => setVolumesPorLote(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))} />
                    <p className="text-xs text-muted-foreground mt-1">
                      Total: {(selectedIds.size || 1) * volumesPorLote} etiqueta(s)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4" />Prévia</CardTitle>
              </CardHeader>
              <CardContent>
                {fonte === "lotes" && previewLote ? (
                  <EtiquetaPreviewLote lote={previewLote} tamanho={tamanho} volume={1} totalVolumes={volumesPorLote} qrUrl={qrUrl} />
                ) : fonte === "entregas" && previewEntrega ? (
                  <EtiquetaPreviewEntrega entrega={previewEntrega} tamanho={tamanho} qrUrl={qrUrl} />
                ) : (
                  <p className="text-sm text-center text-muted-foreground py-8">Selecione um item para visualizar</p>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2" onClick={() => handleGenerate("download")} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Baixar PDF
              </Button>
              <Button className="flex-1 gap-2" onClick={() => handleGenerate("print")} disabled={isGenerating}>
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
