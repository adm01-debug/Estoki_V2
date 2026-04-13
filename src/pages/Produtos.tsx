import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Search, Plus, Filter, TrendingUp, AlertTriangle, BarChart3, Eye, X } from "lucide-react";
import { ProdutoAddDialog } from "@/components/produtos/ProdutoAddDialog";
import { ProdutoDetailDialog } from "@/components/produtos/ProdutoDetailDialog";

interface Produto {
  id: string; sku: string; nome: string; descricao?: string; unidade?: string;
  curva_abc?: string; estoque_minimo?: number; estoque_maximo?: number;
  ponto_pedido?: number; peso_unitario?: number; fornecedor_principal?: string;
  giro_mensal?: number; created_at: string;
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [curvaFilter, setCurvaFilter] = useState<string>("todos");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);

  useEffect(() => { loadProdutos(); }, []);

  const loadProdutos = async () => {
    try { setLoading(true); const { data, error } = await supabase.from("produtos").select("*").order("nome"); if (error) throw error; setProdutos((data || []) as Produto[]); } catch { toast.error("Erro ao carregar produtos"); } finally { setLoading(false); }
  };

  const filtered = useMemo(() => produtos.filter((p) => {
    const matchSearch = !search || p.nome.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCurva = curvaFilter === "todos" || p.curva_abc === curvaFilter;
    return matchSearch && matchCurva;
  }), [produtos, search, curvaFilter]);

  const stats = useMemo(() => {
    const total = produtos.length;
    return { total, curvaA: produtos.filter(p => p.curva_abc === "A").length, curvaB: produtos.filter(p => p.curva_abc === "B").length, curvaC: produtos.filter(p => p.curva_abc === "C").length };
  }, [produtos]);

  const getCurvaBadge = (curva?: string) => {
    switch (curva) {
      case "A": return <Badge className="bg-primary text-primary-foreground">Curva A</Badge>;
      case "B": return <Badge variant="secondary">Curva B</Badge>;
      case "C": return <Badge variant="outline">Curva C</Badge>;
      default: return <Badge variant="outline" className="text-muted-foreground">Sem curva</Badge>;
    }
  };

  if (loading) return <AppLayout title="Produtos" showBack><PageTransition><div className="p-4 space-y-4"><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[1,2,3,4].map(i => <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>)}</div>{[1,2,3,4,5].map(i => <Card key={i}><CardContent className="p-4"><Skeleton className="h-20 w-full" /></CardContent></Card>)}</div></PageTransition></AppLayout>;

  return (
    <AppLayout title="Produtos" showBack rightAction={<Button size="sm" className="gap-2" onClick={() => setShowAddDialog(true)}><Plus className="h-4 w-4" /><span className="hidden sm:inline">Novo Produto</span></Button>}>
      <PageTransition>
        <div className="p-4 space-y-4">
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {[
              { icon: Package, value: stats.total, label: "Total", bg: "bg-primary/10", text: "text-primary" },
              { icon: TrendingUp, value: stats.curvaA, label: "Curva A", bg: "bg-primary/10", text: "text-primary" },
              { icon: BarChart3, value: stats.curvaB, label: "Curva B", bg: "bg-secondary/50", text: "text-secondary-foreground" },
              { icon: AlertTriangle, value: stats.curvaC, label: "Curva C", bg: "bg-muted", text: "text-muted-foreground" },
            ].map(s => (
              <Card key={s.label}><CardContent className="p-4"><div className="flex items-center gap-3"><div className={`p-2 rounded-lg ${s.bg}`}><s.icon className={`h-5 w-5 ${s.text}`} /></div><div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div></div></CardContent></Card>
            ))}
          </motion.div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou SKU..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
              {search && <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearch("")}><X className="h-4 w-4 text-muted-foreground" /></button>}
            </div>
            <Select value={curvaFilter} onValueChange={setCurvaFilter}>
              <SelectTrigger className="w-[130px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="todos">Todas</SelectItem><SelectItem value="A">Curva A</SelectItem><SelectItem value="B">Curva B</SelectItem><SelectItem value="C">Curva C</SelectItem></SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <Card><CardContent className="p-8 text-center"><Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" /><p className="text-muted-foreground">Nenhum produto encontrado</p></CardContent></Card>
            ) : (
              <AnimatePresence>
                {filtered.map((produto, index) => (
                  <motion.div key={produto.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ delay: index * 0.03 }}>
                    <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedProduto(produto)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1"><p className="font-semibold truncate">{produto.nome}</p>{getCurvaBadge(produto.curva_abc)}</div>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span>SKU: {produto.sku}</span>{produto.unidade && <span>Unidade: {produto.unidade}</span>}{produto.peso_unitario && <span>{produto.peso_unitario}kg</span>}
                            </div>
                          </div>
                          <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </PageTransition>

      <ProdutoAddDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSuccess={loadProdutos} />
      <ProdutoDetailDialog produto={selectedProduto} onClose={() => setSelectedProduto(null)} />
    </AppLayout>
  );
}
