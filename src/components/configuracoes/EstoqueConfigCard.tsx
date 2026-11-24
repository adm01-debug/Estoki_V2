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

interface Props {
  estoque: ConfiguracaoEstoque;
  onChange: (updates: Partial<ConfiguracaoEstoque>) => void;
}

export function EstoqueConfigCard({ estoque, onChange }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Warehouse className="h-5 w-5 text-primary" />
          Níveis de Estoque
        </CardTitle>
        <CardDescription>Defina os parâmetros de controle do estoque</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nivel-minimo-geral" className="text-sm">
              Nível Mínimo Geral
            </Label>
            <Input
              id="nivel-minimo-geral"
              type="number"
              value={estoque.nivelMinimoGeral}
              onChange={(e) => onChange({ nivelMinimoGeral: Number(e.target.value) })}
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nivel-critico-geral" className="text-sm">
              Nível Crítico Geral
            </Label>
            <Input
              id="nivel-critico-geral"
              type="number"
              value={estoque.nivelCriticoGeral}
              onChange={(e) => onChange({ nivelCriticoGeral: Number(e.target.value) })}
              min={0}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dias-de-giro-ideal" className="text-sm">
            Dias de Giro Ideal
          </Label>
          <Input
            id="dias-de-giro-ideal"
            type="number"
            value={estoque.diasGiroIdeal}
            onChange={(e) => onChange({ diasGiroIdeal: Number(e.target.value) })}
            min={1}
          />
          <p className="text-xs text-muted-foreground">Meta de dias para giro do estoque</p>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="capacidade-porta-palete" className="text-sm">
              Capacidade Porta-Palete
            </Label>
            <Input
              id="capacidade-porta-palete"
              type="number"
              value={estoque.capacidadeMaxPP}
              onChange={(e) => onChange({ capacidadeMaxPP: Number(e.target.value) })}
              min={1}
            />
            <p className="text-xs text-muted-foreground">Posições por PP</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacidade-box" className="text-sm">
              Capacidade Box
            </Label>
            <Input
              id="capacidade-box"
              type="number"
              value={estoque.capacidadeMaxBox}
              onChange={(e) => onChange({ capacidadeMaxBox: Number(e.target.value) })}
              min={1}
            />
            <p className="text-xs text-muted-foreground">Posições por Box</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
