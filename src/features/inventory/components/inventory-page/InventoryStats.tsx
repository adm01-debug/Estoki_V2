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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Card className="glass-card group border-primary/20 bg-primary/5 transition-all duration-300 hover:border-primary/40">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 transition-transform group-hover:scale-110">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <Badge
              variant="outline"
              className="border-primary/20 bg-primary/10 text-[10px] font-bold text-primary"
            >
              Meta 99%
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Acuracidade do Estoque
            </p>
            <p className="text-3xl font-black tracking-tight text-primary">
              {accuracy.toFixed(1)}%
            </p>
          </div>
          <Progress
            value={accuracy}
            className="mt-4 h-1.5 bg-primary/10"
            indicatorClassName="bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          />
        </CardContent>
      </Card>

      <Card className="glass-card group border-border/30 transition-all duration-300 hover:border-primary/30">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-muted transition-transform group-hover:scale-110">
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Itens em Processo
            </p>
            <p className="text-3xl font-black tracking-tight text-foreground">{itemCount}</p>
          </div>
          <p className="mt-4 text-[10px] font-bold uppercase text-muted-foreground/60">
            Sessão de contagem ativa
          </p>
        </CardContent>
      </Card>

      <Card
        className={cn(
          "glass-card group transition-all duration-300",
          variance !== 0
            ? "border-destructive/30 bg-destructive/5 hover:border-destructive/50"
            : "border-border/30 hover:border-primary/30"
        )}
      >
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border transition-transform group-hover:scale-110",
                variance !== 0
                  ? "border-destructive/20 bg-destructive/10"
                  : "border-border/50 bg-muted"
              )}
            >
              <AlertTriangle
                className={cn(
                  "h-5 w-5",
                  variance !== 0 ? "text-destructive" : "text-muted-foreground"
                )}
              />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Divergência Acumulada
            </p>
            <p
              className={cn(
                "text-3xl font-black tracking-tight",
                variance !== 0 ? "text-destructive" : "text-foreground"
              )}
            >
              {variance > 0 ? `+${variance}` : variance}
            </p>
          </div>
          <p className="mt-4 text-[10px] font-bold uppercase text-muted-foreground/60">
            Físico vs Sistêmico
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
