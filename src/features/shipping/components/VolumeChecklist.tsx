import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
 import { Package, ClipboardCheck, AlertTriangle, QrCode, ShieldCheck, MapPin } from "lucide-react";
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
  const [items, setItems] = useState<VolumeItem[]>([
    { id: "1", codigo: "VOL-001", setorOrigem: "Triagem", concluido: true, localizacao: "Doca 1" },
    { id: "2", codigo: "VOL-002", setorOrigem: "Triagem", concluido: true, localizacao: "Doca 1" },
    { id: "3", codigo: "VOL-003", setorOrigem: "Gravação", concluido: false, localizacao: "Saída Produção" },
    { id: "4", codigo: "VOL-004", setorOrigem: "Manuseio", concluido: false, localizacao: "Mesa 4" },
  ]);

  const total = items.length;
  const concluido = items.filter(i => i.concluido).length;
  const progresso = (concluido / total) * 100;

  const toggleItem = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, concluido: !i.concluido } : i));
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            Conferência de Volumes
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1">
              <QrCode className="h-3 w-3" /> Escanear
            </Button>
            <Badge variant="secondary" className="font-mono">
              {concluido}/{total}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
            <span>Integridade da Carga</span>
            <span>{Math.round(progresso)}%</span>
          </div>
          <Progress value={progresso} className="h-2" />
        </div>

        <div className="grid gap-2">
          {items.map((item) => (
            <div 
              key={item.id} 
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                item.concluido ? "bg-success/5 border-success/20 opacity-70" : "bg-card border-border hover:border-primary/50"
              }`}
            >
              <Checkbox 
                id={item.id} 
                checked={item.concluido} 
                onCheckedChange={() => toggleItem(item.id)} 
              />
              <div className="flex-1 min-w-0">
                <label 
                  htmlFor={item.id}
                  className={`text-sm font-medium leading-none cursor-pointer flex items-center justify-between ${
                    item.concluido ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Package className="h-3.5 w-3.5" />
                    {item.codigo}
                  </span>
                  <Badge variant="outline" className="text-[9px] h-4">
                    {item.setorOrigem}
                  </Badge>
                </label>
              </div>
              {!item.concluido && item.setorOrigem === "Manuseio" && (
                <AlertTriangle className="h-3.5 w-3.5 text-orange-500 animate-pulse" />
              )}
              {item.concluido && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <ShieldCheck className="h-4 w-4 text-success" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-[10px]">Verificado por: Logística Central</p>
                      {item.localizacao && <p className="text-[10px] flex items-center gap-1"><MapPin className="h-2 w-2" /> {item.localizacao}</p>}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
