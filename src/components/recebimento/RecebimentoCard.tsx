import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { formatDate } from "@/utils/date";
import { Truck } from "lucide-react";

interface RecebimentoCardProps { recebimento: any; onClick?: () => void; }

export const RecebimentoCard = memo(function RecebimentoCard({ recebimento, onClick }: RecebimentoCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2"><Truck className="h-4 w-4" />NF {recebimento.nf_numero}</CardTitle>
          <StatusBadge variant={getStatusVariant(recebimento.status)}>{recebimento.status}</StatusBadge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Previsto: {formatDate(recebimento.data_prevista)}</p>
      </CardContent>
    </Card>
  );
});
