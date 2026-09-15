import { useState, useCallback } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { addBreadcrumb, captureException } from "@/lib/sentry";

type ExportFormat = "csv" | "xlsx" | "json" | "pdf";

interface ExportButtonProps {
  onExport: (format: ExportFormat) => void | Promise<void>;
  isExporting?: boolean;
  formats?: ExportFormat[];
  disabled?: boolean;
  label?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const FORMAT_LABELS: Record<ExportFormat, string> = {
  csv: "Exportar CSV",
  xlsx: "Exportar Excel",
  json: "Exportar JSON",
  pdf: "Exportar PDF",
};

/**
 * Pré-carrega o chunk pesado da lib correspondente ao formato para reduzir
 * o tempo entre clique e download quando o usuário aciona a exportação.
 */
function prefetchFormat(format: ExportFormat): void {
  switch (format) {
    case "xlsx":
      void import("exceljs");
      break;
    case "pdf":
      void Promise.all([import("jspdf"), import("jspdf-autotable")]);
      break;
    case "csv":
      void import("papaparse");
      break;
    default:
      break;
  }
}

/**
 * Botão de exportação com fallback visual (spinner + label "Preparando...")
 * enquanto o chunk async da lib de exportação é baixado, e prefetch ao passar
 * o mouse sobre o item para ocultar a latência de rede.
 */
export function ExportButton({
  onExport,
  isExporting = false,
  formats = ["csv", "xlsx", "pdf"],
  disabled = false,
  label,
  variant = "outline",
  size = "default",
  className,
}: ExportButtonProps) {
  const [preparing, setPreparing] = useState<ExportFormat | null>(null);

  const handleSelect = useCallback(
    async (format: ExportFormat) => {
      setPreparing(format);
      const startedAt = performance.now();
      addBreadcrumb("export", `export:start:${format}`, { format });
      try {
        await onExport(format);
        addBreadcrumb("export", `export:success:${format}`, {
          format,
          durationMs: Math.round(performance.now() - startedAt),
        });
      } catch (err) {
        captureException(err, {
          format,
          durationMs: Math.round(performance.now() - startedAt),
          source: "ExportButton",
        });
        // Não re-lançamos: o Sentry já registrou o erro e o spinner é
        // resetado no finally. O caller pode observar via prop `isExporting`
        // ou registrar seu próprio try/catch no `onExport`.
      } finally {
        setPreparing(null);
      }
    },
    [onExport]
  );

  const busy = isExporting || preparing !== null;
  const buttonLabel = busy
    ? preparing
      ? `Preparando ${preparing.toUpperCase()}...`
      : "Exportando..."
    : label ?? "Exportar";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={disabled || busy}
          aria-busy={busy}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span className="ml-2">{buttonLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {formats.map((format) => (
          <DropdownMenuItem
            key={format}
            onMouseEnter={() => prefetchFormat(format)}
            onFocus={() => prefetchFormat(format)}
            onClick={() => handleSelect(format)}
            disabled={busy}
          >
            {FORMAT_LABELS[format]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}