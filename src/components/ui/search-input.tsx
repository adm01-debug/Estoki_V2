import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebouncedCallback } from '@/hooks/useDebounce';

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
  placeholder = 'Buscar...',
  debounceMs = 300,
  isLoading = false,
  className,
  autoFocus = false,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState('');
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const debouncedSearch = useDebouncedCallback((val: string) => {
    onSearch?.(val);
  }, debounceMs);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (controlledValue === undefined) setInternalValue(newValue);
    onChange?.(newValue);
    debouncedSearch(newValue);
  }, [controlledValue, onChange, debouncedSearch]);

  const handleClear = useCallback(() => {
    if (controlledValue === undefined) setInternalValue('');
    onChange?.('');
    onSearch?.('');
  }, [controlledValue, onChange, onSearch]);

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-9 pr-9"
        autoFocus={autoFocus}
      />
      {isLoading ? (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
      ) : value ? (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}

export default SearchInput;
