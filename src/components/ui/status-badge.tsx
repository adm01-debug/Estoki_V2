import { cn } from "@/lib/utils";

type StatusVariant = "success" | "warning" | "error" | "info" | "neutral";

const variants: Record<StatusVariant, string> = {
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  neutral: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

interface StatusBadgeProps {
  variant?: StatusVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function StatusBadge({ variant = "neutral", children, className, dot }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", variants[variant], className)}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full", variant === "success" ? "bg-green-500" : variant === "warning" ? "bg-yellow-500" : variant === "error" ? "bg-red-500" : variant === "info" ? "bg-blue-500" : "bg-gray-500")} />}
      {children}
    </span>
  );
}

export function getStatusVariant(status: string): StatusVariant {
  const map: Record<string, StatusVariant> = {
    aprovado: "success", concluido: "success", ativo: "success", livre: "success",
    pendente: "warning", em_andamento: "warning", reservada: "warning",
    reprovado: "error", cancelado: "error", bloqueada: "error", divergencia: "error",
    ocupada: "info",
  };
  return map[status.toLowerCase()] || "neutral";
}
