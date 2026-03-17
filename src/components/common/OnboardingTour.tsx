import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ChevronLeft, ChevronRight, Rocket } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface TourStep {
  title: string;
  content: string;
  target?: string;
  route?: string;
}

const tourSteps: TourStep[] = [
  {
    title: '🚀 Bem-vindo ao WMS!',
    content: 'Este é seu sistema de gestão de armazém. Vamos fazer um tour rápido pelos módulos principais.',
  },
  {
    title: '📊 Dashboard',
    content: 'Aqui você acompanha métricas em tempo real: ocupação, recebimentos, picking e mais.',
    target: '[data-tour="dashboard"]',
    route: '/dashboard',
  },
  {
    title: '📦 Recebimento',
    content: 'Registre a entrada de mercadorias, confira lotes e identifique divergências.',
    target: '[data-tour="recebimento"]',
    route: '/recebimento',
  },
  {
    title: '🔍 Triagem',
    content: 'Inspecione produtos recebidos, aprove ou reprove com fotos e observações.',
    target: '[data-tour="triagem"]',
    route: '/triagem',
  },
  {
    title: '🏭 Estoque',
    content: 'Visualize posições, movimente produtos e gerencie o armazenamento completo.',
    target: '[data-tour="estoque"]',
    route: '/estoque',
  },
  {
    title: '📱 Scanner',
    content: 'Use a câmera para ler códigos de barras e QR codes diretamente pelo navegador.',
    target: '[data-tour="scanner"]',
    route: '/scanner',
  },
  {
    title: '⌨️ Busca Global',
    content: 'Pressione Ctrl+K a qualquer momento para buscar produtos, lotes ou posições.',
  },
  {
    title: '✅ Tour Concluído!',
    content: 'Agora você conhece os módulos principais. Explore e bom trabalho!',
  },
];

export function OnboardingTour() {
  const [tourCompleted, setTourCompleted] = useLocalStorage('wms-tour-completed', false);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const navigate = useNavigate();
  const location = useLocation();

  const currentStep = tourSteps[step];

  const highlightTarget = useCallback(() => {
    if (!currentStep?.target) {
      setPosition({ top: window.innerHeight / 2 - 100, left: window.innerWidth / 2 - 160, width: 0 });
      return;
    }
    const el = document.querySelector(currentStep.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 12 + window.scrollY,
        left: Math.min(rect.left + window.scrollX, window.innerWidth - 340),
        width: rect.width,
      });
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(highlightTarget, 300);
      return () => clearTimeout(timer);
    }
  }, [step, isOpen, highlightTarget, location.pathname]);

  const next = () => {
    if (step < tourSteps.length - 1) {
      const nextStep = tourSteps[step + 1];
      if (nextStep.route && location.pathname !== nextStep.route) {
        navigate(nextStep.route);
      }
      setStep(s => s + 1);
    } else {
      setTourCompleted(true);
      setIsOpen(false);
    }
  };

  const prev = () => {
    if (step > 0) {
      const prevStep = tourSteps[step - 1];
      if (prevStep.route && location.pathname !== prevStep.route) {
        navigate(prevStep.route);
      }
      setStep(s => s - 1);
    }
  };

  const close = () => {
    setTourCompleted(true);
    setIsOpen(false);
  };

  if (!isOpen && !tourCompleted) {
    return (
      <div className="fixed bottom-20 right-4 z-50 md:bottom-4">
        <Button onClick={() => setIsOpen(true)} className="shadow-lg gap-2">
          <Rocket className="h-4 w-4" /> Fazer Tour
        </Button>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={close} />
      <Card
        className="fixed z-[61] w-80 shadow-2xl border-primary/20"
        style={{ top: position.top, left: position.left }}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-foreground">{currentStep.title}</h4>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={close}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{currentStep.content}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {step + 1} de {tourSteps.length}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={prev} disabled={step === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={next}>
                {step === tourSteps.length - 1 ? 'Concluir' : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
