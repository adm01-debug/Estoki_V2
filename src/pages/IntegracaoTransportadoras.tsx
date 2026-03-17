import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Truck, Search, MapPin, Clock, Package, CheckCircle2, XCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Rastreio {
  codigo: string;
  romaneioId: string | null;
  romaneioCode: string | null;
  status: string;
  eventos: RastreioEvento[];
}

interface RastreioEvento {
  data: string;
  hora: string;
  local: string;
  descricao: string;
  status: string;
}

export default function IntegracaoTransportadoras() {
  const [codigoRastreio, setCodigoRastreio] = useState('');
  const [rastreios, setRastreios] = useState<Rastreio[]>([]);
  const [romaneios, setRomaneios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('rastrear');

  useEffect(() => {
    const fetchRomaneios = async () => {
      const { data } = await supabase.from('romaneios').select('id, codigo, motorista, status, data_saida').in('status', ['em_transito', 'confirmado']).order('data_saida', { ascending: false }).limit(20);
      setRomaneios(data || []);
    };
    fetchRomaneios();
  }, []);

  const simularRastreio = (codigo: string): RastreioEvento[] => {
    const agora = new Date();
    const eventos: RastreioEvento[] = [];
    const statusList = [
      { desc: 'Objeto postado', status: 'postado', horasAtras: 72 },
      { desc: 'Objeto em trânsito - por favor aguarde', status: 'transito', horasAtras: 48 },
      { desc: 'Objeto em trânsito - transferido para unidade de distribuição', status: 'transito', horasAtras: 24 },
      { desc: 'Objeto saiu para entrega ao destinatário', status: 'entrega', horasAtras: 4 },
    ];

    if (Math.random() > 0.3) {
      statusList.push({ desc: 'Objeto entregue ao destinatário', status: 'entregue', horasAtras: 1 });
    }

    statusList.forEach(s => {
      const d = new Date(agora.getTime() - s.horasAtras * 3600000);
      eventos.push({
        data: d.toLocaleDateString('pt-BR'),
        hora: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        local: ['São Paulo/SP', 'Campinas/SP', 'Curitiba/PR', 'Rio de Janeiro/RJ'][Math.floor(Math.random() * 4)],
        descricao: s.desc,
        status: s.status,
      });
    });

    return eventos.reverse();
  };

  const rastrear = async () => {
    if (!codigoRastreio.trim()) { toast.error('Digite o código de rastreio'); return; }
    setLoading(true);

    // Simulação - em produção integraria com API dos Correios/Jadlog/etc
    await new Promise(r => setTimeout(r, 1500));

    const eventos = simularRastreio(codigoRastreio);
    const novoRastreio: Rastreio = {
      codigo: codigoRastreio,
      romaneioId: null,
      romaneioCode: null,
      status: eventos[0]?.status || 'desconhecido',
      eventos,
    };

    setRastreios(prev => [novoRastreio, ...prev.filter(r => r.codigo !== codigoRastreio)]);
    setLoading(false);
    toast.success('Rastreio atualizado!');
  };

  const rastrearRomaneio = async (romaneio: any) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));

    const codigoFake = `BR${romaneio.codigo.replace(/\D/g, '')}${Date.now().toString().slice(-6)}BR`;
    const eventos = simularRastreio(codigoFake);

    const novoRastreio: Rastreio = {
      codigo: codigoFake,
      romaneioId: romaneio.id,
      romaneioCode: romaneio.codigo,
      status: eventos[0]?.status || 'desconhecido',
      eventos,
    };

    setRastreios(prev => [novoRastreio, ...prev]);
    setLoading(false);
    toast.success(`Rastreio do romaneio ${romaneio.codigo} atualizado`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'entregue': return <Badge className="bg-success/20 text-success border-success/30"><CheckCircle2 className="h-3 w-3 mr-1" />Entregue</Badge>;
      case 'entrega': return <Badge className="bg-info/20 text-info border-info/30"><Truck className="h-3 w-3 mr-1" />Saiu p/ Entrega</Badge>;
      case 'transito': return <Badge className="bg-warning/20 text-warning border-warning/30"><RefreshCw className="h-3 w-3 mr-1" />Em Trânsito</Badge>;
      case 'postado': return <Badge className="bg-muted text-muted-foreground"><Package className="h-3 w-3 mr-1" />Postado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">🔗 Integração Transportadoras</h1>
        <p className="text-sm text-muted-foreground">Rastreamento de entregas e atualização automática de status</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="rastrear">Rastrear Código</TabsTrigger>
          <TabsTrigger value="romaneios">Romaneios em Trânsito ({romaneios.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="rastrear" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Input
                  placeholder="Digite o código de rastreio (ex: BR123456789BR)"
                  value={codigoRastreio}
                  onChange={e => setCodigoRastreio(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && rastrear()}
                  className="flex-1"
                />
                <Button onClick={rastrear} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />{loading ? 'Buscando...' : 'Rastrear'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="romaneios" className="mt-4 space-y-3">
          {romaneios.length === 0 ? (
            <Card className="glass-card"><CardContent className="py-12 text-center">
              <Truck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum romaneio em trânsito</p>
            </CardContent></Card>
          ) : romaneios.map((rom, i) => (
            <motion.div key={rom.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{rom.codigo}</p>
                    <p className="text-xs text-muted-foreground">Motorista: {rom.motorista || 'N/D'} | Saída: {rom.data_saida ? new Date(rom.data_saida).toLocaleDateString('pt-BR') : 'N/D'}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => rastrearRomaneio(rom)}>
                    <Search className="h-3 w-3 mr-1" />Rastrear
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Tracking Results */}
      {rastreios.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Resultados</h2>
          {rastreios.map((r, i) => (
            <motion.div key={r.codigo + i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        {r.codigo}
                      </CardTitle>
                      {r.romaneioCode && <p className="text-[10px] text-muted-foreground">Romaneio: {r.romaneioCode}</p>}
                    </div>
                    {getStatusBadge(r.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative pl-6 space-y-4">
                    <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-border" />
                    {r.eventos.map((ev, j) => (
                      <div key={j} className="relative">
                        <div className={`absolute -left-[15px] w-3 h-3 rounded-full border-2 ${j === 0 ? 'bg-primary border-primary' : 'bg-background border-muted-foreground/30'}`} />
                        <div className="text-xs">
                          <p className="font-semibold text-foreground">{ev.descricao}</p>
                          <div className="flex items-center gap-3 text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.local}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ev.data} {ev.hora}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
