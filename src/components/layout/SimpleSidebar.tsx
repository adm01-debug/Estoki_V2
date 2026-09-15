import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { menuItems } from "@/config/menu";
import { Box } from "lucide-react";

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = true, onClose }: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-background transition-transform md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <Box className="mr-2 h-6 w-6 text-primary" />
        <span className="text-lg font-bold">ESTOKI</span>
      </div>
      <nav className="space-y-1 p-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
