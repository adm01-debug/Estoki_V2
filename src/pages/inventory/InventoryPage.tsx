import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { useInventoryCount } from "@/hooks/useInventoryCount";
import { Plus, Download, Clock } from "lucide-react";
import { InventoryStats } from "@/features/inventory/components/inventory-page/InventoryStats";
import { InventoryActionCards } from "@/features/inventory/components/inventory-page/InventoryActionCards";
import { InventorySessionList } from "@/features/inventory/components/inventory-page/InventorySessionList";

export default function InventoryPage() {
  const { items, getAccuracy, getTotalVariance } = useInventoryCount();
  const [query, setQuery] = useState("");

  const accuracy = getAccuracy();
  const variance = getTotalVariance();

  return (
    <AppLayout title="Centro de Inventário" showBack>
      <PageTransition>
        <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tight text-foreground">Controle de Inventário</h1>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest">
                <Clock className="h-3.5 w-3.5" />
                Última atualização: {new Date().toLocaleTimeString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 rounded-xl border-border/40 gap-2 font-bold text-xs uppercase tracking-wider">
                <Download className="h-4 w-4" /> Exportar
              </Button>
              <Button size="sm" className="h-9 rounded-xl glow-button gap-2 font-bold text-xs uppercase tracking-wider">
                <Plus className="h-4 w-4" /> Nova Contagem
              </Button>
            </div>
          </div>

          <InventoryStats 
            accuracy={accuracy} 
            itemCount={items.length} 
            variance={variance} 
          />

          <InventoryActionCards />

          <InventorySessionList 
            items={items} 
            query={query} 
            onQueryChange={setQuery} 
          />
        </div>
      </PageTransition>
    </AppLayout>
  );
}
