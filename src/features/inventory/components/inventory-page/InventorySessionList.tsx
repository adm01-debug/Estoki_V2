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
  const filteredItems = items.filter(item => 
    item.sku.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Card className="glass-card border-border/30 overflow-hidden">
      <CardHeader className="border-b border-border/20 px-8 py-6 flex flex-row items-center justify-between bg-muted/20">
        <div className="space-y-1">
          <CardTitle className="text-lg font-black tracking-tight">Itens da Sessão Atual</CardTitle>
          <CardDescription className="text-xs font-medium">Contagens realizadas nas últimas 24 horas</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
            <Input 
              placeholder="Filtrar SKU..." 
              className="pl-9 h-9 w-48 text-xs rounded-xl bg-background/50" 
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-bold text-muted-foreground">Nenhum item encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {filteredItems.map((item, idx) => (
              <motion.div 
                key={idx} 
                className="flex items-center justify-between px-8 py-5 hover:bg-muted/30 transition-colors group/item"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm transition-transform group-hover/item:scale-110",
                    item.variance === 0 ? "bg-success/5 border-success/20 text-success" : "bg-destructive/5 border-destructive/20 text-destructive"
                  )}>
                    {item.variance === 0 ? <Zap className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-black text-sm text-foreground tracking-tight">{item.sku}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Esperado: <span className="text-foreground">{item.expected}</span></span>
                      <div className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Contado: <span className="text-foreground">{item.counted}</span></span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={item.variance === 0 ? "outline" : "destructive"} className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-2.5 rounded-full",
                    item.variance === 0 ? "border-success/30 text-success bg-success/5" : ""
                  )}>
                    {item.variance === 0 ? "Acurado" : `Divergência: ${item.variance}`}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover/item:opacity-100 transition-opacity">
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
