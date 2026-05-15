import { useState, useCallback } from "react";
import { Upload, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TemplateCard } from "./TemplateCard";
import { IMPORT_TEMPLATES, ImportResult } from "./types";
import { ImportResultsCard } from "./ImportResultsCard";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function ImportSection() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const downloadTemplate = async (templateId: string) => {
    const template = IMPORT_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    const Papa = (await import('papaparse')).default || (await import('papaparse'));
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

  const handleImport = useCallback(async (file: File, templateId: string) => {
    const template = IMPORT_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    setImporting(true);
    setResult(null);

    const Papa = (await import('papaparse')).default || (await import('papaparse'));
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const importResult: ImportResult = { success: 0, errors: [], total: results.data.length };

         for (let i = 0; i < results.data.length; i++) {
           const row = results.data[i] as Record<string, unknown>;
          try {
            // Validações básicas
            if (templateId === "produtos" && (!row.sku || !row.nome)) {
              throw new Error("SKU e nome são obrigatórios");
            }
            if (templateId === "posicoes" && (!row.codigo || !row.tipo)) {
              throw new Error("Código e tipo são obrigatórios");
            }
            if (templateId === "lotes" && (!row.numero_lote || !row.produto_sku)) {
              throw new Error("Número do lote e SKU do produto são obrigatórios");
            }

            let insertData = { ...row };
            
            // Caso especial de lotes
            if (templateId === "lotes" && row.produto_sku) {
              const { data: produto } = await supabase
                .from("produtos")
                .select("id")
                .eq("sku", row.produto_sku)
                .maybeSingle();
              
              if (!produto) throw new Error(`Produto SKU "${row.produto_sku}" não encontrado`);
              insertData.produto_id = produto.id;
              delete insertData.produto_sku;
              insertData.quantidade_inicial = Number(insertData.quantidade_inicial) || 0;
              insertData.quantidade_atual = Number(insertData.quantidade_atual) || insertData.quantidade_inicial;
              insertData.data_recebimento = new Date().toISOString();
            }

            // Limpeza de campos vazios e conversão numérica
            Object.keys(insertData).forEach(key => {
              if (insertData[key] === "") delete insertData[key];
              
              // Conversão automática para campos conhecidamente numéricos
              const numericFields = ['estoque_minimo', 'estoque_maximo', 'ponto_pedido', 'capacidade_kg', 'quantidade_inicial', 'quantidade_atual'];
              if (numericFields.includes(key) && insertData[key] !== undefined) {
                insertData[key] = Number(insertData[key]);
              }
            });

             const { error } = await (supabase.from(template.table as never) as never).insert(insertData as never);
             if (error) throw error;
             importResult.success++;
           } catch (err) {
             const error = err as Error;
            importResult.errors.push({ 
              row: i + 2, 
              message: err.message || String(err) 
            });
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
    e.target.value = ''; // Reset
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {IMPORT_TEMPLATES.map((t) => (
          <TemplateCard
            key={t.id}
            {...t}
            isSelected={selectedTemplate === t.id}
            onSelect={setSelectedTemplate}
            onDownloadTemplate={downloadTemplate}
          />
        ))}
      </div>

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

      {result && <ImportResultsCard result={result} />}
    </div>
  );
}
