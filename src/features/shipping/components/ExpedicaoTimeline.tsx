import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
  import { CheckCircle2, Clock, Truck, Package, MapPin, AlertCircle, FileText, Camera, MoreHorizontal } from "lucide-react";
  import { motion, useReducedMotion } from "framer-motion";
  import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
  import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  time: Date;
  status: "success" | "pending" | "current" | "alert";
  icon: any;
}

 export function ExpedicaoTimeline() {
   const shouldReduceMotion = useReducedMotion();
 
  const events: TimelineEvent[] = [
    {
      id: "1",
      title: "Volumes Coletados",
      description: "12 caixas (Pedido #4582) coletadas do setor de Triagem",
      time: new Date(),
      status: "success",
      icon: Package,
    },
    {
      id: "2",
      title: "Conferência Final",
      description: "Checklist de integridade concluído sem avarias",
      time: new Date(Date.now() - 1000 * 60 * 30),
      status: "success",
      icon: CheckCircle2,
    },
    {
       id: "5",
       title: "Protocolo de Custódia",
       description: "Evidência fotográfica gerada para o romaneio #ROM-442",
       time: new Date(Date.now() - 1000 * 60 * 45),
       status: "success",
       icon: Camera,
     },
     {
      id: "3",
      title: "Em Carregamento",
      description: "Veículo ABC-1234 em plataforma 02",
      time: new Date(Date.now() - 1000 * 60 * 60),
      status: "current",
      icon: Truck,
    },
    {
      id: "4",
      title: "Saída Prevista",
      description: "Rota: Grande São Paulo",
      time: new Date(Date.now() + 1000 * 60 * 45),
      status: "pending",
      icon: Clock,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Timeline de Expedição
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/20 before:via-primary/10 before:to-transparent">
          <TooltipProvider>
            {events.map((event, index) => (
              <motion.div 
                key={event.id} 
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start gap-4 group"
              >
                <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-background shadow-sm z-10 transition-transform ${
                  !shouldReduceMotion ? "group-hover:scale-110" : ""
                } ${
                  event.status === "success" ? "border-success text-success" :
                  event.status === "current" ? "border-primary text-primary" :
                  event.status === "alert" ? "border-destructive text-destructive" :
                  "border-muted text-muted-foreground"
                }`}>
                  {event.status === "current" && !shouldReduceMotion ? (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-primary/20"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  ) : null}
                  <event.icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-1 pt-1 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm group-hover:text-primary transition-colors">{event.title}</span>
                      <Badge variant="outline" className="text-[10px] font-mono h-5">
                        {format(event.time, "HH:mm")}
                      </Badge>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-[10px]">Ver detalhes do evento</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{event.description}</p>
                </div>
              </motion.div>
            ))}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
