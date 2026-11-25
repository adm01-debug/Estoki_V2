import React, { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  label?: string;
  placeholder?: string;
  loading?: boolean;
}
export function SearchInput({
  value = "",
  onChange,
  onSearch,
  label,
  placeholder = "Buscar...",
  loading = false,
}: SearchInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSearch?.(value);
  };
  const handleClear = () => {
    onChange?.("");
    onSearch?.("");
  };
  const uid = useId();

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={uid}>{label}</Label>}
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={uid}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pr-10 pl-10"
        />
        {loading ? (
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          value && (
            <Button
              aria-label="Limpar busca"
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0 h-full w-10"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )
        )}
      </div>
    </div>
  );
}
