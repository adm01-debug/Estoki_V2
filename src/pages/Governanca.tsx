import { useState, memo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Shield,
  Link2,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowRight,
  FileWarning,
  Eye,
  Gavel,
} from 'lucide-react';
import { useCustodiaTransferencias, useCheckpointsZona, useOcorrenciasPerda } from '@/hooks/useGovernanca';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ── Status helpers ──
const statusColor: Record<string, string> = {
  pendente: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30',
  confirmado: 'bg-green-500/15 text-green-700 border-green-500/30',
  rejeitado: 'bg-destructive/15 text-destructive border-destructive/30',
  aberto: 'bg-red-500/15 text-red-700 border-red-500/30',
  investigacao: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
  parecer: 'bg-purple-500/15 text-purple-700 border-purple-500/30',
  encerrado: 'bg-muted text-muted-foreground border-border',
};

const statusLabel: Record<string, string> = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  rejeitado: 'Rejeitado',
  aberto: 'Aberto',
  investigacao: 'Em Investigação',
  parecer: 'Parecer Emitido',
  encerrado: 'Encerrado',
};

// ── Tab: Cadeia de Custódia ──
const CustodiaTab = memo(function CustodiaTab() {
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

// ── Tab: Checkpoints por Zona ──
const CheckpointsTab = memo(function CheckpointsTab() {
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

      {/* Alertas de itens presos */}
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

// ── Tab: Ocorrências de Perda ──
const OcorrenciasTab = memo(function OcorrenciasTab() {
  const { ocorrencias, criarOcorrencia, atualizarOcorrencia, stats } = useOcorrenciasPerda();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tipo: 'perda', quantidade: 1, zona_detectada: '', valor_prejuizo: 0 });
  const [detailId, setDetailId] = useState<string | null>(null);
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
      {/* KPI cards */}
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

// ── Main Page ──
export default function Governanca() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" />
          Governança & Responsabilização
        </h1>
        <p className="text-muted-foreground mt-1">
          Cadeia de custódia, checkpoints obrigatórios e investigação de perdas — zero margem para "ninguém sabe onde está".
        </p>
      </div>

      <Tabs defaultValue="custodia" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="custodia" className="gap-2">
            <Link2 className="h-4 w-4" />
            <span className="hidden sm:inline">Cadeia de Custódia</span>
            <span className="sm:hidden">Custódia</span>
          </TabsTrigger>
          <TabsTrigger value="checkpoints" className="gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Checkpoints Zona</span>
            <span className="sm:hidden">Checkpoints</span>
          </TabsTrigger>
          <TabsTrigger value="ocorrencias" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Ocorrências</span>
            <span className="sm:hidden">Ocorrências</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="custodia"><CustodiaTab /></TabsContent>
        <TabsContent value="checkpoints"><CheckpointsTab /></TabsContent>
        <TabsContent value="ocorrencias"><OcorrenciasTab /></TabsContent>
      </Tabs>
    </div>
  );
}
