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
    <motion.section variants={itemVariants}>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              {getGreeting()}, <span className="gradient-text">{userName}</span>! 👋
            </h1>
            {isConnected && (
              <Badge variant="outline" className="bg-success/10 text-success border-success/30 gap-1.5 animate-pulse">
                <Wifi className="h-3 w-3" />Live
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">Resumo completo do seu armazém</p>
        </div>
        <Button className="gap-2 hidden sm:flex glow-button bg-primary hover:bg-primary/90" onClick={onDashboardClick}>
          <BarChart3 className="h-4 w-4" />Dashboard
        </Button>
      </div>
    </motion.section>
  );
}
