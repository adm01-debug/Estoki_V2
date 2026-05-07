import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IMPORT_TEMPLATES } from "./types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function ExportSection() {
  const [exporting, setExporting] = useState<string | null>(null);

  const exportData = async (templateId: string) => {
    const template = IMPORT_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    setExporting(templateId);
    try {
      const { data, error } = await (supabase.from(template.table as any) as any)
        .select("*")
        .limit(5000);
        
      if (error) throw error;

      if (!data || data.length === 0) {
        toast.info(`Nenhum dado encontrado na tabela ${template.label}`);
        return;
      }

      const Papa = (await import('papaparse')).default || (await import('papaparse'));
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `export_${templateId}_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`${data.length} registros exportados!`);
    } catch (err: any) {
      toast.error(`Erro na exportação: ${err.message || String(err)}`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {IMPORT_TEMPLATES.map((t) => (
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
              disabled={exporting !== null}
              className="w-full gap-2"
              variant="outline"
            >
              {exporting === t.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Exportar CSV
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
