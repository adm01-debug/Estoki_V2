import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface AppState {
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  notifications: Notification[];
}

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
}

interface AppContextType extends AppState {
  toggleSidebar: () => void;
  setTheme: (theme: AppState["theme"]) => void;
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    sidebarOpen: true,
    theme: "system",
    notifications: [],
  });

  const toggleSidebar = useCallback(() => setState(s => ({ ...s, sidebarOpen: !s.sidebarOpen })), []);
  const setTheme = useCallback((theme: AppState["theme"]) => setState(s => ({ ...s, theme })), []);
  const addNotification = useCallback((notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setState(s => ({ ...s, notifications: [...s.notifications, { ...notification, id }] }));
  }, []);
  const removeNotification = useCallback((id: string) => {
    setState(s => ({ ...s, notifications: s.notifications.filter(n => n.id !== id) }));
  }, []);

  return (
    <AppContext.Provider value={{ ...state, toggleSidebar, setTheme, addNotification, removeNotification }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
