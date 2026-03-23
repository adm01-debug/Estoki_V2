// @ts-nocheck
/**
 * Hook de Exportação e Impressão
 * Suporta PDF, Excel, CSV, impressão
 */

import { useCallback, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { analytics, EventCategory, EventAction } from '@/config/analytics';

export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'print';

export interface ExportColumn {
  key: string;
  header: string;
  width?: number;
  format?: (value: any, row: any) => string;
}

export interface ExportOptions {
  filename?: string;
  title?: string;
  subtitle?: string;
  columns?: ExportColumn[];
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'a4' | 'letter' | 'legal';
  includeTimestamp?: boolean;
  customStyles?: {
    headerColor?: string;
    headerTextColor?: string;
    alternateRowColor?: string;
  };
}

export interface UseExportReturn {
  isExporting: boolean;
  exportToPDF: (data: any[], options?: ExportOptions) => Promise<void>;
  exportToExcel: (data: any[], options?: ExportOptions) => Promise<void>;
  exportToCSV: (data: any[], options?: ExportOptions) => void;
  exportToJSON: (data: any[], options?: ExportOptions) => void;
  print: (elementId: string) => void;
  export: (format: ExportFormat, data: any[], options?: ExportOptions) => Promise<void>;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
}

function getAutoColumns(data: any[]): ExportColumn[] {
  if (!data.length) return [];
  return Object.keys(data[0]).map(key => ({
    key,
    header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
  }));
}

export function useExport(): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = useCallback(async (data: any[], options: ExportOptions = {}) => {
    setIsExporting(true);
    try {
      const {
        filename = 'export', title = 'Relatório', subtitle, columns = getAutoColumns(data),
        orientation = 'portrait', pageSize = 'a4', includeTimestamp = true, customStyles = {},
      } = options;

      const doc = new jsPDF({ orientation, unit: 'mm', format: pageSize });
      doc.setFontSize(18);
      doc.text(title, 14, 22);
      if (subtitle) { doc.setFontSize(12); doc.setTextColor(100); doc.text(subtitle, 14, 30); }
      if (includeTimestamp) { doc.setFontSize(10); doc.setTextColor(150); doc.text(`Gerado em: ${formatDate(new Date())}`, 14, subtitle ? 38 : 30); }

      const headers = columns.map(col => col.header);
      const rows = data.map(row => columns.map(col => {
        const value = row[col.key];
        return col.format ? col.format(value, row) : String(value ?? '');
      }));

      autoTable(doc, {
        head: [headers], body: rows,
        startY: includeTimestamp ? (subtitle ? 45 : 37) : (subtitle ? 37 : 30),
        styles: { fontSize: 9 },
        headStyles: { fillColor: customStyles.headerColor || '#6366f1', textColor: customStyles.headerTextColor || '#ffffff' },
        alternateRowStyles: { fillColor: customStyles.alternateRowColor || '#f8fafc' },
        columnStyles: columns.reduce((acc, col, i) => { if (col.width) acc[i] = { cellWidth: col.width }; return acc; }, {} as Record<number, { cellWidth: number }>),
      });

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i); doc.setFontSize(8); doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }
      doc.save(`${filename}.pdf`);
      analytics.trackEvent(EventCategory.USER, EventAction.PAGE_VIEW, { label: 'export_pdf', value: data.length });
    } catch (error) {
      if (import.meta.env.DEV) console.error('[Export] PDF error:', error);
      throw error;
    } finally { setIsExporting(false); }
  }, []);

  const exportToExcel = useCallback(async (data: any[], options: ExportOptions = {}) => {
    setIsExporting(true);
    try {
      const { filename = 'export', title = 'Dados', columns = getAutoColumns(data) } = options;
      const headers = columns.map(col => col.header);
      const rows = data.map(row => columns.reduce((acc, col) => {
        const value = row[col.key];
        acc[col.header] = col.format ? col.format(value, row) : value;
        return acc;
      }, {} as Record<string, any>));

      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet(title.substring(0, 31));
      ws.addRow(headers);
      const headerRow = ws.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } };
      rows.forEach(row => ws.addRow(headers.map(h => row[h] ?? '')));

      headers.forEach((header, i) => {
        const col = ws.getColumn(i + 1);
        const colDef = columns[i];
        if (colDef.width) { col.width = colDef.width / 7; return; }
        let maxLen = header.length;
        rows.forEach(row => { const val = String(row[header] ?? ''); if (val.length > maxLen) maxLen = val.length; });
        col.width = Math.min(maxLen + 2, 50);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = `${filename}.xlsx`; link.click();
      URL.revokeObjectURL(url);

      analytics.trackEvent(EventCategory.USER, EventAction.PAGE_VIEW, { label: 'export_excel', value: data.length });
    } catch (error) {
      if (import.meta.env.DEV) console.error('[Export] Excel error:', error);
      throw error;
    } finally { setIsExporting(false); }
  }, []);

  const exportToCSV = useCallback((data: any[], options: ExportOptions = {}) => {
    const { filename = 'export', columns = getAutoColumns(data) } = options;
    const headers = columns.map(col => col.header);
    const rows = data.map(row => columns.map(col => {
      const value = row[col.key];
      const formatted = col.format ? col.format(value, row) : String(value ?? '');
      if (formatted.includes(',') || formatted.includes('"') || formatted.includes('\n')) return `"${formatted.replace(/"/g, '""')}"`;
      return formatted;
    }).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `${filename}.csv`; link.click();
    URL.revokeObjectURL(url);
  }, []);

  const exportToJSON = useCallback((data: any[], options: ExportOptions = {}) => {
    const { filename = 'export' } = options;
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `${filename}.json`; link.click();
    URL.revokeObjectURL(url);
  }, []);

  const print = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Imprimir</title><style>body{font-family:Arial,sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background-color:#f5f5f5}@media print{body{padding:0}}</style></head><body>${element.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.print();
  }, []);

  const exportData = useCallback(async (format: ExportFormat, data: any[], options?: ExportOptions) => {
    switch (format) {
      case 'pdf': await exportToPDF(data, options); break;
      case 'excel': await exportToExcel(data, options); break;
      case 'csv': exportToCSV(data, options); break;
      case 'json': exportToJSON(data, options); break;
      case 'print': print(options?.filename || 'print-content'); break;
    }
  }, [exportToPDF, exportToExcel, exportToCSV, exportToJSON, print]);

  return { isExporting, exportToPDF, exportToExcel, exportToCSV, exportToJSON, print, export: exportData };
}

export default useExport;