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
      type: selectedType,
    };

    haptics.medium();
    setPoints([...points, newPoint]);
  };

  const removePoint = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.light();
    setPoints(points.filter((p) => p.id !== id));
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
            className="h-8 gap-2 rounded-full text-[10px] font-bold uppercase tracking-wider"
            onClick={() => setSelectedType(t.id)}
          >
            <div className={cn("h-2 w-2 rounded-full", t.color)} />
            {t.label}
          </Button>
        ))}
      </div>

      <div
        className="group relative aspect-video cursor-crosshair overflow-hidden rounded-2xl border-2 border-dashed border-border/40 bg-muted/30"
        onClick={handleAreaClick}
      >
        {/* Placeholder for Product image or generic outline */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <Target className="h-32 w-32" />
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8">
          <div className="flex h-full w-full items-center justify-center rounded-[40px] border-4 border-foreground/5">
            <span className="text-[10px] font-black uppercase text-muted-foreground/20">
              Área de Mapeamento Técnico
            </span>
          </div>
        </div>

        {points.map((p) => (
          <motion.div
            key={p.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="group/point absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            <div
              className={cn(
                "flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-white shadow-lg",
                defectTypes.find((t) => t.id === p.type)?.color || "bg-primary"
              )}
            >
              <AlertCircle className="h-3 w-3 text-white" />
            </div>

            <button
              className="absolute -right-2 -top-2 rounded-full border bg-background p-0.5 opacity-0 transition-opacity group-hover/point:opacity-100"
              onClick={(e) => removePoint(p.id, e)}
            >
              <X className="h-2 w-2" />
            </button>
          </motion.div>
        ))}

        <div className="absolute bottom-4 left-4 rounded-lg border bg-background/80 px-2 py-1 text-[9px] font-bold uppercase tracking-tighter text-muted-foreground backdrop-blur-sm">
          {points.length} Pontos Identificados
        </div>
      </div>
    </div>
  );
}
