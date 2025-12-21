import { createContext, useContext, useState, useCallback } from "react";

interface Toast { id: string; message: string; type: "success" | "error" | "info" | "warning"; }

interface ToastContextType { toasts: Toast[]; addToast: (message: string, type?: Toast["type"]) => void; removeToast: (id: string) => void; }

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(toast => toast.id !== id)), 5000);
  }, []);

  const removeToast = useCallback((id: string) => setToasts(t => t.filter(toast => toast.id !== id)), []);

  return <ToastContext.Provider value={{ toasts, addToast, removeToast }}>{children}</ToastContext.Provider>;
}

export const useToast = () => { const ctx = useContext(ToastContext); if (!ctx) throw new Error("useToast must be used within ToastProvider"); return ctx; };
