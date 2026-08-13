import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
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
    if (data) {
      setItens(
        data.map((item) => ({
          id: item.id,
          nome: item.nome,
          descricao: item.descricao || "",
          preco: item.preco,
          imagem_url: item.imagem_url || "",
          categoria: item.categoria || "cosmetico",
          estoque: item.estoque || -1,
        }))
      );
    }
    setLoading(false);
  }

  async function fetchSaldo() {
    if (!user) return;
    const { data } = await supabase
      .from("gamificacao_usuarios")
      .select("pontos")
      .eq("user_id", user.id)
      .single();
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
        valor: item.preco,
      });

      if (transacaoError) throw transacaoError;

      // 2. Descontar pontos via RPC (usando as any para evitar erros de tipos desatualizados)
      const { error: pontosError } = await (supabase.rpc as any)("descontar_pontos", {
        p_user_id: user.id,
        p_valor: item.preco,
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
      setPontos((prev) => prev - item.preco);
      fetchSaldo();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar compra.");
    } finally {
      setComprando(null);
    }
  }

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary p-2">
            <Coins className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Seu Saldo
            </p>
            <p className="text-2xl font-bold">{pontos} Pontos</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="hidden md:flex">
          Histórico de Compras
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {itens.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="group flex h-full flex-col overflow-hidden transition-colors hover:border-primary/50">
              <div className="flex h-32 items-center justify-center bg-muted p-4 transition-colors group-hover:bg-primary/5">
                <img
                  src={item.imagem_url}
                  alt={item.nome}
                  className="h-20 w-20 object-contain drop-shadow-md"
                />
              </div>
              <CardHeader className="p-4 pb-2">
                <div className="mb-1 flex items-start justify-between">
                  <Badge variant="secondary" className="text-[10px] uppercase">
                    {item.categoria}
                  </Badge>
                  <div className="flex items-center text-sm font-bold text-primary">
                    <Coins className="mr-1 h-3 w-3" /> {item.preco}
                  </div>
                </div>
                <CardTitle className="text-md">{item.nome}</CardTitle>
                <CardDescription className="line-clamp-2 text-xs">{item.descricao}</CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto p-4 pt-0">
                <Button
                  className="w-full"
                  disabled={pontos < item.preco || comprando === item.id}
                  onClick={() => comprarItem(item)}
                >
                  {comprando === item.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="mr-2 h-4 w-4" />
                  )}
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
