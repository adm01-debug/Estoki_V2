import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";

interface Props {
  criticosCount: number;
  avisosCount: number;
  reconhecidosCount: number;
  resolvidosCount: number;
  hasCriticalAlerts: boolean;
}

export function AlertasResumoCards({ criticosCount, avisosCount, reconhecidosCount, resolvidosCount, hasCriticalAlerts }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className={hasCriticalAlerts ? "border-red-500" : ""}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Críticos</p>
              <p className="text-3xl font-bold text-red-500">{criticosCount}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avisos</p>
              <p className="text-3xl font-bold text-amber-500">{avisosCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Reconhecidos</p>
              <p className="text-3xl font-bold text-muted-foreground">{reconhecidosCount}</p>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resolvidos (24h)</p>
              <p className="text-3xl font-bold text-green-500">{resolvidosCount}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
