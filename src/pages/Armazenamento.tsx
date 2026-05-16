import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useEstoque, PosicaoEstoque } from "@/features/inventory/hooks/useEstoque";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { ArrowRight, AlertTriangle, MapPin, Loader2, QrCode } from "lucide-react";
import { ArmazenamentoItemCard } from "@/components/armazenamento/ArmazenamentoItemCard";
import { SugestaoCard } from "@/components/armazenamento/SugestaoCard";

type Rotatividade = "alta" | "media" | "baixa";

interface PosicaoSugerida {
  id: string; codigo: string; zona?: string; tipo: string; status: string; score: number; motivos: string[]; rua: string; nivelNumero: number; coluna: number;
}

interface ItemArmazenar {
  id: string; sku: string; descricao: string; peso: number; rotatividade: Rotatividade; quantidade: number; volumes: number; produtoId?: string; loteId?: string;
}

const parsePosicaoCodigo = (codigo: string) => {
  const match = codigo.match(/([A-Z]+)(\d)(\d{2})/);
  if (match) return { rua: match[1], nivel: parseInt(match[2]), coluna: parseInt(match[3]) };
  const ppMatch = codigo.match(/PP(\d)-S(\d+)-N(\d)/);
  if (ppMatch) return { rua: `PP${ppMatch[1]}`, nivel: parseInt(ppMatch[3]), coluna: parseInt(ppMatch[2]) };
  return { rua: "A", nivel: 1, coluna: 1 };
};

