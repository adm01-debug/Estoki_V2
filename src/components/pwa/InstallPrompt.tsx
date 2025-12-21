import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShowPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-card border rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start gap-3">
        <Download className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium">Instalar ESTOKI</p>
          <p className="text-sm text-muted-foreground">Acesse mais rápido e funcione offline</p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleInstall}>Instalar</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowPrompt(false)}><X className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
