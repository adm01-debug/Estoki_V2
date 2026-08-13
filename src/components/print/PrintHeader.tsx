import React from "react";
import { cn } from "@/lib/utils";
interface PrintHeaderProps {
  title?: string;
  subtitle?: string;
  logo?: string;
  companyName?: string;
  date?: Date;
  className?: string;
}
export function PrintHeader({
  title,
  subtitle,
  logo,
  companyName,
  date = new Date(),
  className,
}: PrintHeaderProps) {
  return (
    <header
      className={cn(
        "mb-4 flex items-start justify-between border-b pb-4 print:border-black",
        className
      )}
    >
      <div className="flex items-center gap-4">
        {logo && <img src={logo} alt="Logo" className="h-12 w-auto" />}
        <div>
          {companyName && <p className="text-lg font-bold">{companyName}</p>}
          {title && <h1 className="text-xl font-bold">{title}</h1>}
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="text-right text-sm text-muted-foreground">
        <p>{date.toLocaleDateString("pt-BR")}</p>
        <p>{date.toLocaleTimeString("pt-BR")}</p>
      </div>
    </header>
  );
}
