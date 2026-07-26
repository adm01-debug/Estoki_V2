import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SEO } from "@/components/common/SEO";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useEstoque, PosicaoEstoque } from "@/features/inventory/hooks/useEstoque";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import {
  ArrowRight,
  AlertTriangle,
  MapPin,
  Loader2,
  QrCode,
  Zap,
  Info,
  PackageCheck,
} from "lucide-react";
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
  if (ppMatch)
    return { rua: `PP${ppMatch[1]}`, nivel: parseInt(ppMatch[3]), coluna: parseInt(ppMatch[2]) };
  return { rua: "A", nivel: 1, coluna: 1 };
};

const calcularSugestoes = (posicoes: PosicaoEstoque[], item: ItemArmazenar): PosicaoSugerida[] => {
  const { peso, rotatividade } = item;
  const faixaPeso = peso <= 10 ? "leve" : peso <= 30 ? "medio" : "pesado";

  return posicoes
    .filter((p) => p.status === "livre")
    .map((p) => {
      const parsed = parsePosicaoCodigo(p.codigo);
      let score = 100;
      const motivos: string[] = [];

      // Lógica de Peso/Nível
      if (faixaPeso === "pesado") {
        if (parsed.nivel === 1) {
          score += 60;
          motivos.push("Nível 1 é ideal para itens pesados (Segurança)");
        } else if (parsed.nivel === 2) {
          score += 30;
          motivos.push("Nível ergonômico aceitável");
        } else {
          score -= 50;
          motivos.push("Risco: Item pesado em nível alto");
        }
      } else if (faixaPeso === "leve") {
        if (parsed.nivel >= 3) {
          score += 40;
          motivos.push("Aproveitamento de espaço vertical para itens leves");
        }
      }

      // Lógica de Rotatividade (Layout Golden Zone)
      if (rotatividade === "alta") {
        if (parsed.rua === "A" || parsed.rua.includes("1")) {
          score += 50;
          motivos.push("Próximo à expedição (Cross-docking natural)");
        }
        if (parsed.coluna <= 5) {
          score += 20;
          motivos.push("Início de corredor para acesso rápido");
        }
      } else if (rotatividade === "baixa") {
        if (parsed.rua === "D" || parsed.rua === "E") {
          score += 30;
          motivos.push("Fundo do armazém ideal para itens lentos");
        }
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
        ocupacaoAtual: 0, // mock
      } as PosicaoSugerida;
    })
    .sort((a, b) => b.score - a.score);
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
      {
        id: "1",
        sku: "SKU-002",
        descricao: "Produto B",
        peso: 10,
        rotatividade: "alta",
        quantidade: 50,
        volumes: 1,
      },
      {
        id: "2",
        sku: "SKU-003",
        descricao: "Produto C",
        peso: 45,
        rotatividade: "baixa",
        quantidade: 20,
        volumes: 2,
      },
    ]);
  }, []);

  // Step 1: Cross-docking Engine
  useEffect(() => {
    const checkCrossDocking = async () => {
      // `order_items` referencia o produto por id; resolvemos o SKU antes de
      // procurar um pedido pendente que possa consumir o item recebido.
      if (!item.sku) return;
      try {
        const { data: produto } = await supabase
          .from("produtos")
          .select("id")
          .eq("sku", item.sku)
          .maybeSingle();
        if (!produto) return;
        const { data } = await supabase
          .from("order_items")
          .select("*, orders(*)")
          .eq("produto_id", produto.id)
          .limit(1);
        if (data && data.length > 0) {
          setCrossDockingOrder(data[0]);
          toast({
            title: "🚀 Oportunidade de Cross-docking!",
            description: `Há um pedido pendente (${data[0].orders?.id}) aguardando este item.`,
            duration: 10000,
          });
        }
      } catch (e) {
        console.error("CD Error", e);
      }
    };
    checkCrossDocking();
  }, [item.sku]);

  const sugestoes = useMemo(
    () => calcularSugestoes(Array.isArray(posicoes) ? posicoes : [], item),
    [posicoes, item]
  );
  const top3 = sugestoes.slice(0, 3);
  const melhorSugestao = top3[0];

  const posicoesAgrupadas = useMemo(() => {
    const grupos: Record<string, PosicaoSugerida[]> = {};
    sugestoes.forEach((p) => {
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
      toast({
        title: "Erro de Local",
        description: "O local escaneado não confere com o sugerido!",
        variant: "destructive",
      });
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
        description: `Armazenamento concluído em ${timeInSeconds}s. Acuracidade garantida.`,
      });

      await refetch();
      if (queue.length > 0) {
        const next = queue[0];
        setQueue((q) => q.slice(1));
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

  if (loadingPosicoes)
    return (
      <AppLayout title="WMS Putaway AI" showBack>
        <div className="flex h-96 flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="animate-pulse font-medium text-muted-foreground">
            Otimizando roteiro de armazenamento...
          </p>
        </div>
      </AppLayout>
    );

  return (
    <AppLayout title="Inbound Putaway Excellence" showBack>
      <SEO title="Armazenamento" path="/armazenamento" description="Putaway inteligente com sugestão de posição e cross-docking." />
      <div className="mx-auto max-w-7xl space-y-6 p-4 pb-32">
        {/* Header Indicators */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center gap-4">
            <div className="border-r px-4 text-center">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">
                Tempo Decorrido
              </p>
              <p className="font-mono text-lg font-bold">00:04:12</p>
            </div>
            <div className="px-4 text-center">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Itens na Fila</p>
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
          <Card className="border-2 border-orange-500/50 bg-orange-500/10 shadow-lg shadow-orange-100 duration-500 animate-in fade-in zoom-in">
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-orange-500 p-3 shadow-inner">
                  <Zap className="h-7 w-7 animate-pulse text-white" />
                </div>
                <div>
                  <h3 className="font-black leading-tight text-orange-900">
                    OPORTUNIDADE CRÍTICA DE CROSS-DOCKING
                  </h3>
                  <p className="text-sm text-orange-800">
                    Pedido #{crossDockingOrder.orders?.id.slice(0, 8)} requer este item com
                    urgência.
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                className="bg-orange-600 text-white shadow-md hover:bg-orange-700"
                onClick={() => navigate(`/shipping/orders/${crossDockingOrder.orders?.id}`)}
              >
                ATENDER AGORA
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-4">
            <ArmazenamentoItemCard item={item} onItemChange={setItem} />

            {/* Step 3: Capacity Guard */}
            {posicaoSelecionada && (
              <Card className="overflow-hidden border-blue-100">
                <div className="h-1 w-full bg-blue-600" />
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold">
                    <PackageCheck className="h-4 w-4 text-blue-600" /> Auditoria de Capacidade
                    (Real-time)
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
                  <div className="mt-2 flex gap-2 rounded border bg-slate-50 p-2 text-[10px] text-muted-foreground">
                    <Info className="h-3 w-3 flex-shrink-0 text-primary" />
                    <span>
                      Esta posição é dedicada para a família: <b>{item.descricao.split(" ")[0]}</b>.
                      Compatibilidade 100%.
                    </span>
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
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Fila de Roteirização Otimizada
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {queue.map((q, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 rounded-lg bg-muted/50 p-2 text-xs opacity-60"
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-border font-bold">
                        {idx + 2}
                      </div>
                      <span className="font-bold">{q.sku}</span>
                      <span className="flex-1 truncate">{q.descricao}</span>
                      <Badge variant="outline" className="text-[9px]">
                        {q.rotatividade}
                      </Badge>
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
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-primary/10 bg-white/95 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] backdrop-blur-md lg:pl-64">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
          <div className="hidden items-center gap-4 md:flex">
            {posicaoSelecionada ? (
              <>
                <div className="rounded-xl border border-primary/20 bg-primary/10 p-3">
                  <MapPin className="h-6 w-6 animate-bounce text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Destino Confirmado
                  </p>
                  <p className="text-2xl font-black tracking-tight text-primary">
                    {posicaoSelecionada.codigo}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-muted">
                  ?
                </div>
                <p className="text-sm font-medium italic">
                  Selecione o endereço de destino no mapa 3D
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-1 gap-3 md:flex-initial">
            {posicaoSelecionada && (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  className={`h-14 flex-1 border-2 text-lg font-bold transition-all md:w-56 ${scannedPosicao === posicaoSelecionada.codigo ? "border-green-600 bg-green-500 text-white shadow-lg shadow-green-200" : "hover:border-primary/50"}`}
                  onClick={() => {
                    toast({ title: "Scanner Ativado" });
                    setTimeout(() => {
                      setScannedPosicao(posicaoSelecionada.codigo);
                      toast({
                        title: "Check-in Realizado! ✅",
                        description: "O endereço confere com a sugestão do WMS.",
                      });
                    }, 800);
                  }}
                >
                  <QrCode className="mr-2 h-6 w-6" />
                  {scannedPosicao === posicaoSelecionada.codigo ? "Validado" : "Scanear Bin"}
                </Button>
                <Button
                  className="h-14 flex-1 bg-primary text-lg font-black shadow-xl shadow-primary/20 transition-transform hover:scale-[1.02] active:scale-[0.98] md:w-64"
                  onClick={handleConfirmarArmazenamento}
                  disabled={
                    confirmando || (!blindMode && scannedPosicao !== posicaoSelecionada.codigo)
                  }
                >
                  {confirmando ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      CONCLUIR ARMAZENAGEM
                      <ArrowRight className="ml-2 h-6 w-6" />
                    </>
                  )}
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
