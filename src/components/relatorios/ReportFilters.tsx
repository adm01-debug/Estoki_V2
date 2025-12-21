import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface ReportFiltersProps {
  onPeriodoChange: (inicio: Date | undefined, fim: Date | undefined) => void;
  onTipoChange?: (tipo: string) => void;
  tipos?: { value: string; label: string }[];
  className?: string;
}

export function ReportFilters({ onPeriodoChange, onTipoChange, tipos, className }: ReportFiltersProps) {
  const [dataInicio, setDataInicio] = useState<Date | undefined>();
  const [dataFim, setDataFim] = useState<Date | undefined>();
  const [tipoSelecionado, setTipoSelecionado] = useState<string>("");

  const handleLimpar = () => {
    setDataInicio(undefined);
    setDataFim(undefined);
    setTipoSelecionado("");
    onPeriodoChange(undefined, undefined);
    onTipoChange?.("");
  };

  const handleDataInicioChange = (date: Date | undefined) => {
    setDataInicio(date);
    onPeriodoChange(date, dataFim);
  };

  const handleDataFimChange = (date: Date | undefined) => {
    setDataFim(date);
    onPeriodoChange(dataInicio, date);
  };

  return (
    <div className={cn("flex flex-wrap gap-3 p-4 bg-card rounded-lg border", className)}>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filtros:</span>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            {dataInicio ? format(dataInicio, "dd/MM/yyyy", { locale: ptBR }) : "Data início"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar mode="single" selected={dataInicio} onSelect={handleDataInicioChange} locale={ptBR} />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            {dataFim ? format(dataFim, "dd/MM/yyyy", { locale: ptBR }) : "Data fim"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar mode="single" selected={dataFim} onSelect={handleDataFimChange} locale={ptBR} />
        </PopoverContent>
      </Popover>

      {tipos && tipos.length > 0 && (
        <Select value={tipoSelecionado} onValueChange={(v) => { setTipoSelecionado(v); onTipoChange?.(v); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {tipos.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {(dataInicio || dataFim || tipoSelecionado) && (
        <Button variant="ghost" size="sm" onClick={handleLimpar} className="gap-1">
          <X className="h-4 w-4" />
          Limpar
        </Button>
      )}
    </div>
  );
}
