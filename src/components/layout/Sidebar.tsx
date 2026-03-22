import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { menuItems } from "@/config/menu";
import { Box } from "lucide-react";

interface SidebarProps { open?: boolean; onClose?: () => void; }

export function Sidebar({ open = true, onClose }: SidebarProps) {
  return (
    <aside className={cn("fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform md:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
      <div className="flex h-14 items-center border-b px-4">
        <Package className="h-6 w-6 text-primary mr-2" />
        <span className="font-bold text-lg">ESTOKI</span>
      </div>
      <nav className="p-4 space-y-1">
        {menuItems.map(item => (
          <NavLink key={item.path} to={item.path} onClick={onClose} className={({ isActive }) => cn("flex items-center gap-3 px-3 py-2 rounded-lg transition-colors", isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
