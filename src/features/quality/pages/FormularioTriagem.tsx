 import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
 import { Loader2, AlertTriangle, CheckCircle2, XCircle, ImagePlus, AlertCircle } from "lucide-react";
 import { toast } from "sonner";
import { useTriagens } from "../hooks/useTriagens";
import { useTriagemTimer } from "@/hooks/useTriagemTimer";
import { useTriagemFotos, FotoTriagem } from "@/hooks/useTriagemFotos";
import { AmostragemAutomatica } from "../components/AmostragemAutomatica";
import { DefeitoHistorico, mockHistoricoDefeitos } from "../components/DefeitoHistorico";
import { FotosLoteObrigatorias } from "../components/FotosLoteObrigatorias";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trophy, Star } from "lucide-react";

// Modularized Components
 import { TriagemHeaderCard } from "../components/formulario/TriagemHeaderCard";
 import { ChecklistCard } from "../components/formulario/ChecklistCard";
 import { ResultadoInspecaoCard } from "../components/formulario/ResultadoInspecaoCard";
 import { checklistItems } from "../components/formulario/constants";
 import { VolumeContagem, VolumeData } from "../components/VolumeContagem";
 import { StepProgress } from "@/components/common/StepProgress";
 import { LeaveGuard } from "@/components/common/LeaveGuard";

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
  const [activeStep, setActiveStep] = useState(0);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [observacoes, setObservacoes] = useState("");
  const [quantidadeAprovada, setQuantidadeAprovada] = useState(0);
  const [quantidadeReprovada, setQuantidadeReprovada] = useState(0);
  const [mostrarAmostragem, setMostrarAmostragem] = useState(true);
  const [amostragemConfirmada, setAmostragemConfirmada] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [volumes, setVolumes] = useState<VolumeData[]>([]);
  const [missingReported, setMissingReported] = useState(false);
  const [defectCategory, setDefectCategory] = useState<string>("funcional");
  const [productivity, setProductivity] = useState({ itemsPerHour: 0, efficiency: 100 });
 
    const quantidadeTotal = (triagem as any)?.lotes?.quantidade_inicial || (triagem as any)?.quantidade_total || 100;

  useEffect(() => {
    const carregarTriagem = async () => {
      if (!id) return;
      
      setLoadingTriagem(true);
      if (triagens) {
        const found = triagens.find(t => t.id === id);
        if (found) {
          setTriagem(found);
          // Mock volumes based on quantity if not present
          const qty = (found as any)?.lotes?.quantidade_inicial || (found as any)?.quantidade_total || 100;
          const totalVolumes = Math.ceil(qty / 50) || 1; // Example: 50 items per box
          const initialVolumes: VolumeData[] = Array.from({ length: totalVolumes }, (_, i) => ({
            id: i + 1,
            numero: String(i + 1).padStart(2, '0'),
            qtdEsperada: i === totalVolumes - 1 ? (qty % 50 || 50) : 50,
            qtdContada: null,
            conferido: false,
            integridade: 'ok'
          }));
          setVolumes(initialVolumes);
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
     setHasChanges(true);
     setChecklist(prev => ({ ...prev, [itemId]: checked }));
   };

  const todosItensVerificados = () => {
    return checklistItems.every(item => checklist[item.id] === true);
  };

   const handleAddFoto = async (file: File, tipo: FotoTriagem['tipo']): Promise<FotoTriagem | null> => {
     setHasChanges(true);
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
       setHasChanges(false);

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

    const steps = [
      { id: 1, label: "Checklist Técnico", description: "Verificação de conformidade" },
      { id: 2, label: "Volumes e Lacre", description: "Integridade de embalagens" },
      { id: 3, label: "Documentação", description: "Evidência fotográfica" },
      { id: 4, label: "Rastreabilidade", description: "Vinculação de lote" },
      { id: 5, label: "Resultado", description: "Finalização do laudo" },
    ];
 
   const currentStep = activeStep;
  
   const canGoNext = useMemo(() => {
     switch (activeStep) {
       case 0: return volumes.every(v => v.conferido);
       case 1: return amostragemConfirmada;
       case 2: return todosItensVerificados();
       case 3: return fotos.length >= 2;
       case 4: return true;
       default: return false;
     }
   }, [activeStep, volumes, amostragemConfirmada, checklist, fotos]);
 
   return (
     <AppLayout title="Formulário de Triagem" showBack>
       <LeaveGuard hasChanges={hasChanges} />
       <div className="p-4 space-y-6 max-w-4xl mx-auto">
         <StepProgress steps={steps} currentStep={currentStep} className="mb-8" />
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

        {/* Operator HUD - Real-time stats */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed top-24 right-4 z-40 hidden lg:block"
        >
          <div className="bg-background/80 backdrop-blur-md border border-primary/20 p-4 rounded-2xl shadow-xl space-y-3 w-48">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sessão Ativa</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Produtividade</p>
              <p className="text-xl font-black text-primary">{Math.round(quantidadeAprovada + quantidadeReprovada)} <span className="text-[10px]">itens</span></p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Precisão</p>
              <div className="h-1.5 w-full bg-muted rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '98%' }} />
              </div>
            </div>
          </div>
        </motion.div>

         <div className="space-y-6">
           <AnimatePresence mode="wait">
             {activeStep === 0 && (
               <motion.div 
                 key="step-0"
                 initial={{ opacity: 0, x: 20 }} 
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="space-y-6"
               >
                 <Card className="border-primary/20 shadow-lg overflow-hidden">
                   <CardHeader className="bg-primary/5 border-b border-primary/10">
                     <CardTitle className="text-lg flex items-center gap-2">
                       <Calculator className="h-5 w-5 text-primary" />
                       Fase 1: Conferência de Volumes
                     </CardTitle>
                     <CardDescription>Valide a integridade física de cada caixa/volume.</CardDescription>
                   </CardHeader>
                   <CardContent className="pt-6">
                     {volumes.length > 0 && (
                       <VolumeContagem
                         volumes={volumes}
                         totalEsperado={quantidadeTotal}
                         onVolumeChange={(volId, val) => {
                           setHasChanges(true);
                           setVolumes(prev => prev.map(v => v.id === volId ? { ...v, qtdContada: val } : v));
                         }}
                         onVolumeConfirm={(volId) => {
                           setVolumes(prev => prev.map(v => v.id === volId ? { ...v, conferido: true } : v));
                         }}
                         onVolumeIntegrityChange={(volId, integrity) => {
                           setVolumes(prev => prev.map(v => v.id === volId ? { ...v, integridade: integrity } : v));
                         }}
                         onReportMissing={(volId) => {
                           setMissingReported(true);
                           toast.warning("Alerta de Extravio Emitido", {
                             description: `O volume ${volId} foi marcado como ausente.`,
                             duration: 5000,
                           });
                         }}
                         onVolumeHandoff={(volId) => {
                           setVolumes(prev => prev.map(v => v.id === volId ? { ...v, handoffConfirmado: true } : v));
                           toast.success(`Volume ${volId} liberado.`);
                         }}
                       />
                     )}
                   </CardContent>
                 </Card>
               </motion.div>
             )}

             {activeStep === 1 && (
               <motion.div 
                 key="step-1"
                 initial={{ opacity: 0, x: 20 }} 
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
               >
                 <Card className="border-primary/20 shadow-lg">
                   <CardHeader className="bg-primary/5 border-b border-primary/10">
                     <CardTitle className="text-lg flex items-center gap-2">
                       <Target className="h-5 w-5 text-primary" />
                       Fase 2: Amostragem Estatística
                     </CardTitle>
                     <CardDescription>Defina o rigor da inspeção com base no nível de confiança.</CardDescription>
                   </CardHeader>
                   <CardContent className="pt-6">
                     {mostrarAmostragem && quantidadeTotal > 0 && (
                       <AmostragemAutomatica
                         tamanhoLote={quantidadeTotal}
                         onConfirmarAmostra={() => setAmostragemConfirmada(true)}
                       />
                     )}
                   </CardContent>
                 </Card>
               </motion.div>
             )}

             {activeStep === 2 && (
               <motion.div 
                 key="step-2"
                 initial={{ opacity: 0, x: 20 }} 
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="space-y-6"
               >
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
               </motion.div>
             )}

             {activeStep === 3 && (
               <motion.div 
                 key="step-3"
                 initial={{ opacity: 0, x: 20 }} 
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
               >
                 <Card className="border-primary/20 shadow-lg">
                   <CardHeader className="bg-primary/5 border-b border-primary/10">
                     <CardTitle className="text-lg flex items-center gap-2">
                       <ImagePlus className="h-5 w-5 text-primary" />
                       Fase 4: Evidências Fotográficas
                     </CardTitle>
                     <CardDescription>Capture fotos em alta resolução para rastreabilidade técnica.</CardDescription>
                   </CardHeader>
                   <CardContent className="pt-6">
                     <FotosLoteObrigatorias
                       triagemId={id}
                       fotos={fotos}
                       onAddFoto={handleAddFoto}
                       onRemoveFoto={handleRemoveFoto}
                       uploading={loadingFotos}
                     />
                   </CardContent>
                 </Card>
               </motion.div>
             )}

             {activeStep === 4 && (
               <motion.div 
                 key="step-4"
                 initial={{ opacity: 0, x: 20 }} 
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="space-y-6"
               >
                 <ResultadoInspecaoCard 
                   quantidadeTotal={quantidadeTotal}
                   quantidadeAprovada={quantidadeAprovada}
                   setQuantidadeAprovada={setQuantidadeAprovada}
                   quantidadeReprovada={quantidadeReprovada}
                   setQuantidadeReprovada={setQuantidadeReprovada}
                   observacoes={observacoes}
                   setObservacoes={setObservacoes}
                 />

                 <Card className="border-primary/20">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Causa Raiz do Defeito (Se houver)</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {['Funcional', 'Estético', 'Embalagem', 'Incompleto'].map((cat) => (
                            <Button
                              key={cat}
                              variant={defectCategory === cat.toLowerCase() ? "default" : "outline"}
                              className="h-10 rounded-xl text-[10px] font-bold uppercase"
                              onClick={() => setDefectCategory(cat.toLowerCase())}
                            >
                              {cat}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                 </Card>
               </motion.div>
             )}
           </AnimatePresence>
         </div>

         <div className="flex gap-4 pt-6 sticky bottom-4 z-30 bg-background/80 backdrop-blur-md p-2 rounded-2xl border border-border/20 shadow-2xl">
           {activeStep > 0 && (
             <Button
               variant="outline"
               className="h-12 rounded-xl border-border/40 font-bold uppercase px-8"
               onClick={() => setActiveStep(prev => prev - 1)}
             >
               Voltar
             </Button>
           )}
           
           {activeStep < 4 ? (
             <Button
               className="flex-1 h-12 rounded-xl shadow-xl shadow-primary/20 font-black uppercase tracking-widest glow-button"
               onClick={() => {
                 haptics.medium();
                 if (canGoNext) setActiveStep(prev => prev + 1);
                 else toast.warning("Complete a fase atual para prosseguir.");
               }}
             >
               Próxima Fase
               <ChevronRight className="ml-2 h-5 w-5" />
             </Button>
           ) : (
             <div className="flex-1 flex gap-4">
               <Button
                 variant="outline"
                 className="flex-1 h-12 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5 font-black uppercase tracking-widest"
                 onClick={() => handleSubmit("reprovado")}
                 disabled={submitting}
               >
                 {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <XCircle className="h-5 w-5 mr-2" />}
                 Reprovar
               </Button>
               <Button
                 variant="default"
                 className="flex-1 h-12 rounded-xl shadow-xl shadow-primary/20 font-black uppercase tracking-widest"
                 onClick={() => handleSubmit("aprovado")}
                 disabled={submitting}
               >
                 {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                 Aprovar e Liberar
               </Button>
             </div>
           )}
         </div>

         {!canGoNext && activeStep < 4 && (
           <p className="text-sm text-amber-500 text-center flex items-center justify-center gap-1 animate-pulse">
             <AlertTriangle className="h-4 w-4" />
             Complete todos os requisitos da {steps[activeStep].label}
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
