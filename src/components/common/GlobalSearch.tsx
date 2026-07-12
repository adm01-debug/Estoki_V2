import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

// Diálogo pesado (cmdk + 20 lucide icons + supabase queries) — carregado
// apenas quando o usuário abre a busca (Ctrl+K, evento global ou clique),
// mantendo o main bundle enxuto.
const GlobalSearchDialog = lazy(() =>
  import("./GlobalSearchDialog").then((m) => ({ default: m.GlobalSearchDialog }))
);

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);

  const openDialog = useCallback(() => {
    setEverOpened(true);
    setOpen(true);
  }, []);

  // Prefetch on hover para esconder o custo do chunk async.
  const prefetch = useCallback(() => {
    void import("./GlobalSearchDialog");
  }, []);

  useEffect(() => {
    const handleOpen = () => openDialog();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setEverOpened(true);
        setOpen((v) => !v);
      }
    };
    window.addEventListener("open-global-search", handleOpen);
    document.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("open-global-search", handleOpen);
      document.removeEventListener("keydown", handleKey);
    };
  }, [openDialog]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="group/search h-9 w-9 transition-all duration-300 lg:w-72 lg:justify-start lg:border lg:border-border/20 lg:bg-muted/30 lg:px-3 lg:hover:border-primary/30 lg:hover:bg-muted"
        onClick={openDialog}
        onMouseEnter={prefetch}
        onFocus={prefetch}
        title="Buscar (Ctrl+K)"
        aria-label="Abrir busca global"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="ml-2 hidden flex-1 text-xs font-medium text-muted-foreground transition-colors group-hover/search:text-foreground lg:inline-flex">
          Buscar (funções, produtos, lotes)...
        </span>
        <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 transition-all group-hover/search:border-primary/50 group-hover/search:text-primary lg:inline-flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {everOpened && (
        <Suspense fallback={null}>
          <GlobalSearchDialog open={open} onOpenChange={setOpen} />
        </Suspense>
      )}
    </>
  );
}