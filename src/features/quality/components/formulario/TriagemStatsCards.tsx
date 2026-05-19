import { Clock, CheckCircle, AlertTriangle, TrendingUp, Filter, Wrench, PackageSearch } from "lucide-react";
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

export const TriagemStatsCards = memo(function TriagemStatsCards({ stats }: TriagemStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="glass-card border-primary/20 bg-primary/5 group hover:border-primary/40 transition-all duration-300">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:rotate-12 transition-transform">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Em Andamento</p>
            <p className="text-2xl font-black text-primary tracking-tight">{stats.emAndamento}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-success/20 bg-success/5 group hover:border-success/40 transition-all duration-300">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center border border-success/20 group-hover:rotate-12 transition-transform">
            <CheckCircle className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-success/60 uppercase tracking-widest">Aprovados</p>
            <p className="text-2xl font-black text-success tracking-tight">{stats.aprovados}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-amber-500/20 bg-amber-500/5 group hover:border-amber-500/40 transition-all duration-300">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:rotate-12 transition-transform">
            <Wrench className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-amber-600/60 uppercase tracking-widest">Conserto (Retidos)</p>
            <p className="text-2xl font-black text-amber-600 tracking-tight">{stats.retidosConserto}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-purple-500/20 bg-purple-500/5 group hover:border-purple-500/40 transition-all duration-300">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:rotate-12 transition-transform">
            <PackageSearch className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-purple-600/60 uppercase tracking-widest">Divergências Vol.</p>
            <p className="text-2xl font-black text-purple-600 tracking-tight">{stats.divergenciasVolume || 0}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-destructive/20 bg-destructive/5 group hover:border-destructive/40 transition-all duration-300">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/20 group-hover:rotate-12 transition-transform">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-destructive/60 uppercase tracking-widest">Reprovados</p>
            <p className="text-2xl font-black text-destructive tracking-tight">{stats.reprovados}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
