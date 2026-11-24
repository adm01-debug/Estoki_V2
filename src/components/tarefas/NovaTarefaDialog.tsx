import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { TipoTarefa, PrioridadeTarefa, tipoLabels, prioridadeLabels } from "@/types/tarefas";

interface NovaTarefaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submitting: boolean;
  novaTarefa: {
    tipo: TipoTarefa;
    descricao: string;
    prioridade: PrioridadeTarefa;
    quantidade: number;
  };
  setNovaTarefa: (val: any) => void;
  onCriar: () => void;
}

export function NovaTarefaDialog({
  open,
  onOpenChange,
  submitting,
  novaTarefa,
  setNovaTarefa,
  onCriar,
}: NovaTarefaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (submitting) return;
            onCriar();
          }}
        >
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={novaTarefa.tipo}
                onValueChange={(v) => setNovaTarefa({ ...novaTarefa, tipo: v as TipoTarefa })}
              >
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tipoLabels).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      {val}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva a tarefa..."
                value={novaTarefa.descricao}
                onChange={(e) => setNovaTarefa({ ...novaTarefa, descricao: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select
                  value={novaTarefa.prioridade}
                  onValueChange={(v) =>
                    setNovaTarefa({ ...novaTarefa, prioridade: v as PrioridadeTarefa })
                  }
                >
                  <SelectTrigger id="prioridade">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(prioridadeLabels).map(([key, val]) => (
                      <SelectItem key={key} value={key}>
                        {val}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  type="number"
                  value={novaTarefa.quantidade}
                  onChange={(e) =>
                    setNovaTarefa({ ...novaTarefa, quantidade: Number(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Criar Tarefa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
