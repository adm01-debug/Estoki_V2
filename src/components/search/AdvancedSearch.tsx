import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdvancedSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isSearching?: boolean;
  totalResults?: number;
  minChars?: number;
  className?: string;
  showResultCount?: boolean;
  onClear?: () => void;
}

export function AdvancedSearch({
  value,
  onChange,
  placeholder = "Buscar...",
  isSearching = false,
  totalResults,
  minChars = 2,
  className,
  showResultCount = true,
  onClear,
}: AdvancedSearchProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChange("");
    onClear?.();
  };

  const showClearButton = value.length > 0;
  const showResultBadge = showResultCount && value.length >= minChars && totalResults !== undefined;

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>

        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "pl-10 pr-20 transition-all",
            isFocused && "ring-2 ring-primary/20"
          )}
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {showResultBadge && (
            <Badge variant="secondary" className="text-xs h-5">
              {totalResults} resultado{totalResults !== 1 ? "s" : ""}
            </Badge>
          )}

          {showClearButton && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {value.length > 0 && value.length < minChars && (
        <p className="text-xs text-muted-foreground mt-1">
          Digite pelo menos {minChars} caracteres para buscar
        </p>
      )}
    </div>
  );
}

interface SearchHighlightProps {
  text: string;
  searchTerm: string;
  className?: string;
}

export function SearchHighlight({ text, searchTerm, className }: SearchHighlightProps) {
  if (!searchTerm || searchTerm.length < 2) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, "gi");
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
