import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ShoppingCart, Coins, Star, Zap, Coffee, Gift, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface LojaItem {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem_url: string;
  categoria: string;
  estoque: number;
}

export function GamificacaoLoja() {
  const { user } = useAuth();
  const [itens, setItens] = useState<LojaItem[]>([]);
  const [pontos, setPontos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [comprando, setComprando] = useState<string | null>(null);

  useEffect(() => {
    fetchLoja();
    fetchSaldo();
  }, [user]);

  async function fetchLoja() {
    const { data } = await supabase.from("gamificacao_loja").select("*").eq("ativo", true);
    if (data) setItens(data);
    setLoading(false);
  }

  async function fetchSaldo() {
    if (!user) return;
    const { data } = await supabase.from("gamificacao_usuarios").select("pontos").eq("user_id", user.id).single();
    if (data) setPontos(data.pontos || 0);
  }

  async function comprarItem(item: LojaItem) {
    if (!user) return;
    if (pontos < item.preco) {
      toast.error("Pontos insuficientes!");
      return;
    }

    setComprando(item.id);
    try {
      // 1. Inserir transação
      const { error: transacaoError } = await supabase.from("gamificacao_transacoes").insert({
        user_id: user.id,
        item_id: item.id,
        valor: item.preco
      });

      if (transacaoError) throw transacaoError;

      // 2. Descontar pontos
      const { error: pontosError } = await supabase.rpc('descontar_pontos', {
        p_user_id: user.id,
        p_valor: item.preco
      });

      // Se a RPC não existir, fazemos manualmente (embora RPC seja mais seguro)
      if (pontosError) {
         const { error: manualError } = await supabase
           .from("gamificacao_usuarios")
           .update({ pontos: pontos - item.preco })
           .eq("user_id", user.id);
         if (manualError) throw manualError;
      }

      toast.success(`${item.nome} adquirido com sucesso!`);
      setPontos(prev => prev - item.preco);
      fetchSaldo();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar compra.");
    } finally {
      setComprando(null);
    }
  }

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-primary/10 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-full"><Coins className="h-6 w-6 text-primary-foreground" /></div>
          <div>
            <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Seu Saldo</p>
            <p className="text-2xl font-bold">{pontos} Pontos</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="hidden md:flex">Histórico de Compras</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {itens.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="h-full flex flex-col overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="h-32 bg-muted flex items-center justify-center p-4 group-hover:bg-primary/5 transition-colors">
                <img src={item.imagem_url} alt={item.nome} className="h-20 w-20 object-contain drop-shadow-md" />
              </div>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start mb-1">
                  <Badge variant="secondary" className="text-[10px] uppercase">{item.categoria}</Badge>
                  <div className="flex items-center text-sm font-bold text-primary">
                    <Coins className="h-3 w-3 mr-1" /> {item.preco}
                  </div>
                </div>
                <CardTitle className="text-md">{item.nome}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">{item.descricao}</CardDescription>
              </CardHeader>
              <CardFooter className="p-4 pt-0 mt-auto">
                <Button 
                  className="w-full" 
                  disabled={pontos < item.preco || comprando === item.id}
                  onClick={() => comprarItem(item)}
                >
                  {comprando === item.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShoppingCart className="h-4 w-4 mr-2" />}
                  {pontos < item.preco ? "Pontos Insuficientes" : "Comprar"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}