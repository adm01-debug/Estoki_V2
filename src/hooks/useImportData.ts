import { useState, useCallback } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';

export interface ImportResult<T> {
  success: T[];
  errors: ImportError[];
  total: number;
  fileName: string;
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value?: unknown;
}

export type ImportStatus = 'idle' | 'parsing' | 'validating' | 'importing' | 'complete' | 'error';

interface UseImportDataOptions<T> {
  schema: z.ZodSchema<T>;
  onImport: (data: T[]) => Promise<void>;
  maxRows?: number;
  skipFirstRow?: boolean;
}

export function useImportData<T>(options: UseImportDataOptions<T>) {
  const { schema, onImport, maxRows = 10000, skipFirstRow = false } = options;
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult<T> | null>(null);

  const parseCSV = useCallback(async (file: File): Promise<unknown[]> => {
    const Papa = (await import('papaparse')).default;
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
        complete: (results) => {
          if (skipFirstRow && results.data.length > 0) results.data.shift();
          resolve(results.data);
        },
        error: (error) => reject(error),
      });
    });
  }, [skipFirstRow]);

  const parseExcel = useCallback(async (file: File): Promise<unknown[]> => {
    const ExcelJS = (await import('exceljs')).default;
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet || worksheet.rowCount === 0) return [];

    const headers: string[] = [];
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber - 1] = String(cell.value ?? '').trim().toLowerCase().replace(/\s+/g, '_');
    });

    const rows: Record<string, unknown>[] = [];
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const rowObj: Record<string, unknown> = {};
      let hasData = false;
      headers.forEach((header, idx) => {
        if (!header) return;
        let value = row.getCell(idx + 1).value;
        if (typeof value === 'string') value = value.trim();
        if (value !== null && value !== undefined && value !== '') hasData = true;
        rowObj[header] = value;
      });
      if (hasData) rows.push(rowObj);
    }

    if (skipFirstRow && rows.length > 0) rows.shift();
    return rows;
  }, [skipFirstRow]);

  const validateData = useCallback((data: unknown[]): ImportResult<T> => {
    const success: T[] = [];
    const errors: ImportError[] = [];
    data.slice(0, maxRows).forEach((row, index) => {
      try {
        success.push(schema.parse(row));
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            errors.push({ row: index + 2, field: err.path.join('.'), message: err.message, value: (row as Record<string, unknown>)[err.path[0] as string] });
          });
        }
      }
    });
    return { success, errors, total: data.length, fileName: '' };
  }, [schema, maxRows]);

  const processFile = useCallback(async (file: File) => {
    setStatus('parsing'); setProgress(10); setResult(null);
    try {
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      const data = isExcel ? await parseExcel(file) : await parseCSV(file);
      setStatus('validating'); setProgress(40);
      const validationResult = validateData(data);
      validationResult.fileName = file.name;
      setResult(validationResult); setProgress(60); setStatus('complete');
      if (validationResult.errors.length > 0) toast.warning(`${validationResult.success.length} válidos, ${validationResult.errors.length} com erros`);
      else toast.success(`${validationResult.success.length} registros prontos para importar`);
    } catch (error) {
      setStatus('error');
      toast.error(`Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }, [parseCSV, parseExcel, validateData]);

  const confirmImport = useCallback(async () => {
    if (!result || result.success.length === 0) { toast.error('Nenhum dado válido para importar'); return; }
    setStatus('importing'); setProgress(70);
    try {
      await onImport(result.success); setProgress(100);
      toast.success(`${result.success.length} registros importados com sucesso!`);
      setTimeout(() => { setStatus('idle'); setResult(null); setProgress(0); }, 2000);
    } catch (error) {
      setStatus('error');
      toast.error(`Erro ao importar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }, [result, onImport]);

  const reset = useCallback(() => { setStatus('idle'); setProgress(0); setResult(null); }, []);

  return { status, progress, result, processFile, confirmImport, reset, isProcessing: status === 'parsing' || status === 'validating' || status === 'importing' };
}

export default useImportData;
