import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, Building2 } from "lucide-react";

interface Props {
  periodoFiltro: string;
  searchTerm: string;
  fornecedorFiltro: string;
  tipoFiltro: "todos" | "falta" | "sobra";
  fornecedoresUnicos: string[];
  onPeriodoChange: (v: string) => void;
  onSearchChange: (v: string) => void;
  onFornecedorChange: (v: string) => void;
  onTipoChange: (v: "todos" | "falta" | "sobra") => void;
}

export function DivergenciasFiltros({ periodoFiltro, searchTerm, fornecedorFiltro, tipoFiltro, fornecedoresUnicos, onPeriodoChange, onSearchChange, onFornecedorChange, onTipoChange }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Search className="h-4 w-4" />Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Período</label>
            <Select value={periodoFiltro} onValueChange={onPeriodoChange}>
              <SelectTrigger><Calendar className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="15">Últimos 15 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="60">Últimos 60 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Lote, produto, fornecedor..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="pl-9" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Fornecedor</label>
            <Select value={fornecedorFiltro} onValueChange={onFornecedorChange}>
              <SelectTrigger><Building2 className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {fornecedoresUnicos.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Tipo</label>
            <Select value={tipoFiltro} onValueChange={(v) => onTipoChange(v as "todos" | "falta" | "sobra")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="falta">Apenas Faltas</SelectItem>
                <SelectItem value="sobra">Apenas Sobras</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
