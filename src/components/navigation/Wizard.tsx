import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
interface WizardStep {
  title: string;
  description?: string;
  content: React.ReactNode;
  validate?: () => boolean;
}
interface WizardProps {
  steps: WizardStep[];
  onComplete: () => void;
  onCancel?: () => void;
}
export function Wizard({ steps, onComplete, onCancel }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = ((currentStep + 1) / steps.length) * 100;
  const canProceed = !steps[currentStep].validate || steps[currentStep].validate();
  const next = () => {
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
    else onComplete();
  };
  const prev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };
  return (
    <Card>
      <CardHeader>
        <div className="mb-4 flex items-center gap-4">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 ${i <= currentStep ? "text-primary" : "text-muted-foreground"}`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${i < currentStep ? "border-primary bg-primary text-primary-foreground" : i === currentStep ? "border-primary" : "border-muted-foreground"}`}
              >
                {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className="hidden text-sm font-medium sm:inline">{s.title}</span>
              {i < steps.length - 1 && <div className="h-px w-8 bg-border" />}
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-semibold">{steps[currentStep].title}</h3>
          {steps[currentStep].description && (
            <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
          )}
        </div>
        <div className="min-h-[200px]">{steps[currentStep].content}</div>
        <div className="mt-6 flex justify-between">
          <div>
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={prev} disabled={currentStep === 0}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            <Button onClick={next} disabled={!canProceed}>
              {currentStep === steps.length - 1 ? "Concluir" : "Próximo"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
