import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface InventoryFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
}

export function InventoryFilters({ searchTerm, onSearchChange, statusFilter, onStatusFilterChange }: InventoryFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar ciclos..." 
          value={searchTerm} 
          onChange={(e) => onSearchChange(e.target.value)} 
          className="pl-9" 
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-[150px]">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          <SelectItem value="agendado">Agendados</SelectItem>
          <SelectItem value="em_andamento">Em Andamento</SelectItem>
          <SelectItem value="concluido">Concluídos</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
