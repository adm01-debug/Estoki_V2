import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, CheckCircle2, XCircle, ImagePlus } from "lucide-react";
 import { toast } from "sonner";
import { useTriagens } from "@/hooks/useTriagens";
import { useTriagemTimer } from "@/hooks/useTriagemTimer";
import { useTriagemFotos, FotoTriagem } from "@/hooks/useTriagemFotos";
import { AmostragemAutomatica } from "@/components/triagem/AmostragemAutomatica";
import { DefeitoHistorico, mockHistoricoDefeitos } from "@/components/triagem/DefeitoHistorico";
import { FotosLoteObrigatorias } from "@/components/triagem/FotosLoteObrigatorias";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trophy, Star } from "lucide-react";

// Modularized Components
import { TriagemHeaderCard } from "@/components/triagem/formulario/TriagemHeaderCard";
import { ChecklistCard } from "@/components/triagem/formulario/ChecklistCard";
import { ResultadoInspecaoCard } from "@/components/triagem/formulario/ResultadoInspecaoCard";
import { checklistItems } from "@/components/triagem/formulario/constants";

export default function FormularioTriagem() {
  const navigate = useNavigate();
  const { id } = useParams();
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
      toast.error("Fotos obrigatórias", {
        description: "É necessário adicionar foto geral e de etiqueta"
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
      toast.error("Erro ao finalizar", {
        description: "Não foi possível finalizar a triagem"
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

      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-card p-8 rounded-2xl shadow-2xl border-2 border-primary flex flex-col items-center gap-4 text-center"
            >
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[-20px] rounded-full border-2 border-dashed border-primary/30"
                />
                <div className="bg-primary/10 p-6 rounded-full">
                  <Trophy className="h-16 w-16 text-primary" />
                </div>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-2 -right-2 bg-yellow-500 p-2 rounded-full text-white shadow-lg"
                >
                  <Star className="h-4 w-4 fill-current" />
                </motion.div>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-primary">Excelente Trabalho!</h2>
                <p className="text-muted-foreground mt-2">Você concluiu a triagem com sucesso.</p>
              </div>
              
              <div className="bg-primary/5 px-6 py-3 rounded-xl border border-primary/10 flex items-center gap-3">
                <div className="text-left">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Bônus de XP</p>
                  <p className="text-2xl font-bold text-primary">+50 XP</p>
                </div>
                <div className="h-8 w-px bg-primary/20" />
                <div className="text-left">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Combo</p>
                  <p className="text-2xl font-bold text-primary">x1.2</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <span>Novo nível em breve!</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
