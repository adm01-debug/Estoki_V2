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

    if (window.navigator.vibrate) {
      window.navigator.vibrate([5, 10, 5]);
    }

    // Logic for returning: if we have history, use it.
    // If not, calculate the logical parent or fallback to dashboard
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      const parentRoute =
        segments.length > 1 ? "/" + segments.slice(0, -1).join("/") : "/dashboard";
      navigate(parentRoute);
    }
  }, [navigate, location.pathname]);

  const handleLogout = useCallback(async () => {
    await signOut();
    navigate("/auth");
  }, [signOut, navigate]);

  const handleNavigate = useCallback(
    (path: string, isMobile = false) => {
      if (location.pathname === path) {
        if (isMobile) setMobileMenuOpen(false);
        return;
      }
      navigate(path);
      if (isMobile) setMobileMenuOpen(false);
    },
    [navigate, location.pathname]
  );

  useEffect(() => {
    prefetchCriticalRoutes();
  }, []);

  useEffect(() => {
    // Notifications request permission should ideally be triggered by a user action
    // or after some time, not immediately on every mount of the layout.
    // Moved to a more appropriate place or handled via settings.
  }, [isSupported, permission]);

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
    handleNavigate,
  };
}
