import { Card, CardContent } from "@/components/ui/card";
import { Target, Clock, TrendingUp, CheckCircle2 } from "lucide-react";

interface TarefaStatsProps {
  stats: {
    total: number;
    pendentes: number;
    emAndamento: number;
    concluidas: number;
  };
}

export function TarefaStats({ stats }: TarefaStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><Target className="h-5 w-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats.total}</p></div></div></CardContent></Card>
      <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-muted"><Clock className="h-5 w-5 text-muted-foreground" /></div><div><p className="text-xs text-muted-foreground">Pendentes</p><p className="text-2xl font-bold">{stats.pendentes}</p></div></div></CardContent></Card>
      <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-warning/10"><TrendingUp className="h-5 w-5 text-warning" /></div><div><p className="text-xs text-muted-foreground">Em Andamento</p><p className="text-2xl font-bold">{stats.emAndamento}</p></div></div></CardContent></Card>
      <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-success/10"><CheckCircle2 className="h-5 w-5 text-success" /></div><div><p className="text-xs text-muted-foreground">Concluídas</p><p className="text-2xl font-bold">{stats.concluidas}</p></div></div></CardContent></Card>
    </div>
  );
}