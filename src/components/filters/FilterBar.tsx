import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  children?: React.ReactNode;
}

export function FilterBar({ search, onSearchChange, onClear, placeholder = "Buscar...", children }: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => onSearchChange(e.target.value)} placeholder={placeholder} className="pl-10" />
        {search && (
          <button onClick={() => onSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>
      {children}
      {onClear && (
        <Button variant="ghost" onClick={onClear}>
          <Filter className="mr-2 h-4 w-4" />Limpar
        </Button>
      )}
    </div>
  );
}
