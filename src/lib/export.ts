const BOM = "\ufeff";

export function objectsToCSV<T extends Record<string, unknown>>(data: T[]): string {
  if (!data.length) return "";
  const headers = Object.keys(data[0]);
  return rowsToCSV(
    headers,
    data.map((row) => headers.map((h) => row[h]))
  );
}

export function exportToCSV<T extends Record<string, unknown>>(data: T[], filename: string): void {
  const csv = objectsToCSV(data);
  if (!csv) return;
  downloadFile(BOM + csv, `${filename}.csv`, "text/csv;charset=utf-8;");
}

function csvCell(valor: unknown): string {
  const texto = String(valor ?? "");
  const protegido = /^[=+\-@\t\r]/.test(texto) ? `'${texto}` : texto;
  return /[",\n\r;]/.test(protegido) ? `"${protegido.replace(/"/g, '""')}"` : protegido;
}

export function rowsToCSV(headers: string[], rows: unknown[][]): string {
  return [headers, ...rows].map((linha) => linha.map(csvCell).join(",")).join("\n");
}

export function exportRowsToCSV(headers: string[], rows: unknown[][], filename: string): void {
  if (!rows.length) return;
  downloadFile(BOM + rowsToCSV(headers, rows), `${filename}.csv`, "text/csv;charset=utf-8;");
}

export function exportToJSON<T>(data: T[], filename: string): void {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `${filename}.json`, "application/json");
}

function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function printContent(elementId: string): void {
  const content = document.getElementById(elementId);
  if (!content) return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write("<html><head><title>Print</title></head><body>");
  printWindow.document.write(content.innerHTML);
  printWindow.document.write("</body></html>");
  printWindow.document.close();
  printWindow.print();
}
