import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, CheckCircle2, XCircle, ImagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTriagens } from "@/hooks/useTriagens";
import { useTriagemTimer } from "@/hooks/useTriagemTimer";
import { useTriagemFotos, FotoTriagem } from "@/hooks/useTriagemFotos";
import { AmostragemAutomatica } from "@/components/triagem/AmostragemAutomatica";
import { DefeitoHistorico, mockHistoricoDefeitos } from "@/components/triagem/DefeitoHistorico";
import { FotosLoteObrigatorias } from "@/components/triagem/FotosLoteObrigatorias";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Sparkles, Trophy, Star } from "lucide-react";

// Modularized Components
import { TriagemHeaderCard } from "@/components/triagem/formulario/TriagemHeaderCard";
import { ChecklistCard } from "@/components/triagem/formulario/ChecklistCard";
import { ResultadoInspecaoCard } from "@/components/triagem/formulario/ResultadoInspecaoCard";
import { checklistItems } from "@/components/triagem/formulario/constants";

export default function FormularioTriagem() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { triagens, isLoading: triagensLoading, updateTriagem } = useTriagens();
  
  const {
    formattedTime,
    isRunning,
    start: iniciarTimer,
    pause: pausarTimer,
    stop: pararTimer,
  } = useTriagemTimer();

  const {
    fotos,
    uploading: loadingFotos,
    addFotoFromFile,
    removeFoto,
    requisitosAtendidos,
    salvarFotosTriagem,
  } = useTriagemFotos({ triagemId: id });
  
  const [triagem, setTriagem] = useState<any>(null);
  const [loadingTriagem, setLoadingTriagem] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [observacoes, setObservacoes] = useState("");
  const [quantidadeAprovada, setQuantidadeAprovada] = useState(0);
  const [quantidadeReprovada, setQuantidadeReprovada] = useState(0);
  const [mostrarAmostragem, setMostrarAmostragem] = useState(true);
  const [amostragemConfirmada, setAmostragemConfirmada] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const quantidadeTotal = triagem?.quantidade_total || 100;

  useEffect(() => {
    const carregarTriagem = async () => {
      if (!id) return;
      
      setLoadingTriagem(true);
      if (triagens) {
        const found = triagens.find(t => t.id === id);
        if (found) {
          setTriagem(found);
          iniciarTimer();
        }
      }
      setLoadingTriagem(false);
    };
    
    carregarTriagem();

    return () => {
      pararTimer();
    };
  }, [id, triagens]);

  const handleChecklistChange = (itemId: string, checked: boolean) => {
    setChecklist(prev => ({ ...prev, [itemId]: checked }));
  };

  const todosItensVerificados = () => {
    return checklistItems.every(item => checklist[item.id] === true);
  };

  const handleAddFoto = async (file: File, tipo: FotoTriagem['tipo']): Promise<FotoTriagem | null> => {
    return await addFotoFromFile(file, tipo);
  };

  const handleRemoveFoto = async (fotoId: string) => {
    await removeFoto(fotoId);
  };

  const handleSubmit = async (resultado: "aprovado" | "reprovado") => {
    if (!id || !triagem) return;

    if (!requisitosAtendidos) {
      toast({
        title: "Fotos obrigatórias",
        description: "É necessário adicionar foto geral e de etiqueta",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    pararTimer();

    try {
      if (fotos.length > 0) {
        await salvarFotosTriagem(id);
      }

      await updateTriagem.mutateAsync({
        id,
        resultado,
        observacoes,
        data_fim: new Date().toISOString(),
      });

      if (resultado === "aprovado") {
        setShowCelebration(true);
        toast.success("Excelente! Triagem aprovada.", {
          description: `Você ganhou +50 XP! Tempo: ${formattedTime}`,
          icon: <Trophy className="h-4 w-4 text-yellow-500" />
        });
        setTimeout(() => navigate("/triagem"), 3000);
      } else {
        toast.error("Triagem reprovada", {
          description: `Tempo: ${formattedTime}`,
          icon: <XCircle className="h-4 w-4" />
        });
        navigate("/triagem");
      }
    } catch {
      toast({
        title: "Erro ao finalizar",
        description: "Não foi possível finalizar a triagem",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingTriagem || triagensLoading) {
    return (
      <AppLayout title="Triagem" showBack>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!triagem) {
    return (
      <AppLayout title="Triagem" showBack>
        <div className="p-4 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
          <h2 className="text-xl font-bold">Triagem não encontrada</h2>
          <Button onClick={() => navigate("/triagem")} className="mt-4">
            Voltar
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Formulário de Triagem" showBack>
      <div className="p-4 space-y-6">
        <TriagemHeaderCard 
          id={id}
          loteId={triagem.lote_id}
          produtoNome={triagem.produto_nome}
          quantidadeTotal={quantidadeTotal}
          formattedTime={formattedTime}
          isRunning={isRunning}
          onPausar={pausarTimer}
          onIniciar={iniciarTimer}
        />

        {mostrarAmostragem && quantidadeTotal > 0 && !amostragemConfirmada && (
          <AmostragemAutomatica
            tamanhoLote={quantidadeTotal}
            onConfirmarAmostra={() => setAmostragemConfirmada(true)}
          />
        )}

        <ChecklistCard 
          checklist={checklist}
          onChecklistChange={handleChecklistChange}
        />

        {triagem?.produto_sku && mockHistoricoDefeitos[triagem.produto_sku] && (
          <DefeitoHistorico
            sku={triagem.produto_sku}
            produto={triagem.produto_nome || "Produto"}
            historico={mockHistoricoDefeitos[triagem.produto_sku].historico}
            totalTriagens={mockHistoricoDefeitos[triagem.produto_sku].totalTriagens}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ImagePlus className="h-5 w-5" />
              Fotos do Lote
            </CardTitle>
            <CardDescription>
              Tire fotos do produto para documentação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FotosLoteObrigatorias
              triagemId={id}
              fotos={fotos}
              onAddFoto={handleAddFoto}
              onRemoveFoto={handleRemoveFoto}
              uploading={loadingFotos}
            />
          </CardContent>
        </Card>

        <ResultadoInspecaoCard 
          quantidadeTotal={quantidadeTotal}
          quantidadeAprovada={quantidadeAprovada}
          setQuantidadeAprovada={setQuantidadeAprovada}
          quantidadeReprovada={quantidadeReprovada}
          setQuantidadeReprovada={setQuantidadeReprovada}
          observacoes={observacoes}
          setObservacoes={setObservacoes}
        />

        <div className="flex gap-3">
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => handleSubmit("reprovado")}
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <XCircle className="h-4 w-4 mr-2" />
            )}
            Reprovar
          </Button>
          <Button
            variant="default"
            className="flex-1"
            onClick={() => handleSubmit("aprovado")}
            disabled={submitting || !todosItensVerificados()}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Aprovar
          </Button>
        </div>

        {!todosItensVerificados() && (
          <p className="text-sm text-amber-500 text-center flex items-center justify-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            Complete todos os itens do checklist para aprovar
          </p>
        )}
      </div>
    </AppLayout>
  );
}
