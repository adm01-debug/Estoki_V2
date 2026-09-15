import React from "react";
import { Badge } from "@/components/ui/badge";
import { GripVertical, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
interface KanbanCardProps {
  id: string;
  title: string;
  description?: string;
  labels?: { text: string; color?: string }[];
  assignee?: { name: string; avatar?: string };
  dueDate?: Date;
  priority?: "low" | "medium" | "high";
  onClick?: () => void;
  onMenuClick?: () => void;
}
export function KanbanCard({
  id,
  title,
  description,
  labels,
  assignee,
  dueDate,
  priority,
  onClick,
  onMenuClick,
}: KanbanCardProps) {
  const priorityColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };
  const isOverdue = dueDate && dueDate < new Date();
  return (
    <div
      className="group cursor-pointer rounded-lg border bg-background p-3 transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <div className="mt-1 cursor-grab opacity-0 group-hover:opacity-100">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between">
            <h4 className="truncate text-sm font-medium">{title}</h4>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onMenuClick?.();
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          {description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{description}</p>
          )}
          {labels && labels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {labels.map((l, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="text-xs"
                  style={{ backgroundColor: l.color }}
                >
                  {l.text}
                </Badge>
              ))}
            </div>
          )}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {priority && (
                <Badge className={`text-xs ${priorityColors[priority]}`}>{priority}</Badge>
              )}
              {dueDate && (
                <span className={`text-xs ${isOverdue ? "text-red-500" : "text-muted-foreground"}`}>
                  {dueDate.toLocaleDateString()}
                </span>
              )}
            </div>
            {assignee && (
              <div className="flex items-center gap-1">
                {assignee.avatar ? (
                  <img src={assignee.avatar} alt={assignee.name} className="h-5 w-5 rounded-full" />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {assignee.name[0]}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
