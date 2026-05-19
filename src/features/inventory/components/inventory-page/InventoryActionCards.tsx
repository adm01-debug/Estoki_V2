import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { ClipboardList, History, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function InventoryActionCards() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass-card border-border/30 group hover:border-primary/50 transition-all duration-500 cursor-pointer overflow-hidden" onClick={() => navigate("/inventario-ciclico")}>
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12 group-hover:scale-110 transition-transform duration-700">
          <ClipboardList className="h-32 w-32 text-primary" />
        </div>
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:shadow-glow-sm transition-all duration-300">
              <ClipboardList className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <CardTitle className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">Inventário Cíclico</CardTitle>
              <CardDescription className="text-sm font-medium">Contagens rotativas baseadas em Curva ABC ou por Zona. Ideal para manutenção diária da acuracidade.</CardDescription>
            </div>
            <div className="w-10 h-10 rounded-full border border-border/40 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-border/30 group hover:border-primary/50 transition-all duration-500 cursor-pointer overflow-hidden" onClick={() => navigate("/inventory/movements")}>
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12 group-hover:scale-110 transition-transform duration-700">
          <History className="h-32 w-32 text-primary" />
        </div>
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center border border-border/50 group-hover:shadow-glow-sm transition-all duration-300">
              <History className="h-8 w-8 text-foreground/70" />
            </div>
            <div className="flex-1 space-y-1">
              <CardTitle className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">Histórico de Fluxo</CardTitle>
              <CardDescription className="text-sm font-medium">Rastreabilidade completa e auditável de todas as movimentações de estoque, entradas e saídas.</CardDescription>
            </div>
            <div className="w-10 h-10 rounded-full border border-border/40 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
