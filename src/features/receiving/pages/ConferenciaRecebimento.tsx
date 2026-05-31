import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, AlertTriangle, Package, Loader2, QrCode, TrendingUp, History, BarChart3, Filter, Download, Info, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button"; 
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useRecebimentos } from "../hooks/useRecebimentos";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { BalancaCard } from "@/components/conferencia/BalancaCard";
import { ConferenciaForm } from "@/components/conferencia/ConferenciaForm";
import { statusConfig } from "@/components/conferencia/conferenciaHelpers";
import { PersistentStepper } from "@/components/molecules/navigation/PersistentStepper";
import { LeaveGuard } from "@/components/common/LeaveGuard";
import { Recebimento, TipoEmbalagem, VolumeData } from "@/components/conferencia/types";
import { Mic, MicOff, Printer } from "lucide-react";

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
  const [itemScanned, setItemScanned] = useState(false);
  const [locationScanned, setLocationScanned] = useState(false);
   const [volumes, setVolumes] = useState<VolumeData[]>([]);
   const [voiceActive, setVoiceActive] = useState(false);
   const [hasChanges, setHasChanges] = useState(false);
 
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
     setHasChanges(true);
     setVolumes(prev => prev.map(v => 
       v.id === volumeId ? { ...v, qtdContada } : v
     ));
   };
  
  const handleVolumeConfirm = (volumeId: number) => {
    setVolumes(prev => prev.map(v => 
      v.id === volumeId ? { ...v, conferido: true, integridade: v.integridade || 'ok' } : v
    ));
    setVolumes(prevVolumes => {
      const updatedVolumes = prevVolumes.map(v => 
        v.id === volumeId ? { ...v, conferido: true, integridade: v.integridade || 'ok' } : v
      );
      const total = updatedVolumes.reduce((acc, v) => acc + (v.conferido ? (v.qtdContada || 0) : 0), 0);
      setQuantidadeConferida(total);
      return updatedVolumes;
    });
  };

  const handleVolumeIntegrityChange = (volumeId: number, integridade: 'ok' | 'avaiado' | 'critico') => {
    setHasChanges(true);
    setVolumes(prev => prev.map(v => 
      v.id === volumeId ? { ...v, integridade } : v
    ));
  };

  const handleVolumeHandoff = (volumeId: number) => {
    setHasChanges(true);
    setVolumes(prev => prev.map(v => 
      v.id === volumeId ? { ...v, handoffConfirmado: true } : v
    ));
    toast({
      title: "Volume Liberado",
      description: `Volume ${volumeId} encaminhado para triagem.`,
    });
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

  const handleScanItem = () => {
    setItemScanned(true);
    toast({ title: "Item Validado", description: "Código do produto conferido com sucesso." });
  };

  const handleScanLocation = () => {
    setLocationScanned(true);
    toast({ title: "Local Validado", description: "Posição de destino confirmada." });
  };

   const handleSalvar = async () => {
     if (!recebimento || !id) return;
     
     if (!itemScanned) {
      toast({
        title: "Item não validado",
        description: "É necessário escanear o produto para garantir a acuracidade.",
        variant: "destructive",
      });
      return;
    }

    if (!locationScanned) {
      toast({
        title: "Local não validado",
        description: "Escaneie a etiqueta da posição de triagem/estoque.",
        variant: "destructive",
      });
      return;
    }
    
    setSalvando(true);
    try {
      const { error } = await supabase.from('lotes').update({
        quantidade_atual: quantidadeConferida,
        observacoes_conferencia: observacoes,
        status: quantidadeConferida === quantidadeEsperada ? 'conferido' : 'divergencia',
        data_conferencia: new Date().toISOString(),
      }).eq('id', id);
      
       if (error) throw error;
       setHasChanges(false);
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

  const toggleVoice = () => {
    if (!voiceActive) {
      toast({ title: "Comando de Voz Ativado", description: "Diga a quantidade do volume (ex: 'Dez')" });
      setVoiceActive(true);
      // Simulando reconhecimento de voz
      setTimeout(() => {
        toast({ title: "Voz Detectada", description: "Identificado: 50 unidades" });
      }, 2000);
    } else {
      setVoiceActive(false);
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
 
   const currentStep = useMemo(() => {
     if (!itemScanned || !locationScanned) return 0;
     const allVolumesConferidos = volumes.every(v => v.conferido);
     const allHandoffs = volumes.every(v => v.handoffConfirmado);
     if (!allVolumesConferidos) return 1;
     if (!allHandoffs) return 2;
     return 3;
   }, [itemScanned, locationScanned, volumes]);

   const volumesFaltantes = useMemo(() => {
     return volumes.filter(v => v.conferido && v.integridade === 'critico').length;
   }, [volumes]);

   const volumesNaoEncontrados = useMemo(() => {
     return volumes.filter(v => !v.conferido).length;
   }, [volumes]);
 
   const steps = [
     { id: 1, label: "Validação", description: "Escanear item e local" },
     { id: 2, label: "Conferência", description: "Conferir volumes e integridade" },
     { id: 3, label: "Handoff", description: "Liberar para Triagem" },
     { id: 4, label: "Finalização", description: "Confirmar dados" },
   ];
 
    return (
      <AppLayout title="Conferência de Recebimento" showBack>
        <LeaveGuard hasChanges={hasChanges} />
        <PersistentStepper steps={steps} currentStep={currentStep} />
        <div className="p-4 space-y-6 max-w-4xl mx-auto mt-4">
         
         <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Lote: {recebimento.numero_lote}
            </h2>
            <p className="text-muted-foreground">{recebimento.fornecedor}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={voiceActive ? "default" : "outline"} 
              size="icon" 
              onClick={toggleVoice}
              className={voiceActive ? "animate-pulse" : ""}
            >
              {voiceActive ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
            <Badge className={statusConfig[recebimento.status]?.color || 'bg-muted'}>
              {statusConfig[recebimento.status]?.label || recebimento.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BalancaCard onPesoCapturado={setPesoConferido} />
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Validação de Fluxo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  variant={itemScanned ? "secondary" : "outline"} 
                  className={cn("h-12 justify-between px-4 transition-all", itemScanned && "bg-success/20 border-success/40 text-success")}
                  onClick={handleScanItem}
                >
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    <span className="font-bold">Escanear Produto (SKU/EAN)</span>
                  </div>
                  {itemScanned && <Check className="h-5 w-5 animate-in zoom-in" />}
                </Button>
                <Button 
                  variant={locationScanned ? "secondary" : "outline"} 
                  className={cn("h-12 justify-between px-4 transition-all", locationScanned && "bg-success/20 border-success/40 text-success")}
                  onClick={handleScanLocation}
                >
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    <span className="font-bold">Escanear Endereço/Posição</span>
                  </div>
                  {locationScanned && <Check className="h-5 w-5 animate-in zoom-in" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium leading-tight">
                <Info className="h-3 w-3 inline mr-1" />
                A validação física é obrigatória para evitar erros de troca de mercadoria ou endereçamento indevido no WMS.
              </p>
            </CardContent>
          </Card>
        </div>

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
          {(volumesNaoEncontrados > 0 || volumesFaltantes > 0) && (
            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-2xl flex items-start gap-3 animate-pulse">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="text-sm font-black text-destructive uppercase tracking-tighter">Atenção: Inconsistência Detectada</p>
                <p className="text-xs text-destructive/80 font-medium">
                  {volumesNaoEncontrados > 0 && `${volumesNaoEncontrados} volume(s) ainda não foram localizados no pátio. `}
                  {volumesFaltantes > 0 && `${volumesFaltantes} volume(s) marcados com avaria crítica.`}
                </p>
              </div>
            </div>
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
          handleVolumeIntegrityChange={handleVolumeIntegrityChange}
          handleVolumeHandoff={handleVolumeHandoff}
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
