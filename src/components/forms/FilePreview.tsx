import React from 'react';
import { File, Image, FileText, FileSpreadsheet, FileVideo, FileAudio, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface FilePreviewProps { file: File | { name: string; type: string; url: string; size?: number }; showDownload?: boolean; }
export function FilePreview({ file, showDownload = true }: FilePreviewProps) {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const isAudio = file.type.startsWith('audio/');
  const isPdf = file.type === 'application/pdf';
  const isSpreadsheet = file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.csv');
  const url = 'url' in file ? file.url : URL.createObjectURL(file as File);
  const getIcon = () => {
    if (isImage) return <Image className="h-12 w-12" />;
    if (isVideo) return <FileVideo className="h-12 w-12" />;
    if (isAudio) return <FileAudio className="h-12 w-12" />;
    if (isPdf) return <FileText className="h-12 w-12" />;
    if (isSpreadsheet) return <FileSpreadsheet className="h-12 w-12" />;
    return <File className="h-12 w-12" />;
  };
  return (
    <div className="border rounded-lg p-4">
      {isImage ? <img src={url} alt={file.name} className="max-h-48 mx-auto rounded" /> : <div className="flex justify-center text-muted-foreground py-8">{getIcon()}</div>}
      <div className="mt-2 text-center"><p className="text-sm font-medium truncate">{file.name}</p>{'size' in file && file.size && <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>}</div>
      {showDownload && <div className="mt-2 flex justify-center"><Button variant="outline" size="sm" asChild><a href={url} download={file.name}><Download className="h-4 w-4 mr-2" />Download</a></Button></div>}
    </div>
  );
}
