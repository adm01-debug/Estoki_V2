import { useState } from "react";
import { QRScanner } from "@/components/scanner/QRScanner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Search, Package, ArrowRight } from "lucide-react";
import { useScanner } from "@/hooks/useScanner";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { haptics } from "@/utils/haptics";
import { motion, AnimatePresence } from "framer-motion";

export function QuickScanner() {
  const [open, setOpen] = useState(false);
  const { processQRCode, isLoading, lastResult, clearLastResult } = useScanner();
  const navigate = useNavigate();

  const handleScan = async (data: string) => {
    haptics.success();
    const result = await processQRCode(data);
    if (result) {
      toast.success("QR Code identificado!", {
        description: `${result.tipo.toUpperCase()}: ${result.produto}`,
      });
    }
  };

  const handleNavigate = () => {
    if (lastResult) {
      setOpen(false);
      haptics.medium();
      navigate(`/triagem/${lastResult.id}`);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) clearLastResult();
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground/50 transition-colors hover:text-primary"
          onClick={() => haptics.light()}
        >
          <QrCode className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Scanner Rápido
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <AnimatePresence mode="wait">
            {!lastResult ? (
              <motion.div
                key="scanner"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <QRScanner onScan={handleScan} className="w-full" />
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-background text-primary shadow-sm">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase leading-none tracking-widest text-primary/60">
                      Resultado Identificado
                    </p>
                    <p className="text-lg font-black tracking-tight">{lastResult.produto}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Tipo
                    </p>
                    <p className="font-bold">{lastResult.tipo}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Status
                    </p>
                    <p className="font-bold">{lastResult.status}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="h-11 flex-1 rounded-xl text-[11px] font-bold uppercase tracking-wider"
                    onClick={() => {
                      haptics.light();
                      clearLastResult();
                    }}
                  >
                    Novo Scan
                  </Button>
                  <Button
                    className="glow-button h-11 flex-1 gap-2 rounded-xl text-[11px] font-bold uppercase tracking-wider"
                    onClick={handleNavigate}
                  >
                    Ir para Triagem <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
