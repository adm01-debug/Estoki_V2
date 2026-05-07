import { Card, CardContent } from "@/components/ui/card";
import { History, Package, CheckCircle2, MapPin } from "lucide-react";

interface RastreabilidadeKPIsProps {
  stats: {
    total: number;
    recebimentos: number;
    expedicoes: number;
    armazenamentos: number;
  };
}

export function RastreabilidadeKPIs({ stats }: RastreabilidadeKPIsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <History className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Recebimentos</p>
              <p className="text-2xl font-bold">{stats.recebimentos}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <CheckCircle2 className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Expedições</p>
              <p className="text-2xl font-bold">{stats.expedicoes}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <MapPin className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Armazenamentos</p>
              <p className="text-2xl font-bold">{stats.armazenamentos}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
