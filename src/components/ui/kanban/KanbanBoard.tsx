import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
}

export interface KanbanItem {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  tags?: string[];
  priority?: "low" | "medium" | "high" | "critical";
  assignee?: string;
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  items: KanbanItem[];
  onMoveItem?: (itemId: string, newColumnId: string) => void;
  renderItem?: (item: KanbanItem) => React.ReactNode;
}

export function KanbanBoard({ columns, items, onMoveItem, renderItem }: KanbanBoardProps) {
  return (
    <div className="flex min-h-[600px] gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div key={column.id} className="flex w-80 flex-shrink-0 flex-col gap-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${column.color || "bg-primary"}`} />
              <h3 className="text-sm font-bold uppercase tracking-wider">{column.title}</h3>
              <Badge variant="secondary" className="text-[10px]">
                {items.filter((i) => i.columnId === column.id).length}
              </Badge>
            </div>
          </div>

          <div className="min-h-[500px] flex-1 space-y-3 rounded-xl bg-muted/30 p-2">
            <AnimatePresence mode="popLayout">
              {items
                .filter((item) => item.columnId === column.id)
                .map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    {renderItem ? (
                      renderItem(item)
                    ) : (
                      <Card className="shadow-sm transition-colors hover:border-primary/50">
                        <CardContent className="space-y-2 p-3">
                          <div className="flex items-start justify-between">
                            <p className="line-clamp-2 text-sm font-medium">{item.title}</p>
                            {item.priority && (
                              <div
                                className={`h-1.5 w-1.5 rounded-full ${
                                  item.priority === "critical"
                                    ? "bg-destructive"
                                    : item.priority === "high"
                                      ? "bg-orange-500"
                                      : item.priority === "medium"
                                        ? "bg-primary"
                                        : "bg-success"
                                }`}
                              />
                            )}
                          </div>
                          {item.description && (
                            <p className="line-clamp-2 text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {item.tags?.map((tag) => (
                              <Badge key={tag} variant="outline" className="px-1 py-0 text-[9px]">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
}
