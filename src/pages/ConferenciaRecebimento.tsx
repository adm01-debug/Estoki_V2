import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, AlertTriangle, Package, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useRecebimentos } from "@/hooks/useRecebimentos";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { BalancaCard } from "@/components/conferencia/BalancaCard";
import { ConferenciaForm } from "@/components/conferencia/ConferenciaForm";
import { statusConfig } from "@/components/conferencia/conferenciaHelpers";
import { Recebimento, TipoEmbalagem, VolumeData } from "@/components/conferencia/types";

export default function ConferenciaRecebimento() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { recebimentos, isLoading } = useRecebimentos();
  
  const [recebimento, setRecebimento] = useState<Recebimento | null>(null);
  const [quantidadeConferida, setQuantidadeConferida] = useState(0);
  const [pesoConferido, setPesoConferido] = useState(0);
  const [tipoEmbalagem, setTipoEmbalagem] = useState<TipoEmbalagem>("original");
  const [observacoes, setObservacoes] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [volumes, setVolumes] = useState<VolumeData[]>([]);

  const quantidadeEsperada = recebimento?.quantidade_pedida || recebimento?.quantidade_inicial || 0;
  
  useEffect(() => {
    if (recebimento && quantidadeEsperada > 0) {
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
    const total = volumes.reduce((acc, v) => acc + (v.id === volumeId ? (v.qtdContada || 0) : (v.conferido ? (v.qtdContada || 0) : 0)), 0);
    setQuantidadeConferida(total);
  };

  useEffect(() => {
    if (id && recebimentos && recebimentos.length > 0) {
      const rec = recebimentos.find(r => r.id === id);
      if (rec) {
        setRecebimento(rec as unknown as Recebimento);
        setQuantidadeConferida(rec.quantidade_atual || 0);
        setObservacoes(rec.observacoes_conferencia || "");
      }
    }
  }, [id, recebimentos]);

  const handleSalvar = async () => {
    if (!recebimento || !id) return;
    
    setSalvando(true);
    try {
      const { error } = await supabase.from('lotes').update({
        quantidade_atual: quantidadeConferida,
        observacoes_conferencia: observacoes,
        status: quantidadeConferida === quantidadeEsperada ? 'conferido' : 'divergencia',
        data_conferencia: new Date().toISOString(),
      }).eq('id', id);
      
      if (error) throw error;
      
      navigate("/recebimento");
    } catch {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a conferência",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  };

  if (isLoading) {
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
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Lote: {recebimento.numero_lote}
            </h2>
            <p className="text-muted-foreground">{recebimento.fornecedor}</p>
          </div>
          <Badge className={statusConfig[recebimento.status]?.color || 'bg-muted'}>
            {statusConfig[recebimento.status]?.label || recebimento.status}
          </Badge>
        </div>

        <BalancaCard onPesoCapturado={setPesoConferido} />

        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Produto</p>
            <p className="font-medium">{recebimento.produto_nome || recebimento.produto_id}</p>
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

        <ConferenciaForm 
          volumes={volumes}
          quantidadeConferida={quantidadeConferida}
          setQuantidadeConferida={setQuantidadeConferida}
          pesoConferido={pesoConferido}
          setPesoConferido={setPesoConferido}
          tipoEmbalagem={tipoEmbalagem}
          setTipoEmbalagem={setTipoEmbalagem}
          observacoes={observacoes}
          setObservacoes={setObservacoes}
          quantidadeEsperada={quantidadeEsperada}
          handleVolumeChange={handleVolumeChange}
          handleVolumeConfirm={handleVolumeConfirm}
          balancaConectada={false} // Simulado ou passado via props se necessário
          leituraBalanca={null}
        />

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
