import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { tiposMovimento } from "./movimentacaoHelpers";
import type { TipoMovimentacao } from "@/types/movimentacao";

interface MovimentacaoTipoSelectorProps {
  tipoMovimento: TipoMovimentacao;
  setTipoMovimento: (tipo: TipoMovimentacao) => void;
}

export function MovimentacaoTipoSelector({
  tipoMovimento,
  setTipoMovimento,
}: MovimentacaoTipoSelectorProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <Label className="mb-3 block text-sm font-medium">Tipo de Movimento:</Label>
      <RadioGroup
        value={tipoMovimento}
        onValueChange={(v) => setTipoMovimento(v as TipoMovimentacao)}
        className="space-y-2"
      >
        {tiposMovimento.map((tipo) => (
          <div
            key={tipo.value}
            className={cn(
              "flex cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-all",
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
