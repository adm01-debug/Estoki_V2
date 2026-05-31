import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ClipboardList, Zap, AlertTriangle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SessionItem {
  sku: string;
  expected: number;
  counted: number;
  variance: number;
}

interface InventorySessionListProps {
  items: SessionItem[];
  query: string;
  onQueryChange: (val: string) => void;
}

export function InventorySessionList({ items, query, onQueryChange }: InventorySessionListProps) {
  const filteredItems = items.filter((item) =>
    item.sku.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Card className="glass-card overflow-hidden border-border/30">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/20 bg-muted/20 px-8 py-6">
        <div className="space-y-1">
          <CardTitle className="text-lg font-black tracking-tight">Itens da Sessão Atual</CardTitle>
          <CardDescription className="text-xs font-medium">
            Contagens realizadas nas últimas 24 horas
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Filtrar SKU..."
              className="h-9 w-48 rounded-xl bg-background/50 pl-9 text-xs"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 w-9 rounded-xl p-0">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filteredItems.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
              <ClipboardList className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-bold text-muted-foreground">Nenhum item encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={idx}
                className="group/item flex items-center justify-between px-8 py-5 transition-colors hover:bg-muted/30"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm transition-transform group-hover/item:scale-110",
                      item.variance === 0
                        ? "border-success/20 bg-success/5 text-success"
                        : "border-destructive/20 bg-destructive/5 text-destructive"
                    )}
                  >
                    {item.variance === 0 ? (
                      <Zap className="h-5 w-5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-black tracking-tight text-foreground">{item.sku}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Esperado: <span className="text-foreground">{item.expected}</span>
                      </span>
                      <div className="h-1 w-1 rounded-full bg-border" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Contado: <span className="text-foreground">{item.counted}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant={item.variance === 0 ? "outline" : "destructive"}
                    className={cn(
                      "rounded-full px-2.5 text-[10px] font-black uppercase tracking-widest",
                      item.variance === 0 ? "border-success/30 bg-success/5 text-success" : ""
                    )}
                  >
                    {item.variance === 0 ? "Acurado" : `Divergência: ${item.variance}`}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 transition-opacity group-hover/item:opacity-100"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
