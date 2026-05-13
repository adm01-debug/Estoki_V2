import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, Send, Sparkles, Loader2, Package, TrendingDown, 
  AlertTriangle, BarChart3, Lightbulb, RefreshCw, X, Maximize2, Minimize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickActions = [
  { icon: TrendingDown, label: "Produtos em ruptura", prompt: "Quais produtos estão abaixo do ponto de pedido e precisam de reposição urgente?" },
  { icon: Package, label: "Produtos parados", prompt: "Identifique produtos com giro mensal zero ou muito baixo que estão parados no estoque." },
  { icon: AlertTriangle, label: "Lotes vencendo", prompt: "Quais lotes estão próximos da data de vencimento nos próximos 30 dias?" },
  { icon: BarChart3, label: "Análise geral", prompt: "Faça uma análise geral do estoque: ocupação, produtos críticos, sugestões de otimização." },
  { icon: Lightbulb, label: "Otimizar layout", prompt: "Com base na curva ABC, sugira otimizações no layout do armazém para melhorar a eficiência de picking." },
];

export default function AssistenteIA() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getContext = async () => {
    const [produtosRes, lotesRes, posicoesRes] = await Promise.all([
      supabase.from("produtos").select("sku, nome, curva_abc, giro_mensal, estoque_minimo, ponto_pedido").limit(50),
      supabase.from("lotes").select("numero_lote, produto_id, quantidade_atual, data_validade, status").limit(50),
      supabase.from("posicoes_estoque").select("codigo, status, zona, tipo").limit(100),
    ]);

    const totalPosicoes = posicoesRes.data?.length || 0;
    const ocupados = posicoesRes.data?.filter(p => p.status === "ocupado").length || 0;
    const livres = posicoesRes.data?.filter(p => p.status === "livre").length || 0;

    return {
      produtos: {
        total: produtosRes.data?.length || 0,
        lista: produtosRes.data?.slice(0, 20) || [],
      },
      lotes: {
        total: lotesRes.data?.length || 0,
        proximos_vencimento: lotesRes.data?.filter(l => {
          if (!l.data_validade) return false;
          const diff = new Date(l.data_validade).getTime() - Date.now();
          return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
        }).length || 0,
        lista: lotesRes.data?.slice(0, 15) || [],
      },
      posicoes: {
        total: totalPosicoes,
        ocupados,
        livres,
        taxa_ocupacao: totalPosicoes > 0 ? Math.round((ocupados / totalPosicoes) * 100) : 0,
      },
    };
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const context = await getContext();

      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: { message: text, context },
      });

      if (error) throw error;

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: unknown) {
      toast.error("Erro ao consultar o assistente IA");
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "❌ Desculpe, não consegui processar sua solicitação. Tente novamente.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto">
      <PageHeader 
        title="Assistente IA" 
        description="Análise inteligente do seu estoque com IA"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-2">
          <h3 className="text-xs font-bold text-primary/60 uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
            <Sparkles className="h-3 w-3" />
            Ações Rápidas
          </h3>
          {quickActions.map((action) => (
            <motion.button
              key={action.label}
              onClick={() => sendMessage(action.prompt)}
              disabled={loading}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-card/80 border border-border/40 text-left hover:border-primary/30 hover:bg-primary/5 transition-all disabled:opacity-50"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <action.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Chat Area */}
        <Card className="lg:col-span-3 glass-card border-border/30 flex flex-col min-h-[600px]">
          <CardHeader className="pb-3 border-b border-border/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                ESTOKI AI
                <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-[10px]">
                  Online
                </Badge>
              </CardTitle>
              {messages.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setMessages([])}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <motion.div 
                    className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Bot className="h-8 w-8 text-primary" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Olá! Sou o ESTOKI AI 🤖</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Posso analisar seu estoque, prever rupturas, sugerir reposições e otimizar seu armazém. 
                    Use as ações rápidas ou faça uma pergunta!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-card border border-border/50 rounded-bl-md"
                        }`}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${
                            msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"
                          }`}>
                            {msg.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {loading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-primary"
                            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                      <span className="text-xs">Analisando...</span>
                    </motion.div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border/30">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pergunte sobre seu estoque..."
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 placeholder:text-muted-foreground/50"
                  disabled={loading}
                />
                <Button 
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  size="icon"
                  className="h-11 w-11 rounded-xl glow-button shrink-0"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground/50 mt-2 text-center">
                Powered by Lovable AI • Os dados são analisados em tempo real
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
