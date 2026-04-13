import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Filter, Search, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TipoMovimentacao } from "@/hooks/useMovimentacoes";

const tipoLabels: Record<TipoMovimentacao, string> = {
  recebimento_nf: "Recebimento NF", conferencia: "Conferência", triagem_inicio: "Triagem Início",
  triagem_fim: "Triagem Fim", armazenamento: "Armazenamento", reserva: "Reserva",
  separacao: "Separação", conferencia_expedicao: "Conf. Expedição", carregamento: "Carregamento",
  saida_transporte: "Saída Transporte", entrega: "Entrega", devolucao: "Devolução", ajuste_estoque: "Ajuste Estoque",
};

interface RelatorioFiltersProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  tipoFiltro: string;
  setTipoFiltro: (v: string) => void;
  dataInicio: Date;
  setDataInicio: (d: Date) => void;
  dataFim: Date;
  setDataFim: (d: Date) => void;
}

export function RelatorioFilters({ searchTerm, setSearchTerm, tipoFiltro, setTipoFiltro, dataInicio, setDataInicio, dataFim, setDataFim }: RelatorioFiltersProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2"><Filter className="h-4 w-4" />Filtros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tipo</Label>
            <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {Object.entries(tipoLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Data Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start"><Calendar className="h-4 w-4 mr-2" />{format(dataInicio, "dd/MM/yyyy")}</Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent mode="single" selected={dataInicio} onSelect={(date) => date && setDataInicio(date)} locale={ptBR} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Data Fim</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start"><Calendar className="h-4 w-4 mr-2" />{format(dataFim, "dd/MM/yyyy")}</Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent mode="single" selected={dataFim} onSelect={(date) => date && setDataFim(date)} locale={ptBR} />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { tipoLabels };
