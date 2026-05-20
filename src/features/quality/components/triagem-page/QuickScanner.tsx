import { useState } from "react";
import { QRScanner } from "@/components/scanner/QRScanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) clearLastResult();
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground/50 hover:text-primary transition-colors"
          onClick={() => haptics.light()}
        >
          <QrCode className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-3xl p-6">
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
                <QRScanner 
                  onScan={handleScan}
                  className="w-full"
                />
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/5 rounded-2xl p-6 border border-primary/20 space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center border shadow-sm text-primary">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest leading-none mb-1">Resultado Identificado</p>
                    <p className="text-lg font-black tracking-tight">{lastResult.produto}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Tipo</p>
                    <p className="font-bold">{lastResult.tipo}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Status</p>
                    <p className="font-bold">{lastResult.status}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1 h-11 rounded-xl font-bold text-[11px] uppercase tracking-wider" onClick={() => { haptics.light(); clearLastResult(); }}>
                    Novo Scan
                  </Button>
                  <Button className="flex-1 h-11 rounded-xl font-bold text-[11px] uppercase tracking-wider glow-button gap-2" onClick={handleNavigate}>
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
