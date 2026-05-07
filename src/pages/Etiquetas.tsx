import { useState, useEffect, useMemo, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";
import { Search, Printer, Download, Eye, Loader2, Tag, Package, QrCode, ChevronRight, RefreshCw, Truck } from "lucide-react";
import { EtiquetaPreviewLote, EtiquetaPreviewEntrega } from "@/components/etiquetas/EtiquetaPreview";
import { type LoteItem, type EntregaItem, type FonteData, type TamanhoEtiqueta, tamanhos } from "@/components/etiquetas/types";
import { gerarCodigoUnico } from "@/components/etiquetas/etiquetaUtils";
import { generateLotePDF, generateEntregaPDF } from "@/components/etiquetas/pdfGenerators";

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

  const fetchLotes = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("lotes").select("id, numero_lote, produto_id, quantidade_atual, fornecedor, data_recebimento, nf_entrada, produtos(nome, sku)").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      const mapped: LoteItem[] = (data || []).map((l: Record<string, unknown>) => ({ id: l.id as string, numero_lote: l.numero_lote as string, produto_id: l.produto_id as string, quantidade_atual: l.quantidade_atual as number, fornecedor: l.fornecedor as string | null, data_recebimento: l.data_recebimento as string, nf_entrada: l.nf_entrada as string | null, produto_nome: (l.produtos as Record<string, unknown> | null)?.nome as string | undefined, produto_sku: (l.produtos as Record<string, unknown> | null)?.sku as string | undefined }));
      setLotes(mapped);
      if (mapped.length > 0 && !previewId) setPreviewId(mapped[0].id);
    } catch (err: unknown) { toast({ title: "Erro ao carregar lotes", description: (err instanceof Error ? err.message : String(err)), variant: "destructive" }); }
    finally { setLoading(false); }
  }, [toast, previewId]);

  const fetchEntregas = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("romaneio_itens").select("id, cliente, endereco_entrega, pedido_referencia, nf_saida, quantidade, peso_kg, ordem_entrega, romaneio_id, romaneios(codigo), produtos(nome)").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      const mapped: EntregaItem[] = (data || []).map((e: Record<string, unknown>) => ({ id: e.id as string, cliente: e.cliente as string, endereco_entrega: e.endereco_entrega as string, pedido_referencia: e.pedido_referencia as string | null, nf_saida: e.nf_saida as string | null, quantidade: e.quantidade as number, peso_kg: e.peso_kg as number | null, ordem_entrega: e.ordem_entrega as number | null, romaneio_id: e.romaneio_id as string, romaneio_codigo: (e.romaneios as Record<string, unknown> | null)?.codigo as string | undefined, produto_nome: (e.produtos as Record<string, unknown> | null)?.nome as string | undefined }));
      setEntregas(mapped);
      if (mapped.length > 0 && !previewId) setPreviewId(mapped[0].id);
    } catch (err: unknown) { toast({ title: "Erro ao carregar entregas", description: (err instanceof Error ? err.message : String(err)), variant: "destructive" }); }
    finally { setLoading(false); }
  }, [toast, previewId]);

  useEffect(() => { setSelectedIds(new Set()); setPreviewId(null); setQrUrl(null); if (fonte === "lotes") fetchLotes(); else fetchEntregas(); }, [fonte]);

  useEffect(() => {
    if (!previewId) { setQrUrl(null); return; }
    const gen = async () => {
      const item = fonte === "lotes" ? lotes.find(l => l.id === previewId) : entregas.find(e => e.id === previewId);
      if (!item) return;
      const prefix = fonte === "lotes" ? "MAT" : "ENT";
      const url = await QRCode.toDataURL(gerarCodigoUnico(prefix, item.id), { width: 300, margin: 1 });
      setQrUrl(url);
    };
    gen();
  }, [previewId, fonte, lotes, entregas]);

  const filteredLotes = useMemo(() => { if (!searchTerm) return lotes; const t = searchTerm.toLowerCase(); return lotes.filter(l => l.numero_lote.toLowerCase().includes(t) || (l.produto_nome || "").toLowerCase().includes(t) || (l.produto_sku || "").toLowerCase().includes(t) || (l.nf_entrada || "").toLowerCase().includes(t)); }, [lotes, searchTerm]);
  const filteredEntregas = useMemo(() => { if (!searchTerm) return entregas; const t = searchTerm.toLowerCase(); return entregas.filter(e => e.cliente.toLowerCase().includes(t) || (e.pedido_referencia || "").toLowerCase().includes(t) || (e.nf_saida || "").toLowerCase().includes(t) || (e.romaneio_codigo || "").toLowerCase().includes(t)); }, [entregas, searchTerm]);
  const currentItems = fonte === "lotes" ? filteredLotes : filteredEntregas;

  const toggleSelect = (id: string) => { setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); };
  const selectAll = () => { if (selectedIds.size === currentItems.length) setSelectedIds(new Set()); else setSelectedIds(new Set(currentItems.map(i => i.id))); };

  const handleGenerate = async (action: "download" | "print") => {
    const ids = selectedIds.size > 0 ? selectedIds : previewId ? new Set([previewId]) : new Set<string>();
    if (ids.size === 0) { toast({ title: "Selecione ao menos um item", variant: "destructive" }); return; }
    setIsGenerating(true);
    try {
      const { width, height } = tamanhos[tamanho];
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: width > height ? "landscape" : "portrait", unit: "mm", format: [width, height] });
      let total = 0;
      if (fonte === "lotes") { total = await generateLotePDF(doc, lotes.filter(l => ids.has(l.id)), tamanho, volumesPorLote); }
      else { total = await generateEntregaPDF(doc, entregas.filter(e => ids.has(e.id)), tamanho); }
      if (action === "download") { doc.save(`etiquetas_${fonte}_${tamanho}_${Date.now()}.pdf`); }
      else { const blob = doc.output("blob"); const url = URL.createObjectURL(blob); const printWin = window.open(url); if (printWin) { printWin.addEventListener("load", () => { printWin.print(); }); } }
      toast({ title: "Etiquetas geradas!", description: `${total} etiqueta(s) em ${tamanhos[tamanho].label}` });
    } catch (err: unknown) { toast({ title: "Erro ao gerar", description: (err instanceof Error ? err.message : String(err)), variant: "destructive" }); }
    finally { setIsGenerating(false); }
  };

  const previewLote = lotes.find(l => l.id === previewId) || null;
  const previewEntrega = entregas.find(e => e.id === previewId) || null;

  return (
    <AppLayout title="Etiquetas QR Code" showBack>
      <div className="p-4 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2"><Tag className="h-5 w-5 text-primary" />Impressão de Etiquetas</h2>
            <p className="text-sm text-muted-foreground">Gere etiquetas com QR Code para identificação de materiais e entregas</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => fonte === "lotes" ? fetchLotes() : fetchEntregas()} disabled={loading}><RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />Atualizar</Button>
        </div>

        <Tabs value={fonte} onValueChange={(v) => setFonte(v as FonteData)}>
          <TabsList>
            <TabsTrigger value="lotes" className="gap-2"><Package className="h-4 w-4" /> Lotes / Materiais</TabsTrigger>
            <TabsTrigger value="entregas" className="gap-2"><Truck className="h-4 w-4" /> Entregas</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={fonte === "lotes" ? "Buscar lote, produto, SKU, NF..." : "Buscar cliente, pedido, NF, romaneio..."} className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
              <Button variant="outline" size="sm" onClick={selectAll}>{selectedIds.size === currentItems.length && currentItems.length > 0 ? "Desmarcar todos" : "Selecionar todos"}</Button>
            </div>
            <Card>
              <CardHeader className="py-3 px-4"><CardTitle className="text-sm flex items-center justify-between"><span>{fonte === "lotes" ? "Lotes" : "Entregas"} ({currentItems.length})</span>{selectedIds.size > 0 && <Badge variant="secondary">{selectedIds.size} selecionado(s)</Badge>}</CardTitle></CardHeader>
              <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                : currentItems.length === 0 ? <p className="text-center py-8 text-muted-foreground text-sm">Nenhum registro encontrado</p>
                : fonte === "lotes" ? filteredLotes.map(lote => (
                  <div key={lote.id} className={`flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 cursor-pointer transition-colors hover:bg-accent/50 ${previewId === lote.id ? "bg-accent/30" : ""}`} onClick={() => setPreviewId(lote.id)}>
                    <Checkbox checked={selectedIds.has(lote.id)} onCheckedChange={() => toggleSelect(lote.id)} onClick={(e) => e.stopPropagation()} />
                    <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{lote.produto_nome || "Produto"}</p><p className="text-xs text-muted-foreground">Lote: {lote.numero_lote} • {lote.quantidade_atual} un{lote.nf_entrada && ` • NF: ${lote.nf_entrada}`}</p></div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                )) : filteredEntregas.map(ent => (
                  <div key={ent.id} className={`flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 cursor-pointer transition-colors hover:bg-accent/50 ${previewId === ent.id ? "bg-accent/30" : ""}`} onClick={() => setPreviewId(ent.id)}>
                    <Checkbox checked={selectedIds.has(ent.id)} onCheckedChange={() => toggleSelect(ent.id)} onClick={(e) => e.stopPropagation()} />
                    <Truck className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{ent.cliente}</p><p className="text-xs text-muted-foreground">{ent.pedido_referencia && `Pedido: ${ent.pedido_referencia} • `}{ent.quantidade} un{ent.nf_saida && ` • NF: ${ent.nf_saida}`}</p></div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="py-3 px-4"><CardTitle className="text-sm flex items-center gap-2"><QrCode className="h-4 w-4" />Configuração</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label className="text-xs">Tamanho da etiqueta</Label><Select value={tamanho} onValueChange={(v) => setTamanho(v as TamanhoEtiqueta)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(tamanhos).map(([key, val]) => <SelectItem key={key} value={key}>{val.label} {key === "10x15" && "⭐"}</SelectItem>)}</SelectContent></Select></div>
                {fonte === "lotes" && <div><Label className="text-xs">Volumes por lote</Label><Input type="number" min={1} max={50} value={volumesPorLote} onChange={(e) => setVolumesPorLote(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))} /><p className="text-xs text-muted-foreground mt-1">Total: {(selectedIds.size || 1) * volumesPorLote} etiqueta(s)</p></div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3 px-4"><CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4" />Prévia</CardTitle></CardHeader>
              <CardContent>
                {fonte === "lotes" && previewLote ? <EtiquetaPreviewLote lote={previewLote} tamanho={tamanho} volume={1} totalVolumes={volumesPorLote} qrUrl={qrUrl} />
                : fonte === "entregas" && previewEntrega ? <EtiquetaPreviewEntrega entrega={previewEntrega} tamanho={tamanho} qrUrl={qrUrl} />
                : <p className="text-sm text-center text-muted-foreground py-8">Selecione um item para visualizar</p>}
              </CardContent>
            </Card>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2" onClick={() => handleGenerate("download")} disabled={isGenerating}>{isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}Baixar PDF</Button>
              <Button className="flex-1 gap-2" onClick={() => handleGenerate("print")} disabled={isGenerating}>{isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}Imprimir</Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
