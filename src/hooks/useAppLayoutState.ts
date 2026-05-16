import { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { prefetchCriticalRoutes } from "@/lib/prefetch";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export function useAppLayoutState() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { permission, isSupported, requestPermission } = usePushNotifications();

   const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
     const saved = localStorage.getItem("sidebar_collapsed");
     return saved === "true";
   });
   useEffect(() => {
     localStorage.setItem("sidebar_collapsed", String(sidebarCollapsed));
   }, [sidebarCollapsed]);
 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  const isHome = location.pathname === "/";

   const handleBack = useCallback(() => {
     const segments = location.pathname.split("/").filter(Boolean);
     const parentRoute = segments.length > 1 ? "/" + segments.slice(0, -1).join("/") : "/";
     
     if (window.navigator.vibrate) {
       window.navigator.vibrate(5);
     }
     
     if (window.history.length > 2) navigate(-1);
     else navigate(parentRoute);
   }, [navigate, location.pathname]);

  const handleLogout = useCallback(async () => {
    await signOut();
    navigate('/auth');
  }, [signOut, navigate]);

  const handleNavigate = useCallback((path: string, isMobile = false) => {
    if (location.pathname === path) {
      if (isMobile) setMobileMenuOpen(false);
      return;
    }
    navigate(path);
    if (isMobile) setMobileMenuOpen(false);
  }, [navigate, location.pathname]);

  useEffect(() => {
    prefetchCriticalRoutes();
  }, []);

  useEffect(() => {
    if (isSupported && permission === "default") {
      requestPermission();
    }
  }, [isSupported, permission, requestPermission]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "ArrowLeft" && !isHome) {
        e.preventDefault();
        handleBack();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleBack, isHome]);

  return {
    location,
    navigate,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
    fabOpen,
    setFabOpen,
    isHome,
    handleBack,
    handleLogout,
    handleNavigate
  };
}