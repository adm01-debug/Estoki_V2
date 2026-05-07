import { useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { FileWarning, Eye, Gavel, Plus } from 'lucide-react';
import { useOcorrenciasPerda } from '@/hooks/useGovernanca';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { statusColor, statusLabel } from './GovernancaHelpers';

export const OcorrenciasTab = memo(function OcorrenciasTab() {
  const { ocorrencias, criarOcorrencia, atualizarOcorrencia, stats } = useOcorrenciasPerda();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tipo: 'perda', quantidade: 1, zona_detectada: '', valor_prejuizo: 0 });
  const [, setDetailId] = useState<string | null>(null);
  const [parecer, setParecer] = useState('');
  const [acao, setAcao] = useState('');

  const handleSubmit = () => {
    criarOcorrencia.mutate({
      tipo: form.tipo,
      quantidade: form.quantidade,
      zona_detectada: form.zona_detectada || undefined,
      valor_prejuizo: form.valor_prejuizo || undefined,
    });
    setOpen(false);
    setForm({ tipo: 'perda', quantidade: 1, zona_detectada: '', valor_prejuizo: 0 });
  };

  const s = stats.data;

  return (
    <div className="space-y-4">
      {s && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{s.abertas}</p>
            <p className="text-xs text-muted-foreground">Abertas</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{s.investigacao}</p>
            <p className="text-xs text-muted-foreground">Em Investigação</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{s.encerradas}</p>
            <p className="text-xs text-muted-foreground">Encerradas</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">R$ {(s.prejuizoTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-muted-foreground">Prejuízo Total</p>
          </CardContent></Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Ocorrências de Perda</h3>
          <p className="text-sm text-muted-foreground">Registro formal com investigação e parecer.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive"><Plus className="h-4 w-4 mr-2" />Registrar Ocorrência</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Ocorrência de Perda</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Select value={form.tipo} onValueChange={v => setForm(f => ({ ...f, tipo: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="perda">Perda</SelectItem>
                  <SelectItem value="avaria">Avaria</SelectItem>
                  <SelectItem value="extravio">Extravio</SelectItem>
                  <SelectItem value="furto">Furto Suspeito</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.zona_detectada} onValueChange={v => setForm(f => ({ ...f, zona_detectada: v }))}>
                <SelectTrigger><SelectValue placeholder="Zona onde detectou" /></SelectTrigger>
                <SelectContent>
                  {['Recebimento', 'Triagem', 'PP1', 'PP2', 'PP3', 'Expedição', 'BOX'].map(z => (
                    <SelectItem key={z} value={z}>{z}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="number" min={1} placeholder="Quantidade" value={form.quantidade} onChange={e => setForm(f => ({ ...f, quantidade: Number(e.target.value) }))} />
              <Input type="number" min={0} step="0.01" placeholder="Valor do prejuízo (R$)" value={form.valor_prejuizo} onChange={e => setForm(f => ({ ...f, valor_prejuizo: Number(e.target.value) }))} />
              <Button className="w-full" variant="destructive" onClick={handleSubmit} disabled={criarOcorrencia.isPending}>
                Registrar Ocorrência
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {ocorrencias.isLoading && <p className="text-muted-foreground text-sm">Carregando...</p>}
        {(ocorrencias.data || []).map((oc: any) => (
          <Card key={oc.id} className="border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileWarning className="h-5 w-5 text-destructive" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm">{oc.codigo}</span>
                      <Badge variant="outline" className={statusColor[oc.status] || ''}>{statusLabel[oc.status] || oc.status}</Badge>
                      <Badge variant="outline">{oc.tipo}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Zona: {oc.zona_detectada || '—'} • Qtd: {oc.quantidade}
                      {oc.valor_prejuizo ? ` • R$ ${Number(oc.valor_prejuizo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''}
                      {' • '}{formatDistanceToNow(new Date(oc.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {oc.status === 'aberto' && (
                    <Button size="sm" variant="outline" onClick={() => atualizarOcorrencia.mutate({ id: oc.id, status: 'investigacao' })}>
                      <Eye className="h-4 w-4 mr-1" />Investigar
                    </Button>
                  )}
                  {oc.status === 'investigacao' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setDetailId(oc.id)}>
                          <Gavel className="h-4 w-4 mr-1" />Parecer
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Emitir Parecer — {oc.codigo}</DialogTitle></DialogHeader>
                        <div className="space-y-3">
                          <Textarea placeholder="Parecer da investigação..." value={parecer} onChange={e => setParecer(e.target.value)} />
                          <Textarea placeholder="Ação corretiva recomendada..." value={acao} onChange={e => setAcao(e.target.value)} />
                          <Button className="w-full" onClick={() => {
                            atualizarOcorrencia.mutate({ id: oc.id, status: 'encerrado', parecer, acao_corretiva: acao });
                            setParecer('');
                            setAcao('');
                          }}>
                            Encerrar com Parecer
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
              {oc.parecer && (
                <div className="mt-3 p-3 bg-muted rounded-md text-sm">
                  <p className="font-medium mb-1">Parecer:</p>
                  <p className="text-muted-foreground">{oc.parecer}</p>
                  {oc.acao_corretiva && (
                    <>
                      <p className="font-medium mt-2 mb-1">Ação Corretiva:</p>
                      <p className="text-muted-foreground">{oc.acao_corretiva}</p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {!ocorrencias.isLoading && (ocorrencias.data || []).length === 0 && (
          <p className="text-center text-muted-foreground py-8">Nenhuma ocorrência registrada</p>
        )}
      </div>
    </div>
  );
});
