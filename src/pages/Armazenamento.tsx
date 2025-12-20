import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useEstoque, PosicaoEstoque } from "@/hooks/useEstoque";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { 
  Package, 
  MapPin, 
  Weight, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  ArrowRight,
  Info,
  Lightbulb,
  Loader2
} from "lucide-react";

type Rotatividade = "alta" | "media" | "baixa";
type FaixaPeso = "leve" | "medio" | "pesado";

interface PosicaoSugerida extends PosicaoEstoque {
  score: number;
  motivos: string[];
  rua: string;
  nivel: number;
  coluna: number;
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
}

// Função para extrair rua, nível e coluna do código da posição
const parsePosicaoCodigo = (codigo: string): { rua: string; nivel: number; coluna: number } => {
  // Formato esperado: PP1-S01-N1 ou A101 ou similar
  const match = codigo.match(/([A-Z]+)(\d)(\d{2})/);
  if (match) {
    return {
      rua: match[1],
      nivel: parseInt(match[2]),
      coluna: parseInt(match[3])
    };
  }
  
  // Tentar formato PP1-S01-N1
  const ppMatch = codigo.match(/PP(\d)-S(\d+)-N(\d)/);
  if (ppMatch) {
    return {
      rua: `PP${ppMatch[1]}`,
      nivel: parseInt(ppMatch[3]),
      coluna: parseInt(ppMatch[2])
    };
  }
  
  // Default
  return { rua: "A", nivel: 1, coluna: 1 };
};

const calcularSugestoes = (
  posicoes: PosicaoEstoque[], 
  peso: number, 
  rotatividade: Rotatividade
): PosicaoSugerida[] => {
  const faixaPeso: FaixaPeso = peso <= 10 ? "leve" : peso <= 30 ? "medio" : "pesado";
  
  return posicoes
    .filter(p => p.status === 'livre')
    .map(p => {
      const parsed = parsePosicaoCodigo(p.codigo);
      let score = 100;
      const motivos: string[] = [];
      
      // Regra de peso: itens pesados nos níveis baixos
      if (faixaPeso === "pesado") {
        if (parsed.nivel === 1) {
          score += 40;
          motivos.push("Nível baixo ideal para itens pesados");
        } else if (parsed.nivel === 2) {
          score += 20;
          motivos.push("Nível adequado para peso");
        } else {
          score -= 30 * (parsed.nivel - 2);
          motivos.push("Nível alto não recomendado para peso");
        }
      } else if (faixaPeso === "leve") {
        if (parsed.nivel >= 3) {
          score += 20;
          motivos.push("Níveis altos aproveitados para itens leves");
        }
      } else {
        if (parsed.nivel === 2 || parsed.nivel === 3) {
          score += 15;
          motivos.push("Nível ergonômico para peso médio");
        }
      }
      
      // Regra de rotatividade
      if (rotatividade === "alta") {
        if (parsed.rua === "A" || parsed.rua.includes("PP1")) {
          score += 35;
          motivos.push("Rua próxima à saída - ideal para alta rotatividade");
        } else if (parsed.rua === "B" || parsed.rua.includes("PP2")) {
          score += 25;
          motivos.push("Boa proximidade da saída");
        } else {
          score -= 15;
        }
        if (parsed.coluna <= 2) {
          score += 10;
          motivos.push("Coluna de fácil acesso");
        }
      } else if (rotatividade === "baixa") {
        if (parsed.rua === "D" || parsed.rua === "C" || parsed.rua.includes("PP3")) {
          score += 20;
          motivos.push("Posição adequada para baixa rotatividade");
        }
      }
      
      // Bonus por níveis ergonômicos (2 e 3)
      if (parsed.nivel === 2 || parsed.nivel === 3) {
        score += 5;
        if (!motivos.some(m => m.includes("ergonômico"))) {
          motivos.push("Altura ergonômica");
        }
      }
      
      return { 
        ...p, 
        score, 
        motivos,
        rua: parsed.rua,
        nivel: parsed.nivel,
        coluna: parsed.coluna
      };
    })
    .sort((a, b) => b.score - a.score);
};

const ArmazenamentoPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Hooks do Supabase
  const { posicoes, loading: loadingPosicoes, alocarProduto, refetch } = useEstoque();
  const { registrarEntrada } = useMovimentacoes();
  
  const [posicaoSelecionada, setPosicaoSelecionada] = useState<PosicaoSugerida | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  
  // Dados do item (podem vir de query params ou serem inseridos manualmente)
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
  
  const sugestoes = useMemo(() => 
    calcularSugestoes(posicoes, item.peso, item.rotatividade),
    [posicoes, item.peso, item.rotatividade]
  );
  
  const top3 = sugestoes.slice(0, 3);
  const melhorSugestao = top3[0];
  
  // Agrupar posições por rua para o mapa
  const posicoesAgrupadas = useMemo(() => {
    const grupos: Record<string, PosicaoSugerida[]> = {};
    
    sugestoes.forEach(p => {
      if (!grupos[p.rua]) {
        grupos[p.rua] = [];
      }
      grupos[p.rua].push(p);
    });
    
    // Ordenar cada grupo por coluna
    Object.keys(grupos).forEach(rua => {
      grupos[rua].sort((a, b) => a.coluna - b.coluna);
    });
    
    return grupos;
  }, [sugestoes]);
  
  const ruasDisponiveis = Object.keys(posicoesAgrupadas).sort();
  
  const handleConfirmarArmazenamento = async () => {
    if (!posicaoSelecionada) {
      toast({
        title: "Selecione uma posição",
        description: "É necessário selecionar uma posição para armazenar",
        variant: "destructive"
      });
      return;
    }
    
    setConfirmando(true);
    
    try {
      // Se tiver produtoId, alocar no estoque
      if (item.produtoId) {
        const success = await alocarProduto(
          posicaoSelecionada.id,
          item.produtoId,
          item.quantidade,
          item.loteId
        );
        
        if (!success) {
          throw new Error("Falha ao alocar produto");
        }
        
        // Registrar movimentação
        await registrarEntrada(
          item.produtoId,
          item.quantidade,
          posicaoSelecionada.codigo,
          item.loteId,
          `Armazenamento via triagem - SKU: ${item.sku}`
        );
      }
      
      toast({
        title: "Armazenamento confirmado! ✅",
        description: `Item ${item.sku || item.descricao} armazenado na posição ${posicaoSelecionada.codigo}`,
      });
      
      // Atualizar lista de posições
      await refetch();
      
      navigate("/estoque");
    } catch (error) {
      toast({
        title: "Erro ao armazenar",
        description: "Não foi possível confirmar o armazenamento",
        variant: "destructive"
      });
    } finally {
      setConfirmando(false);
    }
  };
  
  const getRotatividadeColor = (rot: Rotatividade) => {
    switch (rot) {
      case "alta": return "bg-red-500/20 text-red-700 border-red-500/30";
      case "media": return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30";
      case "baixa": return "bg-green-500/20 text-green-700 border-green-500/30";
    }
  };
  
  const getPesoIcon = (peso: number) => {
    if (peso <= 10) return "🪶";
    if (peso <= 30) return "📦";
    return "🏋️";
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 150) return "text-green-600";
    if (score >= 120) return "text-yellow-600";
    return "text-muted-foreground";
  };

  if (loadingPosicoes) {
    return (
      <AppLayout title="Armazenamento" showBack>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Armazenamento" showBack>
      <div className="p-4 lg:pl-72 space-y-4 pb-24">
        {/* Card do Item */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Item a Armazenar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{item.sku || "SKU não informado"}</p>
                <p className="text-sm text-muted-foreground">{item.descricao}</p>
              </div>
              <Badge variant="outline">{item.volumes} volume(s)</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Peso por Volume</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    value={item.peso}
                    onChange={(e) => setItem({...item, peso: Number(e.target.value)})}
                    className="h-9"
                  />
                  <span className="text-sm text-muted-foreground">kg</span>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Rotatividade</Label>
                <Select 
                  value={item.rotatividade} 
                  onValueChange={(v: Rotatividade) => setItem({...item, rotatividade: v})}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Alta (Curva A)</SelectItem>
                    <SelectItem value="media">Média (Curva B)</SelectItem>
                    <SelectItem value="baixa">Baixa (Curva C)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Badge variant="outline" className="gap-1">
                <Weight className="h-3 w-3" />
                {getPesoIcon(item.peso)} {item.peso}kg
              </Badge>
              <Badge variant="outline" className={getRotatividadeColor(item.rotatividade)}>
                <TrendingUp className="h-3 w-3 mr-1" />
                Rotatividade {item.rotatividade}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        {/* Sugestão Automática */}
        {melhorSugestao && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Sugestão Automática
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  posicaoSelecionada?.id === melhorSugestao.id 
                    ? "border-primary bg-primary/10" 
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setPosicaoSelecionada(melhorSugestao)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                      {melhorSugestao.codigo}
                    </div>
                    <div>
                      <p className="font-semibold">Posição Recomendada</p>
                      <p className="text-sm text-muted-foreground">
                        {melhorSugestao.rua} • Nível {melhorSugestao.nivel} • Coluna {melhorSugestao.coluna}
                      </p>
                    </div>
                  </div>
                  <div className={`text-right ${getScoreColor(melhorSugestao.score)}`}>
                    <Zap className="h-5 w-5 inline" />
                    <span className="font-bold ml-1">{melhorSugestao.score}%</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  {melhorSugestao.motivos.slice(0, 3).map((motivo, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {motivo}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Alternativas */}
        {top3.length > 1 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Alternativas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {top3.slice(1).map((pos) => (
                <div 
                  key={pos.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    posicaoSelecionada?.id === pos.id 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setPosicaoSelecionada(pos)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center font-semibold text-sm">
                        {pos.codigo}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {pos.rua} • Nível {pos.nivel}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {pos.motivos[0]}
                        </p>
                      </div>
                    </div>
                    <span className={`font-semibold ${getScoreColor(pos.score)}`}>
                      {pos.score}%
                    </span>
                  </div>
                </div>
              ))}
              
              <div className="pt-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  {sugestoes.length} posições disponíveis no total
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Mapa Visual */}
        {ruasDisponiveis.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Mapa do Estoque</CardTitle>
            </CardHeader>
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
                          <div
                            key={p.id}
                            onClick={() => disponivel && setPosicaoSelecionada(p)}
                            className={`
                              flex-1 min-w-[2rem] h-8 rounded text-xs flex items-center justify-center cursor-pointer
                              transition-all font-medium
                              ${!disponivel 
                                ? "bg-muted text-muted-foreground cursor-not-allowed" 
                                : isSelecionada
                                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                                  : isSugestao
                                    ? "bg-primary/20 text-primary border-2 border-primary/50"
                                    : "bg-green-500/20 text-green-700 hover:bg-green-500/30"
                              }
                            `}
                          >
                            {p.coluna}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                <div className="flex gap-4 pt-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-primary/20 border-2 border-primary/50" />
                    <span>Sugerido</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-green-500/20" />
                    <span>Disponível</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-muted" />
                    <span>Ocupado</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Aviso de Segurança */}
        {item.peso > 30 && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-700 text-sm">Item Pesado</p>
              <p className="text-xs text-yellow-600">
                Este item deve ser armazenado preferencialmente nos níveis 1 ou 2 por questões de segurança.
              </p>
            </div>
          </div>
        )}

        {/* Sem posições disponíveis */}
        {sugestoes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma posição disponível no momento</p>
          </div>
        )}
      </div>
      
      {/* Footer Fixo */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t lg:pl-72">
        <div className="max-w-lg mx-auto">
          {posicaoSelecionada ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Posição selecionada:</span>
                <span className="font-semibold">{posicaoSelecionada.codigo}</span>
              </div>
              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={handleConfirmarArmazenamento}
                disabled={confirmando}
              >
                {confirmando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    Confirmar Armazenamento
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button 
              className="w-full" 
              size="lg" 
              variant="outline"
              disabled
            >
              Selecione uma posição
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ArmazenamentoPage;
