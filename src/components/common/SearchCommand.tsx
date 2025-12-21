import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Package, FileText, Settings, LayoutDashboard, Truck, ArrowLeftRight } from "lucide-react";

const routes = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Estoque", path: "/estoque", icon: Package },
  { name: "Triagem", path: "/triagem", icon: FileText },
  { name: "Recebimento", path: "/recebimento", icon: Truck },
  { name: "Movimentação", path: "/movimentacao", icon: ArrowLeftRight },
  { name: "Configurações", path: "/configuracoes", icon: Settings },
];

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado.</CommandEmpty>
        <CommandGroup heading="Páginas">
          {routes.map(route => (
            <CommandItem key={route.path} onSelect={() => { navigate(route.path); setOpen(false); }}>
              <route.icon className="mr-2 h-4 w-4" />
              {route.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
