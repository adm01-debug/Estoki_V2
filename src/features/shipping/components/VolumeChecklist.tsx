import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ClipboardCheck,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  MapPin,
  Search,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VolumeItem {
  id: string;
  codigo: string;
  setorOrigem: string;
  concluido: boolean;
  localizacao?: string;
}

export function VolumeChecklist() {
  const shouldReduceMotion = useReducedMotion();
  const [filter, setFilter] = useState("");
  const [items, setItems] = useState<VolumeItem[]>([
    { id: "1", codigo: "VOL-001", setorOrigem: "Triagem", concluido: true, localizacao: "Doca 1" },
    { id: "2", codigo: "VOL-002", setorOrigem: "Triagem", concluido: true, localizacao: "Doca 1" },
    {
      id: "3",
      codigo: "VOL-003",
      setorOrigem: "Gravação",
      concluido: false,
      localizacao: "Saída Produção",
    },
    {
      id: "4",
      codigo: "VOL-004",
      setorOrigem: "Manuseio",
      concluido: false,
      localizacao: "Mesa 4",
    },
  ]);

  const total = items.length;
  const concluido = items.filter((i) => i.concluido).length;
  const progresso = (concluido / total) * 100;

  const filteredItems = items.filter(
    (i) =>
      i.codigo.toLowerCase().includes(filter.toLowerCase()) ||
      i.setorOrigem.toLowerCase().includes(filter.toLowerCase())
  );

  const toggleItem = (id: string) => {
    setItems(items.map((i) => (i.id === id ? { ...i, concluido: !i.concluido } : i)));
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            Conferência de Volumes
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-7 gap-1 text-[10px]">
              <QrCode className="h-3 w-3" /> Escanear
            </Button>
            <Badge variant="secondary" className="font-mono">
              {concluido}/{total}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Filtrar volumes..."
            className="h-8 border-none bg-muted/30 pl-8 text-xs focus-visible:ring-1 focus-visible:ring-primary/20"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>Integridade da Carga</span>
            <span>{Math.round(progresso)}%</span>
          </div>
          <Progress value={progresso} className="h-2" />
        </div>

        <div className="grid max-h-[350px] gap-2 overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout={!shouldReduceMotion}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
                  item.concluido
                    ? "border-success/20 bg-success/5 opacity-70"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <Checkbox
                  id={item.id}
                  checked={item.concluido}
                  onCheckedChange={() => toggleItem(item.id)}
                />
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor={item.id}
                    className={`flex cursor-pointer items-center justify-between text-sm font-medium leading-none ${
                      item.concluido ? "text-muted-foreground line-through" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Package className="h-3.5 w-3.5" />
                      {item.codigo}
                    </span>
                    <Badge variant="outline" className="h-4 text-[9px]">
                      {item.setorOrigem}
                    </Badge>
                  </label>
                </div>
                {!item.concluido && item.setorOrigem === "Manuseio" && (
                  <AlertTriangle
                    className={`h-3.5 w-3.5 text-orange-500 ${!shouldReduceMotion ? "animate-pulse" : ""}`}
                  />
                )}
                {item.concluido && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <ShieldCheck className="h-4 w-4 text-success" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-[10px]">Verificado por: Logística Central</p>
                        {item.localizacao && (
                          <p className="flex items-center gap-1 text-[10px]">
                            <MapPin className="h-2 w-2" /> {item.localizacao}
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
