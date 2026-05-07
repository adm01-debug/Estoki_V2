import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Wifi } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
};

interface Props {
  userName: string;
  isConnected: boolean;
  onDashboardClick: () => void;
}

export function IndexHero({ userName, isConnected, onDashboardClick }: Props) {
  return (
    <motion.section variants={itemVariants} className="relative py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-display leading-tight">
              {getGreeting()}, <span className="gradient-text">{userName}</span>!
            </h1>
            {isConnected && (
              <Badge variant="outline" className="premium-glass bg-success/5 text-success border-success/20 gap-1.5 py-1 px-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Live</span>
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground/80 font-medium tracking-tight">
            Seu centro de comando inteligente para logística de alta performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            className="gap-2 px-6 h-12 glow-button bg-primary hover:bg-primary/90 transition-all duration-500 rounded-xl"
            onClick={onDashboardClick}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="font-bold">Análise Estratégica</span>
          </Button>
        </div>
      </div>
      
      {/* Decorative background element for the Hero */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
    </motion.section>
  );
}
