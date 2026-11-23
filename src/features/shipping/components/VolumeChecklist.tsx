import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ClipboardCheck, Search, ShieldCheck, MapPin } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RomaneioLike {
  id: string;
  codigo: string;
  status: string;
  motorista?: string;
  placa_veiculo?: string;
}

const STATUS_LABEL: Record<string, string> = {
  rascunho: "Rascunho",
  confirmado: "Confirmado",
  em_transito: "Em trânsito",
  entregue: "Entregue",
  parcial: "Parcial",
  cancelado: "Cancelado",
};

export function VolumeChecklist({ romaneios = [] }: { romaneios?: RomaneioLike[] }) {
  const shouldReduceMotion = useReducedMotion();
  const [filter, setFilter] = useState("");

  const total = romaneios.length;
  const concluido = romaneios.filter((r) => r.status === "entregue").length;
  const progresso = total ? (concluido / total) * 100 : 0;

  const filteredItems = romaneios.filter((r) => {
    const termo = filter.toLowerCase();
    return (
      r.codigo.toLowerCase().includes(termo) ||
      (STATUS_LABEL[r.status] || r.status).toLowerCase().includes(termo)
    );
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            Conferência de Romaneios
          </CardTitle>
          <Badge variant="secondary" className="font-mono">
            {concluido}/{total}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Filtrar romaneios..."
            className="h-8 border-none bg-muted/30 pl-8 text-xs focus-visible:ring-1 focus-visible:ring-primary/20"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>Romaneios entregues</span>
            <span>{Math.round(progresso)}%</span>
          </div>
          <Progress value={progresso} className="h-2" />
        </div>

        <div className="grid max-h-[350px] gap-2 overflow-y-auto pr-1">
          {filteredItems.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Nenhum romaneio encontrado.
            </p>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout={!shouldReduceMotion}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
                    item.status === "entregue"
                      ? "border-success/20 bg-success/5 opacity-70"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div
                      className={`flex items-center justify-between text-sm font-medium leading-none ${
                        item.status === "entregue" ? "text-muted-foreground" : ""
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Package className="h-3.5 w-3.5" />
                        {item.codigo}
                      </span>
                      <Badge variant="outline" className="h-4 text-[9px]">
                        {STATUS_LABEL[item.status] || item.status}
                      </Badge>
                    </div>
                  </div>
                  {item.status === "entregue" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <ShieldCheck className="h-4 w-4 text-success" />
                        </TooltipTrigger>
                        <TooltipContent>
                          {item.motorista && <p className="text-[10px]">{item.motorista}</p>}
                          {item.placa_veiculo && (
                            <p className="flex items-center gap-1 text-[10px]">
                              <MapPin className="h-2 w-2" /> {item.placa_veiculo}
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
