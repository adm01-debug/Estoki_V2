import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { Fornecedor } from "@/hooks/useFornecedores";

interface Props {
  fornecedoresCriticos: Fornecedor[];
}

export function FornecedoresCriticos({ fornecedoresCriticos }: Props) {
  if (fornecedoresCriticos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
        <p>Nenhum fornecedor crítico</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {fornecedoresCriticos.map((f) => (
        <Card key={f.id} className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <h3 className="font-semibold">{f.nome}</h3>
                </div>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <p>Qualidade: {f.percentual_qualidade.toFixed(1)}%</p>
                  <p>Pontualidade: {f.percentual_pontualidade.toFixed(1)}%</p>
                  <p>Trocas/Devoluções: {f.trocas_devolucoes}</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/30">Classe D</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
