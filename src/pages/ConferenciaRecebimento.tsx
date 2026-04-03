import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Camera, Check, AlertTriangle, Package, Loader2, Clock, Truck, Scale, Wifi, WifiOff } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRecebimentos, Recebimento, StatusRecebimento } from "@/hooks/useRecebimentos";
import { useBalanca } from "@/hooks/useBalanca";
import { VolumeContagem, VolumeData } from "@/components/triagem/VolumeContagem";
import { Progress } from "@/components/ui/progress";

type TipoEmbalagem = "original" | "plastica" | "generica";

const statusConfig: Record<StatusRecebimento, { label: string; color: string }> = {
  aguardando: { label: "Aguardando", color: "bg-muted" },
  em_transito: { label: "Em Trânsito", color: "bg-blue-500" },
  recebido: { label: "Recebido", color: "bg-yellow-500" },
  em_conferencia: { label: "Em Conferência", color: "bg-orange-500" },
  conferido: { label: "Conferido", color: "bg-green-500" },
  divergencia: { label: "Divergência", color: "bg-red-500" },
  cancelado: { label: "Cancelado", color: "bg-destructive" },
};

export default function ConferenciaRecebimento() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Hook de integração com balança
  const {
    conectada: balancaConectada,
    leitura: leituraBalanca,
    suportado: balancaSuportada,
    conectar: conectarBalanca,
    desconectar: desconectarBalanca,
    erro: erroBalanca,
  } = useBalanca();
  
  const { recebimentos, loading, confirmarConferencia, atualizarStatus } = useRecebimentos();
  
  const [recebimento, setRecebimento] = useState<Recebimento | null>(null);
  const [quantidadeConferida, setQuantidadeConferida] = useState(0);
  const [pesoConferido, setPesoConferido] = useState(0);
  const [tipoEmbalagem, setTipoEmbalagem] = useState<TipoEmbalagem>("original");
  const [observacoes, setObservacoes] = useState("");
  const [salvando, setSalvando] = useState(false);
  
  // Estado para volumes (mock para demonstração)
  const [volumes, setVolumes] = useState<VolumeData[]>([]);

  // Get quantidade esperada from the recebimento
  const quantidadeEsperada = recebimento?.quantidade_pedida || recebimento?.quantidade_inicial || 0;
  
  // Inicializar volumes quando recebimento carregar
  useEffect(() => {
    if (recebimento && quantidadeEsperada > 0) {
      // Criar volumes baseado na quantidade (1 volume para cada 100 unidades ou mínimo 1)
      const numVolumes = Math.max(1, Math.ceil(quantidadeEsperada / 100));
      const qtdPorVolume = Math.ceil(quantidadeEsperada / numVolumes);
      
      const newVolumes: VolumeData[] = Array.from({ length: numVolumes }, (_, i) => ({
        id: i + 1,
        numero: String(i + 1).padStart(2, '0'),
        qtdEsperada: i === numVolumes - 1 
          ? quantidadeEsperada - (qtdPorVolume * (numVolumes - 1))
          : qtdPorVolume,
        qtdContada: null,
        conferido: false,
      }));
      
      setVolumes(newVolumes);
    }
  }, [recebimento, quantidadeEsperada]);
  
  const handleVolumeChange = (volumeId: number, qtdContada: number) => {
    setVolumes(prev => prev.map(v => 
      v.id === volumeId ? { ...v, qtdContada } : v
    ));
  };
  
  const handleVolumeConfirm = (volumeId: number) => {
    setVolumes(prev => prev.map(v => 
      v.id === volumeId ? { ...v, conferido: true } : v
    ));
    // Atualizar quantidade conferida total
    const total = volumes.reduce((acc, v) => acc + (v.id === volumeId ? (v.qtdContada || 0) : (v.conferido ? (v.qtdContada || 0) : 0)), 0);
    setQuantidadeConferida(total);
  };

  useEffect(() => {
    if (id && recebimentos.length > 0) {
      const rec = recebimentos.find(r => r.id === id);
      if (rec) {
        setRecebimento(rec);
        setQuantidadeConferida(rec.quantidade_atual || 0);
        setObservacoes(rec.observacoes_conferencia || "");
      }
    }
  }, [id, recebimentos]);

  // Atualizar peso automaticamente quando balança ler
  useEffect(() => {
    if (leituraBalanca && leituraBalanca.estavel) {
      setPesoConferido(leituraBalanca.peso);
      toast({
        title: "Peso capturado",
        description: `${leituraBalanca.peso} ${leituraBalanca.unidade}`,
      });
    }
  }, [leituraBalanca]);

  const handleConectar = async () => {
    try {
      await conectarBalanca();
      toast({
        title: "Balança conectada",
        description: "Pronta para leitura de peso",
      });
    } catch (err) {
      toast({
        title: "Erro ao conectar",
        description: erroBalanca || "Não foi possível conectar à balança",
        variant: "destructive",
      });
    }
  };

  const handleSalvar = async () => {
    if (!recebimento || !id) return;
    
    setSalvando(true);
    try {
      await confirmarConferencia(id, quantidadeConferida, observacoes);
      navigate("/recebimento");
    } catch (err) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a conferência",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Conferência" showBack>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!recebimento) {
    return (
      <AppLayout title="Conferência" showBack>
        <div className="p-4 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
          <h2 className="text-xl font-bold">Recebimento não encontrado</h2>
          <Button onClick={() => navigate("/recebimento")} className="mt-4">
            Voltar
          </Button>
        </div>
      </AppLayout>
    );
  }

  const progresso = quantidadeEsperada > 0 
    ? (quantidadeConferida / quantidadeEsperada) * 100 
    : 0;
  const temDivergencia = quantidadeConferida !== quantidadeEsperada && quantidadeConferida > 0;

  return (
    <AppLayout title="Conferência de Recebimento" showBack>
      <div className="p-4 space-y-6">
        {/* Header do recebimento */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Lote: {recebimento.numero_lote}
            </h2>
            <p className="text-muted-foreground">{recebimento.fornecedor}</p>
          </div>
          <Badge className={statusConfig[recebimento.status].color}>
            {statusConfig[recebimento.status].label}
          </Badge>
        </div>

        {/* Card de integração com balança */}
        {balancaSuportada && (
          <Card className={balancaConectada ? "border-green-500" : ""}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Scale className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Balança Digital</p>
                    <p className="text-sm text-muted-foreground">
                      {balancaConectada 
                        ? leituraBalanca 
                          ? `${leituraBalanca.peso} ${leituraBalanca.unidade} ${leituraBalanca.estavel ? '(estável)' : '(aguardando...)'}`
                          : "Aguardando leitura..."
                        : "Desconectada"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {balancaConectada ? (
                    <>
                      <Wifi className="h-4 w-4 text-green-500" />
                      <Button variant="outline" size="sm" onClick={desconectarBalanca}>
                        Desconectar
                      </Button>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 text-muted-foreground" />
                      <Button variant="default" size="sm" onClick={handleConectar}>
                        Conectar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações do produto */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Produto</p>
            <p className="font-medium">{recebimento.produto_nome}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Quantidade Esperada</p>
            <p className="font-medium">{quantidadeEsperada} unidades</p>
          </div>
          {recebimento.pedido_compra && (
            <div>
              <p className="text-sm text-muted-foreground">Pedido de Compra</p>
              <p className="font-medium">{recebimento.pedido_compra}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Data Prevista</p>
            <p className="font-medium">{recebimento.previsao_chegada || "Não informada"}</p>
          </div>
        </div>

        {/* Progresso da conferência */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso da conferência</span>
            <span className={temDivergencia ? "text-red-500 font-medium" : ""}>
              {quantidadeConferida} / {quantidadeEsperada}
            </span>
          </div>
          <Progress 
            value={Math.min(progresso, 100)} 
            className={temDivergencia ? "[&>div]:bg-red-500" : ""} 
          />
          {temDivergencia && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Divergência detectada
            </p>
          )}
        </div>

        {/* Formulário de conferência */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="quantidade">Quantidade Conferida</Label>

            {/* Contagem por Volume */}
            {volumes.length > 1 && (
              <VolumeContagem
                volumes={volumes}
                onVolumeChange={handleVolumeChange}
                onVolumeConfirm={handleVolumeConfirm}
                totalEsperado={quantidadeEsperada}
                className="mb-4"
              />
            )}
            
            <Input
              id="quantidade"
              type="number"
              value={quantidadeConferida}
              onChange={(e) => setQuantidadeConferida(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="peso">Peso Conferido (kg)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="peso"
                type="number"
                step="0.001"
                value={pesoConferido}
                onChange={(e) => setPesoConferido(Number(e.target.value))}
              />
              {balancaConectada && leituraBalanca && (
                <Button 
                  variant="outline" 
                  onClick={() => setPesoConferido(leituraBalanca.peso)}
                >
                  <Scale className="h-4 w-4 mr-2" />
                  Capturar
                </Button>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="embalagem">Tipo de Embalagem</Label>
            <Select value={tipoEmbalagem} onValueChange={(v) => setTipoEmbalagem(v as TipoEmbalagem)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="original">Original do Fabricante</SelectItem>
                <SelectItem value="plastica">Caixa Plástica</SelectItem>
                <SelectItem value="generica">Embalagem Genérica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações sobre o recebimento..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => navigate("/recebimento")} className="flex-1">
            Cancelar
          </Button>
          <Button 
            onClick={handleSalvar} 
            disabled={salvando || quantidadeConferida === 0}
            className="flex-1"
          >
            {salvando ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            {temDivergencia ? "Registrar Divergência" : "Confirmar Conferência"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
