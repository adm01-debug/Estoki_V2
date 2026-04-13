import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";
import { TipoCiclo } from "@/hooks/useInventarioCiclico";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const tipoLabels: Record<TipoCiclo, string> = {
  completo: "Completo",
  amostragem: "Amostragem",
  curva_a: "Curva A",
  curva_b: "Curva B",
  curva_c: "Curva C",
  posicao: "Por Posição",
  zona: "Por Zona",
};

interface NovoCicloDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  criarCiclo: (data: { nome: string; descricao?: string; tipo: TipoCiclo; zona_alvo?: string; data_agendada: string }) => Promise<unknown>;
}

export function NovoCicloDialog({ open, onOpenChange, criarCiclo }: NovoCicloDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [newCiclo, setNewCiclo] = useState({
    nome: "",
    descricao: "",
    tipo: "completo" as TipoCiclo,
    zona_alvo: "",
    data_agendada: new Date(),
  });

  const handleCriarCiclo = async () => {
    if (!newCiclo.nome) {
      toast({ title: "Erro", description: "Nome é obrigatório", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const ciclo = await criarCiclo({
      nome: newCiclo.nome,
      descricao: newCiclo.descricao || undefined,
      tipo: newCiclo.tipo,
      zona_alvo: newCiclo.zona_alvo || undefined,
      data_agendada: newCiclo.data_agendada.toISOString(),
    });
    setSubmitting(false);
    if (ciclo) {
      onOpenChange(false);
      setNewCiclo({ nome: "", descricao: "", tipo: "completo", zona_alvo: "", data_agendada: new Date() });
      toast({ title: "Sucesso", description: "Ciclo de inventário criado" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Ciclo de Inventário</DialogTitle>
          <DialogDescription>Crie um novo ciclo de contagem</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome do Ciclo *</Label>
            <Input placeholder="Ex: Inventário Zona A - Semana 51" value={newCiclo.nome} onChange={(e) => setNewCiclo({ ...newCiclo, nome: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea placeholder="Descrição opcional" value={newCiclo.descricao} onChange={(e) => setNewCiclo({ ...newCiclo, descricao: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={newCiclo.tipo} onValueChange={(v) => setNewCiclo({ ...newCiclo, tipo: v as TipoCiclo })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(tipoLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Zona Alvo</Label>
              <Input placeholder="Ex: A, B, C" value={newCiclo.zona_alvo} onChange={(e) => setNewCiclo({ ...newCiclo, zona_alvo: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Data Agendada</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(newCiclo.data_agendada, "dd/MM/yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={newCiclo.data_agendada} onSelect={(date) => date && setNewCiclo({ ...newCiclo, data_agendada: date })} locale={ptBR} />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleCriarCiclo} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Criar Ciclo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
