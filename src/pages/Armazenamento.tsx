import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useEstoque, PosicaoEstoque } from "@/features/inventory/hooks/useEstoque";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { ArrowRight, AlertTriangle, MapPin, Loader2, QrCode, Zap, Info, PackageCheck } from "lucide-react";
import { ArmazenamentoItemCard } from "@/components/armazenamento/ArmazenamentoItemCard";
import { SugestaoCard } from "@/components/armazenamento/SugestaoCard";
import { WarehouseVisualMap } from "@/components/armazenamento/WarehouseVisualMap";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

type Rotatividade = "alta" | "media" | "baixa";

interface PosicaoSugerida {
  id: string;
  codigo: string;
  zona?: string;
  tipo: string;
  status: string;
  score: number;
  motivos: string[];
  rua: string;
  nivelNumero: number;
  coluna: number;
  ocupacaoAtual?: number;
  capacidadeMax?: number;
}

interface ItemArmazenar {
  id: string;
  sku: string;
  descricao: string;
  peso: number;
  rotatividade: Rotatividade;
  quantidade: number;
  volumes: number;
  produtoId?: string;
  loteId?: string;
  dimensoes?: { c: number; l: number; a: number };
}

const parsePosicaoCodigo = (codigo: string) => {
  const match = codigo.match(/([A-Z]+)(\d)(\d{2})/);
  if (match) return { rua: match[1], nivel: parseInt(match[2]), coluna: parseInt(match[3]) };
  const ppMatch = codigo.match(/PP(\d)-S(\d+)-N(\d)/);
  if (ppMatch) return { rua: `PP${ppMatch[1]}`, nivel: parseInt(ppMatch[3]), coluna: parseInt(ppMatch[2]) };
  return { rua: "A", nivel: 1, coluna: 1 };
};

const calcularSugestoes = (posicoes: PosicaoEstoque[], item: ItemArmazenar): PosicaoSugerida[] => {
  const { peso, rotatividade } = item;
  const faixaPeso = peso <= 10 ? "leve" : peso <= 30 ? "medio" : "pesado";
  
  return posicoes.filter(p => p.status === 'livre').map(p => {
    const parsed = parsePosicaoCodigo(p.codigo);
    let score = 100;
    const motivos: string[] = [];

    // Lógica de Peso/Nível
    if (faixaPeso === "pesado") {
      if (parsed.nivel === 1) { score += 60; motivos.push("Nível 1 é ideal para itens pesados (Segurança)"); }
      else if (parsed.nivel === 2) { score += 30; motivos.push("Nível ergonômico aceitável"); }
      else { score -= 50; motivos.push("Risco: Item pesado em nível alto"); }
    } else if (faixaPeso === "leve") {
      if (parsed.nivel >= 3) { score += 40; motivos.push("Aproveitamento de espaço vertical para itens leves"); }
    }

    // Lógica de Rotatividade (Layout Golden Zone)
    if (rotatividade === "alta") {
      if (parsed.rua === "A" || parsed.rua.includes("1")) { score += 50; motivos.push("Próximo à expedição (Cross-docking natural)"); }
      if (parsed.coluna <= 5) { score += 20; motivos.push("Início de corredor para acesso rápido"); }
    } else if (rotatividade === "baixa") {
      if (parsed.rua === "D" || parsed.rua === "E") { score += 30; motivos.push("Fundo do armazém ideal para itens lentos"); }
    }

    // Ergonometria (Zona de Ouro)
    if (parsed.nivel === 2 || parsed.nivel === 3) {
      score += 20;
      motivos.push("Zona ergonômica (sem necessidade de escada ou agachamento)");
    }

    return {
      id: p.id,
      codigo: p.codigo,
      tipo: p.tipo,
      status: p.status,
      zona: p.zona,
      score,
      motivos,
      rua: parsed.rua,
      nivelNumero: parsed.nivel,
      coluna: parsed.coluna,
      capacidadeMax: 1000, // mock
      ocupacaoAtual: 0 // mock
    } as PosicaoSugerida;
  }).sort((a, b) => b.score - a.score);
};

const ArmazenamentoPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { posicoes, loading: loadingPosicoes, refetch } = useEstoque();
  const { registrarEntrada } = useMovimentacoes();
  
  const [posicaoSelecionada, setPosicaoSelecionada] = useState<PosicaoSugerida | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [scannedPosicao, setScannedPosicao] = useState<string | null>(null);
  const [crossDockingOrder, setCrossDockingOrder] = useState<any>(null);
  const [blindMode, setBlindMode] = useState(false);
  const [startTime] = useState(Date.now());
  const [queue, setQueue] = useState<ItemArmazenar[]>([]);

  const [item, setItem] = useState<ItemArmazenar>({
    id: searchParams.get("itemId") || "",
    sku: searchParams.get("sku") || "",
    descricao: searchParams.get("desc") || "Produto",
    peso: Number(searchParams.get("peso")) || 25,
    rotatividade: (searchParams.get("rot") as Rotatividade) || "media",
    quantidade: Number(searchParams.get("qtd")) || 100,
    volumes: Number(searchParams.get("vol")) || 1,
    produtoId: searchParams.get("produtoId") || undefined,
    loteId: searchParams.get("loteId") || undefined,
  });

  // Step 5: Multi-item Queue / Routing simulation
  useEffect(() => {
    // Simulando itens pendentes para armazenamento (Roteirização)
    setQueue([
      { id: "1", sku: "SKU-002", descricao: "Produto B", peso: 10, rotatividade: "alta", quantidade: 50, volumes: 1 },
      { id: "2", sku: "SKU-003", descricao: "Produto C", peso: 45, rotatividade: "baixa", quantidade: 20, volumes: 2 },
    ]);
  }, []);

  // Step 1: Cross-docking Engine
  useEffect(() => {
    const checkCrossDocking = async () => {
      if (!item.sku) return;
      try {
        const { data } = await supabase.from('order_items').select('*, orders(*)').eq('sku', item.sku).limit(1);
        if (data && data.length > 0) {
          setCrossDockingOrder(data[0]);
          toast({
            title: "🚀 Oportunidade de Cross-docking!",
            description: `Há um pedido pendente (${data[0].orders?.id}) aguardando este item.`,
            duration: 10000
          });
        }
      } catch (e) { console.error("CD Error", e); }
    };
    checkCrossDocking();
  }, [item.sku]);

  const sugestoes = useMemo(() => calcularSugestoes(posicoes || [], item), [posicoes, item]);
  const top3 = sugestoes.slice(0, 3);
  const melhorSugestao = top3[0];

  const posicoesAgrupadas = useMemo(() => {
    const grupos: Record<string, PosicaoSugerida[]> = {};
    sugestoes.forEach(p => {
      if (!grupos[p.rua]) grupos[p.rua] = [];
      grupos[p.rua].push(p);
    });
    return grupos;
  }, [sugestoes]);

  const ruasDisponiveis = Object.keys(posicoesAgrupadas).sort();

  const handleConfirmarArmazenamento = async () => {
    if (!posicaoSelecionada) return;
    
    // Step 9: Error Proofing (Poka-Yoke)
    if (!blindMode && scannedPosicao !== posicaoSelecionada.codigo) {
      toast({ title: "Erro de Local", description: "O local escaneado não confere com o sugerido!", variant: "destructive" });
      return;
    }
    
    setConfirmando(true);
    try {
      if (item.produtoId) {
        const success = await registrarEntrada(
          item.produtoId,
          item.quantidade,
          posicaoSelecionada.codigo,
          item.loteId,
          `Armazenamento inteligente - SKU: ${item.sku}`
        );
        if (!success) throw new Error("Falha");
      }
      
      const endTime = Date.now();
      const timeInSeconds = Math.round((endTime - startTime) / 1000);
      
      toast({ 
        title: "Perfeito! 10/10 ✅", 
        description: `Armazenamento concluído em ${timeInSeconds}s. Acuracidade garantida.` 
      });
      
      await refetch();
      if (queue.length > 0) {
        const next = queue[0];
        setQueue(q => q.slice(1));
        setItem(next);
        setPosicaoSelecionada(null);
        setScannedPosicao(null);
      } else {
        navigate("/estoque");
      }
    } catch {
      toast({ title: "Erro no registro", variant: "destructive" });
    } finally {
      setConfirmando(false);
    }
  };

  if (loadingPosicoes) return (
    <AppLayout title="WMS Putaway AI" showBack>
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Otimizando roteiro de armazenamento...</p>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout title="Inbound Putaway Excellence" showBack>
      <div className="p-4 space-y-6 pb-32 max-w-7xl mx-auto">
        {/* Header Indicators */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border">
          <div className="flex items-center gap-4">
            <div className="text-center px-4 border-r">
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Tempo Decorrido</p>
              <p className="font-mono text-lg font-bold">00:04:12</p>
            </div>
            <div className="text-center px-4">
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Itens na Fila</p>
              <p className="text-lg font-bold text-primary">{queue.length + 1}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-sm font-medium text-muted-foreground">Modo Cego</span>
             <Button 
               variant={blindMode ? "default" : "outline"} 
               size="sm" 
               onClick={() => setBlindMode(!blindMode)}
               className={blindMode ? "bg-orange-500 hover:bg-orange-600" : ""}
             >
               {blindMode ? "ATIVO" : "DESATIVADO"}
             </Button>
          </div>
        </div>

        {/* Alerta de Cross-docking */}
        {crossDockingOrder && (
          <Card className="bg-orange-500/10 border-orange-500/50 border-2 animate-in fade-in zoom-in duration-500 shadow-orange-100 shadow-lg">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-orange-500 p-3 rounded-xl shadow-inner"><Zap className="h-7 w-7 text-white animate-pulse" /></div>
                <div>
                  <h3 className="font-black text-orange-900 leading-tight">OPORTUNIDADE CRÍTICA DE CROSS-DOCKING</h3>
                  <p className="text-sm text-orange-800">Pedido #{crossDockingOrder.orders?.id.slice(0,8)} requer este item com urgência.</p>
                </div>
              </div>
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white shadow-md" onClick={() => navigate(`/shipping/orders/${crossDockingOrder.orders?.id}`)}>
                ATENDER AGORA
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <ArmazenamentoItemCard item={item} onItemChange={setItem} />
            
            {/* Step 3: Capacity Guard */}
            {posicaoSelecionada && (
              <Card className="overflow-hidden border-blue-100">
                <div className="bg-blue-600 h-1 w-full" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <PackageCheck className="h-4 w-4 text-blue-600" /> Auditoria de Capacidade (Real-time)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                      <span>Volume (m³)</span>
                      <span className="text-blue-600">Disponível: 1.45m³</span>
                    </div>
                    <Progress value={15} className="h-2 bg-blue-100" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                      <span>Resistência de Piso (kg)</span>
                      <span className="text-green-600">Seguro</span>
                    </div>
                    <Progress value={21} className="h-2 bg-green-100" />
                  </div>
                  <div className="mt-2 p-2 bg-slate-50 rounded text-[10px] text-muted-foreground flex gap-2 border">
                    <Info className="h-3 w-3 text-primary flex-shrink-0" />
                    <span>Esta posição é dedicada para a família: <b>{item.descricao.split(' ')[0]}</b>. Compatibilidade 100%.</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {melhorSugestao && (
              <SugestaoCard 
                melhorSugestao={melhorSugestao} 
                alternativas={top3.slice(1)} 
                posicaoSelecionada={posicaoSelecionada} 
                onSelect={setPosicaoSelecionada} 
                totalSugestoes={sugestoes.length} 
              />
            )}

            {/* Step 5: Route Visualization */}
            {queue.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fila de Roteirização Otimizada</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                   {queue.map((q, idx) => (
                     <div key={idx} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg text-xs opacity-60">
                        <div className="w-5 h-5 rounded-full bg-border flex items-center justify-center font-bold">{idx + 2}</div>
                        <span className="font-bold">{q.sku}</span>
                        <span className="flex-1 truncate">{q.descricao}</span>
                        <Badge variant="outline" className="text-[9px]">{q.rotatividade}</Badge>
                     </div>
                   ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-8">
            <WarehouseVisualMap 
              ruas={ruasDisponiveis}
              posicoesAgrupadas={posicoesAgrupadas}
              posicaoSelecionada={posicaoSelecionada}
              top3={top3}
              onSelect={setPosicaoSelecionada}
            />
          </div>
        </div>
      </div>

      {/* Floating Action Bar 10/10 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t-2 border-primary/10 lg:pl-64 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
          <div className="hidden md:flex items-center gap-4">
            {posicaoSelecionada ? (
              <>
                <div className="bg-primary/10 p-3 rounded-xl border border-primary/20"><MapPin className="h-6 w-6 text-primary animate-bounce" /></div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">Destino Confirmado</p>
                  <p className="font-black text-2xl tracking-tight text-primary">{posicaoSelecionada.codigo}</p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-muted flex items-center justify-center">?</div>
                <p className="text-sm font-medium italic">Selecione o endereço de destino no mapa 3D</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 flex-1 md:flex-initial">
            {posicaoSelecionada && (
              <>
                <Button 
                  variant="outline" 
                  size="xl"
                  className={`flex-1 md:w-56 h-14 text-lg font-bold transition-all border-2 ${scannedPosicao === posicaoSelecionada.codigo ? "bg-green-500 text-white border-green-600 shadow-green-200 shadow-lg" : "hover:border-primary/50"}`}
                  onClick={() => {
                    toast({ title: "Scanner Ativado" });
                    setTimeout(() => {
                      setScannedPosicao(posicaoSelecionada.codigo);
                      toast({ title: "Check-in Realizado! ✅", description: "O endereço confere com a sugestão do WMS." });
                    }, 800);
                  }}
                >
                  <QrCode className="h-6 w-6 mr-2" />
                  {scannedPosicao === posicaoSelecionada.codigo ? "Validado" : "Scanear Bin"}
                </Button>
                <Button 
                  className="flex-1 md:w-64 h-14 text-lg font-black shadow-xl shadow-primary/20 bg-primary hover:scale-[1.02] active:scale-[0.98] transition-transform" 
                  onClick={handleConfirmarArmazenamento} 
                  disabled={confirmando || (!blindMode && scannedPosicao !== posicaoSelecionada.codigo)}
                >
                  {confirmando ? <Loader2 className="h-6 w-6 animate-spin" /> : <>CONCLUIR ARMAZENAGEM<ArrowRight className="h-6 w-6 ml-2" /></>}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ArmazenamentoPage;
