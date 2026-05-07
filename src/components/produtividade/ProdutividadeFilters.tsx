import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users } from "lucide-react";

interface ProdutividadeFiltersProps {
  periodo: "hoje" | "semana" | "mes";
  onPeriodoChange: (value: string) => void;
  operadorSelecionado: string;
  onOperadorChange: (value: string) => void;
  operadores: { id: string; nome: string }[];
}

const periodos = [
  { value: "hoje", label: "Hoje" },
  { value: "semana", label: "Últimos 7 dias" },
  { value: "mes", label: "Últimos 30 dias" },
];

export function ProdutividadeFilters({
  periodo,
  onPeriodoChange,
  operadorSelecionado,
  onOperadorChange,
  operadores
}: ProdutividadeFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center justify-between">
      <div className="flex gap-3 flex-wrap">
        <Select value={periodo} onValueChange={onPeriodoChange}>
          <SelectTrigger className="w-[160px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periodos.map((p) => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={operadorSelecionado} onValueChange={onOperadorChange}>
          <SelectTrigger className="w-[180px]">
            <Users className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Operador" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os operadores</SelectItem>
            {operadores.map((op) => (
              <SelectItem key={op.id} value={op.id}>{op.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
