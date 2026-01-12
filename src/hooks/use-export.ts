/**
 * Hook de Exportação e Impressão
 * Suporta PDF, Excel, CSV, impressão
 */

import { useCallback, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
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

// Helper para formatar data
function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
}

// Helper para obter colunas automáticas
function getAutoColumns(data: any[]): ExportColumn[] {
  if (!data.length) return [];
  
  return Object.keys(data[0]).map(key => ({
    key,
    header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
  }));
}

// Hook principal
export function useExport(): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false);

  // Exportar para PDF
  const exportToPDF = useCallback(async (data: any[], options: ExportOptions = {}) => {
    setIsExporting(true);
    
    try {
      const {
        filename = 'export',
        title = 'Relatório',
        subtitle,
        columns = getAutoColumns(data),
        orientation = 'portrait',
        pageSize = 'a4',
        includeTimestamp = true,
        customStyles = {},
      } = options;

      const doc = new jsPDF({
        orientation,
        unit: 'mm',
        format: pageSize,
      });

      // Título
      doc.setFontSize(18);
      doc.text(title, 14, 22);

      // Subtítulo
      if (subtitle) {
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(subtitle, 14, 30);
      }

      // Timestamp
      if (includeTimestamp) {
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Gerado em: ${formatDate(new Date())}`, 14, subtitle ? 38 : 30);
      }

      // Preparar dados
      const headers = columns.map(col => col.header);
      const rows = data.map(row =>
        columns.map(col => {
          const value = row[col.key];
          return col.format ? col.format(value, row) : String(value ?? '');
        })
      );

      // Tabela
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: includeTimestamp ? (subtitle ? 45 : 37) : (subtitle ? 37 : 30),
        styles: { fontSize: 9 },
        headStyles: {
          fillColor: customStyles.headerColor || '#6366f1',
          textColor: customStyles.headerTextColor || '#ffffff',
        },
        alternateRowStyles: {
          fillColor: customStyles.alternateRowColor || '#f8fafc',
        },
        columnStyles: columns.reduce((acc, col, i) => {
          if (col.width) acc[i] = { cellWidth: col.width };
          return acc;
        }, {} as Record<number, { cellWidth: number }>),
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Download
      doc.save(`${filename}.pdf`);

      analytics.trackEvent(EventCategory.USER, EventAction.PAGE_VIEW, {
        label: 'export_pdf',
        value: data.length,
      });
    } catch (error) {
      console.error('[Export] PDF error:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, []);

  // Exportar para Excel
  const exportToExcel = useCallback(async (data: any[], options: ExportOptions = {}) => {
    setIsExporting(true);

    try {
      const {
        filename = 'export',
        title = 'Dados',
        columns = getAutoColumns(data),
      } = options;

      // Preparar dados
      const headers = columns.map(col => col.header);
      const rows = data.map(row =>
        columns.reduce((acc, col) => {
          const value = row[col.key];
          acc[col.header] = col.format ? col.format(value, row) : value;
          return acc;
        }, {} as Record<string, any>)
      );

      // Criar workbook
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31));

      // Auto-size columns
      const colWidths = headers.map((header, i) => {
        const column = columns[i];
        if (column.width) return { wch: column.width / 7 };
        
        const maxLength = Math.max(
          header.length,
          ...rows.map(row => String(row[header] ?? '').length)
        );
        return { wch: Math.min(maxLength + 2, 50) };
      });
      ws['!cols'] = colWidths;

      // Download
      XLSX.writeFile(wb, `${filename}.xlsx`);

      analytics.trackEvent(EventCategory.USER, EventAction.PAGE_VIEW, {
        label: 'export_excel',
        value: data.length,
      });
    } catch (error) {
      console.error('[Export] Excel error:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, []);

  // Exportar para CSV
  const exportToCSV = useCallback((data: any[], options: ExportOptions = {}) => {
    const {
      filename = 'export',
      columns = getAutoColumns(data),
    } = options;

    const headers = columns.map(col => col.header);
    const rows = data.map(row =>
      columns.map(col => {
        const value = row[col.key];
        const formatted = col.format ? col.format(value, row) : String(value ?? '');
        // Escape quotes and wrap in quotes if contains comma
        if (formatted.includes(',') || formatted.includes('"') || formatted.includes('\n')) {
          return `"${formatted.replace(/"/g, '""')}"`;
        }
        return formatted;
      }).join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    
    URL.revokeObjectURL(url);
  }, []);

  // Exportar para JSON
  const exportToJSON = useCallback((data: any[], options: ExportOptions = {}) => {
    const { filename = 'export' } = options;

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }, []);

  // Imprimir
  const print = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Imprimir</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>${element.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }, []);

  // Export genérico
  const exportData = useCallback(async (
    format: ExportFormat,
    data: any[],
    options?: ExportOptions
  ) => {
    switch (format) {
      case 'pdf':
        await exportToPDF(data, options);
        break;
      case 'excel':
        await exportToExcel(data, options);
        break;
      case 'csv':
        exportToCSV(data, options);
        break;
      case 'json':
        exportToJSON(data, options);
        break;
      case 'print':
        print(options?.filename || 'print-content');
        break;
    }
  }, [exportToPDF, exportToExcel, exportToCSV, exportToJSON, print]);

  return {
    isExporting,
    exportToPDF,
    exportToExcel,
    exportToCSV,
    exportToJSON,
    print,
    export: exportData,
  };
}

export default useExport;
