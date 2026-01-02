import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  FileText,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Download,
  X,
} from "lucide-react";
import { z } from "zod";
import { importCSV, ImportResult, downloadCSV, generateCSVTemplate } from "@/lib/csvImporter";
import { importExcel, generateExcelTemplate } from "@/lib/excelImporter";

interface DataImporterProps<T> {
  schema: z.ZodSchema<T>;
  onImport: (data: T[]) => Promise<void>;
  entityName: string;
  templateHeaders: string[];
  exampleData?: Record<string, any>[];
  maxPreviewRows?: number;
  allowedFormats?: ("csv" | "xlsx")[];
}

export function DataImporter<T>({
  schema,
  onImport,
  entityName,
  templateHeaders,
  exampleData,
  maxPreviewRows = 5,
  allowedFormats = ["csv", "xlsx"],
}: DataImporterProps<T>) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult<T> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const acceptedTypes = allowedFormats
    .map((f) => (f === "csv" ? ".csv" : ".xlsx,.xls"))
    .join(",");

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      setFile(selectedFile);
      setIsProcessing(true);
      setProgress(10);
      setResult(null);

      try {
        const isExcel =
          selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".xls");

        setProgress(30);
        const importResult = isExcel
          ? await importExcel(selectedFile, schema)
          : await importCSV(selectedFile, schema);

        setProgress(80);
        setResult(importResult);
        setProgress(100);
      } catch (error) {
        console.error("Erro ao processar arquivo:", error);
        setResult({
          success: [],
          errors: [{ row: 0, field: "file", error: (error as Error).message }],
          total: 0,
          warnings: [],
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [schema]
  );

  const handleImport = async () => {
    if (!result || result.success.length === 0) return;

    setIsImporting(true);
    setProgress(0);

    try {
      const batchSize = 100;
      const batches = Math.ceil(result.success.length / batchSize);

      for (let i = 0; i < batches; i++) {
        const batch = result.success.slice(i * batchSize, (i + 1) * batchSize);
        await onImport(batch);
        setProgress(((i + 1) / batches) * 100);
      }

      setFile(null);
      setResult(null);
    } catch (error) {
      console.error("Erro ao importar:", error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = (format: "csv" | "xlsx") => {
    if (format === "csv") {
      const csv = generateCSVTemplate(templateHeaders);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `template_${entityName}.csv`;
      a.click();
    } else {
      generateExcelTemplate(templateHeaders, `template_${entityName}`, exampleData);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <label className="flex-1 min-w-[200px]">
          <Input
            type="file"
            accept={acceptedTypes}
            onChange={handleFileChange}
            disabled={isProcessing || isImporting}
            className="cursor-pointer"
          />
        </label>

        <div className="flex gap-2">
          {allowedFormats.includes("csv") && (
            <Button variant="outline" size="sm" onClick={() => handleDownloadTemplate("csv")}>
              <FileText className="h-4 w-4 mr-1" />
              CSV
            </Button>
          )}
          {allowedFormats.includes("xlsx") && (
            <Button variant="outline" size="sm" onClick={() => handleDownloadTemplate("xlsx")}>
              <FileSpreadsheet className="h-4 w-4 mr-1" />
              Excel
            </Button>
          )}
        </div>
      </div>

      {(isProcessing || isImporting) && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground text-center">
            {isProcessing ? "Processando arquivo..." : "Importando dados..."}
          </p>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <Alert variant={result.errors.length > 0 ? "destructive" : "default"}>
            <div className="flex items-center gap-2">
              {result.errors.length === 0 ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription className="flex-1">
                <span className="font-medium">{result.success.length}</span> registros válidos
                {result.errors.length > 0 && (
                  <>
                    {" | "}
                    <span className="text-destructive font-medium">
                      {result.errors.length} erros
                    </span>
                  </>
                )}
              </AlertDescription>
              <div className="flex gap-2">
                {result.success.length > 0 && (
                  <Button variant="link" size="sm" onClick={() => setShowPreview(true)}>
                    Preview
                  </Button>
                )}
                {result.errors.length > 0 && (
                  <Button variant="link" size="sm" onClick={() => setShowErrors(true)}>
                    Ver erros
                  </Button>
                )}
              </div>
            </div>
          </Alert>

          <div className="flex gap-2">
            {result.success.length > 0 && (
              <Button onClick={handleImport} disabled={isImporting} className="flex-1">
                {isImporting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Upload className="h-4 w-4 mr-2" />
                Importar {result.success.length} Registros
              </Button>
            )}
            <Button variant="outline" onClick={handleReset}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Preview dos Dados ({result?.success.length} registros)</DialogTitle>
          </DialogHeader>
          {result && result.success.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(result.success[0] as object).map((key) => (
                    <TableHead key={key}>{key}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.success.slice(0, maxPreviewRows).map((row, i) => (
                  <TableRow key={i}>
                    {Object.values(row as object).map((val, j) => (
                      <TableCell key={j} className="max-w-[200px] truncate">
                        {String(val ?? "-")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {result && result.success.length > maxPreviewRows && (
            <p className="text-sm text-muted-foreground text-center">
              Mostrando {maxPreviewRows} de {result.success.length} registros
            </p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showErrors} onOpenChange={setShowErrors}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Erros de Validação ({result?.errors.length})</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {result?.errors.slice(0, 50).map((err, i) => (
              <div key={i} className="text-sm p-2 bg-destructive/10 rounded">
                <Badge variant="outline" className="mr-2">
                  Linha {err.row}
                </Badge>
                <span className="font-medium">{err.field}:</span> {err.error}
              </div>
            ))}
            {result && result.errors.length > 50 && (
              <p className="text-sm text-muted-foreground">
                + {result.errors.length - 50} erros adicionais
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
