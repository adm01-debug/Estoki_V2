import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { X, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
}

interface OnboardingTourContextType {
  startTour: () => void;
  endTour: () => void;
  isActive: boolean;
}

const OnboardingTourContext = createContext<OnboardingTourContextType | undefined>(undefined);

const tourSteps: TourStep[] = [
  {
    target: "[data-tour='dashboard']",
    title: "Dashboard",
    content: "Visualize todos os KPIs e métricas importantes do seu armazém em tempo real.",
    placement: "right",
  },
  {
    target: "[data-tour='recebimento']",
    title: "Recebimento",
    content: "Registre e confira todos os recebimentos de mercadorias com controle de NF.",
    placement: "right",
  },
  {
    target: "[data-tour='triagem']",
    title: "Triagem",
    content: "Faça a triagem de qualidade dos produtos recebidos antes do armazenamento.",
    placement: "right",
  },
  {
    target: "[data-tour='estoque']",
    title: "Mapa de Estoque",
    content: "Visualize o mapa do armazém com todas as posições e seus status em tempo real.",
    placement: "right",
  },
  {
    target: "[data-tour='scanner']",
    title: "Scanner QR",
    content: "Use o scanner para identificar rapidamente produtos e posições pelo código QR.",
    placement: "right",
  },
];

function TourOverlay({ step, currentStep, totalSteps, onNext, onPrev, onClose }: {
  step: TourStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      
      {/* Tour Card */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md pointer-events-auto z-[101]">
        <div className="bg-card border border-border rounded-xl shadow-2xl p-5 animate-fade-in">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                {currentStep}
              </div>
              <h3 className="font-semibold text-lg text-foreground">{step.title}</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar tour">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-muted-foreground mb-4">{step.content}</p>
          
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  i + 1 === currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrev}
              disabled={currentStep === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            
            {currentStep === totalSteps ? (
              <Button size="sm" onClick={onClose} className="gap-1">
                <Check className="h-4 w-4" />
                Concluir
              </Button>
            ) : (
              <Button size="sm" onClick={onNext} className="gap-1">
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function OnboardingTourProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [hasSeenTour, setHasSeenTour] = useState(() => {
    return localStorage.getItem("onboarding-tour-completed") === "true";
  });

  useEffect(() => {
    // Auto-start tour for new users
    const timer = setTimeout(() => {
      if (!hasSeenTour) {
        setIsActive(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [hasSeenTour]);

  const startTour = () => {
    setCurrentStep(1);
    setIsActive(true);
  };

  const endTour = () => {
    setIsActive(false);
    setHasSeenTour(true);
    localStorage.setItem("onboarding-tour-completed", "true");
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <OnboardingTourContext.Provider value={{ startTour, endTour, isActive }}>
      {children}
      {isActive && (
        <TourOverlay
          step={tourSteps[currentStep - 1]}
          currentStep={currentStep}
          totalSteps={tourSteps.length}
          onNext={handleNext}
          onPrev={handlePrev}
          onClose={endTour}
        />
      )}
    </OnboardingTourContext.Provider>
  );
}

export function useOnboardingTour() {
  const context = useContext(OnboardingTourContext);
  if (!context) {
    throw new Error("useOnboardingTour must be used within OnboardingTourProvider");
  }
  return context;
}
