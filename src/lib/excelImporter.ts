import * as XLSX from "xlsx";
import { z } from "zod";
import { ImportResult } from "./csvImporter";

export interface ExcelImportOptions {
  sheetName?: string;
  sheetIndex?: number;
  headerRow?: number;
  startRow?: number;
  trimValues?: boolean;
}

const defaultOptions: ExcelImportOptions = {
  sheetIndex: 0,
  headerRow: 1,
  startRow: 2,
  trimValues: true,
};

export async function importExcel<T>(
  file: File,
  schema: z.ZodSchema<T>,
  options?: ExcelImportOptions
): Promise<ImportResult<T>> {
  const opts = { ...defaultOptions, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });

        const sheetName = opts.sheetName || workbook.SheetNames[opts.sheetIndex || 0];
        const sheet = workbook.Sheets[sheetName];

        if (!sheet) {
          reject(new Error(`Planilha "${sheetName}" não encontrada`));
          return;
        }

        const jsonData = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          raw: false,
          dateNF: "yyyy-mm-dd",
        }) as any[][];

        const headers = (jsonData[0] || []).map((h: any) =>
          String(h || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_")
        );

        const success: T[] = [];
        const errors: { row: number; field: string; error: string }[] = [];
        const warnings: { row: number; message: string }[] = [];

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          const rowNumber = i + 1;

          if (!row || row.every((cell) => cell === null || cell === undefined || cell === "")) {
            continue;
          }

          const rowObj: Record<string, any> = {};
          headers.forEach((header, index) => {
            if (header) {
              let value = row[index];
              if (opts.trimValues && typeof value === "string") {
                value = value.trim();
              }
              rowObj[header] = value;
            }
          });

          try {
            const validated = schema.parse(rowObj);
            success.push(validated);
          } catch (error) {
            if (error instanceof z.ZodError) {
              error.errors.forEach((err) => {
                errors.push({
                  row: rowNumber,
                  field: err.path.join("."),
                  error: err.message,
                });
              });
            }
          }
        }

        resolve({
          success,
          errors,
          total: jsonData.length - 1,
          warnings,
        });
      } catch (error) {
        reject(new Error(`Erro ao processar Excel: ${(error as Error).message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error("Erro ao ler arquivo"));
    };

    reader.readAsArrayBuffer(file);
  });
}

export function getExcelSheets(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        resolve(workbook.SheetNames);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function downloadExcel(data: any[], filename: string, sheetName = "Dados"): void {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const colWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(key.length, 15),
  }));
  worksheet["!cols"] = colWidths;

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function generateExcelTemplate(
  headers: string[],
  filename: string,
  exampleData?: Record<string, any>[]
): void {
  const worksheet = XLSX.utils.aoa_to_sheet([headers]);

  if (exampleData && exampleData.length > 0) {
    XLSX.utils.sheet_add_json(worksheet, exampleData, {
      skipHeader: true,
      origin: "A2",
    });
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

  worksheet["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 5, 15) }));

  XLSX.writeFile(workbook, `${filename}_template.xlsx`);
}
