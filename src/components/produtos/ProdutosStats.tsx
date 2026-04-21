import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Package, TrendingUp, BarChart3, AlertTriangle } from "lucide-react";

interface Props {
  total: number;
  curvaA: number;
  curvaB: number;
  curvaC: number;
}

export function ProdutosStats({ total, curvaA, curvaB, curvaC }: Props) {
  const items = [
    { icon: Package, value: total, label: "Total", bg: "bg-primary/10", color: "text-primary" },
    { icon: TrendingUp, value: curvaA, label: "Curva A", bg: "bg-primary/10", color: "text-primary" },
    { icon: BarChart3, value: curvaB, label: "Curva B", bg: "bg-secondary/50", color: "text-secondary-foreground" },
    { icon: AlertTriangle, value: curvaC, label: "Curva C", bg: "bg-muted", color: "text-muted-foreground" },
  ];
  return (
    <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {items.map((it) => (
        <Card key={it.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${it.bg}`}>
                <it.icon className={`h-5 w-5 ${it.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{it.value}</p>
                <p className="text-xs text-muted-foreground">{it.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}
