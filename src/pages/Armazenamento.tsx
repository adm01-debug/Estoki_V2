import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
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
  Lightbulb
} from "lucide-react";

type Rotatividade = "alta" | "media" | "baixa";
type FaixaPeso = "leve" | "medio" | "pesado";

interface PosicaoSugerida {
  id: string;
  rua: string;
  nivel: number;
  coluna: number;
  score: number;
  motivos: string[];
  disponivel: boolean;
}

interface ItemArmazenar {
  id: string;
  sku: string;
  descricao: string;
  peso: number;
  rotatividade: Rotatividade;
  quantidade: number;
  volumes: number;
}

// Mock de posições do estoque
const gerarPosicoes = (): PosicaoSugerida[] => {
  const posicoes: PosicaoSugerida[] = [];
  const ruas = ["A", "B", "C", "D"];
  
  ruas.forEach(rua => {
    for (let nivel = 1; nivel <= 4; nivel++) {
      for (let coluna = 1; coluna <= 6; coluna++) {
        const disponivel = Math.random() > 0.4;
        posicoes.push({
          id: `${rua}${nivel}${coluna.toString().padStart(2, '0')}`,
          rua,
          nivel,
          coluna,
          score: 0,
          motivos: [],
          disponivel
        });
      }
    }
  });
  
  return posicoes;
};

const calcularSugestoes = (
  posicoes: PosicaoSugerida[], 
  peso: number, 
  rotatividade: Rotatividade
): PosicaoSugerida[] => {
  const faixaPeso: FaixaPeso = peso <= 10 ? "leve" : peso <= 30 ? "medio" : "pesado";
  
  return posicoes
    .filter(p => p.disponivel)
    .map(p => {
      let score = 100;
      const motivos: string[] = [];
      
      // Regra de peso: itens pesados nos níveis baixos
      if (faixaPeso === "pesado") {
        if (p.nivel === 1) {
          score += 40;
          motivos.push("Nível baixo ideal para itens pesados");
        } else if (p.nivel === 2) {
          score += 20;
          motivos.push("Nível adequado para peso");
        } else {
          score -= 30 * (p.nivel - 2);
          motivos.push("Nível alto não recomendado para peso");
        }
      } else if (faixaPeso === "leve") {
        if (p.nivel >= 3) {
          score += 20;
          motivos.push("Níveis altos aproveitados para itens leves");
        }
      } else {
        if (p.nivel === 2 || p.nivel === 3) {
          score += 15;
          motivos.push("Nível ergonômico para peso médio");
        }
      }
      
      // Regra de rotatividade: alta rotatividade perto da saída (ruas A e B)
      if (rotatividade === "alta") {
        if (p.rua === "A") {
          score += 35;
          motivos.push("Rua próxima à saída - ideal para alta rotatividade");
        } else if (p.rua === "B") {
          score += 25;
          motivos.push("Boa proximidade da saída");
        } else {
          score -= 15;
        }
        // Colunas iniciais também são melhores
        if (p.coluna <= 2) {
          score += 10;
          motivos.push("Coluna de fácil acesso");
        }
      } else if (rotatividade === "baixa") {
        if (p.rua === "D" || p.rua === "C") {
          score += 20;
          motivos.push("Posição adequada para baixa rotatividade");
        }
      }
      
      // Bonus por níveis ergonômicos (2 e 3)
      if (p.nivel === 2 || p.nivel === 3) {
        score += 5;
        if (!motivos.some(m => m.includes("ergonômico"))) {
          motivos.push("Altura ergonômica");
        }
      }
      
      return { ...p, score, motivos };
    })
    .sort((a, b) => b.score - a.score);
};

const ArmazenamentoPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [posicoes] = useState<PosicaoSugerida[]>(gerarPosicoes());
  const [posicaoSelecionada, setPosicaoSelecionada] = useState<PosicaoSugerida | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  
  // Dados do item (podem vir de query params ou serem inseridos manualmente)
  const [item, setItem] = useState<ItemArmazenar>({
    id: searchParams.get("itemId") || "TRI-001",
    sku: searchParams.get("sku") || "PROD-12345",
    descricao: searchParams.get("desc") || "Produto Exemplo",
    peso: Number(searchParams.get("peso")) || 25,
    rotatividade: (searchParams.get("rot") as Rotatividade) || "media",
    quantidade: Number(searchParams.get("qtd")) || 100,
    volumes: Number(searchParams.get("vol")) || 2
  });
  
  const sugestoes = useMemo(() => 
    calcularSugestoes(posicoes, item.peso, item.rotatividade),
    [posicoes, item.peso, item.rotatividade]
  );
  
  const top3 = sugestoes.slice(0, 3);
  const melhorSugestao = top3[0];
  
  const handleConfirmarArmazenamento = () => {
    if (!posicaoSelecionada) {
      toast({
        title: "Selecione uma posição",
        description: "É necessário selecionar uma posição para armazenar",
        variant: "destructive"
      });
      return;
    }
    
    setConfirmando(true);
    
    // Simular processamento
    setTimeout(() => {
      toast({
        title: "Armazenamento confirmado!",
        description: `Item ${item.sku} armazenado na posição ${posicaoSelecionada.id}`,
      });
      setConfirmando(false);
      navigate("/estoque");
    }, 1500);
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

  return (
    <AppLayout title="Armazenamento" showBack>
      <div className="p-4 space-y-4 pb-24">
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
                <p className="font-semibold">{item.sku}</p>
                <p className="text-sm text-muted-foreground">{item.descricao}</p>
              </div>
              <Badge variant="outline">{item.volumes} volumes</Badge>
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
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Sugestão Automática
            </CardTitle>
          </CardHeader>
          <CardContent>
            {melhorSugestao && (
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
                      {melhorSugestao.id}
                    </div>
                    <div>
                      <p className="font-semibold">Posição Recomendada</p>
                      <p className="text-sm text-muted-foreground">
                        Rua {melhorSugestao.rua} • Nível {melhorSugestao.nivel} • Coluna {melhorSugestao.coluna}
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
            )}
          </CardContent>
        </Card>
        
        {/* Alternativas */}
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
                      {pos.id}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        Rua {pos.rua} • Nível {pos.nivel}
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
        
        {/* Mapa Visual */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Mapa do Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["A", "B", "C", "D"].map(rua => (
                <div key={rua} className="flex items-center gap-2">
                  <span className="w-6 font-semibold text-sm">{rua}</span>
                  <div className="flex gap-1 flex-1">
                    {posicoes
                      .filter(p => p.rua === rua && p.nivel === 1)
                      .map(p => {
                        const isSugestao = top3.some(s => s.id === p.id);
                        const isSelecionada = posicaoSelecionada?.id === p.id;
                        
                        return (
                          <div
                            key={p.id}
                            onClick={() => p.disponivel && setPosicaoSelecionada(
                              sugestoes.find(s => s.id === p.id) || p
                            )}
                            className={`
                              flex-1 h-8 rounded text-xs flex items-center justify-center cursor-pointer
                              transition-all font-medium
                              ${!p.disponivel 
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
      </div>
      
      {/* Footer Fixo */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <div className="max-w-lg mx-auto">
          {posicaoSelecionada ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Posição selecionada:</span>
                <span className="font-semibold">{posicaoSelecionada.id}</span>
              </div>
              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={handleConfirmarArmazenamento}
                disabled={confirmando}
              >
                {confirmando ? (
                  "Processando..."
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
