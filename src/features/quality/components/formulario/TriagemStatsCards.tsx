import {
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Filter,
  Wrench,
  PackageSearch,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface TriagemStatsCardsProps {
  stats: {
    emAndamento: number;
    aprovados: number;
    reprovados: number;
    retidosConserto: number;
    divergenciasVolume?: number;
  };
}

export const TriagemStatsCards = memo(function TriagemStatsCards({
  stats,
}: TriagemStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Card className="glass-card group border-primary/20 bg-primary/5 transition-all duration-300 hover:border-primary/40">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 transition-transform group-hover:rotate-12">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
              Em Andamento
            </p>
            <p className="text-2xl font-black tracking-tight text-primary">{stats.emAndamento}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card group border-success/20 bg-success/5 transition-all duration-300 hover:border-success/40">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-success/20 bg-success/10 transition-transform group-hover:rotate-12">
            <CheckCircle className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-success/60">
              Aprovados
            </p>
            <p className="text-2xl font-black tracking-tight text-success">{stats.aprovados}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card group border-amber-500/20 bg-amber-500/5 transition-all duration-300 hover:border-amber-500/40">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 transition-transform group-hover:rotate-12">
            <Wrench className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600/60">
              Conserto (Retidos)
            </p>
            <p className="text-2xl font-black tracking-tight text-amber-600">
              {stats.retidosConserto}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card group border-purple-500/20 bg-purple-500/5 transition-all duration-300 hover:border-purple-500/40">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 transition-transform group-hover:rotate-12">
            <PackageSearch className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-600/60">
              Divergências Vol.
            </p>
            <p className="text-2xl font-black tracking-tight text-purple-600">
              {stats.divergenciasVolume || 0}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card group border-destructive/20 bg-destructive/5 transition-all duration-300 hover:border-destructive/40">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 transition-transform group-hover:rotate-12">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-destructive/60">
              Reprovados
            </p>
            <p className="text-2xl font-black tracking-tight text-destructive">
              {stats.reprovados}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
