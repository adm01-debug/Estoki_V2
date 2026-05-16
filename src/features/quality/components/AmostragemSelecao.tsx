import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calculator, Info, Package, Percent, CheckCircle } from "lucide-react";
import { MetodoAmostragem } from "./amostragemUtils";

interface AmostragemSelecaoProps {
  tamanhoLote: number;
  metodoSelecionado: MetodoAmostragem;
  setMetodoSelecionado: (v: MetodoAmostragem) => void;
  calculos: {
    raizQuadrada: number;
    aqlNormal: number;
    aqlRigoroso: number;
    aqlReduzido: number;
    faixa: string;
    letra: string;
  };
  tamanhoAmostraSelecionado: number;
  percentualAmostra: string;
  criterios: { aceite: number; rejeite: number };
  onConfirmar: () => void;
}

export function AmostragemSelecao({
  tamanhoLote,
  metodoSelecionado,
  setMetodoSelecionado,
  calculos,
  tamanhoAmostraSelecionado,
  percentualAmostra,
  criterios,
  onConfirmar
}: AmostragemSelecaoProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          Amostragem Automática
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">
                A amostragem define quantos itens verificar para garantir qualidade.
                AQL (Acceptable Quality Level) segue a norma ISO 2859-1.
              </p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Tamanho do Lote</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-lg">{tamanhoLote}</span>
            <span className="text-xs text-muted-foreground ml-1">unidades</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Método de Amostragem</label>
          <Select value={metodoSelecionado} onValueChange={(v) => setMetodoSelecionado(v as MetodoAmostragem)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aql_normal">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10">Recomendado</Badge>
                  AQL Normal (Nível II)
                </div>
              </SelectItem>
              <SelectItem value="aql_rigoroso">AQL Rigoroso (mais amostras)</SelectItem>
              <SelectItem value="aql_reduzido">AQL Reduzido (menos amostras)</SelectItem>
              <SelectItem value="raiz_quadrada">Raiz Quadrada (√n)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className={`p-2 rounded-lg border ${metodoSelecionado === "aql_normal" ? "border-primary bg-primary/5" : "border-border"}`}>
            <p className="text-muted-foreground">AQL Normal</p>
            <p className="font-bold text-lg">{calculos.aqlNormal}</p>
          </div>
          <div className={`p-2 rounded-lg border ${metodoSelecionado === "raiz_quadrada" ? "border-primary bg-primary/5" : "border-border"}`}>
            <p className="text-muted-foreground">Raiz Quadrada</p>
            <p className="font-bold text-lg">{calculos.raizQuadrada}</p>
          </div>
          <div className={`p-2 rounded-lg border ${metodoSelecionado === "aql_rigoroso" ? "border-primary bg-primary/5" : "border-border"}`}>
            <p className="text-muted-foreground">AQL Rigoroso</p>
            <p className="font-bold text-lg">{calculos.aqlRigoroso}</p>
          </div>
          <div className={`p-2 rounded-lg border ${metodoSelecionado === "aql_reduzido" ? "border-primary bg-primary/5" : "border-border"}`}>
            <p className="text-muted-foreground">AQL Reduzido</p>
            <p className="font-bold text-lg">{calculos.aqlReduzido}</p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Amostra Sugerida</span>
            <Badge variant="outline" className="bg-background">
              Código: {calculos.letra}
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">{tamanhoAmostraSelecionado}</span>
            <span className="text-sm text-muted-foreground">
              itens ({percentualAmostra}% do lote)
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-primary/20 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Percent className="h-3 w-3" />
              Critério de aceite: ≤{criterios.aceite} defeitos | Rejeite: ≥{criterios.rejeite} defeitos
            </div>
          </div>
        </div>

        {metodoSelecionado !== "raiz_quadrada" && (
          <div className="text-xs text-muted-foreground p-2 rounded-lg bg-muted/30">
            <p><strong>Faixa do lote:</strong> {calculos.faixa} unidades</p>
            <p><strong>Letra código:</strong> {calculos.letra} (Nível de inspeção II)</p>
            <p><strong>AQL:</strong> 2.5% (Padrão ISO 2859-1)</p>
          </div>
        )}

        <Button onClick={onConfirmar} className="w-full gap-2">
          <CheckCircle className="h-4 w-4" />
          Confirmar Amostragem ({tamanhoAmostraSelecionado} itens)
        </Button>
      </CardContent>
    </Card>
  );
}
