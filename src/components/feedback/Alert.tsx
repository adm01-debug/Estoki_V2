import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const icons = { info: Info, success: CheckCircle, warning: AlertTriangle, error: AlertCircle };
const styles = {
  info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20",
  success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20",
  error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20",
};

export function Alert({ variant = "info", title, children, className }: AlertProps) {
  const Icon = icons[variant];
  return (
    <div className={cn("flex gap-3 p-4 rounded-lg border", styles[variant], className)} role="alert">
      <Icon className="h-5 w-5 shrink-0" />
      <div>
        {title && <p className="font-medium">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}
