import React, { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
interface TagInputProps {
  value?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  max?: number;
}
export function TagInput({
  value = [],
  onChange,
  placeholder = "Digite e pressione Enter",
  max,
}: TagInputProps) {
  const [input, setInput] = useState("");
  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !value.includes(t) && (!max || value.length < max)) {
      onChange?.([...value, t]);
      setInput("");
    }
  };
  const removeTag = (tag: string) => onChange?.(value.filter((t) => t !== tag));
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && value.length) {
      removeTag(value[value.length - 1]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2 rounded-md border p-2 focus-within:ring-2 focus-within:ring-ring">
      {value.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1">
          {tag}
          <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
        </Badge>
      ))}
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-w-[120px] flex-1 border-0 p-0 focus-visible:ring-0"
      />
    </div>
  );
}
