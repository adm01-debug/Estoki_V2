import React from "react";
import { cn } from "@/lib/utils";
interface PrintFooterProps {
  pageNumber?: number;
  totalPages?: number;
  text?: string;
  showPageNumbers?: boolean;
  className?: string;
}
export function PrintFooter({
  pageNumber,
  totalPages,
  text,
  showPageNumbers = true,
  className,
}: PrintFooterProps) {
  return (
    <footer
      className={cn(
        "mt-4 flex items-center justify-between border-t pt-4 text-sm text-muted-foreground print:border-black",
        className
      )}
    >
      <div>{text}</div>
      {showPageNumbers && pageNumber && (
        <div>
          Página {pageNumber}
          {totalPages && ` de ${totalPages}`}
        </div>
      )}
    </footer>
  );
}
