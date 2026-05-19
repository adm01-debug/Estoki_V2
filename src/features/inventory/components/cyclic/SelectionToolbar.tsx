import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckSquare, Trash2 } from "lucide-react";

interface SelectionToolbarProps {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
}

export function SelectionToolbar({ selectedCount, onClear, onDelete }: SelectionToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20 sticky top-0 z-20 glass-card"
    >
      <CheckSquare className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">{selectedCount} selecionado(s)</span>
      <div className="flex-1" />
      <Button size="sm" variant="ghost" onClick={onClear}>Limpar</Button>
      <Button size="sm" variant="outline" className="text-destructive gap-1" onClick={onDelete}>
        <Trash2 className="h-3 w-3" /> Excluir
      </Button>
    </motion.div>
  );
}
