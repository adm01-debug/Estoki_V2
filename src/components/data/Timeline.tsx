import { cn } from "@/lib/utils";

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  icon?: React.ReactNode;
  status?: "completed" | "current" | "upcoming";
}

interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "h-3 w-3 rounded-full border-2",
                item.status === "completed"
                  ? "border-green-500 bg-green-500"
                  : item.status === "current"
                    ? "border-blue-500 bg-blue-500"
                    : "border-muted-foreground bg-muted"
              )}
            />
            {index < items.length - 1 && <div className="mt-1 h-full w-0.5 bg-muted" />}
          </div>
          <div className="pb-4">
            <p className="font-medium">{item.title}</p>
            {item.description && (
              <p className="text-sm text-muted-foreground">{item.description}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">{item.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
