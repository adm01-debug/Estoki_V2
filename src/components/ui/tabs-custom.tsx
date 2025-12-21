import { cn } from "@/lib/utils";
import { useState } from "react";

interface Tab { id: string; label: string; content: React.ReactNode; icon?: React.ReactNode; }

interface TabsCustomProps { tabs: Tab[]; defaultTab?: string; className?: string; }

export function TabsCustom({ tabs, defaultTab, className }: TabsCustomProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id);
  const activeTab = tabs.find(t => t.id === active);

  return (
    <div className={className}>
      <div className="flex border-b">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActive(tab.id)} className={cn("flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors", active === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>
      <div className="py-4">{activeTab?.content}</div>
    </div>
  );
}
