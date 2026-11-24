import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

export interface RomaneioItemDraft {
  cliente: string;
  endereco_entrega: string;
  quantidade: string;
  peso_kg: string;
}

interface NovoRomaneioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  novoRomaneio: {
    motorista: string;
    placa_veiculo: string;
    tipo_veiculo: string;
    data_prevista_entrega: string;
    rota: string;
  };
  formErrors: Record<string, string>;
  onFieldChange: (field: string, value: string) => void;
  itens: RomaneioItemDraft[];
  itemErrors: Record<string, string>;
  onItemChange: (index: number, field: keyof RomaneioItemDraft, value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function NovoRomaneioDialog({
  open,
  onOpenChange,
  novoRomaneio,
  formErrors,
  onFieldChange,
  itens,
  itemErrors,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onSubmit,
  isSubmitting,
}: NovoRomaneioDialogProps) {
  const buttonProps = { onClick: onSubmit, disabled: isSubmitting };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Romaneio</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="motorista">Motorista *</Label>
            <Input
              id="motorista"
              value={novoRomaneio.motorista}
              onChange={(e) => onFieldChange("motorista", e.target.value)}
              placeholder="Nome do motorista"
              className={formErrors.motorista ? "border-destructive" : ""}
              maxLength={100}
            />
            {formErrors.motorista && (
              <p className="mt-1 text-xs text-destructive">{formErrors.motorista}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="placa-do-veiculo">Placa do Veículo *</Label>
              <Input
                id="placa-do-veiculo"
                value={novoRomaneio.placa_veiculo}
                onChange={(e) => onFieldChange("placa_veiculo", e.target.value.toUpperCase())}
                placeholder="ABC-1234"
                className={formErrors.placa_veiculo ? "border-destructive" : ""}
                maxLength={10}
              />
              {formErrors.placa_veiculo && (
                <p className="mt-1 text-xs text-destructive">{formErrors.placa_veiculo}</p>
              )}
            </div>
            <div>
              <Label htmlFor="tipo-de-veiculo">Tipo de Veículo</Label>
              <Select
                value={novoRomaneio.tipo_veiculo}
                onValueChange={(v) => onFieldChange("tipo_veiculo", v)}
              >
                <SelectTrigger id="tipo-de-veiculo">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
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
            <Label htmlFor="data-prevista">Data Prevista *</Label>
            <Input
              id="data-prevista"
              type="date"
              value={novoRomaneio.data_prevista_entrega}
              onChange={(e) => onFieldChange("data_prevista_entrega", e.target.value)}
              className={formErrors.data_prevista_entrega ? "border-destructive" : ""}
            />
            {formErrors.data_prevista_entrega && (
              <p className="mt-1 text-xs text-destructive">{formErrors.data_prevista_entrega}</p>
            )}
          </div>
          <div>
            <Label htmlFor="rota">Rota</Label>
            <Input
              id="rota"
              value={novoRomaneio.rota}
              onChange={(e) => onFieldChange("rota", e.target.value)}
              placeholder="Descrição da rota"
            />
          </div>
          <div className="space-y-3 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <Label>Itens da entrega *</Label>
              <Button type="button" variant="outline" size="sm" onClick={onAddItem}>
                <Plus className="mr-1 h-3 w-3" />
                Adicionar item
              </Button>
            </div>
            {itens.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Adicione ao menos um destinatário: o romaneio só pode ser confirmado com itens.
              </p>
            )}
            {itens.map((item, index) => (
              <div key={index} className="space-y-2 rounded-md bg-muted/40 p-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Item {index + 1}</span>
                  <Button
                    aria-label="Remover item"
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onRemoveItem(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <Label htmlFor={`destinatario-${index}`}>Destinatário *</Label>
                    <Input
                      id={`destinatario-${index}`}
                      value={item.cliente}
                      onChange={(e) => onItemChange(index, "cliente", e.target.value)}
                      placeholder="Nome do cliente"
                      className={itemErrors[`${index}.cliente`] ? "border-destructive" : ""}
                      maxLength={200}
                    />
                    {itemErrors[`${index}.cliente`] && (
                      <p className="mt-1 text-xs text-destructive">
                        {itemErrors[`${index}.cliente`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor={`volumes-${index}`}>Volumes *</Label>
                    <Input
                      id={`volumes-${index}`}
                      type="number"
                      min={1}
                      value={item.quantidade}
                      onChange={(e) => onItemChange(index, "quantidade", e.target.value)}
                      className={itemErrors[`${index}.quantidade`] ? "border-destructive" : ""}
                    />
                    {itemErrors[`${index}.quantidade`] && (
                      <p className="mt-1 text-xs text-destructive">
                        {itemErrors[`${index}.quantidade`]}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor={`endereco-${index}`}>Endereço *</Label>
                  <Input
                    id={`endereco-${index}`}
                    value={item.endereco_entrega}
                    onChange={(e) => onItemChange(index, "endereco_entrega", e.target.value)}
                    placeholder="Rua, número, bairro, cidade"
                    className={itemErrors[`${index}.endereco_entrega`] ? "border-destructive" : ""}
                    maxLength={300}
                  />
                  {itemErrors[`${index}.endereco_entrega`] && (
                    <p className="mt-1 text-xs text-destructive">
                      {itemErrors[`${index}.endereco_entrega`]}
                    </p>
                  )}
                </div>
                <div className="w-32">
                  <Label htmlFor={`peso-kg-${index}`}>Peso (kg)</Label>
                  <Input
                    id={`peso-kg-${index}`}
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.peso_kg}
                    onChange={(e) => onItemChange(index, "peso_kg", e.target.value)}
                  />
                </div>
              </div>
            ))}
            {formErrors.itens && <p className="text-xs text-destructive">{formErrors.itens}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button {...buttonProps}>Criar Romaneio</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
