import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const isPreviewOrDev = import.meta.env.DEV || /lovable/.test(window.location.hostname) || window.self !== window.top;

export function UpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Never attach to service worker in preview/dev/iframe — it can hang
    if (isPreviewOrDev) return;
    if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller) return;

    // Use a timeout to prevent hanging if ready never resolves
    const timeout = setTimeout(() => {}, 5000);

    navigator.serviceWorker.ready
      .then((reg) => {
        clearTimeout(timeout);
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          newWorker?.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setShowUpdate(true);
              setRegistration(reg);
            }
          });
        });
      })
      .catch(() => {
        clearTimeout(timeout);
      });

    return () => clearTimeout(timeout);
  }, []);

  const handleUpdate = () => {
    registration?.waiting?.postMessage({ type: "SKIP_WAITING" });
    window.location.reload();
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-primary text-primary-foreground rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center gap-3">
        <RefreshCw className="h-5 w-5 shrink-0" />
        <div className="flex-1">
          <p className="font-medium">Nova versão disponível</p>
          <p className="text-sm opacity-90">Atualize para obter as últimas melhorias</p>
        </div>
        <Button size="sm" variant="secondary" onClick={handleUpdate}>Atualizar</Button>
      </div>
    </div>
  );
}
