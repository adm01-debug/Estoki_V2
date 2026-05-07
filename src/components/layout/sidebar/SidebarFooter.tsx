import { memo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LogOut, Settings } from "lucide-react";
import { SidebarNavButton } from "./SidebarNavButton";
import { useRoutePreload } from "@/hooks/useRoutePreload";

interface SidebarFooterProps {
  pathname: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  isCollapsed: boolean;
}

export const SidebarFooter = memo(function SidebarFooter({ 
  pathname, 
  onNavigate, 
  onLogout, 
  isCollapsed 
}: SidebarFooterProps) {
  const preloadRoute = useRoutePreload();
  
  return (
    <div className="p-2 border-t border-sidebar-border/50 space-y-0.5">
      <SidebarNavButton
        item={{ path: "/configuracoes", icon: Settings, label: "Configurações" }}
        isActive={pathname === "/configuracoes"}
        onClick={() => onNavigate("/configuracoes")}
        collapsed={isCollapsed}
        onHover={preloadRoute}
      />
      {isCollapsed ? (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button 
              onClick={onLogout} 
              className="w-full flex items-center justify-center px-3 py-3 rounded-xl text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Sair</TooltipContent>
        </Tooltip>
      ) : (
        <button 
          onClick={onLogout} 
          aria-label="Sair da conta" 
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
          <span className="text-sm font-medium">Sair</span>
        </button>
      )}
    </div>
  );
});
