import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { MapPin, Package, Warehouse, Zap, ArrowRight, CheckCircle2, Layers, Weight } from 'lucide-react';

interface Produto {
  id: string;
  nome: string;
  sku: string;
  curva_abc: string | null;
  peso_unitario: number | null;
  volume_unitario: number | null;
}

interface Posicao {
  id: string;
  codigo: string;
  zona: string | null;
  secao: string | null;
  nivel: string | null;
  status: string;
  tipo: string;
  capacidade_kg: number | null;
}

interface Sugestao {
  posicao: Posicao;
  score: number;
  motivos: string[];
}

export default function EndereçamentoAutomatico() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [posicoes, setPosicoes] = useState<Posicao[]>([]);
  const [selectedProduto, setSelectedProduto] = useState<string>('');
  const [quantidade, setQuantidade] = useState(1);
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const [{ data: prods }, { data: poss }] = await Promise.all([
        supabase.from('produtos').select('id, nome, sku, curva_abc, peso_unitario, volume_unitario'),
        supabase.from('posicoes_estoque').select('id, codigo, zona, secao, nivel, status, tipo, capacidade_kg'),
      ]);
      setProdutos((prods as any[]) || []);
      setPosicoes((poss as any[]) || []);
    };
    fetch();
  }, []);

  const calcularSugestoes = async () => {
    if (!selectedProduto) { toast.error('Selecione um produto'); return; }
    setLoading(true);

    const produto = produtos.find(p => p.id === selectedProduto)!;
    const livres = posicoes.filter(p => p.status === 'livre');

    // Buscar posições que já têm este produto
    const { data: estoqueExistente } = await supabase
      .from('estoque_posicao')
      .select('posicao_id')
      .eq('produto_id', selectedProduto);

    const posicoesComProduto = new Set((estoqueExistente || []).map(e => e.posicao_id));

    // Buscar posições com produtos da mesma curva ABC
    const { data: produtosMesmaCurva } = await supabase
      .from('produtos')
      .select('id')
      .eq('curva_abc', produto.curva_abc || 'C');

    const idsMesmaCurva = new Set((produtosMesmaCurva || []).map(p => p.id));

    const { data: estoquesMesmaCurva } = await supabase
      .from('estoque_posicao')
      .select('posicao_id, produto_id')
      .in('produto_id', Array.from(idsMesmaCurva));

    const posicoesProximas = new Set((estoquesMesmaCurva || []).map(e => e.posicao_id));

    const pesoTotal = (produto.peso_unitario || 0.5) * quantidade;

    const scored: Sugestao[] = livres.map(pos => {
      let score = 50;
      const motivos: string[] = [];

      // Proximidade: mesma posição onde produto já existe
      if (posicoesComProduto.has(pos.id)) {
        score += 30;
        motivos.push('Produto já armazenado nesta área');
      }

      // Proximidade curva ABC
      if (posicoesProximas.has(pos.id)) {
        score += 15;
        motivos.push(`Próximo de produtos curva ${produto.curva_abc || 'C'}`);
      }

      // Curva ABC → nível de acesso
      if (produto.curva_abc === 'A') {
        if (pos.nivel === '1' || pos.nivel === '2') {
          score += 20;
          motivos.push('Nível baixo para produto curva A (fácil acesso)');
        }
      } else if (produto.curva_abc === 'C') {
        if (pos.nivel === '4' || pos.nivel === '5') {
          score += 10;
          motivos.push('Nível alto para produto curva C');
        }
      }

      // Capacidade de peso
      if (pos.capacidade_kg && pesoTotal <= pos.capacidade_kg) {
        score += 10;
        motivos.push('Capacidade de peso adequada');
      } else if (pos.capacidade_kg && pesoTotal > pos.capacidade_kg) {
        score -= 30;
        motivos.push('⚠️ Excede capacidade de peso');
      }

      // Tipo preferencial
      if (pos.tipo === 'porta_palete' && pesoTotal > 50) {
        score += 10;
        motivos.push('Porta-palete ideal para grandes volumes');
      } else if (pos.tipo === 'prateleira' && pesoTotal <= 50) {
        score += 10;
        motivos.push('Prateleira ideal para volumes menores');
      }

      // Zona picking para curva A
      if (produto.curva_abc === 'A' && pos.zona?.toLowerCase().includes('picking')) {
        score += 15;
        motivos.push('Zona de picking para alta rotatividade');
      }

      return { posicao: pos, score: Math.min(100, Math.max(0, score)), motivos };
    });

    scored.sort((a, b) => b.score - a.score);
    setSugestoes(scored.slice(0, 8));
    setLoading(false);
  };

  const confirmarArmazenamento = async (sugestao: Sugestao) => {
    const { error } = await supabase.from('estoque_posicao').insert({
      posicao_id: sugestao.posicao.id,
      produto_id: selectedProduto,
      quantidade,
    });
    if (error) { toast.error('Erro ao armazenar'); return; }

    await supabase.from('posicoes_estoque').update({ status: 'ocupado' } as any).eq('id', sugestao.posicao.id);
    toast.success(`Produto armazenado em ${sugestao.posicao.codigo}!`);
    setSugestoes([]);
  };

  const produto = produtos.find(p => p.id === selectedProduto);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">📦 Endereçamento Automático</h1>
        <p className="text-sm text-muted-foreground">Sugestão inteligente de posição baseada em curva ABC, peso e proximidade</p>
      </div>

      {/* Selector */}
      <Card className="glass-card">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Produto</label>
              <Select value={selectedProduto} onValueChange={setSelectedProduto}>
                <SelectTrigger><SelectValue placeholder="Selecione um produto" /></SelectTrigger>
                <SelectContent>
                  {produtos.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px]">{p.curva_abc || 'C'}</Badge>
                        {p.sku} - {p.nome}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Quantidade</label>
              <input type="number" value={quantidade} onChange={e => setQuantidade(Number(e.target.value))} min={1}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" />
            </div>
            <div className="flex items-end">
              <Button onClick={calcularSugestoes} disabled={loading} className="w-full">
                <Zap className="h-4 w-4 mr-2" />{loading ? 'Calculando...' : 'Sugerir Posição'}
              </Button>
            </div>
          </div>

          {produto && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
              <span className="flex items-center gap-1"><Layers className="h-3 w-3" />Curva: <strong>{produto.curva_abc || 'C'}</strong></span>
              <span className="flex items-center gap-1"><Weight className="h-3 w-3" />Peso unit.: <strong>{produto.peso_unitario || 'N/D'} kg</strong></span>
              <span>Peso total: <strong>{((produto.peso_unitario || 0.5) * quantidade).toFixed(1)} kg</strong></span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggestions */}
      {sugestoes.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Posições Sugeridas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sugestoes.map((sug, i) => (
              <motion.div key={sug.posicao.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className={`glass-card ${i === 0 ? 'border-primary/40 shadow-lg' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {i === 0 && <Badge className="bg-primary text-primary-foreground text-[9px]">MELHOR</Badge>}
                        <span className="text-lg font-bold text-foreground">{sug.posicao.codigo}</span>
                      </div>
                      <Badge variant="outline" className={sug.score >= 80 ? 'text-success border-success/30' : sug.score >= 60 ? 'text-warning border-warning/30' : 'text-destructive border-destructive/30'}>
                        Score: {sug.score}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span>Zona: {sug.posicao.zona || '-'}</span>
                      <span>Seção: {sug.posicao.secao || '-'}</span>
                      <span>Nível: {sug.posicao.nivel || '-'}</span>
                      <span>Tipo: {sug.posicao.tipo}</span>
                    </div>
                    <div className="space-y-1 mb-3">
                      {sug.motivos.map((m, j) => (
                        <p key={j} className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-success shrink-0" />{m}
                        </p>
                      ))}
                    </div>
                    <Button size="sm" onClick={() => confirmarArmazenamento(sug)} className="w-full">
                      <ArrowRight className="h-3 w-3 mr-1" />Armazenar Aqui
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="glass-card"><CardContent className="p-4 text-center">
          <Warehouse className="h-6 w-6 text-info mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{posicoes.filter(p => p.status === 'livre').length}</p>
          <p className="text-xs text-muted-foreground">Posições Livres</p>
        </CardContent></Card>
        <Card className="glass-card"><CardContent className="p-4 text-center">
          <Package className="h-6 w-6 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{produtos.length}</p>
          <p className="text-xs text-muted-foreground">Produtos Cadastrados</p>
        </CardContent></Card>
        <Card className="glass-card"><CardContent className="p-4 text-center">
          <MapPin className="h-6 w-6 text-success mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{posicoes.length}</p>
          <p className="text-xs text-muted-foreground">Total Posições</p>
        </CardContent></Card>
      </div>
    </div>
  );
}
