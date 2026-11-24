import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Filter, Search, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { TipoMovimentacao } from "@/types/movimentacao";

import { tipoLabels } from "@/components/rastreabilidade/constants";

interface RelatorioFiltersProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  tipoFiltro: string;
  setTipoFiltro: (v: string) => void;
  dataInicio: Date;
  setDataInicio: (d: Date) => void;
  dataFim: Date;
  setDataFim: (d: Date) => void;
  operadorFiltro: string;
  setOperadorFiltro: (v: string) => void;
  operadores: { id: string; nome: string }[];
  metaDiaria: number;
  setMetaDiaria: (v: number) => void;
}

export function RelatorioFilters({
  searchTerm,
  setSearchTerm,
  tipoFiltro,
  setTipoFiltro,
  dataInicio,
  setDataInicio,
  dataFim,
  setDataFim,
  operadorFiltro,
  setOperadorFiltro,
  operadores,
  metaDiaria,
  setMetaDiaria,
}: RelatorioFiltersProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Filter className="h-4 w-4" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
          <div className="space-y-1.5">
            <Label htmlFor="buscar" className="text-xs">
              Buscar
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="buscar"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tipo" className="text-xs">
              Tipo
            </Label>
            <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
              <SelectTrigger id="tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {Object.entries(tipoLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="operador" className="text-xs">
              Operador
            </Label>
            <Select value={operadorFiltro} onValueChange={setOperadorFiltro}>
              <SelectTrigger id="operador">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {operadores.map((operador) => (
                  <SelectItem key={operador.id} value={operador.id}>
                    {operador.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="meta-diaria-un" className="text-xs">
              Meta diária (un.)
            </Label>
            <Input
              id="meta-diaria-un"
              type="number"
              min={0}
              value={metaDiaria}
              onChange={(e) => setMetaDiaria(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Data Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(dataInicio, "dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={dataInicio}
                  onSelect={(date) => date && setDataInicio(date)}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Data Fim</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(dataFim, "dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={dataFim}
                  onSelect={(date) => date && setDataFim(date)}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { tipoLabels };
