import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItem { id: string; title: string; content: React.ReactNode; }

interface AccordionProps { items: AccordionItem[]; allowMultiple?: boolean; }

export function AccordionCustom({ items, allowMultiple = false }: AccordionProps) {
  const [open, setOpen] = useState<string[]>([]);

  const toggle = (id: string) => {
    if (allowMultiple) {
      setOpen(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    } else {
      setOpen(prev => prev.includes(id) ? [] : [id]);
    }
  };

  return (
    <div className="divide-y rounded-lg border">
      {items.map(item => (
        <div key={item.id}>
          <button onClick={() => toggle(item.id)} className="flex w-full items-center justify-between p-4 text-left font-medium hover:bg-muted/50">
            {item.title}
            <ChevronDown className={cn("h-4 w-4 transition-transform", open.includes(item.id) && "rotate-180")} />
          </button>
          {open.includes(item.id) && <div className="px-4 pb-4">{item.content}</div>}
        </div>
      ))}
    </div>
  );
}
