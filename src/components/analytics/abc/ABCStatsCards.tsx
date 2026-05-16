import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";
import { EstatisticasABC } from "@/features/analytics/hooks/useCurvaABC";

interface ABCStatsCardsProps {
  estatisticas: EstatisticasABC;
}

export function ABCStatsCards({ estatisticas }: ABCStatsCardsProps) {
  const items = [
    { label: "Curva A", value: estatisticas.produtosA, color: "green" },
    { label: "Curva B", value: estatisticas.produtosB, color: "amber" },
    { label: "Curva C", value: estatisticas.produtosC, color: "blue" },
    { label: "Total", value: estatisticas.totalProdutos, color: "primary" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                item.color === 'green' ? 'bg-green-500/10' : 
                item.color === 'amber' ? 'bg-amber-500/10' : 
                item.color === 'blue' ? 'bg-blue-500/10' : 
                'bg-primary/10'
              }`}>
                <Package className={`h-5 w-5 ${
                  item.color === 'green' ? 'text-green-500' : 
                  item.color === 'amber' ? 'text-amber-500' : 
                  item.color === 'blue' ? 'text-blue-500' : 
                  'text-primary'
                }`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold">{item.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}