import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { downloadCSV } from "@/lib/csvImporter";
import { downloadExcel } from "@/lib/excelImporter";
import { toast } from "sonner";

type ExportFormat = "csv" | "xlsx" | "json" | "pdf";

interface ExportOptions<T> {
  table: string;
  filename: string;
  columns?: Array<{
    key: keyof T;
    header: string;
    transform?: (value: unknown, row: T) => string;
  }>;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  onProgress?: (progress: number) => void;
}

interface UseExportResult {
  exportData: (format: ExportFormat) => Promise<void>;
  exportSelected: (ids: string[], format: ExportFormat) => Promise<void>;
  isExporting: boolean;
  progress: number;
  error: Error | null;
}

export function useExport<T extends Record<string, any>>(
  options: ExportOptions<T>
): UseExportResult {
  const {
    table,
    filename,
    columns,
    filters = {},
    orderBy = { column: "created_at", ascending: false },
    limit = 10000,
    onProgress,
  } = options;

  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const updateProgress = useCallback(
    (value: number) => {
      setProgress(value);
      onProgress?.(value);
    },
    [onProgress]
  );

  const fetchData = useCallback(
    async (ids?: string[]): Promise<T[]> => {
      const pageSize = 500;
      let allData: T[] = [];
      let page = 0;
      let hasMore = true;

      while (hasMore) {
        let query = (supabase
          .from(table as any) as any)
          .select("*")
          .order(orderBy.column, { ascending: orderBy.ascending })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (ids && ids.length > 0) {
          query = query.in("id", ids);
        }

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            query = query.eq(key, value);
          }
        });

        const { data, error } = await query;

        if (error) throw error;

        if (data.length === 0) {
          hasMore = false;
        } else {
          allData = [...allData, ...(data as unknown as T[])];
          page++;
          updateProgress(Math.min(50, (allData.length / limit) * 50));

          if (allData.length >= limit || data.length < pageSize) {
            hasMore = false;
          }
        }
      }

      return allData;
    },
    [table, filters, orderBy, limit, updateProgress]
  );

  const transformData = useCallback(
    (data: T[]): Record<string, any>[] => {
      if (!columns) return data;

      return data.map((row) => {
        const transformed: Record<string, any> = {};
        columns.forEach((col) => {
          const value = row[col.key];
          transformed[col.header] = col.transform
            ? col.transform(value, row)
            : value;
        });
        return transformed;
      });
    },
    [columns]
  );

  const exportToFormat = useCallback(
    async (data: Record<string, any>[], format: ExportFormat) => {
      updateProgress(75);

      const headers = columns?.map((c) => c.header);

      switch (format) {
        case "csv":
          downloadCSV(data, filename, headers);
          break;
        case "xlsx":
          downloadExcel(data, filename);
          break;
        case "json": {
          const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
          });
          const jsonUrl = URL.createObjectURL(jsonBlob);
          const jsonLink = document.createElement("a");
          jsonLink.href = jsonUrl;
          jsonLink.download = `${filename}.json`;
          jsonLink.click();
          URL.revokeObjectURL(jsonUrl);
          break;
        }
        case "pdf":
          toast.info("Exportação PDF em desenvolvimento");
          break;
      }

      updateProgress(100);
    },
    [columns, filename, updateProgress]
  );

  const exportData = useCallback(
    async (format: ExportFormat) => {
      setIsExporting(true);
      setError(null);
      updateProgress(0);

      try {
        const data = await fetchData();
        updateProgress(50);

        const transformed = transformData(data);
        await exportToFormat(transformed, format);

        toast.success(`${data.length} registros exportados!`);
      } catch (err) {
        const exportError = err as Error;
        setError(exportError);
        toast.error(`Erro ao exportar: ${exportError.message}`);
      } finally {
        setIsExporting(false);
        setTimeout(() => updateProgress(0), 1000);
      }
    },
    [fetchData, transformData, exportToFormat, updateProgress]
  );

  const exportSelected = useCallback(
    async (ids: string[], format: ExportFormat) => {
      if (ids.length === 0) {
        toast.warning("Nenhum registro selecionado");
        return;
      }

      setIsExporting(true);
      setError(null);
      updateProgress(0);

      try {
        const data = await fetchData(ids);
        updateProgress(50);

        const transformed = transformData(data);
        await exportToFormat(transformed, format);

        toast.success(`${data.length} registros exportados!`);
      } catch (err) {
        const exportError = err as Error;
        setError(exportError);
        toast.error(`Erro ao exportar: ${exportError.message}`);
      } finally {
        setIsExporting(false);
        setTimeout(() => updateProgress(0), 1000);
      }
    },
    [fetchData, transformData, exportToFormat, updateProgress]
  );

  return {
    exportData,
    exportSelected,
    isExporting,
    progress,
    error,
  };
}
