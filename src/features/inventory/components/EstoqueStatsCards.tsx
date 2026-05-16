import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Box, Clock } from "lucide-react";
import { ProgressRing } from "@/components/dashboard/ProgressRing";

interface EstoqueStats {
  ppStats: { ocupados: number; livres: number; reservados: number; bloqueados: number; total: number };
  boxStats: { ocupados: number; livres: number; total: number };
  ocupacaoTotal: number;
}

interface EstoqueStatsCardsProps {
  stats: EstoqueStats;
}

export function EstoqueStatsCards({ stats }: EstoqueStatsCardsProps) {
  return (
    <motion.div
      className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="col-span-2 lg:col-span-1">
        <CardContent className="p-4 flex items-center gap-4">
          <ProgressRing
            value={stats.ocupacaoTotal} size={70} strokeWidth={6}
            variant={stats.ocupacaoTotal > 90 ? "danger" : stats.ocupacaoTotal > 70 ? "warning" : "success"}
          />
          <div>
            <p className="text-2xl font-bold">{stats.ocupacaoTotal}%</p>
            <p className="text-xs text-muted-foreground">Ocupação Total</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success">{stats.ppStats.ocupados + stats.boxStats.ocupados}</p>
              <p className="text-xs text-muted-foreground">Ocupadas</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Box className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.ppStats.livres + stats.boxStats.livres}</p>
              <p className="text-xs text-muted-foreground">Livres</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{stats.ppStats.reservados}</p>
              <p className="text-xs text-muted-foreground">Reservadas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
