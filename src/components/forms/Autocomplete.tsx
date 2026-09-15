import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
interface AutocompleteProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}
export function Autocomplete({
  options,
  value,
  onChange,
  placeholder,
  label,
  className,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const filtered = options.filter((opt) => opt.toLowerCase().includes(value.toLowerCase()));
  return (
    <div className={cn("relative", className)}>
      {label && <Label className="mb-1">{label}</Label>}
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        placeholder={placeholder}
      />
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background shadow-lg">
          {filtered.map((opt, i) => (
            <div
              key={i}
              className="cursor-pointer px-3 py-2 hover:bg-accent"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
