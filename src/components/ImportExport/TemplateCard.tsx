import { motion } from "framer-motion";
import { Download, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TemplateCardProps {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDownloadTemplate: (id: string) => void;
}

export function TemplateCard({
  id,
  label,
  description,
  icon: Icon,
  isSelected,
  onSelect,
  onDownloadTemplate,
}: TemplateCardProps) {
  return (
    <motion.button
      onClick={() => onSelect(id)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-2xl border p-4 text-left transition-all ${
        isSelected
          ? "border-primary/50 bg-primary/5 shadow-glow-sm"
          : "border-border/40 bg-card/80 hover:border-primary/30"
      }`}
    >
      <div className="mb-2 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-xs text-primary"
        onClick={(e) => {
          e.stopPropagation();
          onDownloadTemplate(id);
        }}
      >
        <Download className="mr-1 h-3 w-3" /> Baixar template
      </Button>
    </motion.button>
  );
}
