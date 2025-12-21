import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { exportToCSV, exportToJSON } from "@/lib/export";

interface ExportButtonProps<T> {
  data: T[];
  filename: string;
}

export function ExportButton<T extends Record<string, unknown>>({ data, filename }: ExportButtonProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => exportToCSV(data, filename)}>CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportToJSON(data, filename)}>JSON</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
