import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Upload, Download, FileSpreadsheet, FileText, Package, 
  MapPin, Layers, CheckCircle2, AlertTriangle, Loader2, X, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
// papaparse loaded dynamically

interface ImportResult {
  success: number;
  errors: { row: number; message: string }[];
  total: number;
}

const templates = [
  { 
    id: "produtos", 
    icon: Package, 
    label: "Produtos", 
    description: "SKU, nome, descrição, unidade, curva ABC",
    headers: ["sku", "nome", "descricao", "unidade", "curva_abc", "estoque_minimo", "estoque_maximo", "ponto_pedido", "fornecedor_principal"],
    table: "produtos",
  },
  { 
    id: "posicoes", 
    icon: MapPin, 
    label: "Posições", 
    description: "Código, zona, tipo, capacidade",
    headers: ["codigo", "zona", "tipo", "porta_palete", "secao", "nivel", "box", "capacidade_kg"],
    table: "posicoes_estoque",
  },
  { 
    id: "lotes", 
    icon: Layers, 
    label: "Lotes", 
    description: "Número, produto, quantidade, validade",
    headers: ["numero_lote", "produto_sku", "quantidade_inicial", "quantidade_atual", "data_validade", "data_fabricacao", "fornecedor", "nf_entrada"],
    table: "lotes",
  },
];

export default function ImportExport() {
  const [activeTab, setActiveTab] = useState("import");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const downloadTemplate = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    const Papa = (await import('papaparse')).default;
    const csv = Papa.unparse({ fields: template.headers, data: [] });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `template_${templateId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Template ${template.label} baixado!`);
  };

  const exportData = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    setExporting(true);
    try {
      const { data, error } = await (supabase.from(template.table as any) as any).select("*").limit(5000);
      if (error) throw error;

      const Papa = (await import('papaparse')).default;
      const csv = Papa.unparse(data || []);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `export_${templateId}_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`${data?.length || 0} registros exportados!`);
    } catch (err: any) {
      toast.error(`Erro na exportação: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = useCallback(async (file: File, templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    setImporting(true);
    setResult(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const importResult: ImportResult = { success: 0, errors: [], total: results.data.length };

        for (let i = 0; i < results.data.length; i++) {
          const row = results.data[i] as any;
          try {
            // Validate required fields
            if (templateId === "produtos" && (!row.sku || !row.nome)) {
              throw new Error("SKU e nome são obrigatórios");
            }
            if (templateId === "posicoes" && (!row.codigo || !row.tipo)) {
              throw new Error("Código e tipo são obrigatórios");
            }
            if (templateId === "lotes" && (!row.numero_lote || !row.produto_sku)) {
              throw new Error("Número do lote e SKU do produto são obrigatórios");
            }

            // Handle lotes special case (need produto_id from SKU)
            let insertData = { ...row };
            if (templateId === "lotes" && row.produto_sku) {
              const { data: produto } = await supabase
                .from("produtos")
                .select("id")
                .eq("sku", row.produto_sku)
                .single();
              
              if (!produto) throw new Error(`Produto SKU "${row.produto_sku}" não encontrado`);
              insertData.produto_id = produto.id;
              delete insertData.produto_sku;
              insertData.quantidade_inicial = Number(insertData.quantidade_inicial) || 0;
              insertData.quantidade_atual = Number(insertData.quantidade_atual) || insertData.quantidade_inicial;
              insertData.data_recebimento = new Date().toISOString();
            }

            // Clean empty strings
            Object.keys(insertData).forEach(key => {
              if (insertData[key] === "") delete insertData[key];
            });

            // Convert numeric fields
            if (insertData.estoque_minimo) insertData.estoque_minimo = Number(insertData.estoque_minimo);
            if (insertData.estoque_maximo) insertData.estoque_maximo = Number(insertData.estoque_maximo);
            if (insertData.ponto_pedido) insertData.ponto_pedido = Number(insertData.ponto_pedido);
            if (insertData.capacidade_kg) insertData.capacidade_kg = Number(insertData.capacidade_kg);

            const { error } = await (supabase.from(template.table as any) as any).insert(insertData);
            if (error) throw error;
            importResult.success++;
          } catch (err: any) {
            importResult.errors.push({ row: i + 2, message: err.message });
          }
        }

        setResult(importResult);
        setImporting(false);

        if (importResult.errors.length === 0) {
          toast.success(`${importResult.success} registros importados com sucesso!`);
        } else {
          toast.warning(`${importResult.success} importados, ${importResult.errors.length} erros`);
        }
      },
      error: (err) => {
        toast.error(`Erro ao ler arquivo: ${err.message}`);
        setImporting(false);
      },
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && selectedTemplate) {
      handleImport(file, selectedTemplate);
    }
  }, [selectedTemplate, handleImport]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedTemplate) {
      handleImport(file, selectedTemplate);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto">
      <PageHeader 
        title="Importar / Exportar" 
        description="Gerencie dados em massa via CSV"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="import" className="gap-2">
            <Upload className="h-4 w-4" /> Importar
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-2">
            <Download className="h-4 w-4" /> Exportar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          {/* Template Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {templates.map((t) => (
              <motion.button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedTemplate === t.id
                    ? "border-primary/50 bg-primary/5 shadow-glow-sm"
                    : "border-border/40 bg-card/80 hover:border-primary/30"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    selectedTemplate === t.id ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                  }`}>
                    <t.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.description}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-primary"
                  onClick={(e) => { e.stopPropagation(); downloadTemplate(t.id); }}
                >
                  <Download className="h-3 w-3 mr-1" /> Baixar template
                </Button>
              </motion.button>
            ))}
          </div>

          {/* Drop Zone */}
          {selectedTemplate && (
            <Card 
              className={`glass-card border-dashed border-2 transition-all ${
                dragOver ? "border-primary bg-primary/5" : "border-border/40"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                {importing ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="text-sm font-medium">Importando dados...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium text-foreground mb-1">
                      Arraste seu arquivo CSV aqui
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">ou clique para selecionar</p>
                    <label className="cursor-pointer">
                      <input type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
                      <Button variant="outline" className="gap-2" asChild>
                        <span><FileText className="h-4 w-4" /> Selecionar arquivo</span>
                      </Button>
                    </label>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Import Results */}
          {result && (
            <Card className="glass-card border-border/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {result.errors.length === 0 ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  )}
                  Resultado da Importação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-4">
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                    ✓ {result.success} importados
                  </Badge>
                  {result.errors.length > 0 && (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                      ✕ {result.errors.length} erros
                    </Badge>
                  )}
                  <Badge variant="outline">{result.total} total</Badge>
                </div>
                {result.errors.length > 0 && (
                  <div className="max-h-40 overflow-auto text-xs space-y-1 bg-destructive/5 p-3 rounded-lg">
                    {result.errors.slice(0, 20).map((err, i) => (
                      <p key={i} className="text-destructive">
                        Linha {err.row}: {err.message}
                      </p>
                    ))}
                    {result.errors.length > 20 && (
                      <p className="text-muted-foreground">...e mais {result.errors.length - 20} erros</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {templates.map((t) => (
              <Card key={t.id} className="glass-card border-border/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <t.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.description}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => exportData(t.id)} 
                    disabled={exporting}
                    className="w-full gap-2"
                    variant="outline"
                  >
                    {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Exportar CSV
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
