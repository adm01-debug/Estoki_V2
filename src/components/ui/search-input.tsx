import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "@/hooks/useDebounce";

interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  isLoading?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export function SearchInput({
  value: controlledValue,
  onChange,
  onSearch,
  placeholder = "Buscar...",
  debounceMs = 300,
  isLoading = false,
  className,
  autoFocus = false,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState("");
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const debouncedSearch = useDebouncedCallback((val: string) => {
    onSearch?.(val);
  }, debounceMs);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (controlledValue === undefined) setInternalValue(newValue);
      onChange?.(newValue);
      debouncedSearch(newValue);
    },
    [controlledValue, onChange, debouncedSearch]
  );

  const handleClear = useCallback(() => {
    if (controlledValue === undefined) setInternalValue("");
    onChange?.("");
    onSearch?.("");
  }, [controlledValue, onChange, onSearch]);

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        aria-label={placeholder || "Buscar"}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="pr-9 pl-9"
        autoFocus={autoFocus}
      />
      {isLoading ? (
        <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      ) : value ? (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}

export default SearchInput;
