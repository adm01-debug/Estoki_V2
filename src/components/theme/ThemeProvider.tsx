import { ReactNode } from "react";
import { ThemeProvider as ContextThemeProvider } from "@/contexts/ThemeContext";

interface ThemeProviderProps {
  children: ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  storageKey?: string;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return <ContextThemeProvider>{children}</ContextThemeProvider>;
}
