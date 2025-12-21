import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrintButtonProps {
  targetId: string;
  title?: string;
}

export function PrintButton({ targetId, title = "Imprimir" }: PrintButtonProps) {
  const handlePrint = () => {
    const content = document.getElementById(targetId);
    if (!content) return;
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head><title>${title}</title>
          <style>body { font-family: system-ui; padding: 20px; } @media print { body { padding: 0; } }</style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  return (
    <Button variant="outline" size="sm" onClick={handlePrint}>
      <Printer className="mr-2 h-4 w-4" />{title}
    </Button>
  );
}
