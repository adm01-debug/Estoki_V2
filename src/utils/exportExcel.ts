import ExcelJS from 'exceljs';

interface ExportOptions {
  filename?: string;
  sheetName?: string;
}

export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  options: ExportOptions = {}
): void {
  const { filename = 'export', sheetName = 'Dados' } = options;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  if (!data.length) return;

  // Add headers
  const headers = Object.keys(data[0]);
  worksheet.addRow(headers);

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } };
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Add data rows
  data.forEach(row => {
    worksheet.addRow(headers.map(h => row[h] ?? ''));
  });

  // Auto-size columns
  headers.forEach((_, i) => {
    const col = worksheet.getColumn(i + 1);
    let maxLen = headers[i].length;
    data.forEach(row => {
      const val = String(row[headers[i]] ?? '');
      if (val.length > maxLen) maxLen = val.length;
    });
    col.width = Math.min(maxLen + 2, 50);
  });

  // Download
  workbook.xlsx.writeBuffer().then(buffer => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

export function exportMultipleSheetsToExcel(
  sheets: { data: Record<string, unknown>[]; name: string }[],
  filename: string = 'export'
): void {
  const workbook = new ExcelJS.Workbook();

  sheets.forEach(({ data, name }) => {
    if (data.length === 0) return;
    const worksheet = workbook.addWorksheet(name.substring(0, 31));
    const headers = Object.keys(data[0]);

    worksheet.addRow(headers);
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } };

    data.forEach(row => {
      worksheet.addRow(headers.map(h => row[h] ?? ''));
    });

    headers.forEach((_, i) => {
      const col = worksheet.getColumn(i + 1);
      let maxLen = headers[i].length;
      data.forEach(row => {
        const val = String(row[headers[i]] ?? '');
        if (val.length > maxLen) maxLen = val.length;
      });
      col.width = Math.min(maxLen + 2, 50);
    });
  });

  workbook.xlsx.writeBuffer().then(buffer => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  });
}