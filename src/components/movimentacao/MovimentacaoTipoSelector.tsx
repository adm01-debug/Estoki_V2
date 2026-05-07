import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { tiposMovimento } from "./movimentacaoHelpers";
import { TipoMovimentacao } from "@/hooks/useMovimentacoes";

interface MovimentacaoTipoSelectorProps {
  tipoMovimento: TipoMovimentacao;
  setTipoMovimento: (tipo: TipoMovimentacao) => void;
}

export function MovimentacaoTipoSelector({ tipoMovimento, setTipoMovimento }: MovimentacaoTipoSelectorProps) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <Label className="text-sm font-medium mb-3 block">Tipo de Movimento:</Label>
      <RadioGroup
        value={tipoMovimento}
        onValueChange={(v) => setTipoMovimento(v as TipoMovimentacao)}
        className="space-y-2"
      >
        {tiposMovimento.map((tipo) => (
          <div
            key={tipo.value}
            className={cn(
              "flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer",
              tipoMovimento === tipo.value
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
            onClick={() => setTipoMovimento(tipo.value)}
          >
            <RadioGroupItem value={tipo.value} id={tipo.value} />
            <tipo.icon className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor={tipo.value} className="flex-1 cursor-pointer">
              {tipo.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
