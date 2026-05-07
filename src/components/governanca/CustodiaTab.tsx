import { useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Link2, ArrowRight, CheckCircle2, Plus } from 'lucide-react';
import { useCustodiaTransferencias } from '@/hooks/useGovernanca';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { statusColor, statusLabel } from './GovernancaHelpers';

export const CustodiaTab = memo(function CustodiaTab() {
  const { transferencias, criarTransferencia, confirmarRecebimento } = useCustodiaTransferencias();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ operador_destino_id: '', zona_origem: '', zona_destino: '', quantidade: 1, motivo: '' });

  const handleSubmit = () => {
    if (!form.operador_destino_id || !form.zona_origem || !form.zona_destino) return;
    criarTransferencia.mutate({
      operador_destino_id: form.operador_destino_id,
      zona_origem: form.zona_origem,
      zona_destino: form.zona_destino,
      quantidade: form.quantidade,
      motivo: form.motivo || undefined,
    });
    setOpen(false);
    setForm({ operador_destino_id: '', zona_origem: '', zona_destino: '', quantidade: 1, motivo: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Cadeia de Custódia</h3>
          <p className="text-sm text-muted-foreground">Toda transferência de material exige assinatura digital de origem e destino.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nova Transferência</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Transferência de Custódia</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="ID do operador destino" value={form.operador_destino_id} onChange={e => setForm(f => ({ ...f, operador_destino_id: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <Select value={form.zona_origem} onValueChange={v => setForm(f => ({ ...f, zona_origem: v }))}>
                  <SelectTrigger><SelectValue placeholder="Zona origem" /></SelectTrigger>
                  <SelectContent>
                    {['Recebimento', 'Triagem', 'PP1', 'PP2', 'PP3', 'Expedição', 'BOX'].map(z => (
                      <SelectItem key={z} value={z}>{z}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={form.zona_destino} onValueChange={v => setForm(f => ({ ...f, zona_destino: v }))}>
                  <SelectTrigger><SelectValue placeholder="Zona destino" /></SelectTrigger>
                  <SelectContent>
                    {['Recebimento', 'Triagem', 'PP1', 'PP2', 'PP3', 'Expedição', 'BOX'].map(z => (
                      <SelectItem key={z} value={z}>{z}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input type="number" min={1} placeholder="Quantidade" value={form.quantidade} onChange={e => setForm(f => ({ ...f, quantidade: Number(e.target.value) }))} />
              <Textarea placeholder="Motivo (opcional)" value={form.motivo} onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))} />
              <Button className="w-full" onClick={handleSubmit} disabled={criarTransferencia.isPending}>
                Registrar com Assinatura Digital
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {transferencias.isLoading && <p className="text-muted-foreground text-sm">Carregando...</p>}
        {(transferencias.data || []).map((t: any) => (
          <Card key={t.id} className="border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link2 className="h-5 w-5 text-primary" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{t.zona_origem}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium text-sm">{t.zona_destino}</span>
                      <Badge variant="outline" className={statusColor[t.status] || ''}>{statusLabel[t.status] || t.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Qtd: {t.quantidade} • {formatDistanceToNow(new Date(t.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <Badge variant="outline" className={t.assinatura_origem ? 'bg-green-500/10 text-green-700' : 'bg-muted text-muted-foreground'}>
                      {t.assinatura_origem ? '✓' : '○'} Origem
                    </Badge>
                    <Badge variant="outline" className={t.assinatura_destino ? 'bg-green-500/10 text-green-700' : 'bg-muted text-muted-foreground'}>
                      {t.assinatura_destino ? '✓' : '○'} Destino
                    </Badge>
                  </div>
                  {t.status === 'pendente' && (
                    <Button size="sm" variant="outline" onClick={() => confirmarRecebimento.mutate(t.id)}>
                      <CheckCircle2 className="h-4 w-4 mr-1" />Confirmar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {!transferencias.isLoading && (transferencias.data || []).length === 0 && (
          <p className="text-center text-muted-foreground py-8">Nenhuma transferência registrada</p>
        )}
      </div>
    </div>
  );
});
