import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Warehouse } from "lucide-react";

export interface ConfiguracaoEstoque {
  nivelMinimoGeral: number;
  nivelCriticoGeral: number;
  diasGiroIdeal: number;
  capacidadeMaxPP: number;
  capacidadeMaxBox: number;
}

interface EstoqueConfigCardProps {
  estoque: ConfiguracaoEstoque;
  onUpdate: (updates: Partial<ConfiguracaoEstoque>) => void;
}

export function EstoqueConfigCard({ estoque, onUpdate }: EstoqueConfigCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Warehouse className="h-5 w-5 text-primary" />Níveis de Estoque
        </CardTitle>
        <CardDescription>Defina os parâmetros de controle do estoque</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Nível Mínimo Geral</Label>
            <Input type="number" value={estoque.nivelMinimoGeral} onChange={(e) => onUpdate({ nivelMinimoGeral: Number(e.target.value) })} min={0} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Nível Crítico Geral</Label>
            <Input type="number" value={estoque.nivelCriticoGeral} onChange={(e) => onUpdate({ nivelCriticoGeral: Number(e.target.value) })} min={0} />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Dias de Giro Ideal</Label>
          <Input type="number" value={estoque.diasGiroIdeal} onChange={(e) => onUpdate({ diasGiroIdeal: Number(e.target.value) })} min={1} />
          <p className="text-xs text-muted-foreground">Meta de dias para giro do estoque</p>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Capacidade Porta-Palete</Label>
            <Input type="number" value={estoque.capacidadeMaxPP} onChange={(e) => onUpdate({ capacidadeMaxPP: Number(e.target.value) })} min={1} />
            <p className="text-xs text-muted-foreground">Posições por PP</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Capacidade Box</Label>
            <Input type="number" value={estoque.capacidadeMaxBox} onChange={(e) => onUpdate({ capacidadeMaxBox: Number(e.target.value) })} min={1} />
            <p className="text-xs text-muted-foreground">Posições por Box</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
