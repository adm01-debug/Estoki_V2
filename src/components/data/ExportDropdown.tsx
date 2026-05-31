import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Download, FileText, FileSpreadsheet, FileJson, Loader2 } from "lucide-react";

interface ExportDropdownProps {
  onExportCSV: () => void;
  onExportExcel: () => void;
  onExportJSON?: () => void;
  onExportSelected?: () => void;
  isExporting: boolean;
  progress: number;
  selectedCount?: number;
  disabled?: boolean;
}

export function ExportDropdown({
  onExportCSV,
  onExportExcel,
  onExportJSON,
  onExportSelected,
  isExporting,
  progress,
  selectedCount = 0,
  disabled = false,
}: ExportDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {Math.round(progress)}%
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {isExporting ? (
          <div className="p-3">
            <p className="mb-2 text-sm text-muted-foreground">Exportando...</p>
            <Progress value={progress} />
          </div>
        ) : (
          <>
            <DropdownMenuLabel>Exportar Todos</DropdownMenuLabel>
            <DropdownMenuItem onClick={onExportCSV}>
              <FileText className="mr-2 h-4 w-4" />
              CSV (.csv)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportExcel}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel (.xlsx)
            </DropdownMenuItem>
            {onExportJSON && (
              <DropdownMenuItem onClick={onExportJSON}>
                <FileJson className="mr-2 h-4 w-4" />
                JSON (.json)
              </DropdownMenuItem>
            )}

            {selectedCount > 0 && onExportSelected && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Exportar Selecionados ({selectedCount})</DropdownMenuLabel>
                <DropdownMenuItem onClick={onExportSelected}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar {selectedCount} registro{selectedCount > 1 ? "s" : ""}
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
