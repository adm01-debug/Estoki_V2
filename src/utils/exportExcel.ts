import * as XLSX from 'xlsx';

interface ExportOptions {
  filename?: string;
  sheetName?: string;
}

export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  options: ExportOptions = {}
): void {
  const { filename = 'export', sheetName = 'Dados' } = options;

  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto-size columns
  const columnWidths = Object.keys(data[0] || {}).map((key) => {
    const maxLength = Math.max(
      key.length,
      ...data.map((row) => String(row[key] ?? '').length)
    );
    return { wch: Math.min(maxLength + 2, 50) };
  });
  worksheet['!cols'] = columnWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate and download file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportMultipleSheetsToExcel(
  sheets: { data: Record<string, unknown>[]; name: string }[],
  filename: string = 'export'
): void {
  const workbook = XLSX.utils.book_new();

  sheets.forEach(({ data, name }) => {
    if (data.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(data);

    // Auto-size columns
    const columnWidths = Object.keys(data[0] || {}).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...data.map((row) => String(row[key] ?? '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, name.substring(0, 31));
  });

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
