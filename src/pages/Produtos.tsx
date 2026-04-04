import { useState, useMemo, useEffect } from "react";
import { produtoSchema, validateForm } from "@/lib/validations";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Search,
  Plus,
  Filter,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Loader2,
  Edit,
  Eye,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Produto {
  id: string;
  sku: string;
  nome: string;
  descricao?: string;
  unidade?: string;
  curva_abc?: string;
  estoque_minimo?: number;
  estoque_maximo?: number;
  ponto_pedido?: number;
  peso_unitario?: number;
  fornecedor_principal?: string;
  giro_mensal?: number;
  created_at: string;
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [curvaFilter, setCurvaFilter] = useState<string>("todos");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [formData, setFormData] = useState({
    sku: "",
    nome: "",
    descricao: "",
    unidade: "UN",
    estoque_minimo: 0,
    estoque_maximo: 0,
    ponto_pedido: 0,
    peso_unitario: 0,
    fornecedor_principal: "",
  });
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProdutos();
  }, []);

  const loadProdutos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .order("nome");
      if (error) throw error;
      setProdutos((data || []) as Produto[]);
    } catch (err) {
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.sku || !formData.nome) {
      toast.error("SKU e Nome são obrigatórios");
      return;
    }
    try {
      setSaving(true);
      const { error } = await supabase.from("produtos").insert({
        sku: formData.sku,
        nome: formData.nome,
        descricao: formData.descricao || null,
        unidade: formData.unidade,
        estoque_minimo: formData.estoque_minimo,
        estoque_maximo: formData.estoque_maximo,
        ponto_pedido: formData.ponto_pedido,
        peso_unitario: formData.peso_unitario || null,
        fornecedor_principal: formData.fornecedor_principal || null,
      });
      if (error) throw error;
      toast.success("Produto cadastrado com sucesso!");
      setShowAddDialog(false);
      setFormData({ sku: "", nome: "", descricao: "", unidade: "UN", estoque_minimo: 0, estoque_maximo: 0, ponto_pedido: 0, peso_unitario: 0, fornecedor_principal: "" });
      loadProdutos();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar produto");
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    return produtos.filter((p) => {
      const matchSearch =
        !search ||
        p.nome.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCurva = curvaFilter === "todos" || p.curva_abc === curvaFilter;
      return matchSearch && matchCurva;
    });
  }, [produtos, search, curvaFilter]);

  const stats = useMemo(() => {
    const total = produtos.length;
    const curvaA = produtos.filter((p) => p.curva_abc === "A").length;
    const curvaB = produtos.filter((p) => p.curva_abc === "B").length;
    const curvaC = produtos.filter((p) => p.curva_abc === "C").length;
    const semCurva = total - curvaA - curvaB - curvaC;
    return { total, curvaA, curvaB, curvaC, semCurva };
  }, [produtos]);

  const getCurvaBadge = (curva?: string) => {
    switch (curva) {
      case "A": return <Badge className="bg-primary text-primary-foreground">Curva A</Badge>;
      case "B": return <Badge variant="secondary">Curva B</Badge>;
      case "C": return <Badge variant="outline">Curva C</Badge>;
      default: return <Badge variant="outline" className="text-muted-foreground">Sem curva</Badge>;
    }
  };

  if (loading) {
    return (
      <AppLayout title="Produtos" showBack>
        <PageTransition>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
              ))}
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-20 w-full" /></CardContent></Card>
            ))}
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Produtos"
      showBack
      rightAction={
        <Button size="sm" className="gap-2" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo Produto</span>
        </Button>
      }
    >
      <PageTransition>
        <div className="p-4 space-y-4">
          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.curvaA}</p>
                    <p className="text-xs text-muted-foreground">Curva A</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/50">
                    <BarChart3 className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.curvaB}</p>
                    <p className="text-xs text-muted-foreground">Curva B</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.curvaC}</p>
                    <p className="text-xs text-muted-foreground">Curva C</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Search & Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou SKU..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearch("")}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <Select value={curvaFilter} onValueChange={setCurvaFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="A">Curva A</SelectItem>
                <SelectItem value="B">Curva B</SelectItem>
                <SelectItem value="C">Curva C</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Product List */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Nenhum produto encontrado</p>
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence>
                {filtered.map((produto, index) => (
                  <motion.div
                    key={produto.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card
                      className="cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => setSelectedProduto(produto)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold truncate">{produto.nome}</p>
                              {getCurvaBadge(produto.curva_abc)}
                            </div>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span>SKU: {produto.sku}</span>
                              {produto.unidade && <span>Unidade: {produto.unidade}</span>}
                              {produto.peso_unitario && <span>{produto.peso_unitario}kg</span>}
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

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Produto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>SKU *</Label>
                <Input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
              </div>
              <div>
                <Label>Unidade</Label>
                <Select value={formData.unidade} onValueChange={(v) => setFormData({ ...formData, unidade: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["UN", "KG", "L", "M", "CX", "PC", "PAR"].map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Nome *</Label>
              <Input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Est. Mínimo</Label>
                <Input type="number" value={formData.estoque_minimo} onChange={(e) => setFormData({ ...formData, estoque_minimo: +e.target.value })} />
              </div>
              <div>
                <Label>Est. Máximo</Label>
                <Input type="number" value={formData.estoque_maximo} onChange={(e) => setFormData({ ...formData, estoque_maximo: +e.target.value })} />
              </div>
              <div>
                <Label>Ponto Pedido</Label>
                <Input type="number" value={formData.ponto_pedido} onChange={(e) => setFormData({ ...formData, ponto_pedido: +e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Peso (kg)</Label>
                <Input type="number" step="0.01" value={formData.peso_unitario} onChange={(e) => setFormData({ ...formData, peso_unitario: +e.target.value })} />
              </div>
              <div>
                <Label>Fornecedor</Label>
                <Input value={formData.fornecedor_principal} onChange={(e) => setFormData({ ...formData, fornecedor_principal: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!selectedProduto} onOpenChange={() => setSelectedProduto(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedProduto?.nome}</DialogTitle>
          </DialogHeader>
          {selectedProduto && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">SKU:</span> <span className="font-medium">{selectedProduto.sku}</span></div>
                <div><span className="text-muted-foreground">Unidade:</span> <span className="font-medium">{selectedProduto.unidade || "-"}</span></div>
                <div><span className="text-muted-foreground">Curva ABC:</span> {getCurvaBadge(selectedProduto.curva_abc)}</div>
                <div><span className="text-muted-foreground">Peso:</span> <span className="font-medium">{selectedProduto.peso_unitario ? `${selectedProduto.peso_unitario}kg` : "-"}</span></div>
                <div><span className="text-muted-foreground">Est. Mínimo:</span> <span className="font-medium">{selectedProduto.estoque_minimo ?? "-"}</span></div>
                <div><span className="text-muted-foreground">Est. Máximo:</span> <span className="font-medium">{selectedProduto.estoque_maximo ?? "-"}</span></div>
                <div><span className="text-muted-foreground">Ponto Pedido:</span> <span className="font-medium">{selectedProduto.ponto_pedido ?? "-"}</span></div>
                <div><span className="text-muted-foreground">Giro Mensal:</span> <span className="font-medium">{selectedProduto.giro_mensal ?? "-"}</span></div>
              </div>
              {selectedProduto.descricao && (
                <div>
                  <span className="text-sm text-muted-foreground">Descrição:</span>
                  <p className="text-sm mt-1">{selectedProduto.descricao}</p>
                </div>
              )}
              {selectedProduto.fornecedor_principal && (
                <div>
                  <span className="text-sm text-muted-foreground">Fornecedor:</span>
                  <p className="text-sm font-medium mt-1">{selectedProduto.fornecedor_principal}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
