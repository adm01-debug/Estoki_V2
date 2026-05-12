import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export function NovaTarefaDialog({ open, onOpenChange, submitting, novaTarefa, setNovaTarefa, onCriar }: NovaTarefaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nova Tarefa</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={novaTarefa.tipo} onValueChange={(v) => setNovaTarefa({ ...novaTarefa, tipo: v as TipoTarefa })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(tipoLabels).map(([key, val]) => (<SelectItem key={key} value={key}>{val}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Descrição *</Label>
            <Textarea placeholder="Descreva a tarefa..." value={novaTarefa.descricao} onChange={(e) => setNovaTarefa({ ...novaTarefa, descricao: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={novaTarefa.prioridade} onValueChange={(v) => setNovaTarefa({ ...novaTarefa, prioridade: v as PrioridadeTarefa })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(prioridadeLabels).map(([key, val]) => (<SelectItem key={key} value={key}>{val}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input type="number" value={novaTarefa.quantidade} onChange={(e) => setNovaTarefa({ ...novaTarefa, quantidade: Number(e.target.value) })} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onCriar} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Criar Tarefa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}