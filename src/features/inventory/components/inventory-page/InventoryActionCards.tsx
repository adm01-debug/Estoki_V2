import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { ClipboardList, History, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function InventoryActionCards() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card
        className="glass-card group cursor-pointer overflow-hidden border-border/30 transition-all duration-500 hover:border-primary/50"
        onClick={() => navigate("/inventario-ciclico")}
      >
        <div className="absolute right-0 top-0 rotate-12 p-8 opacity-[0.03] transition-opacity transition-transform duration-700 group-hover:scale-110 group-hover:opacity-[0.08]">
          <ClipboardList className="h-32 w-32 text-primary" />
        </div>
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 transition-all duration-300 group-hover:shadow-glow-sm">
              <ClipboardList className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <CardTitle className="text-xl font-black tracking-tight transition-colors group-hover:text-primary">
                Inventário Cíclico
              </CardTitle>
              <CardDescription className="text-sm font-medium">
                Contagens rotativas baseadas em Curva ABC ou por Zona. Ideal para manutenção diária
                da acuracidade.
              </CardDescription>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/40 transition-all group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        className="glass-card group cursor-pointer overflow-hidden border-border/30 transition-all duration-500 hover:border-primary/50"
        onClick={() => navigate("/inventory/movements")}
      >
        <div className="absolute right-0 top-0 rotate-12 p-8 opacity-[0.03] transition-opacity transition-transform duration-700 group-hover:scale-110 group-hover:opacity-[0.08]">
          <History className="h-32 w-32 text-primary" />
        </div>
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/50 bg-muted transition-all duration-300 group-hover:shadow-glow-sm">
              <History className="h-8 w-8 text-foreground/70" />
            </div>
            <div className="flex-1 space-y-1">
              <CardTitle className="text-xl font-black tracking-tight transition-colors group-hover:text-primary">
                Histórico de Fluxo
              </CardTitle>
              <CardDescription className="text-sm font-medium">
                Rastreabilidade completa e auditável de todas as movimentações de estoque, entradas
                e saídas.
              </CardDescription>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/40 transition-all group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