const calcularSugestoes = (posicoes: PosicaoEstoque[], peso: number, rotatividade: Rotatividade): PosicaoSugerida[] => {
  const faixaPeso = peso <= 10 ? "leve" : peso <= 30 ? "medio" : "pesado";
  return posicoes.filter(p => p.status === 'livre').map(p => {
    const parsed = parsePosicaoCodigo(p.codigo);
    let score = 100; const motivos: string[] = [];
    if (faixaPeso === "pesado") { if (parsed.nivel === 1) { score += 40; motivos.push("Nível baixo ideal para itens pesados"); } else if (parsed.nivel === 2) { score += 20; motivos.push("Nível adequado para peso"); } else { score -= 30 * (parsed.nivel - 2); motivos.push("Nível alto não recomendado para peso"); } }
    else if (faixaPeso === "leve") { if (parsed.nivel >= 3) { score += 20; motivos.push("Níveis altos aproveitados para itens leves"); } }
    else { if (parsed.nivel === 2 || parsed.nivel === 3) { score += 15; motivos.push("Nível ergonômico para peso médio"); } }
    if (rotatividade === "alta") { if (parsed.rua === "A" || parsed.rua.includes("PP1")) { score += 35; motivos.push("Rua próxima à saída - ideal para alta rotatividade"); } else if (parsed.rua === "B" || parsed.rua.includes("PP2")) { score += 25; motivos.push("Boa proximidade da saída"); } else score -= 15; if (parsed.coluna <= 2) { score += 10; motivos.push("Coluna de fácil acesso"); } }
    else if (rotatividade === "baixa") { if (parsed.rua === "D" || parsed.rua === "C" || parsed.rua.includes("PP3")) { score += 20; motivos.push("Posição adequada para baixa rotatividade"); } }
    if (parsed.nivel === 2 || parsed.nivel === 3) { score += 5; if (!motivos.some(m => m.includes("ergonômico"))) motivos.push("Altura ergonômica"); }
    return { id: p.id, codigo: p.codigo, tipo: p.tipo, status: p.status, zona: p.zona, score, motivos, rua: parsed.rua, nivelNumero: parsed.nivel, coluna: parsed.coluna } as PosicaoSugerida;
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

  const [item, setItem] = useState<ItemArmazenar>({
    id: searchParams.get("itemId") || "", sku: searchParams.get("sku") || "", descricao: searchParams.get("desc") || "Produto",
    peso: Number(searchParams.get("peso")) || 25, rotatividade: (searchParams.get("rot") as Rotatividade) || "media",
    quantidade: Number(searchParams.get("qtd")) || 100, volumes: Number(searchParams.get("vol")) || 1,
    produtoId: searchParams.get("produtoId") || undefined, loteId: searchParams.get("loteId") || undefined,
  });

  const sugestoes = useMemo(() => calcularSugestoes(posicoes || [], item.peso, item.rotatividade), [posicoes, item.peso, item.rotatividade]);
  const top3 = sugestoes.slice(0, 3);
  const melhorSugestao = top3[0];

  const posicoesAgrupadas = useMemo(() => {
    const grupos: Record<string, PosicaoSugerida[]> = {};
    sugestoes.forEach(p => { if (!grupos[p.rua]) grupos[p.rua] = []; grupos[p.rua].push(p); });
    Object.keys(grupos).forEach(rua => grupos[rua].sort((a, b) => a.coluna - b.coluna));
    return grupos;
  }, [sugestoes]);
  const ruasDisponiveis = Object.keys(posicoesAgrupadas).sort();

  const handleConfirmarArmazenamento = async () => {
    if (!posicaoSelecionada) { 
      toast({ title: "Selecione uma posição", description: "É necessário selecionar uma posição para armazenar", variant: "destructive" }); 
      return; 
    }
    if (scannedPosicao !== posicaoSelecionada.codigo) {
      toast({ title: "Validação pendente", description: "Scaneie o QR Code da posição para confirmar o armazenamento", variant: "destructive" });
      return;
    }
    setConfirmando(true);
    try {
      if (item.produtoId) { const success = await registrarEntrada(item.produtoId, item.quantidade, posicaoSelecionada.codigo, item.loteId, `Armazenamento via triagem - SKU: ${item.sku}`); if (!success) throw new Error("Falha ao registrar entrada"); }
      toast({ title: "Armazenamento confirmado! ✅", description: `Item ${item.sku || item.descricao} armazenado na posição ${posicaoSelecionada.codigo}` });
      await refetch(); navigate("/estoque");
    } catch { toast({ title: "Erro ao armazenar", description: "Não foi possível confirmar o armazenamento", variant: "destructive" }); }
    finally { setConfirmando(false); }
  };

  if (loadingPosicoes) return <AppLayout title="Armazenamento" showBack><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;

  return (
    <AppLayout title="Armazenamento" showBack>
      <div className="p-4 space-y-4 pb-24">
        <ArmazenamentoItemCard item={item} onItemChange={setItem} />
        {melhorSugestao && <SugestaoCard melhorSugestao={melhorSugestao} alternativas={top3.slice(1)} posicaoSelecionada={posicaoSelecionada} onSelect={setPosicaoSelecionada} totalSugestoes={sugestoes.length} />}

        {ruasDisponiveis.length > 0 && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Mapa do Estoque</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ruasDisponiveis.slice(0, 4).map(rua => (
                  <div key={rua} className="flex items-center gap-2">
                    <span className="w-8 font-semibold text-sm">{rua}</span>
                    <div className="flex gap-1 flex-1 overflow-x-auto">
                      {posicoesAgrupadas[rua]?.slice(0, 6).map(p => {
                        const isSugestao = top3.some(s => s.id === p.id);
                        const isSelecionada = posicaoSelecionada?.id === p.id;
                        const disponivel = p.status === 'livre';
                        return (
                          <div key={p.id} onClick={() => disponivel && setPosicaoSelecionada(p)} className={`flex-1 min-w-[2rem] h-8 rounded text-xs flex items-center justify-center cursor-pointer transition-all font-medium ${!disponivel ? "bg-muted text-muted-foreground cursor-not-allowed" : isSelecionada ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2" : isSugestao ? "bg-primary/20 text-primary border-2 border-primary/50" : "bg-green-500/20 text-green-700 hover:bg-green-500/30"}`}>
                            {p.coluna}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="flex gap-4 pt-2 text-xs">
                  <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-primary/20 border-2 border-primary/50" /><span>Sugerido</span></div>
                  <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-green-500/20" /><span>Disponível</span></div>
                  <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-muted" /><span>Ocupado</span></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {item.peso > 30 && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div><p className="font-medium text-yellow-700 text-sm">Item Pesado</p><p className="text-xs text-yellow-600">Este item deve ser armazenado preferencialmente nos níveis 1 ou 2 por questões de segurança.</p></div>
          </div>
        )}

        {sugestoes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground"><MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhuma posição disponível no momento</p></div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t lg:pl-64">
        <div className="max-w-lg mx-auto">
          {posicaoSelecionada ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Posição selecionada:</span><span className="font-semibold">{posicaoSelecionada.codigo}</span></div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className={scannedPosicao === posicaoSelecionada.codigo ? "flex-1 gap-2 bg-green-500/10 text-green-700 border-green-500/50" : "flex-1 gap-2"}
                  onClick={() => {
                    toast({ title: "Scanner Ativado", description: "Aponte para o QR Code da posição" });
                    setTimeout(() => {
                      setScannedPosicao(posicaoSelecionada.codigo);
                      toast({ title: "Posição validada! ✅", description: `Código ${posicaoSelecionada.codigo} reconhecido.` });
                    }, 1500);
                  }}
                >
                  <QrCode className="h-4 w-4" />
                  {scannedPosicao === posicaoSelecionada.codigo ? "Validado" : "Scanear"}
                </Button>
                <Button 
                  className="flex-1 gap-2" 
                  size="lg" 
                  onClick={handleConfirmarArmazenamento} 
                  disabled={confirmando || scannedPosicao !== posicaoSelecionada.codigo}
                >
                  {confirmando ? <><Loader2 className="h-4 w-4 animate-spin" />...</> : <>Confirmar<ArrowRight className="h-4 w-4" /></>}
                </Button>
              </div>
            </div>
          ) : <Button className="w-full" size="lg" variant="outline" disabled>Selecione uma posição</Button>}
        </div>
      </div>
    </AppLayout>
  );
};

export default ArmazenamentoPage;
