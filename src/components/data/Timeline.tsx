import { cn } from "@/lib/utils";

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  icon?: React.ReactNode;
  status?: "completed" | "current" | "upcoming";
}

interface TimelineProps { items: TimelineItem[]; }

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={cn("w-3 h-3 rounded-full border-2", item.status === "completed" ? "bg-green-500 border-green-500" : item.status === "current" ? "bg-blue-500 border-blue-500" : "bg-muted border-muted-foreground")} />
            {index < items.length - 1 && <div className="w-0.5 h-full bg-muted mt-1" />}
          </div>
          <div className="pb-4">
            <p className="font-medium">{item.title}</p>
            {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
            <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
