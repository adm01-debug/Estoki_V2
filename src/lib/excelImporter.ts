import ExcelJS from "exceljs";
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

  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const worksheet = opts.sheetName
    ? workbook.getWorksheet(opts.sheetName)
    : workbook.worksheets[opts.sheetIndex || 0];

  if (!worksheet) {
    throw new Error(`Planilha "${opts.sheetName || opts.sheetIndex}" não encontrada`);
  }

  // Extract headers from first row
  const headers: string[] = [];
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    headers[colNumber - 1] = String(cell.value ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
  });

  const success: T[] = [];
  const errors: { row: number; field: string; error: string }[] = [];
  const warnings: { row: number; message: string }[] = [];

  for (let i = 2; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    const rowObj: Record<string, unknown> = {};
    let hasData = false;

    headers.forEach((header, idx) => {
      if (!header) return;
      let value = row.getCell(idx + 1).value;
      if (opts.trimValues && typeof value === "string") value = value.trim();
      if (value !== null && value !== undefined && value !== "") hasData = true;
      rowObj[header] = value;
    });

    if (!hasData) continue;

    try {
      const validated = schema.parse(rowObj);
      success.push(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          errors.push({ row: i + 1, field: err.path.join("."), error: err.message });
        });
      }
    }
  }

  return { success, errors, total: worksheet.rowCount - 1, warnings };
}

export function getExcelSheets(file: File): Promise<string[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      resolve(workbook.worksheets.map(ws => ws.name));
    } catch (error) {
      reject(error);
    }
  });
}

export async function downloadExcel(data: Record<string, unknown>[], filename: string, sheetName = "Dados"): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  if (!data.length) return;

  const headers = Object.keys(data[0]);
  worksheet.addRow(headers);
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };

  data.forEach(row => worksheet.addRow(headers.map(h => row[h] ?? '')));

  headers.forEach((key, i) => {
    worksheet.getColumn(i + 1).width = Math.max(key.length, 15);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}.xlsx`; a.click();
  URL.revokeObjectURL(url);
}

export async function generateExcelTemplate(
  headers: string[],
  filename: string,
  exampleData?: Record<string, unknown>[]
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Template");

  worksheet.addRow(headers);
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };

  if (exampleData) {
    exampleData.forEach(row => {
      worksheet.addRow(headers.map(h => row[h] ?? ''));
    });
  }

  headers.forEach((h, i) => {
    worksheet.getColumn(i + 1).width = Math.max(h.length + 5, 15);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}_template.xlsx`; a.click();
  URL.revokeObjectURL(url);
}