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
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
      {columns.map((column) => (
        <div key={column.id} className="flex-shrink-0 w-80 flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${column.color || 'bg-primary'}`} />
              <h3 className="font-bold text-sm uppercase tracking-wider">{column.title}</h3>
              <Badge variant="secondary" className="text-[10px]">{items.filter(i => i.columnId === column.id).length}</Badge>
            </div>
          </div>
          
          <div className="flex-1 bg-muted/30 rounded-xl p-2 space-y-3 min-h-[500px]">
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
                    {renderItem ? renderItem(item) : (
                      <Card className="hover:border-primary/50 transition-colors shadow-sm">
                        <CardContent className="p-3 space-y-2">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-medium line-clamp-2">{item.title}</p>
                            {item.priority && (
                               <div className={`w-1.5 h-1.5 rounded-full ${
                                 item.priority === 'critical' ? 'bg-destructive' :
                                 item.priority === 'high' ? 'bg-orange-500' :
                                 item.priority === 'medium' ? 'bg-primary' : 'bg-success'
                               }`} />
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {item.tags?.map(tag => (
                              <Badge key={tag} variant="outline" className="text-[9px] px-1 py-0">{tag}</Badge>
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
