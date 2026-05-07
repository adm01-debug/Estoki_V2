import { useState } from "react";
import { Upload, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { ImportSection } from "@/components/ImportExport/ImportSection";
import { ExportSection } from "@/components/ImportExport/ExportSection";

/**
 * Página de Importação e Exportação de Dados
 * 
 * Centraliza as operações de carga e extração de dados em massa (CSV),
 * permitindo a gestão eficiente de produtos, posições e lotes.
 */
export default function ImportExport() {
  const [activeTab, setActiveTab] = useState("import");

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

        <TabsContent value="import">
          <ImportSection />
        </TabsContent>

        <TabsContent value="export">
          <ExportSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

