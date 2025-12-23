import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
interface TourStep { target: string; title: string; content: string; placement?: 'top' | 'bottom' | 'left' | 'right'; }
interface TourProps { steps: TourStep[]; isOpen: boolean; onClose: () => void; onComplete?: () => void; }
export function Tour({ steps, isOpen, onClose, onComplete }: TourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (!isOpen) return;
    const el = document.querySelector(steps[currentStep]?.target);
    if (el) { const rect = el.getBoundingClientRect(); setPosition({ top: rect.bottom + 10 + window.scrollY, left: rect.left + window.scrollX }); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }, [currentStep, isOpen, steps]);
  if (!isOpen || !steps[currentStep]) return null;
  const next = () => { if (currentStep < steps.length - 1) setCurrentStep(s => s + 1); else { onComplete?.(); onClose(); } };
  const prev = () => setCurrentStep(s => Math.max(0, s - 1));
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <Card className="fixed z-50 w-80 shadow-lg" style={{ top: position.top, left: position.left }}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2"><h4 className="font-semibold">{steps[currentStep].title}</h4><Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button></div>
          <p className="text-sm text-muted-foreground mb-4">{steps[currentStep].content}</p>
          <div className="flex justify-between items-center"><span className="text-xs text-muted-foreground">{currentStep + 1} de {steps.length}</span>
            <div className="flex gap-2"><Button variant="outline" size="sm" onClick={prev} disabled={currentStep === 0}><ChevronLeft className="h-4 w-4" /></Button><Button size="sm" onClick={next}>{currentStep === steps.length - 1 ? 'Concluir' : <ChevronRight className="h-4 w-4" />}</Button></div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
