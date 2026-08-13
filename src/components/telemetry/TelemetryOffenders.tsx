import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

interface TelemetryOffendersProps {
  offenders: [string, { count: number; totalMs: number; maxMs: number }][];
}

const formatDuration = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`);

export function TelemetryOffenders({ offenders }: TelemetryOffendersProps) {
  if (offenders.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Database className="h-4 w-4" />
          Tabelas Mais Problemáticas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {offenders.map(([name, stats]) => (
            <div key={name} className="rounded-lg border border-border/50 bg-muted/30 p-3">
              <p className="truncate font-mono text-sm font-medium" title={name}>
                {name}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{stats.count}× alertas</span>
                <span className="text-xs text-destructive">max {formatDuration(stats.maxMs)}</span>
              </div>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                média: {formatDuration(Math.round(stats.totalMs / stats.count))}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
