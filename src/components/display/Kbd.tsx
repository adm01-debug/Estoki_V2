import React from "react";
import { cn } from "@/lib/utils";
interface KbdProps {
  children: React.ReactNode;
  className?: string;
}
export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd className={cn("rounded border bg-muted px-2 py-1 font-mono text-xs shadow-sm", className)}>
      {children}
    </kbd>
  );
}
