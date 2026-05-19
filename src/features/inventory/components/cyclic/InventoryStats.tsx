import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon, Play, CheckCircle, Target } from "lucide-react";

interface InventoryStatsProps {
  agendados: number;
  emAndamento: number;
  concluidos: number;
  acuracidadeMedia: number;
}

export function InventoryStats({ agendados, emAndamento, concluidos, acuracidadeMedia }: InventoryStatsProps) {
  const statCards = [
    { icon: CalendarIcon, label: "Agendados", value: agendados, color: "bg-blue-500/10", textColor: "text-blue-500" },
    { icon: Play, label: "Em Andamento", value: emAndamento, color: "bg-amber-500/10", textColor: "text-amber-500" },
    { icon: CheckCircle, label: "Concluídos", value: concluidos, color: "bg-green-500/10", textColor: "text-green-500" },
    { icon: Target, label: "Acuracidade", value: `${acuracidadeMedia.toFixed(1)}%`, color: "bg-primary/10", textColor: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map(({ icon: Icon, label, value, color, textColor }) => (
        <Card key={label} className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${color}`}><Icon className={`h-5 w-5 ${textColor}`} /></div>
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
