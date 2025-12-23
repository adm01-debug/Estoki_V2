import { useCallback } from 'react';
import { useToast } from './use-toast';

export function useExport() {
  const { toast } = useToast();

  const exportToCSV = useCallback((data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    toast({ title: 'Exportado!', description: `${filename}.csv` });
  }, [toast]);

  const exportToJSON = useCallback((data: any, filename: string) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    toast({ title: 'Exportado!', description: `${filename}.json` });
  }, [toast]);

  return { exportToCSV, exportToJSON };
}
