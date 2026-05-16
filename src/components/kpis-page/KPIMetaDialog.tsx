import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { MetaKPI } from "@/features/analytics/hooks/useKPIsOperacionais";

interface MetaFormState {
  nome: string;
  descricao: string;
  tipo: string;
  metrica: string;
  valor_meta: number;
  unidade: string;
}

interface KPIMetaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMeta: MetaKPI | null;
  metaForm: MetaFormState;
  onMetaFormChange: (form: MetaFormState) => void;
  onSave: () => void;
}

export function KPIMetaDialog({ open, onOpenChange, editingMeta, metaForm, onMetaFormChange, onSave }: KPIMetaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingMeta ? "Editar Meta" : "Nova Meta"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input value={metaForm.nome} onChange={(e) => onMetaFormChange({ ...metaForm, nome: e.target.value })} placeholder="Ex: Meta de Triagem Diária" />
          </div>
          <div>
            <Label>Descrição</Label>
            <Input value={metaForm.descricao} onChange={(e) => onMetaFormChange({ ...metaForm, descricao: e.target.value })} placeholder="Descrição opcional" />
          </div>
          <div>
            <Label>Métrica</Label>
            <Select value={metaForm.metrica} onValueChange={(v) => onMetaFormChange({ ...metaForm, metrica: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione a métrica" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="itens_triados">Itens Triados</SelectItem>
                <SelectItem value="taxa_aprovacao">Taxa de Aprovação</SelectItem>
                <SelectItem value="tempo_medio_triagem_minutos">Tempo Médio Triagem</SelectItem>
                <SelectItem value="pedidos_separados">Pedidos Separados</SelectItem>
                <SelectItem value="acuracidade_picking">Acuracidade Picking</SelectItem>
                <SelectItem value="volumes_recebidos">Volumes Recebidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tipo</Label>
            <Select value={metaForm.tipo} onValueChange={(v) => onMetaFormChange({ ...metaForm, tipo: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="maior_melhor">Maior é melhor</SelectItem>
                <SelectItem value="menor_melhor">Menor é melhor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valor da Meta</Label>
              <Input type="number" value={metaForm.valor_meta} onChange={(e) => onMetaFormChange({ ...metaForm, valor_meta: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Unidade</Label>
              <Input value={metaForm.unidade} onChange={(e) => onMetaFormChange({ ...metaForm, unidade: e.target.value })} placeholder="Ex: un, %, min" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSave}>{editingMeta ? "Atualizar" : "Criar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
