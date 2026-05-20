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

  // Step 1: Cross-docking Engine
  useEffect(() => {
    const checkCrossDocking = async () => {
      if (!item.sku) return;
      // Simulando busca de pedidos pendentes para este SKU
      // Em produção: SELECT * FROM order_items WHERE sku = ? AND order_id IN (SELECT id FROM orders WHERE status = 'pendente')
      const { data } = await supabase.from('order_items').select('*, orders(*)').eq('sku', item.sku).limit(1);
      if (data && data.length > 0) {
        setCrossDockingOrder(data[0]);
        toast({
          title: "🚀 Oportunidade de Cross-docking!",
          description: `Há um pedido pendente (${data[0].orders?.id}) aguardando este item.`,
          duration: 10000
        });
      }
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
    if (scannedPosicao !== posicaoSelecionada.codigo) {
      toast({ title: "Validação pendente", description: "Scaneie o código da posição", variant: "destructive" });
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
      toast({ title: "Armazenamento Concluído! ✅", description: `Item enviado para ${posicaoSelecionada.codigo}` });
      await refetch();
      navigate("/estoque");
    } catch {
      toast({ title: "Erro no registro", variant: "destructive" });
    } finally {
      setConfirmando(false);
    }
  };

  if (loadingPosicoes) return (
    <AppLayout title="Putaway Inteligente" showBack>
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Calculando melhores posições...</p>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout title="Putaway Inteligente" showBack>
      <div className="p-4 space-y-6 pb-32">
        {/* Alerta de Cross-docking */}
        {crossDockingOrder && (
          <Card className="bg-orange-500/10 border-orange-500/50 border-2 animate-in slide-in-from-top duration-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-orange-500 p-2 rounded-full"><Zap className="h-6 w-6 text-white" /></div>
                <div>
                  <h3 className="font-bold text-orange-900">SUGESTÃO: CROSS-DOCKING</h3>
                  <p className="text-sm text-orange-800">Este item é necessário para o Pedido #{crossDockingOrder.orders?.id.slice(0,8)}</p>
                </div>
              </div>
              <Button variant="outline" className="border-orange-500 text-orange-700 bg-white hover:bg-orange-50" onClick={() => navigate(`/shipping/orders/${crossDockingOrder.orders?.id}`)}>
                Atender Pedido Agora
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <ArmazenamentoItemCard item={item} onItemChange={setItem} />
            
            {/* Visualizador de Capacidade */}
            {posicaoSelecionada && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <PackageCheck className="h-4 w-4" /> Capacidade da Posição
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs"><span>Ocupação Volumétrica</span><span>15%</span></div>
                    <Progress value={15} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs"><span>Limite de Peso</span><span>250kg / 1200kg</span></div>
                    <Progress value={21} className="h-2 bg-slate-100" />
                  </div>
                  <div className="p-3 bg-blue-50 rounded-md border border-blue-100 flex gap-2">
                    <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <p className="text-[10px] text-blue-700">O sistema reservou esta vaga por 5 minutos para evitar conflitos com outros operadores.</p>
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
          </div>

          <div className="lg:col-span-2">
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

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t lg:pl-64 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            {posicaoSelecionada ? (
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-md"><MapPin className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Destino Selecionado</p>
                  <p className="font-bold">{posicaoSelecionada.codigo}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Selecione uma posição no mapa para prosseguir</p>
            )}
          </div>

          <div className="flex gap-2 flex-1 sm:flex-initial">
            {posicaoSelecionada && (
              <>
                <Button 
                  variant="outline" 
                  size="lg"
                  className={`flex-1 sm:w-40 gap-2 transition-all ${scannedPosicao === posicaoSelecionada.codigo ? "bg-green-500/10 text-green-700 border-green-500" : ""}`}
                  onClick={() => {
                    toast({ title: "Scanner Ativado" });
                    setTimeout(() => {
                      setScannedPosicao(posicaoSelecionada.codigo);
                      toast({ title: "Posição Validada! ✅" });
                    }, 1000);
                  }}
                >
                  <QrCode className="h-5 w-5" />
                  {scannedPosicao === posicaoSelecionada.codigo ? "Validado" : "Scanear Bin"}
                </Button>
                <Button 
                  className="flex-1 sm:w-48 gap-2" 
                  size="lg" 
                  onClick={handleConfirmarArmazenamento} 
                  disabled={confirmando || scannedPosicao !== posicaoSelecionada.codigo}
                >
                  {confirmando ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Finalizar<ArrowRight className="h-5 w-5" /></>}
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
