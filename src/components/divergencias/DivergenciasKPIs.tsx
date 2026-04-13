import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, TrendingDown, TrendingUp, Package } from "lucide-react";

interface DivergenciasKPIsProps {
  totalDivergencias: number;
  totalFaltas: number;
  totalSobras: number;
  valorTotalDiferenca: number;
}

export function DivergenciasKPIs({ totalDivergencias, totalFaltas, totalSobras, valorTotalDiferenca }: DivergenciasKPIsProps) {
  const items = [
    { icon: AlertTriangle, value: totalDivergencias, label: "Divergências", bg: "bg-red-500/10", text: "text-red-500" },
    { icon: TrendingDown, value: totalFaltas, label: "Faltas", bg: "bg-orange-500/10", text: "text-orange-500" },
    { icon: TrendingUp, value: totalSobras, label: "Sobras", bg: "bg-green-500/10", text: "text-green-500" },
    { icon: Package, value: valorTotalDiferenca, label: "Unid. Diferença", bg: "bg-blue-500/10", text: "text-blue-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map(({ icon: Icon, value, label, bg, text }) => (
        <Card key={label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${bg}`}><Icon className={`h-5 w-5 ${text}`} /></div>
              <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-2xl font-bold">{value}</p></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
