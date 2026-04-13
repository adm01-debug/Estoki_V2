import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ArrowLeftRight, Undo2, Loader2 } from "lucide-react";
import type { TrocaDevolucaoInput, MotivoTD } from "@/hooks/useTrocasDevolucoes";

const motivosDefeito: { value: MotivoTD; label: string }[] = [
  { value: 'defeito', label: 'Defeito de fabricação' },
  { value: 'cor_errada', label: 'Cor incorreta' },
  { value: 'tamanho_errado', label: 'Tamanho errado' },
  { value: 'quantidade_errada', label: 'Quantidade divergente' },
  { value: 'produto_errado', label: 'Produto incorreto' },
  { value: 'avaria_transporte', label: 'Avaria no transporte' },
  { value: 'desistencia', label: 'Desistência' },
  { value: 'outro', label: 'Outro' },
];

interface NovoRegistroDialogProps {
  onSave: (input: TrocaDevolucaoInput) => Promise<void>;
  saving: boolean;
}

export function NovoRegistroDialog({ onSave, saving }: NovoRegistroDialogProps) {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<'troca' | 'devolucao'>('troca');
  const [pedido, setPedido] = useState('');
  const [cliente, setCliente] = useState('');
  const [produto, setProduto] = useState('');
  const [sku, setSku] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [motivo, setMotivo] = useState<MotivoTD>('defeito');
  const [descricaoProblema, setDescricaoProblema] = useState('');

  const handleSave = async () => {
    await onSave({ tipo, pedido, cliente, produto, sku: sku || undefined, quantidade: parseInt(quantidade), fornecedor: fornecedor || undefined, motivo, descricao_problema: descricaoProblema || undefined });
    setOpen(false);
    setTipo('troca'); setPedido(''); setCliente(''); setProduto(''); setSku(''); setQuantidade(''); setFornecedor(''); setMotivo('defeito'); setDescricaoProblema('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Novo Registro</Button></DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Registrar Troca/Devolução</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as 'troca' | 'devolucao')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="troca"><div className="flex items-center gap-2"><ArrowLeftRight className="h-4 w-4" />Troca</div></SelectItem>
                <SelectItem value="devolucao"><div className="flex items-center gap-2"><Undo2 className="h-4 w-4" />Devolução</div></SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Pedido *</Label><Input placeholder="Número do pedido" value={pedido} onChange={(e) => setPedido(e.target.value)} /></div>
            <div className="space-y-2"><Label>Cliente *</Label><Input placeholder="Nome do cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Produto *</Label><Input placeholder="Nome do produto" value={produto} onChange={(e) => setProduto(e.target.value)} /></div>
            <div className="space-y-2"><Label>SKU</Label><Input placeholder="SKU-001" value={sku} onChange={(e) => setSku(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Quantidade *</Label><Input type="number" placeholder="0" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} /></div>
            <div className="space-y-2"><Label>Fornecedor</Label><Input placeholder="Nome do fornecedor" value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} /></div>
          </div>
          <div className="space-y-2">
            <Label>Motivo *</Label>
            <Select value={motivo} onValueChange={(v) => setMotivo(v as MotivoTD)}>
              <SelectTrigger><SelectValue placeholder="Selecione o motivo" /></SelectTrigger>
              <SelectContent>{motivosDefeito.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Descrição do Problema</Label>
            <Textarea placeholder="Descreva o problema em detalhes..." value={descricaoProblema} onChange={(e) => setDescricaoProblema(e.target.value)} rows={3} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !pedido || !cliente || !produto || !quantidade}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}Registrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
