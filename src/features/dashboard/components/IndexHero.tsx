import { motion } from "framer-motion";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { BarChart3, Wifi, Zap, Plus, Search, FileText } from "lucide-react";
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
   DropdownMenuSeparator,
 } from "@/components/ui/dropdown-menu";
 import { useNavigate } from "react-router-dom";

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
   const navigate = useNavigate();
 
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
         <div className="flex items-center gap-2">
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5 text-primary rounded-xl">
                 <Zap className="h-4 w-4 shrink-0" />
                 <span className="hidden xs:inline">Ações</span>
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end" className="w-56 p-2 bg-popover/95 backdrop-blur-2xl border-border/40 shadow-2xl rounded-2xl animate-in fade-in-0 zoom-in-95">
               <DropdownMenuItem onClick={() => navigate("/recebimento")} className="gap-2 p-2.5 rounded-xl cursor-pointer">
                 <Plus className="h-4 w-4 text-primary" />Novo Recebimento
               </DropdownMenuItem>
               <DropdownMenuItem onClick={() => navigate("/triagem")} className="gap-2 p-2.5 rounded-xl cursor-pointer">
                 <Search className="h-4 w-4 text-primary" />Iniciar Triagem
               </DropdownMenuItem>
               <DropdownMenuSeparator className="my-1 bg-border/40" />
               <DropdownMenuItem onClick={() => navigate("/relatorios")} className="gap-2 p-2.5 rounded-xl cursor-pointer">
                 <FileText className="h-4 w-4 text-muted-foreground" />Gerar Relatório
               </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
           <Button className="gap-2 hidden sm:flex glow-button bg-primary hover:bg-primary/90 rounded-xl" onClick={onDashboardClick}>
             <BarChart3 className="h-4 w-4" />Dashboard
           </Button>
         </div>
      </div>
    </motion.section>
  );
}
