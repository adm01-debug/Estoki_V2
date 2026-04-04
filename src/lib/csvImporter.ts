import { z } from "zod";

export interface ImportResult<T> {
  success: T[];
  errors: { row: number; field: string; error: string }[];
  total: number;
  warnings: { row: number; message: string }[];
}

export interface ImportOptions {
  skipFirstRow?: boolean;
  delimiter?: string;
  encoding?: string;
  trimValues?: boolean;
  skipEmptyRows?: boolean;
}

const defaultOptions: ImportOptions = {
  skipFirstRow: false,
  delimiter: ",",
  encoding: "UTF-8",
  trimValues: true,
  skipEmptyRows: true,
};

export async function importCSV<T>(
  file: File,
  schema: z.ZodSchema<T>,
  options?: ImportOptions
): Promise<ImportResult<T>> {
  const opts = { ...defaultOptions, ...options };
  const Papa = (await import('papaparse')).default;

  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: opts.skipEmptyRows,
      delimiter: opts.delimiter,
      encoding: opts.encoding,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, "_"),
      transform: (value) => (opts.trimValues ? value.trim() : value),
      complete: (results) => {
        const success: T[] = [];
        const errors: { row: number; field: string; error: string }[] = [];
        const warnings: { row: number; message: string }[] = [];

        if (results.errors.length > 0) {
          results.errors.forEach((err) => {
            warnings.push({ row: err.row || 0, message: err.message });
          });
        }

        results.data.forEach((row: Record<string, string>, index: number) => {
          const rowNumber = index + 2;
          if (Object.values(row).every((v) => v === "" || v === null)) return;

          try {
            const validated = schema.parse(row);
            success.push(validated);
          } catch (error) {
            if (error instanceof z.ZodError) {
              error.errors.forEach((err) => {
                errors.push({ row: rowNumber, field: err.path.join("."), error: err.message });
              });
            }
          }
        });

        resolve({ success, errors, total: results.data.length, warnings });
      },
      error: (error) => {
        reject(new Error(`Erro ao processar CSV: ${error.message}`));
      },
    });
  });
}

export function generateCSVTemplate(headers: string[]): string {
  return headers.join(",") + "\n";
}

export async function downloadCSV(data: Record<string, unknown>[], filename: string, headers?: string[]): Promise<void> {
  const Papa = (await import('papaparse')).default;
  const csv = Papa.unparse(data, { columns: headers, header: true });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function validateCSVHeaders(
  file: File,
  requiredHeaders: string[]
): Promise<{ valid: boolean; missing: string[]; extra: string[] }> {
  const Papa = (await import('papaparse')).default;
  return new Promise((resolve) => {
    Papa.parse(file, {
      preview: 1,
      complete: (results) => {
        const headers = (results.data[0] as string[]).map((h) =>
          h.trim().toLowerCase().replace(/\s+/g, "_")
        );
        const normalizedRequired = requiredHeaders.map((h) =>
          h.trim().toLowerCase().replace(/\s+/g, "_")
        );
        const missing = normalizedRequired.filter((h) => !headers.includes(h));
        const extra = headers.filter((h) => !normalizedRequired.includes(h));
        resolve({ valid: missing.length === 0, missing, extra });
      },
    });
  });
}
