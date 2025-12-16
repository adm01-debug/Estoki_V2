import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { Calculator, CheckCircle, Info, Target, Percent, Package } from "lucide-react";

type MetodoAmostragem = "raiz_quadrada" | "aql_normal" | "aql_rigoroso" | "aql_reduzido";
type NivelInspecao = "I" | "II" | "III";

// Tabela AQL simplificada (baseada em MIL-STD-105E / ISO 2859-1)
// Nível de inspeção II, AQL 2.5%
const tabelaAQL: Record<string, { letra: string; normal: number; rigoroso: number; reduzido: number }> = {
  "2-8": { letra: "A", normal: 2, rigoroso: 3, reduzido: 2 },
  "9-15": { letra: "B", normal: 3, rigoroso: 5, reduzido: 2 },
  "16-25": { letra: "C", normal: 5, rigoroso: 8, reduzido: 2 },
  "26-50": { letra: "D", normal: 8, rigoroso: 13, reduzido: 3 },
  "51-90": { letra: "E", normal: 13, rigoroso: 20, reduzido: 5 },
  "91-150": { letra: "F", normal: 20, rigoroso: 32, reduzido: 8 },
  "151-280": { letra: "G", normal: 32, rigoroso: 50, reduzido: 13 },
  "281-500": { letra: "H", normal: 50, rigoroso: 80, reduzido: 20 },
  "501-1200": { letra: "J", normal: 80, rigoroso: 125, reduzido: 32 },
  "1201-3200": { letra: "K", normal: 125, rigoroso: 200, reduzido: 50 },
  "3201-10000": { letra: "L", normal: 200, rigoroso: 315, reduzido: 80 },
  "10001-35000": { letra: "M", normal: 315, rigoroso: 500, reduzido: 125 },
  "35001-150000": { letra: "N", normal: 500, rigoroso: 800, reduzido: 200 },
  "150001-500000": { letra: "P", normal: 800, rigoroso: 1250, reduzido: 315 },
};

// Critérios de aceite/rejeite por tamanho de amostra (AQL 2.5%)
const criteriosAceite: Record<number, { aceite: number; rejeite: number }> = {
  2: { aceite: 0, rejeite: 1 },
  3: { aceite: 0, rejeite: 1 },
  5: { aceite: 0, rejeite: 1 },
  8: { aceite: 0, rejeite: 1 },
  13: { aceite: 1, rejeite: 2 },
  20: { aceite: 1, rejeite: 2 },
  32: { aceite: 2, rejeite: 3 },
  50: { aceite: 3, rejeite: 4 },
  80: { aceite: 5, rejeite: 6 },
  125: { aceite: 7, rejeite: 8 },
  200: { aceite: 10, rejeite: 11 },
  315: { aceite: 14, rejeite: 15 },
  500: { aceite: 21, rejeite: 22 },
  800: { aceite: 21, rejeite: 22 },
  1250: { aceite: 21, rejeite: 22 },
};

function getFaixaLote(tamanhoLote: number): string {
  if (tamanhoLote <= 8) return "2-8";
  if (tamanhoLote <= 15) return "9-15";
  if (tamanhoLote <= 25) return "16-25";
  if (tamanhoLote <= 50) return "26-50";
  if (tamanhoLote <= 90) return "51-90";
  if (tamanhoLote <= 150) return "91-150";
  if (tamanhoLote <= 280) return "151-280";
  if (tamanhoLote <= 500) return "281-500";
  if (tamanhoLote <= 1200) return "501-1200";
  if (tamanhoLote <= 3200) return "1201-3200";
  if (tamanhoLote <= 10000) return "3201-10000";
  if (tamanhoLote <= 35000) return "10001-35000";
  if (tamanhoLote <= 150000) return "35001-150000";
  return "150001-500000";
}

function calcularAmostraRaizQuadrada(tamanhoLote: number): number {
  // Raiz quadrada com mínimo de 5 e máximo de 10% do lote
  const raiz = Math.ceil(Math.sqrt(tamanhoLote));
  const minimo = Math.min(5, tamanhoLote);
  const maximo = Math.ceil(tamanhoLote * 0.1);
  return Math.max(minimo, Math.min(raiz, maximo));
}

function calcularAmostraAQL(tamanhoLote: number, tipo: "normal" | "rigoroso" | "reduzido"): number {
  const faixa = getFaixaLote(tamanhoLote);
  const dados = tabelaAQL[faixa];
  if (!dados) return calcularAmostraRaizQuadrada(tamanhoLote);
  return dados[tipo];
}

function getCriteriosAceite(tamanhoAmostra: number): { aceite: number; rejeite: number } {
  // Encontrar o tamanho de amostra mais próximo na tabela
  const tamanhos = Object.keys(criteriosAceite).map(Number).sort((a, b) => a - b);
  const tamanhoProximo = tamanhos.reduce((prev, curr) => 
    Math.abs(curr - tamanhoAmostra) < Math.abs(prev - tamanhoAmostra) ? curr : prev
  );
  return criteriosAceite[tamanhoProximo] || { aceite: 0, rejeite: 1 };
}

interface AmostragemAutomaticaProps {
  tamanhoLote: number;
  onConfirmarAmostra: (tamanhoAmostra: number, metodo: string, criterios: { aceite: number; rejeite: number }) => void;
  itensVerificados?: number;
  defeitosEncontrados?: number;
}

