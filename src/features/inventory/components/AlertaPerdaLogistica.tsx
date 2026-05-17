import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, MapPin, Search, ArrowRight, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function AlertaPerdaLogistica() {
  const alertas = [
    {
      id: "1",
      codigo: "VOL-0942",
      motivo: "Volume não localizado na Triagem",
      localizaçãoOriginal: "Rua A, Nível 2",
      tempoAtraso: "4h",
      severidade: "high"
    },
    {
      id: "2",
      codigo: "SKU-BRIND-01",
      motivo: "Divergência de inventário físico",
      localizaçãoOriginal: "Box 14",
      tempoAtraso: "2h",
      severidade: "medium"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          Alertas de Perda Logística
        </h3>
        <Badge variant="destructive" className="animate-pulse font-mono">
          {alertas.length} CRÍTICOS
        </Badge>
      </div>

      <div className="grid gap-3">
        {alertas.map((alerta) => (
          <motion.div
            key={alerta.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.01 }}
          >
            <Card className="border-l-4 border-l-destructive bg-destructive/5 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-destructive">{alerta.codigo}</span>
                      <Badge variant="outline" className="text-[10px] h-4 border-destructive/20 text-destructive">
                        Há {alerta.tempoAtraso}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{alerta.motivo}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                      <MapPin className="h-3 w-3" />
                      Último registro: {alerta.localizaçãoOriginal}
                    </div>
                  </div>
                  <Button size="sm" variant="destructive" className="h-8 rounded-lg shadow-lg shadow-destructive/20">
                    Localizar <Search className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
