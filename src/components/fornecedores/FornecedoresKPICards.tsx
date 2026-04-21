import { Card, CardContent } from "@/components/ui/card";
import { Building2, CheckCircle, Package, AlertTriangle } from "lucide-react";

interface Props {
  total: number;
  qualidadeMedia: number;
  pontualidadeMedia: number;
  criticosCount: number;
}

export function FornecedoresKPICards({ total, qualidadeMedia, pontualidadeMedia, criticosCount }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card><CardContent className="p-4"><div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Building2 className="h-5 w-5 text-primary" /></div>
        <div><p className="text-xs text-muted-foreground">Fornecedores</p><p className="text-2xl font-bold">{total}</p></div>
      </div></CardContent></Card>
      <Card><CardContent className="p-4"><div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-green-500/10"><CheckCircle className="h-5 w-5 text-green-500" /></div>
        <div><p className="text-xs text-muted-foreground">Qualidade Média</p><p className="text-2xl font-bold">{qualidadeMedia.toFixed(1)}%</p></div>
      </div></CardContent></Card>
      <Card><CardContent className="p-4"><div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/10"><Package className="h-5 w-5 text-blue-500" /></div>
        <div><p className="text-xs text-muted-foreground">Pontualidade</p><p className="text-2xl font-bold">{pontualidadeMedia.toFixed(1)}%</p></div>
      </div></CardContent></Card>
      <Card><CardContent className="p-4"><div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10"><AlertTriangle className="h-5 w-5 text-amber-500" /></div>
        <div><p className="text-xs text-muted-foreground">Críticos</p><p className="text-2xl font-bold">{criticosCount}</p></div>
      </div></CardContent></Card>
    </div>
  );
}
