import { useCallback } from 'react';
export function useFileDownload() {
  const download = useCallback((content: string | Blob, filename: string, mimeType = 'text/plain') => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);
  const downloadJSON = useCallback((data: unknown, filename: string) => download(JSON.stringify(data, null, 2), filename, 'application/json'), [download]);
  const downloadCSV = useCallback((data: string, filename: string) => download(data, filename, 'text/csv'), [download]);
  return { download, downloadJSON, downloadCSV };
}
