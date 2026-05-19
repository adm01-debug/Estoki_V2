import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Package, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface InventoryStatsProps {
  accuracy: number;
  itemCount: number;
  variance: number;
}

export function InventoryStats({ accuracy, itemCount, variance }: InventoryStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="glass-card border-primary/20 bg-primary/5 group hover:border-primary/40 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">Meta 99%</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Acuracidade do Estoque</p>
            <p className="text-3xl font-black tracking-tight text-primary">{accuracy.toFixed(1)}%</p>
          </div>
          <Progress value={accuracy} className="h-1.5 mt-4 bg-primary/10" indicatorClassName="bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
        </CardContent>
      </Card>

      <Card className="glass-card border-border/30 group hover:border-primary/30 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center border border-border/50 group-hover:scale-110 transition-transform">
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Itens em Processo</p>
            <p className="text-3xl font-black tracking-tight text-foreground">{itemCount}</p>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground/60 mt-4 uppercase">Sessão de contagem ativa</p>
        </CardContent>
      </Card>

      <Card className={cn(
        "glass-card group transition-all duration-300",
        variance !== 0 ? "border-destructive/30 bg-destructive/5 hover:border-destructive/50" : "border-border/30 hover:border-primary/30"
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110",
              variance !== 0 ? "bg-destructive/10 border-destructive/20" : "bg-muted border-border/50"
            )}>
              <AlertTriangle className={cn("h-5 w-5", variance !== 0 ? "text-destructive" : "text-muted-foreground")} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Divergência Acumulada</p>
            <p className={cn("text-3xl font-black tracking-tight", variance !== 0 ? "text-destructive" : "text-foreground")}>
              {variance > 0 ? `+${variance}` : variance}
            </p>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground/60 mt-4 uppercase">Físico vs Sistêmico</p>
        </CardContent>
      </Card>
    </div>
  );
}
