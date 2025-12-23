import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
interface WizardStep { title: string; description?: string; content: React.ReactNode; validate?: () => boolean; }
interface WizardProps { steps: WizardStep[]; onComplete: () => void; onCancel?: () => void; }
export function Wizard({ steps, onComplete, onCancel }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = ((currentStep + 1) / steps.length) * 100;
  const canProceed = !steps[currentStep].validate || steps[currentStep].validate();
  const next = () => { if (currentStep < steps.length - 1) setCurrentStep(s => s + 1); else onComplete(); };
  const prev = () => { if (currentStep > 0) setCurrentStep(s => s - 1); };
  return (
    <Card>
      <CardHeader><div className="flex items-center gap-4 mb-4">{steps.map((s, i) => <div key={i} className={`flex items-center gap-2 ${i <= currentStep ? 'text-primary' : 'text-muted-foreground'}`}><div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${i < currentStep ? 'bg-primary text-primary-foreground border-primary' : i === currentStep ? 'border-primary' : 'border-muted-foreground'}`}>{i < currentStep ? <Check className="h-4 w-4" /> : i + 1}</div><span className="text-sm font-medium hidden sm:inline">{s.title}</span>{i < steps.length - 1 && <div className="w-8 h-px bg-border" />}</div>)}</div><Progress value={progress} className="h-2" /></CardHeader>
      <CardContent>
        <div className="mb-6"><h3 className="text-lg font-semibold">{steps[currentStep].title}</h3>{steps[currentStep].description && <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>}</div>
        <div className="min-h-[200px]">{steps[currentStep].content}</div>
        <div className="flex justify-between mt-6">
          <div>{onCancel && <Button variant="ghost" onClick={onCancel}>Cancelar</Button>}</div>
          <div className="flex gap-2"><Button variant="outline" onClick={prev} disabled={currentStep === 0}><ChevronLeft className="h-4 w-4 mr-2" />Anterior</Button><Button onClick={next} disabled={!canProceed}>{currentStep === steps.length - 1 ? 'Concluir' : 'Próximo'}<ChevronRight className="h-4 w-4 ml-2" /></Button></div>
        </div>
      </CardContent>
    </Card>
  );
}
