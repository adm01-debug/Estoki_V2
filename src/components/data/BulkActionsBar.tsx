import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2, Copy, RotateCcw, Edit, MoreHorizontal, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkActionsBarProps {
  selectedCount: number;
  isProcessing: boolean;
  progress: number;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onRestore?: () => void;
  onUpdate?: () => void;
  onClear: () => void;
  className?: string;
  showDelete?: boolean;
  showDuplicate?: boolean;
  showRestore?: boolean;
  showUpdate?: boolean;
  customActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "destructive";
  }>;
}

export function BulkActionsBar({
  selectedCount,
  isProcessing,
  progress,
  onDelete,
  onDuplicate,
  onRestore,
  onUpdate,
  onClear,
  className,
  showDelete = true,
  showDuplicate = true,
  showRestore = false,
  showUpdate = false,
  customActions = [],
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
        "bg-background border rounded-lg shadow-lg p-3",
        "flex items-center gap-3 animate-in slide-in-from-bottom-4",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-sm">
          {selectedCount} selecionado{selectedCount > 1 ? "s" : ""}
        </Badge>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClear}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {isProcessing ? (
        <div className="flex items-center gap-3 min-w-[200px]">
          <Loader2 className="h-4 w-4 animate-spin" />
          <Progress value={progress} className="w-32" />
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {showDuplicate && onDuplicate && (
            <Button variant="outline" size="sm" onClick={onDuplicate}>
              <Copy className="h-4 w-4 mr-1" />
              Duplicar
            </Button>
          )}

          {showUpdate && onUpdate && (
            <Button variant="outline" size="sm" onClick={onUpdate}>
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          )}

          {showRestore && onRestore && (
            <Button variant="outline" size="sm" onClick={onRestore}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Restaurar
            </Button>
          )}

          {customActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {customActions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={action.onClick}
                    className={action.variant === "destructive" ? "text-destructive" : ""}
                  >
                    {action.icon}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {showDelete && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Você está prestes a excluir {selectedCount} registro
                    {selectedCount > 1 ? "s" : ""}. Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">
                    Excluir {selectedCount} registro{selectedCount > 1 ? "s" : ""}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )}
    </div>
  );
}
