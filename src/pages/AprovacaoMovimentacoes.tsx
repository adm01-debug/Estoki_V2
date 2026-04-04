import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Clock, ShieldCheck, AlertTriangle, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Aprovacao {
  id: string;
  tipo: string;
  quantidade: number;
  motivo: string | null;
  solicitante_id: string;
  aprovador_id: string | null;
  status: string;
  data_solicitacao: string;
  data_decisao: string | null;
  observacao_aprovador: string | null;
  produto_id: string | null;
}

export default function AprovacaoMovimentacoes() {
  const { user, role } = useAuth();
  const [aprovacoes, setAprovacoes] = useState<Aprovacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [observacao, setObservacao] = useState<Record<string, string>>({});
  const [tab, setTab] = useState('pendente');

  const fetchAprovacoes = async () => {
    const { data } = await supabase.from('aprovacoes_movimentacao').select('*').order('data_solicitacao', { ascending: false });
    setAprovacoes((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAprovacoes(); }, []);

  const handleDecisao = async (id: string, decisao: 'aprovado' | 'rejeitado') => {
    const { error } = await supabase.from('aprovacoes_movimentacao').update({
      status: decisao,
      aprovador_id: user?.id,
      data_decisao: new Date().toISOString(),
      observacao_aprovador: observacao[id] || null,
    } as any).eq('id', id);

    if (error) { toast.error('Erro ao processar'); return; }
    toast.success(decisao === 'aprovado' ? '✅ Movimentação aprovada!' : '❌ Movimentação rejeitada');
    fetchAprovacoes();
  };

  const filtered = aprovacoes.filter(a => a.status === tab);
  const pendentes = aprovacoes.filter(a => a.status === 'pendente').length;
  const aprovadas = aprovacoes.filter(a => a.status === 'aprovado').length;
  const rejeitadas = aprovacoes.filter(a => a.status === 'rejeitado').length;

  const isApprover = role === 'admin' || role === 'supervisor';

  const statusConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
    pendente: { icon: Clock, color: 'text-warning', label: 'Pendente' },
    aprovado: { icon: CheckCircle2, color: 'text-success', label: 'Aprovado' },
    rejeitado: { icon: XCircle, color: 'text-destructive', label: 'Rejeitado' },
  };

  const tipoLabel: Record<string, string> = {
    ajuste: 'Ajuste de Estoque', transferencia: 'Transferência', saida: 'Saída Manual', entrada: 'Entrada Manual',
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">🔐 Aprovação de Movimentações</h1>
          <p className="text-sm text-muted-foreground">Workflow de aprovação para movimentações críticas</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-warning border-warning/30"><Clock className="h-3 w-3 mr-1" />{pendentes} pendentes</Badge>
          <Badge variant="outline" className="text-success border-success/30"><CheckCircle2 className="h-3 w-3 mr-1" />{aprovadas}</Badge>
          <Badge variant="outline" className="text-destructive border-destructive/30"><XCircle className="h-3 w-3 mr-1" />{rejeitadas}</Badge>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pendente">Pendentes ({pendentes})</TabsTrigger>
          <TabsTrigger value="aprovado">Aprovadas ({aprovadas})</TabsTrigger>
          <TabsTrigger value="rejeitado">Rejeitadas ({rejeitadas})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <Card key={i} className="glass-card animate-pulse h-28" />)}</div>
          ) : filtered.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center py-12">
                <ShieldCheck className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">Nenhuma movimentação {tab === 'pendente' ? 'pendente de aprovação' : tab}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((aprov, i) => {
                const cfg = statusConfig[aprov.status] || statusConfig.pendente;
                return (
                  <motion.div key={aprov.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="glass-card">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                              <span className="text-sm font-semibold">{tipoLabel[aprov.tipo] || aprov.tipo}</span>
                              <Badge variant="outline" className={cfg.color}>{cfg.label}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Package className="h-3 w-3" />Qtd: {aprov.quantidade}</span>
                              <span>{new Date(aprov.data_solicitacao).toLocaleString('pt-BR')}</span>
                            </div>
                            {aprov.motivo && <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">{aprov.motivo}</p>}
                            {aprov.observacao_aprovador && (
                              <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded border-l-2 border-primary">
                                <strong>Observação:</strong> {aprov.observacao_aprovador}
                              </p>
                            )}
                          </div>

                          {aprov.status === 'pendente' && isApprover && (
                            <div className="flex flex-col gap-2 min-w-[200px]">
                              <Textarea
                                placeholder="Observação (opcional)"
                                className="text-xs h-16"
                                value={observacao[aprov.id] || ''}
                                onChange={e => setObservacao(o => ({ ...o, [aprov.id]: e.target.value }))}
                              />
                              <div className="flex gap-2">
                                <Button size="sm" className="flex-1" onClick={() => handleDecisao(aprov.id, 'aprovado')}>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />Aprovar
                                </Button>
                                <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleDecisao(aprov.id, 'rejeitado')}>
                                  <XCircle className="h-3 w-3 mr-1" />Rejeitar
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
