import { Card, CardContent } from "@/components/ui/card";
import { Building2, CheckCircle, Package, AlertTriangle } from "lucide-react";

interface FornecedorKPIsProps {
  total: number;
  qualidadeMedia: number;
  pontualidadeMedia: number;
  criticos: number;
}

export function FornecedorKPIs({ total, qualidadeMedia, pontualidadeMedia, criticos }: FornecedorKPIsProps) {
  const items = [
    { icon: Building2, value: total, label: "Fornecedores", bg: "bg-primary/10", text: "text-primary" },
    { icon: CheckCircle, value: `${qualidadeMedia.toFixed(1)}%`, label: "Qualidade Média", bg: "bg-green-500/10", text: "text-green-500" },
    { icon: Package, value: `${pontualidadeMedia.toFixed(1)}%`, label: "Pontualidade", bg: "bg-blue-500/10", text: "text-blue-500" },
    { icon: AlertTriangle, value: criticos, label: "Críticos", bg: "bg-amber-500/10", text: "text-amber-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map(({ icon: Icon, value, label, bg, text }) => (
        <Card key={label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${bg}`}><Icon className={`h-5 w-5 ${text}`} /></div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
