import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area,
} from "recharts";

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
    color: "hsl(var(--foreground))",
  },
};

interface EstoqueChartsProps {
  posicoes: { status: string; tipo?: string; porta_palete?: string }[];
}

export function EstoqueCharts({ posicoes }: EstoqueChartsProps) {
  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    posicoes.forEach(p => { map[p.status] = (map[p.status] || 0) + 1; });
    return [
      { name: "Ocupado", value: map["ocupado"] || 0, color: "hsl(142, 76%, 36%)" },
      { name: "Livre", value: map["livre"] || 0, color: "hsl(var(--muted-foreground))" },
      { name: "Reservado", value: map["reservado"] || 0, color: "hsl(38, 92%, 50%)" },
      { name: "Bloqueado", value: map["bloqueado"] || 0, color: "hsl(0, 84%, 60%)" },
    ].filter(d => d.value > 0);
  }, [posicoes]);

  const ruaData = useMemo(() => {
    const map: Record<string, { ocupado: number; livre: number }> = {};
    posicoes.filter(p => p.porta_palete).forEach(p => {
      const rua = p.porta_palete!;
      if (!map[rua]) map[rua] = { ocupado: 0, livre: 0 };
      if (p.status === "ocupado") map[rua].ocupado++;
      else map[rua].livre++;
    });
    return Object.entries(map).map(([name, v]) => ({ name, ...v })).slice(0, 10);
  }, [posicoes]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Distribuição por Status</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {ruaData.length > 0 && (
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Ocupação por Rua</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ruaData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="ocupado" name="Ocupado" fill="hsl(142, 76%, 36%)" radius={[3, 3, 0, 0]} maxBarSize={24} stackId="a" />
                <Bar dataKey="livre" name="Livre" fill="hsl(var(--muted-foreground))" radius={[3, 3, 0, 0]} maxBarSize={24} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface MovimentacaoChartsProps {
  movimentacoes: { tipo: string; created_at: string; quantidade: number }[];
}

export function MovimentacaoCharts({ movimentacoes }: MovimentacaoChartsProps) {
  const tipoData = useMemo(() => {
    const map: Record<string, number> = {};
    movimentacoes.forEach(m => { map[m.tipo] = (map[m.tipo] || 0) + 1; });
    const labels: Record<string, string> = {
      armazenamento: "Armazenamento", separacao: "Separação", saida_transporte: "Saída",
      devolucao: "Devolução", ajuste_estoque: "Ajuste",
    };
    return Object.entries(map).map(([k, v]) => ({ name: labels[k] || k, value: v }));
  }, [movimentacoes]);

  const dailyData = useMemo(() => {
    const days: Record<string, number> = {};
    const labels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    movimentacoes.forEach(m => {
      const d = new Date(m.created_at);
      const key = labels[d.getDay()];
      days[key] = (days[key] || 0) + 1;
    });
    return labels.map(l => ({ name: l, value: days[l] || 0 }));
  }, [movimentacoes]);

  const COLORS = ["hsl(var(--primary))", "hsl(142, 76%, 36%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)", "hsl(221, 83%, 53%)"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Por Tipo de Movimento</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={tipoData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                {tipoData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Volume por Dia da Semana</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="movGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="value" name="Movimentações" stroke="hsl(var(--primary))" fill="url(#movGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

interface RecebimentoChartsProps {
  items: { status: string; fornecedor?: string | null; quantidade_atual: number; quantidade_inicial: number }[];
}

export function RecebimentoCharts({ items }: RecebimentoChartsProps) {
  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach(i => { map[i.status] = (map[i.status] || 0) + 1; });
    const labels: Record<string, string> = {
      aguardando: "Aguardando", em_transito: "Trânsito", recebido: "Recebido",
      em_conferencia: "Conferência", conferido: "Conferido", divergencia: "Divergência",
    };
    const colors: Record<string, string> = {
      aguardando: "hsl(var(--muted-foreground))", em_transito: "hsl(221, 83%, 53%)",
      recebido: "hsl(38, 92%, 50%)", em_conferencia: "hsl(262, 83%, 58%)",
      conferido: "hsl(142, 76%, 36%)", divergencia: "hsl(0, 84%, 60%)",
    };
    return Object.entries(map).map(([k, v]) => ({ name: labels[k] || k, value: v, color: colors[k] || "hsl(var(--primary))" }));
  }, [items]);

  const fornecedorData = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach(i => {
      const f = i.fornecedor || "Desconhecido";
      map[f] = (map[f] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name: name.length > 12 ? name.slice(0, 12) + "…" : name, value }));
  }, [items]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Status dos Recebimentos</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {fornecedorData.length > 1 && (
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Top Fornecedores</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={fornecedorData} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={50} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" name="Lotes" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface TriagemChartsProps {
  items: { resultado?: string | null; data_fim?: string | null; created_at: string }[];
}

export function TriagemCharts({ items }: TriagemChartsProps) {
  const resultadoData = useMemo(() => {
    const emAndamento = items.filter(i => !i.data_fim).length;
    const aprovados = items.filter(i => i.resultado === "aprovado").length;
    const reprovados = items.filter(i => i.resultado === "reprovado").length;
    const ressalvas = items.filter(i => i.resultado === "ressalva").length;
    return [
      { name: "Em Andamento", value: emAndamento, color: "hsl(221, 83%, 53%)" },
      { name: "Aprovados", value: aprovados, color: "hsl(142, 76%, 36%)" },
      { name: "Reprovados", value: reprovados, color: "hsl(0, 84%, 60%)" },
      { name: "Ressalvas", value: ressalvas, color: "hsl(38, 92%, 50%)" },
    ].filter(d => d.value > 0);
  }, [items]);

  const weeklyData = useMemo(() => {
    const days: Record<string, number> = {};
    const labels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    items.forEach(i => {
      const d = new Date(i.created_at);
      days[labels[d.getDay()]] = (days[labels[d.getDay()]] || 0) + 1;
    });
    return labels.map(l => ({ name: l, value: days[l] || 0 }));
  }, [items]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Resultados da Triagem</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={resultadoData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                {resultadoData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Volume Semanal</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" name="Triagens" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

interface LotesChartsProps {
  lotes: { status: string; data_validade?: string | null; quantidade_atual: number; quantidade_inicial: number; fornecedor?: string | null }[];
}

export function LotesCharts({ lotes }: LotesChartsProps) {
  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    lotes.forEach(l => { map[l.status] = (map[l.status] || 0) + 1; });
    const colors: Record<string, string> = {
      aguardando: "hsl(var(--muted-foreground))", recebido: "hsl(38, 92%, 50%)",
      conferido: "hsl(142, 76%, 36%)", divergencia: "hsl(0, 84%, 60%)",
      em_conferencia: "hsl(221, 83%, 53%)", em_transito: "hsl(262, 83%, 58%)",
    };
    return Object.entries(map).map(([k, v]) => ({ name: k, value: v, color: colors[k] || "hsl(var(--primary))" }));
  }, [lotes]);

  const consumoData = useMemo(() => {
    const consumido = lotes.reduce((acc, l) => acc + (l.quantidade_inicial - l.quantidade_atual), 0);
    const restante = lotes.reduce((acc, l) => acc + l.quantidade_atual, 0);
    return [
      { name: "Consumido", value: consumido, color: "hsl(var(--primary))" },
      { name: "Em Estoque", value: restante, color: "hsl(142, 76%, 36%)" },
    ].filter(d => d.value > 0);
  }, [lotes]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Lotes por Status</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {consumoData.length > 0 && (
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Consumo vs Estoque</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={consumoData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                  {consumoData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface OndasChartsProps {
  ondas: { status: string; prioridade: string; total_tarefas?: number; tarefas_concluidas?: number }[];
}

export function OndasCharts({ ondas }: OndasChartsProps) {
  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    ondas.forEach(o => { map[o.status] = (map[o.status] || 0) + 1; });
    const colors: Record<string, string> = {
      pendente: "hsl(var(--muted-foreground))", em_andamento: "hsl(38, 92%, 50%)",
      concluida: "hsl(142, 76%, 36%)", cancelada: "hsl(0, 84%, 60%)",
    };
    return Object.entries(map).map(([k, v]) => ({ name: k, value: v, color: colors[k] || "hsl(var(--primary))" }));
  }, [ondas]);

  const prioridadeData = useMemo(() => {
    const map: Record<string, number> = {};
    ondas.forEach(o => { map[o.prioridade] = (map[o.prioridade] || 0) + 1; });
    const labels: Record<string, string> = { baixa: "Baixa", media: "Média", alta: "Alta", urgente: "Urgente" };
    const colors: Record<string, string> = {
      baixa: "hsl(var(--muted-foreground))", media: "hsl(221, 83%, 53%)",
      alta: "hsl(38, 92%, 50%)", urgente: "hsl(0, 84%, 60%)",
    };
    return Object.entries(map).map(([k, v]) => ({ name: labels[k] || k, value: v, color: colors[k] || "hsl(var(--primary))" }));
  }, [ondas]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Ondas por Status</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Distribuição de Prioridade</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={prioridadeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" name="Ondas" radius={[4, 4, 0, 0]} maxBarSize={28}>
                {prioridadeData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

interface AlertasChartsProps {
  historico: { severidade: string; status: string; created_at: string }[];
}

export function AlertasCharts({ historico }: AlertasChartsProps) {
  const severidadeData = useMemo(() => {
    const map: Record<string, number> = {};
    historico.forEach(a => { map[a.severidade] = (map[a.severidade] || 0) + 1; });
    const labels: Record<string, string> = { info: "Info", warning: "Aviso", critical: "Crítico" };
    const colors: Record<string, string> = {
      info: "hsl(221, 83%, 53%)", warning: "hsl(38, 92%, 50%)", critical: "hsl(0, 84%, 60%)",
    };
    return Object.entries(map).map(([k, v]) => ({ name: labels[k] || k, value: v, color: colors[k] || "hsl(var(--primary))" }));
  }, [historico]);

  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    historico.forEach(a => { map[a.status] = (map[a.status] || 0) + 1; });
    const labels: Record<string, string> = { ativo: "Ativo", reconhecido: "Reconhecido", resolvido: "Resolvido" };
    const colors: Record<string, string> = {
      ativo: "hsl(0, 84%, 60%)", reconhecido: "hsl(38, 92%, 50%)", resolvido: "hsl(142, 76%, 36%)",
    };
    return Object.entries(map).map(([k, v]) => ({ name: labels[k] || k, value: v, color: colors[k] || "hsl(var(--primary))" }));
  }, [historico]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Alertas por Severidade</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={severidadeData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                {severidadeData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Alertas por Status</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

interface RomaneiosChartsProps {
  romaneios: { status: string; entregas_realizadas: number; total_entregas: number }[];
}

export function RomaneiosCharts({ romaneios }: RomaneiosChartsProps) {
  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    romaneios.forEach(r => { map[r.status] = (map[r.status] || 0) + 1; });
    const colors: Record<string, string> = {
      rascunho: "hsl(var(--muted-foreground))", confirmado: "hsl(221, 83%, 53%)",
      em_transito: "hsl(38, 92%, 50%)", entregue: "hsl(142, 76%, 36%)",
      parcial: "hsl(262, 83%, 58%)", cancelado: "hsl(0, 84%, 60%)",
    };
    return Object.entries(map).map(([k, v]) => ({ name: k, value: v, color: colors[k] || "hsl(var(--primary))" }));
  }, [romaneios]);

  const entregaData = useMemo(() => {
    const realizadas = romaneios.reduce((a, r) => a + r.entregas_realizadas, 0);
    const pendentes = romaneios.reduce((a, r) => a + (r.total_entregas - r.entregas_realizadas), 0);
    return [
      { name: "Realizadas", value: realizadas, color: "hsl(142, 76%, 36%)" },
      { name: "Pendentes", value: pendentes, color: "hsl(38, 92%, 50%)" },
    ].filter(d => d.value > 0);
  }, [romaneios]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Romaneios por Status</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {entregaData.length > 0 && (
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Entregas: Realizadas vs Pendentes</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={entregaData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                  {entregaData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface GamificacaoChartsProps {
  xpTotal: number;
  nivel: number;
  conquistasDesbloqueadas: number;
  totalConquistas: number;
  desafiosConcluidos: number;
  totalDesafios: number;
  streakAtual: number;
}

export function GamificacaoCharts({ xpTotal, nivel, conquistasDesbloqueadas, totalConquistas, desafiosConcluidos, totalDesafios, streakAtual }: GamificacaoChartsProps) {
  const progressData = [
    { name: "Conquistas", achieved: conquistasDesbloqueadas, total: totalConquistas || 1 },
    { name: "Desafios", achieved: desafiosConcluidos, total: totalDesafios || 1 },
  ];

  const barData = progressData.map(d => ({
    name: d.name,
    concluido: d.achieved,
    restante: d.total - d.achieved,
  }));

  const xpData = useMemo(() => {
    const levels = [];
    for (let i = Math.max(1, nivel - 3); i <= nivel + 2; i++) {
      levels.push({ name: `Nv ${i}`, xp: i === nivel ? xpTotal : Math.round(100 * Math.pow(1.5, i - 1)) });
    }
    return levels;
  }, [xpTotal, nivel]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Progresso de Conquistas</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="concluido" name="Concluído" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} stackId="a" maxBarSize={40} />
              <Bar dataKey="restante" name="Restante" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} stackId="a" maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Evolução de XP</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={xpData}>
              <defs>
                <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="xp" name="XP" stroke="hsl(var(--primary))" fill="url(#xpGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
