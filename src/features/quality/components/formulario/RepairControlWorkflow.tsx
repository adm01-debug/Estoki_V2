import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hammer, Clock, ArrowRight, Settings2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface RepairAction {
  id: string;
  label: string;
  description: string;
  estimatedTime: string;
}

const REPAIR_ACTIONS: RepairAction[] = [
  {
    id: "embalagem",
    label: "Troca de Embalagem",
    description: "Substituir caixa externa danificada",
    estimatedTime: "5 min",
  },
  {
    id: "limpeza",
    label: "Limpeza Técnica",
    description: "Remover manchas ou poeira superficial",
    estimatedTime: "10 min",
  },
  {
    id: "re-etiquetagem",
    label: "Re-etiquetagem",
    description: "Substituir etiquetas ilegíveis ou erradas",
    estimatedTime: "3 min",
  },
  {
    id: "manual",
    label: "Inclusão de Manual",
    description: "Adicionar manuais ou acessórios faltantes",
    estimatedTime: "2 min",
  },
];

interface RepairControlWorkflowProps {
  quantity: number;
  onConfirm: (data: any) => void;
}

export function RepairControlWorkflow({ quantity, onConfirm }: RepairControlWorkflowProps) {
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [priority, setPriority] = useState<"baixa" | "media" | "alta">("media");

  const toggleAction = (id: string) => {
    setSelectedActions((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  if (quantity <= 0) return null;

  return (
    <Card className="overflow-hidden border-warning/30 bg-warning/5">
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-warning/20 p-2 text-warning">
              <Hammer className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-warning">
                Workflow de Conserto
              </h3>
              <p className="text-xs font-medium text-muted-foreground">
                {quantity} unidades aguardando intervenção
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-warning/40 text-[10px] font-black uppercase text-warning"
          >
            Em Retenção
          </Badge>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Ações de Reparo Necessárias
          </p>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {REPAIR_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => toggleAction(action.id)}
                className={cn(
                  "group flex items-center justify-between rounded-xl border p-3 text-left transition-all",
                  selectedActions.includes(action.id)
                    ? "border-warning/40 bg-warning/20 ring-1 ring-warning/20"
                    : "border-border/40 bg-background hover:border-warning/20 hover:bg-warning/5"
                )}
              >
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase">{action.label}</p>
                  <p className="text-[10px] leading-tight text-muted-foreground">
                    {action.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {action.estimatedTime}
                  </div>
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors",
                      selectedActions.includes(action.id)
                        ? "border-warning bg-warning"
                        : "border-muted"
                    )}
                  >
                    {selectedActions.includes(action.id) && (
                      <ShieldCheck className="h-3 w-3 text-white" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-warning/10 pt-4">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">
              Prioridade:
            </span>
            <div className="flex rounded-lg bg-muted p-1">
              {(["baixa", "media", "alta"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={cn(
                    "rounded-md px-3 py-1 text-[10px] font-black uppercase transition-all",
                    priority === p
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="gap-2 text-xs font-bold text-warning hover:bg-warning/10"
            onClick={() => onConfirm({ selectedActions, priority })}
            disabled={selectedActions.length === 0}
          >
            Configurar Retrabalho
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
