import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { formatRelativeTime } from "@/utils/date";
import { FileSearch, Clock } from "lucide-react";

interface TriagemCardProps { triagem: any; onClick?: () => void; }

export function TriagemCard({ triagem, onClick }: TriagemCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileSearch className="h-4 w-4" />
            Lote #{triagem.lote_id?.slice(0, 8)}
          </CardTitle>
          <StatusBadge variant={getStatusVariant(triagem.status)}>{triagem.status}</StatusBadge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Qtd: {triagem.quantidade_aprovada || 0}/{triagem.quantidade_total}</p>
          <p className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatRelativeTime(triagem.created_at)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
