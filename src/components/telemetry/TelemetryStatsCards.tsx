import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Clock, Zap, Database } from "lucide-react";

interface TelemetryStatsCardsProps {
  verySlow: number;
  slow: number;
  errors: number;
  avgDuration: string;
}

export function TelemetryStatsCards({ verySlow, slow, errors, avgDuration }: TelemetryStatsCardsProps) {
  const items = [
    { icon: AlertTriangle, value: verySlow, label: "Muito Lentas (>8s)", bg: "bg-destructive/10", text: "text-destructive" },
    { icon: Clock, value: slow, label: "Lentas (>3s)", bg: "bg-yellow-500/10", text: "text-yellow-600" },
    { icon: Zap, value: errors, label: "Erros", bg: "bg-destructive/10", text: "text-destructive" },
    { icon: Database, value: avgDuration, label: "Média de duração", bg: "bg-primary/10", text: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map(({ icon: Icon, value, label, bg, text }) => (
        <Card key={label}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${bg}`}><Icon className={`h-5 w-5 ${text}`} /></div>
            <div><p className="text-2xl font-bold">{value}</p><p className="text-[11px] text-muted-foreground">{label}</p></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
