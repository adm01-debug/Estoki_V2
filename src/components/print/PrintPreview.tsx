import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download, X } from "lucide-react";
import { cn } from "@/lib/utils";
interface PrintPreviewProps {
  children: React.ReactNode;
  title?: string;
  onPrint?: () => void;
  onDownload?: () => void;
  onClose?: () => void;
  className?: string;
}
export function PrintPreview({
  children,
  title,
  onPrint,
  onDownload,
  onClose,
  className,
}: PrintPreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col bg-background/80 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-center justify-between border-b bg-background p-4">
        <h2 className="text-lg font-semibold">{title || "Visualização de Impressão"}</h2>
        <div className="flex gap-2">
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          {onDownload && (
            <Button variant="outline" onClick={onDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-muted p-8">
        <div ref={contentRef} className="mx-auto bg-white shadow-lg print:shadow-none">
          {children}
        </div>
      </div>
    </div>
  );
}
