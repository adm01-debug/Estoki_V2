import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NovoRomaneioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  novoRomaneio: { motorista: string; placa_veiculo: string; tipo_veiculo: string; data_prevista_entrega: string; rota: string };
  formErrors: Record<string, string>;
  onFieldChange: (field: string, value: string) => void;
  onSubmit: () => void;
}

export function NovoRomaneioDialog({ open, onOpenChange, novoRomaneio, formErrors, onFieldChange, onSubmit }: NovoRomaneioDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Novo Romaneio</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Motorista *</Label>
            <Input value={novoRomaneio.motorista} onChange={e => onFieldChange("motorista", e.target.value)} placeholder="Nome do motorista" className={formErrors.motorista ? "border-destructive" : ""} maxLength={100} />
            {formErrors.motorista && <p className="text-xs text-destructive mt-1">{formErrors.motorista}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Placa do Veículo *</Label>
              <Input value={novoRomaneio.placa_veiculo} onChange={e => onFieldChange("placa_veiculo", e.target.value.toUpperCase())} placeholder="ABC-1234" className={formErrors.placa_veiculo ? "border-destructive" : ""} maxLength={10} />
              {formErrors.placa_veiculo && <p className="text-xs text-destructive mt-1">{formErrors.placa_veiculo}</p>}
            </div>
            <div>
              <Label>Tipo de Veículo</Label>
              <Select value={novoRomaneio.tipo_veiculo} onValueChange={v => onFieldChange("tipo_veiculo", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="moto">Moto</SelectItem>
                  <SelectItem value="carro">Carro</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="caminhao">Caminhão</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Data Prevista *</Label>
            <Input type="date" value={novoRomaneio.data_prevista_entrega} onChange={e => onFieldChange("data_prevista_entrega", e.target.value)} className={formErrors.data_prevista_entrega ? "border-destructive" : ""} />
            {formErrors.data_prevista_entrega && <p className="text-xs text-destructive mt-1">{formErrors.data_prevista_entrega}</p>}
          </div>
          <div>
            <Label>Rota</Label>
            <Input value={novoRomaneio.rota} onChange={e => onFieldChange("rota", e.target.value)} placeholder="Descrição da rota" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSubmit}>Criar Romaneio</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
