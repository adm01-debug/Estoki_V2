import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

export interface ExportColumn<T> {
  key: keyof T;
  header: string;
  width?: number;
  format?: (value: unknown) => string;
}

export function useExportData<T extends Record<string, unknown>>(options: { columns: ExportColumn<T>[]; fileName: string }) {
  const { columns, fileName } = options;
  const [isExporting, setIsExporting] = useState(false);

  const formatData = useCallback((data: T[]) => data.map(row => {
    const formatted: Record<string, unknown> = {};
    columns.forEach(col => { formatted[col.header] = col.format ? col.format(row[col.key]) : row[col.key]; });
    return formatted;
  }), [columns]);

  const exportCSV = useCallback((data: T[]) => {
    const formatted = formatData(data);
    const headers = columns.map(c => c.header);
    const csvContent = [headers.join(','), ...formatted.map(row => headers.map(h => { const v = row[h]; return typeof v === 'string' && (v.includes(',') || v.includes('"')) ? `"${v.replace(/"/g, '""')}"` : v ?? ''; }).join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    link.click();
  }, [columns, formatData, fileName]);

  const exportExcel = useCallback((data: T[]) => {
    const formatted = formatData(data);
    const ws = XLSX.utils.json_to_sheet(formatted);
    ws['!cols'] = columns.map(col => ({ wch: col.width ?? 15 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dados');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }, [columns, formatData, fileName]);

  const exportPDF = useCallback((data: T[], title?: string) => {
    const doc = new jsPDF({ orientation: data.length > 5 ? 'landscape' : 'portrait' });
    doc.setFontSize(16);
    doc.text(title ?? fileName, 14, 15);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 22);
    autoTable(doc, { head: [columns.map(c => c.header)], body: data.map(row => columns.map(col => col.format ? col.format(row[col.key]) : String(row[col.key] ?? ''))), startY: 30, styles: { fontSize: 9 }, headStyles: { fillColor: [59, 130, 246] } });
    doc.save(`${fileName}.pdf`);
  }, [columns, fileName]);

  const exportData = useCallback(async (data: T[], format: ExportFormat, opts?: { title?: string }) => {
    if (!data.length) { toast.error('Sem dados'); return; }
    setIsExporting(true);
    try {
      if (format === 'csv') exportCSV(data);
      else if (format === 'xlsx') exportExcel(data);
      else exportPDF(data, opts?.title);
      toast.success(`Exportado ${data.length} registros`);
    } catch (e) { toast.error(`Erro: ${e instanceof Error ? e.message : 'desconhecido'}`); }
    finally { setIsExporting(false); }
  }, [exportCSV, exportExcel, exportPDF]);

  return { exportData, exportCSV: (d: T[]) => exportData(d, 'csv'), exportExcel: (d: T[]) => exportData(d, 'xlsx'), exportPDF: (d: T[], t?: string) => exportData(d, 'pdf', { title: t }), isExporting };
}

export default useExportData;
