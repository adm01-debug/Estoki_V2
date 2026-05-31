import React, { useState, useEffect, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, ChevronLeft, ChevronRight, Rocket } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Progress } from "@/components/ui/progress";

interface TourStep {
  title: string;
  content: string;
  target?: string;
  route?: string;
}

const tourSteps: TourStep[] = [
  {
    title: "🚀 Bem-vindo ao PROMO BRINDES!",
    content:
      "Este é seu sistema de gestão de estoque. Vamos fazer um tour rápido pelos módulos principais.",
  },
  {
    title: "📊 Dashboard",
    content: "Aqui você acompanha métricas em tempo real: ocupação, recebimentos, picking e mais.",
    target: '[data-tour="dashboard"]',
    route: "/dashboard",
  },
  {
    title: "📦 Recebimento",
    content: "Registre a entrada de mercadorias, confira lotes e identifique divergências.",
    target: '[data-tour="recebimento"]',
    route: "/recebimento",
  },
  {
    title: "🔍 Triagem",
    content: "Inspecione produtos recebidos, aprove ou reprove com fotos e observações.",
    target: '[data-tour="triagem"]',
    route: "/triagem",
  },
  {
    title: "🏭 Estoque",
    content: "Visualize posições, movimente produtos e gerencie o armazenamento completo.",
    target: '[data-tour="estoque"]',
    route: "/estoque",
  },
  {
    title: "📱 Scanner",
    content: "Use a câmera para ler códigos de barras e QR codes diretamente pelo navegador.",
    target: '[data-tour="scanner"]',
    route: "/scanner",
  },
  {
    title: "⌨️ Busca Global",
    content: "Pressione Ctrl+K a qualquer momento para buscar produtos, lotes ou posições.",
  },
  {
    title: "✅ Tour Concluído!",
    content: "Agora você conhece os módulos principais. Explore e bom trabalho!",
  },
];

export const OnboardingTour = memo(function OnboardingTour() {
  const [tourCompleted, setTourCompleted] = useLocalStorage("wms-tour-completed", false);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const currentStep = tourSteps[step];
  const progress = ((step + 1) / tourSteps.length) * 100;

  // Reset step when reopening
  useEffect(() => {
    if (isOpen) setStep(0);
  }, [isOpen]);

  const next = useCallback(() => {
    if (step < tourSteps.length - 1) {
      const nextStep = tourSteps[step + 1];
      if (nextStep.route && location.pathname !== nextStep.route) {
        navigate(nextStep.route);
      }
      setStep((s) => s + 1);
    } else {
      setTourCompleted(true);
      setIsOpen(false);
    }
  }, [step, location.pathname, navigate, setTourCompleted]);

  const prev = useCallback(() => {
    if (step > 0) {
      const prevStep = tourSteps[step - 1];
      if (prevStep.route && location.pathname !== prevStep.route) {
        navigate(prevStep.route);
      }
      setStep((s) => s - 1);
    }
  }, [step, location.pathname, navigate]);

  const close = useCallback(() => {
    setTourCompleted(true);
    setIsOpen(false);
  }, [setTourCompleted]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, close, next, prev]);

  if (!isOpen && !tourCompleted) {
    return (
      <div className="fixed bottom-20 right-4 z-50 md:bottom-4">
        <Button onClick={() => setIsOpen(true)} className="animate-pulse gap-2 shadow-lg">
          <Rocket className="h-4 w-4" /> Fazer Tour
        </Button>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={close} />
      <div className="pointer-events-none fixed inset-0 z-[61] flex items-center justify-center p-4">
        <Card className="pointer-events-auto w-full max-w-sm border-primary/20 shadow-2xl">
          <CardContent className="p-5">
            <div className="mb-1 flex items-start justify-between">
              <h4 className="text-base font-bold text-foreground">{currentStep.title}</h4>
              <Button variant="ghost" size="icon" className="-mr-1 -mt-1 h-7 w-7" onClick={close}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              {currentStep.content}
            </p>

            <Progress value={progress} className="mb-3 h-1" />

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {step + 1} / {tourSteps.length}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={prev} disabled={step === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={next}>
                  {step === tourSteps.length - 1 ? (
                    "Concluir"
                  ) : (
                    <>
                      Próximo <ChevronRight className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
});
