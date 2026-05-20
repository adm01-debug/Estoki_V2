import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptics } from "@/utils/haptics";

interface DefectPoint {
  id: string;
  x: number;
  y: number;
  type: string;
}

export function VisualDefectTagging() {
  const [points, setPoints] = useState<DefectPoint[]>([]);
  const [selectedType, setSelectedType] = useState("risco");

  const handleAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPoint: DefectPoint = {
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      type: selectedType
    };

    haptics.medium();
    setPoints([...points, newPoint]);
  };

  const removePoint = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.light();
    setPoints(points.filter(p => p.id !== id));
  };

  const defectTypes = [
    { id: "risco", label: "Risco/Arranhão", color: "bg-red-500" },
    { id: "amassado", label: "Amassado", color: "bg-orange-500" },
    { id: "mancha", label: "Mancha", color: "bg-yellow-500" },
    { id: "quebrado", label: "Quebrado", color: "bg-destructive" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {defectTypes.map((t) => (
          <Button
            key={t.id}
            variant={selectedType === t.id ? "default" : "outline"}
            size="sm"
            className="h-8 rounded-full text-[10px] font-bold uppercase tracking-wider gap-2"
            onClick={() => setSelectedType(t.id)}
          >
            <div className={cn("w-2 h-2 rounded-full", t.color)} />
            {t.label}
          </Button>
        ))}
      </div>

      <div 
        className="relative aspect-video bg-muted/30 rounded-2xl border-2 border-dashed border-border/40 overflow-hidden cursor-crosshair group"
        onClick={handleAreaClick}
      >
        {/* Placeholder for Product image or generic outline */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <Target className="w-32 h-32" />
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
           <div className="w-full h-full border-4 border-foreground/5 rounded-[40px] flex items-center justify-center">
              <span className="text-[10px] font-black uppercase text-muted-foreground/20">Área de Mapeamento Técnico</span>
           </div>
        </div>

        {points.map((p) => (
          <motion.div
            key={p.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 group/point"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-lg cursor-pointer",
              defectTypes.find(t => t.id === p.type)?.color || "bg-primary"
            )}>
              <AlertCircle className="w-3 h-3 text-white" />
            </div>
            
            <button 
              className="absolute -top-2 -right-2 bg-background border rounded-full p-0.5 opacity-0 group-hover/point:opacity-100 transition-opacity"
              onClick={(e) => removePoint(p.id, e)}
            >
              <X className="w-2 h-2" />
            </button>
          </motion.div>
        ))}

        <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm border rounded-lg px-2 py-1 text-[9px] font-bold uppercase tracking-tighter text-muted-foreground">
          {points.length} Pontos Identificados
        </div>
      </div>
    </div>
  );
}
