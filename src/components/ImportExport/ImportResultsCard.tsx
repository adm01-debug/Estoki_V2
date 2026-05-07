import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImportResult } from "./types";

interface ImportResultsCardProps {
  result: ImportResult;
}

export function ImportResultsCard({ result }: ImportResultsCardProps) {
  return (
    <Card className="glass-card border-border/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {result.errors.length === 0 ? (
            <CheckCircle2 className="h-5 w-5 text-success" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-warning" />
          )}
          Resultado da Importação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-4">
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            ✓ {result.success} importados
          </Badge>
          {result.errors.length > 0 && (
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
              ✕ {result.errors.length} erros
            </Badge>
          )}
          <Badge variant="outline">{result.total} total</Badge>
        </div>
        {result.errors.length > 0 && (
          <div className="max-h-40 overflow-auto text-xs space-y-1 bg-destructive/5 p-3 rounded-lg">
            {result.errors.slice(0, 20).map((err, i) => (
              <p key={i} className="text-destructive">
                Linha {err.row}: {err.message}
              </p>
            ))}
            {result.errors.length > 20 && (
              <p className="text-muted-foreground">...e mais {result.errors.length - 20} erros</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
