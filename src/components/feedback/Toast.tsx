import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
  onClose?: () => void;
}

const icons = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info };
const styles = {
  success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800",
  error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800",
};

export function Toast({ title, description, variant = "info", onClose }: ToastProps) {
  const Icon = icons[variant];
  return (
    <div className={cn("flex items-start gap-3 p-4 rounded-lg border", styles[variant])}>
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        {description && <p className="text-sm mt-1 opacity-90">{description}</p>}
      </div>
      {onClose && <button onClick={onClose} className="shrink-0"><X className="h-4 w-4" /></button>}
    </div>
  );
}