export function AmostragemAutomatica({
  tamanhoLote,
  onConfirmarAmostra,
  itensVerificados = 0,
  defeitosEncontrados = 0,
}: AmostragemAutomaticaProps) {
  const [metodoSelecionado, setMetodoSelecionado] = useState<MetodoAmostragem>("aql_normal");
  const [amostraConfirmada, setAmostraConfirmada] = useState(false);
  const [tamanhoAmostraConfirmado, setTamanhoAmostraConfirmado] = useState(0);

  const calculos = useMemo(() => {
    const raizQuadrada = calcularAmostraRaizQuadrada(tamanhoLote);
    const aqlNormal = calcularAmostraAQL(tamanhoLote, "normal");
    const aqlRigoroso = calcularAmostraAQL(tamanhoLote, "rigoroso");
    const aqlReduzido = calcularAmostraAQL(tamanhoLote, "reduzido");
    const faixa = getFaixaLote(tamanhoLote);
    const letra = tabelaAQL[faixa]?.letra || "A";

    return {
      raizQuadrada,
      aqlNormal,
      aqlRigoroso,
      aqlReduzido,
      faixa,
      letra,
    };
  }, [tamanhoLote]);

  const tamanhoAmostraSelecionado = useMemo(() => {
    switch (metodoSelecionado) {
      case "raiz_quadrada":
        return calculos.raizQuadrada;
      case "aql_normal":
        return calculos.aqlNormal;
      case "aql_rigoroso":
        return calculos.aqlRigoroso;
      case "aql_reduzido":
        return calculos.aqlReduzido;
      default:
        return calculos.aqlNormal;
    }
  }, [metodoSelecionado, calculos]);

  const criterios = useMemo(() => {
    return getCriteriosAceite(tamanhoAmostraSelecionado);
  }, [tamanhoAmostraSelecionado]);

  const percentualAmostra = ((tamanhoAmostraSelecionado / tamanhoLote) * 100).toFixed(1);

  const handleConfirmar = () => {
    setAmostraConfirmada(true);
    setTamanhoAmostraConfirmado(tamanhoAmostraSelecionado);
    const metodoNome = metodoSelecionado === "raiz_quadrada" ? "Raiz Quadrada" :
      metodoSelecionado === "aql_normal" ? "AQL Normal" :
      metodoSelecionado === "aql_rigoroso" ? "AQL Rigoroso" : "AQL Reduzido";
    onConfirmarAmostra(tamanhoAmostraSelecionado, metodoNome, criterios);
  };

  const progressoVerificacao = amostraConfirmada 
    ? Math.min((itensVerificados / tamanhoAmostraConfirmado) * 100, 100) 
    : 0;

  const statusAmostragem = useMemo(() => {
    if (!amostraConfirmada) return "pendente";
    if (itensVerificados < tamanhoAmostraConfirmado) return "em_andamento";
    if (defeitosEncontrados > criterios.rejeite) return "rejeitado";
    if (defeitosEncontrados <= criterios.aceite) return "aprovado";
    return "limite";
  }, [amostraConfirmada, itensVerificados, tamanhoAmostraConfirmado, defeitosEncontrados, criterios]);

  if (amostraConfirmada) {
    return (
      <Card className={`border-2 ${
        statusAmostragem === "aprovado" ? "border-success/50 bg-success/5" :
        statusAmostragem === "rejeitado" ? "border-destructive/50 bg-destructive/5" :
        "border-primary/50"
      }`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Amostragem em Andamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Progresso da Verificação</p>
              <p className="text-2xl font-bold">
                {itensVerificados} / {tamanhoAmostraConfirmado}
              </p>
            </div>
            <Badge className={
              statusAmostragem === "aprovado" ? "bg-success" :
              statusAmostragem === "rejeitado" ? "bg-destructive" :
              statusAmostragem === "limite" ? "bg-warning" :
              "bg-primary"
            }>
              {statusAmostragem === "aprovado" ? "Aprovado" :
               statusAmostragem === "rejeitado" ? "Rejeitado" :
               statusAmostragem === "limite" ? "No Limite" :
               `${progressoVerificacao.toFixed(0)}%`}
            </Badge>
          </div>
          
          <Progress value={progressoVerificacao} className={
            statusAmostragem === "aprovado" ? "[&>div]:bg-success" :
            statusAmostragem === "rejeitado" ? "[&>div]:bg-destructive" : ""
          } />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-2 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs">Defeitos Encontrados</p>
              <p className={`font-bold text-lg ${
                defeitosEncontrados > criterios.rejeite ? "text-destructive" :
                defeitosEncontrados > criterios.aceite ? "text-warning" :
                "text-success"
              }`}>
                {defeitosEncontrados}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs">Critério</p>
              <p className="font-medium text-sm">
                Aceite: ≤{criterios.aceite} | Rejeite: ≥{criterios.rejeite}
              </p>
            </div>
          </div>

          {statusAmostragem === "aprovado" && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">
                Lote aprovado! Defeitos dentro do limite aceitável.
              </span>
            </div>
          )}

          {statusAmostragem === "rejeitado" && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
              <Target className="h-5 w-5" />
              <span className="text-sm font-medium">
                Lote rejeitado. Número de defeitos excede o limite.
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

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
        {/* Info do lote */}
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

        {/* Seleção do método */}
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

        {/* Comparativo de métodos */}
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

        {/* Resultado selecionado */}
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

        {/* Info sobre AQL */}
        {metodoSelecionado !== "raiz_quadrada" && (
          <div className="text-xs text-muted-foreground p-2 rounded-lg bg-muted/30">
            <p><strong>Faixa do lote:</strong> {calculos.faixa} unidades</p>
            <p><strong>Letra código:</strong> {calculos.letra} (Nível de inspeção II)</p>
            <p><strong>AQL:</strong> 2.5% (Padrão ISO 2859-1)</p>
          </div>
        )}

        <Button onClick={handleConfirmar} className="w-full gap-2">
          <CheckCircle className="h-4 w-4" />
          Confirmar Amostragem ({tamanhoAmostraSelecionado} itens)
        </Button>
      </CardContent>
    </Card>
  );
}
