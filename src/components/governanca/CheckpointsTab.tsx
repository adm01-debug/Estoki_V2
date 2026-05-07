import { useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, AlertTriangle, Plus } from 'lucide-react';
import { useCheckpointsZona } from '@/hooks/useGovernanca';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const CheckpointsTab = memo(function CheckpointsTab() {
  const { checkpoints, registrarCheckpoint, itensPresos } = useCheckpointsZona();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ zona: '', tipo: 'entrada' as 'entrada' | 'saida', quantidade: 1, observacoes: '' });

  const handleSubmit = () => {
    if (!form.zona) return;
    registrarCheckpoint.mutate(form);
    setOpen(false);
    setForm({ zona: '', tipo: 'entrada', quantidade: 1, observacoes: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Checkpoints Obrigatórios</h3>
          <p className="text-sm text-muted-foreground">Todo produto deve ser bipado ao entrar e sair de cada zona.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Registrar Checkpoint</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Checkpoint de Zona</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Select value={form.zona} onValueChange={v => setForm(f => ({ ...f, zona: v }))}>
                <SelectTrigger><SelectValue placeholder="Zona" /></SelectTrigger>
                <SelectContent>
                  {['Recebimento', 'Triagem', 'PP1', 'PP2', 'PP3', 'Expedição', 'BOX'].map(z => (
                    <SelectItem key={z} value={z}>{z}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={form.tipo} onValueChange={v => setForm(f => ({ ...f, tipo: v as 'entrada' | 'saida' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">📥 Entrada na Zona</SelectItem>
                  <SelectItem value="saida">📤 Saída da Zona</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" min={1} placeholder="Quantidade" value={form.quantidade} onChange={e => setForm(f => ({ ...f, quantidade: Number(e.target.value) }))} />
              <Textarea placeholder="Observações (opcional)" value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} />
              <Button className="w-full" onClick={handleSubmit} disabled={registrarCheckpoint.isPending}>
                Registrar Checkpoint
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {(itensPresos.data || []).length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Itens Presos em Zona ({itensPresos.data?.length})
            </CardTitle>
            <CardDescription>Itens que entraram em uma zona mas não saíram há mais de 4 horas.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {(itensPresos.data || []).slice(0, 5).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between text-sm p-2 rounded bg-background">
                  <span>Zona <strong>{item.zona}</strong></span>
                  <Badge variant="destructive">{item.horas_preso}h preso</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {checkpoints.isLoading && <p className="text-muted-foreground text-sm">Carregando...</p>}
        {(checkpoints.data || []).map((cp: any) => (
          <Card key={cp.id} className="border">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className={`h-5 w-5 ${cp.tipo === 'entrada' ? 'text-green-600' : 'text-blue-600'}`} />
                <div>
                  <span className="font-medium text-sm">
                    {cp.tipo === 'entrada' ? '📥 Entrada' : '📤 Saída'} — Zona {cp.zona}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Qtd: {cp.quantidade} • {formatDistanceToNow(new Date(cp.created_at), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {!checkpoints.isLoading && (checkpoints.data || []).length === 0 && (
          <p className="text-center text-muted-foreground py-8">Nenhum checkpoint registrado</p>
        )}
      </div>
    </div>
  );
});
