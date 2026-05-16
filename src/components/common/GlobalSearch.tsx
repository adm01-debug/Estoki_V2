import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Package, Layers, Warehouse, FileText, ArrowRight, LayoutDashboard, Truck, ArrowLeftRight, Activity, Plus, FileBarChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { useHaptics } from "@/hooks/useHaptics";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

interface SearchResult {
  id: string;
  type: "produto" | "lote" | "posicao" | "pedido";
  title: string;
  subtitle: string;
}

const typeConfig = {
  produto: { icon: Package, label: "Produto", color: "text-blue-500", route: "/produtos" },
  lote: { icon: Layers, label: "Lote", color: "text-green-500", route: "/lotes" },
  posicao: { icon: Warehouse, label: "Posição", color: "text-orange-500", route: "/posicoes" },
  pedido: { icon: FileText, label: "Pedido", color: "text-purple-500", route: "/pedidos" },
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);
  const { light } = useHaptics();

  // Listen for custom event to open search
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-global-search", handleOpen);
    return () => window.removeEventListener("open-global-search", handleOpen);
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Search
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      const searchTerm = `%${debouncedQuery}%`;
      const allResults: SearchResult[] = [];

      try {
        const [produtos, lotes, posicoes] = await Promise.all([
          supabase.from("produtos").select("id, sku, nome").ilike("nome", searchTerm).limit(3),
          supabase.from("lotes").select("id, numero_lote, fornecedor").ilike("numero_lote", searchTerm).limit(3),
          supabase.from("posicoes_estoque").select("id, codigo, zona").ilike("codigo", searchTerm).limit(3),
        ]);

        produtos.data?.forEach((p) =>
          allResults.push({ id: p.id, type: "produto", title: p.nome, subtitle: `SKU: ${p.sku}` })
        );
        lotes.data?.forEach((l) =>
          allResults.push({ id: l.id, type: "lote", title: l.numero_lote, subtitle: l.fornecedor || "Sem fornecedor" })
        );
        posicoes.data?.forEach((p) =>
          allResults.push({ id: p.id, type: "posicao", title: p.codigo, subtitle: `Zona: ${p.zona || "N/A"}` })
        );

        setResults(allResults);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  const onSelect = useCallback(
    (path: string) => {
      light();
      navigate(path);
      setOpen(false);
    },
    [navigate, light]
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 lg:w-64 lg:justify-start lg:px-3 lg:bg-muted/50 lg:border lg:border-border/30 lg:hover:bg-muted transition-all"
        onClick={() => setOpen(true)}
        title="Buscar (Ctrl+K)"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden lg:inline-flex ml-2 text-xs text-muted-foreground font-medium flex-1">Buscar no sistema...</span>
        <kbd className="hidden lg:inline-flex ml-auto pointer-events-none h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="O que você está procurando?" 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="scrollbar-hide">
          <CommandEmpty>
            {loading ? "Buscando..." : "Nenhum resultado encontrado."}
          </CommandEmpty>
          
          {results.length > 0 && (
            <CommandGroup heading="Resultados do Banco">
              {results.map((result) => (
                <CommandItem
                  key={`${result.type}-${result.id}`}
                  onSelect={() => onSelect(typeConfig[result.type].route)}
                  className="flex items-center gap-3 py-3"
                >
                  <div className={`p-2 rounded-lg bg-background border border-border`}>
                    {(() => {
                      const Icon = typeConfig[result.type].icon;
                      return <Icon className={`h-4 w-4 ${typeConfig[result.type].color}`} />;
                    })()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{result.title}</span>
                    <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                  </div>
                  <CommandShortcut>{typeConfig[result.type].label}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />
          
          <CommandGroup heading="Ações Rápidas">
            <CommandItem onSelect={() => onSelect("/recebimento")}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Recebimento
            </CommandItem>
            <CommandItem onSelect={() => onSelect("/triagem")}>
              <Search className="mr-2 h-4 w-4" />
              Iniciar Triagem
            </CommandItem>
            <CommandItem onSelect={() => onSelect("/relatorios")}>
              <FileBarChart className="mr-2 h-4 w-4" />
              Gerar Relatório de Inventário
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Navegação">
            <CommandItem onSelect={() => onSelect("/")}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Início
            </CommandItem>
            <CommandItem onSelect={() => onSelect("/dashboard")}>
              <Activity className="mr-2 h-4 w-4" />
              Dashboard Analítico
            </CommandItem>
            <CommandItem onSelect={() => onSelect("/estoque")}>
              <Warehouse className="mr-2 h-4 w-4" />
              Estoque Central
            </CommandItem>
            <CommandItem onSelect={() => onSelect("/expedicao")}>
              <Truck className="mr-2 h-4 w-4" />
              Expedição
            </CommandItem>
            <CommandItem onSelect={() => onSelect("/movimentacao")}>
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Movimentar Itens
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
