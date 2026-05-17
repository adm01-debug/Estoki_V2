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
  
  return null;
});
