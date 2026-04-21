import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export interface ProdutoFormData {
  sku: string;
  nome: string;
  descricao: string;
  unidade: string;
  estoque_minimo: number;
  estoque_maximo: number;
  ponto_pedido: number;
  peso_unitario: number;
  fornecedor_principal: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ProdutoFormData;
  setFormData: (data: ProdutoFormData) => void;
  formErrors: Record<string, string>;
  setFormErrors: (errors: Record<string, string> | ((p: Record<string, string>) => Record<string, string>)) => void;
  saving: boolean;
  onSave: () => void;
}

export function ProdutoFormDialog({ open, onOpenChange, formData, setFormData, formErrors, setFormErrors, saving, onSave }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Novo Produto</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>SKU *</Label>
              <Input value={formData.sku} onChange={(e) => { setFormData({ ...formData, sku: e.target.value }); setFormErrors(p => ({ ...p, sku: "" })); }} className={formErrors.sku ? "border-destructive" : ""} maxLength={50} />
              {formErrors.sku && <p className="text-xs text-destructive mt-1">{formErrors.sku}</p>}
            </div>
            <div>
              <Label>Unidade</Label>
              <Select value={formData.unidade} onValueChange={(v) => setFormData({ ...formData, unidade: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["UN", "KG", "L", "M", "CX", "PC", "PAR"].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Nome *</Label>
            <Input value={formData.nome} onChange={(e) => { setFormData({ ...formData, nome: e.target.value }); setFormErrors(p => ({ ...p, nome: "" })); }} className={formErrors.nome ? "border-destructive" : ""} maxLength={200} />
            {formErrors.nome && <p className="text-xs text-destructive mt-1">{formErrors.nome}</p>}
          </div>
          <div>
            <Label>Descrição</Label>
            <Input value={formData.descricao} onChange={(e) => { setFormData({ ...formData, descricao: e.target.value }); setFormErrors(p => ({ ...p, descricao: "" })); }} maxLength={500} />
            {formErrors.descricao && <p className="text-xs text-destructive mt-1">{formErrors.descricao}</p>}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Est. Mínimo</Label>
              <Input type="number" value={formData.estoque_minimo} onChange={(e) => { setFormData({ ...formData, estoque_minimo: +e.target.value }); setFormErrors(p => ({ ...p, estoque_minimo: "" })); }} className={formErrors.estoque_minimo ? "border-destructive" : ""} />
              {formErrors.estoque_minimo && <p className="text-xs text-destructive mt-1">{formErrors.estoque_minimo}</p>}
            </div>
            <div>
              <Label>Est. Máximo</Label>
              <Input type="number" value={formData.estoque_maximo} onChange={(e) => { setFormData({ ...formData, estoque_maximo: +e.target.value }); setFormErrors(p => ({ ...p, estoque_maximo: "" })); }} className={formErrors.estoque_maximo ? "border-destructive" : ""} />
              {formErrors.estoque_maximo && <p className="text-xs text-destructive mt-1">{formErrors.estoque_maximo}</p>}
            </div>
            <div>
              <Label>Ponto Pedido</Label>
              <Input type="number" value={formData.ponto_pedido} onChange={(e) => setFormData({ ...formData, ponto_pedido: +e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Peso (kg)</Label>
              <Input type="number" step="0.01" value={formData.peso_unitario} onChange={(e) => setFormData({ ...formData, peso_unitario: +e.target.value })} />
            </div>
            <div>
              <Label>Fornecedor</Label>
              <Input value={formData.fornecedor_principal} onChange={(e) => setFormData({ ...formData, fornecedor_principal: e.target.value })} maxLength={200} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
