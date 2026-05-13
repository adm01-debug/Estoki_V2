import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Package, Layers, Warehouse, FileText, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";

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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);

  // Keyboard shortcut to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

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
          supabase.from("produtos").select("id, sku, nome").ilike("nome", searchTerm).limit(5),
          supabase.from("lotes").select("id, numero_lote, fornecedor").ilike("numero_lote", searchTerm).limit(5),
          supabase.from("posicoes_estoque").select("id, codigo, zona").ilike("codigo", searchTerm).limit(5),
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
        setSelectedIndex(0);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      const config = typeConfig[result.type];
      navigate(config.route);
      setOpen(false);
    },
    [navigate]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  // Click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

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

      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-background/60 backdrop-blur-sm">
          <div
            ref={containerRef}
            className="w-full max-w-lg bg-popover border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 border-b border-border">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar produtos, lotes, posições..."
                className="flex-1 py-3.5 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
              />
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading && (
                <div className="p-4 text-center text-sm text-muted-foreground">Buscando...</div>
              )}

              {!loading && query.length >= 2 && results.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Nenhum resultado para "{query}"
                </div>
              )}

              {!loading && results.length > 0 && (
                <ul className="p-1.5">
                  {results.map((result, index) => {
                    const config = typeConfig[result.type];
                    const Icon = config.icon;
                    return (
                      <li key={`${result.type}-${result.id}`}>
                        <button
                          onClick={() => handleSelect(result)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                            index === selectedIndex
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-muted"
                          )}
                        >
                          <Icon className={cn("h-4 w-4 shrink-0", config.color)} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{result.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase font-medium">
                            {config.label}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {!loading && query.length < 2 && (
                <div className="p-6 text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Digite pelo menos 2 caracteres para buscar
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">Ctrl</kbd>
                    {" + "}
                    <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">K</kbd>
                    {" para abrir rapidamente"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
