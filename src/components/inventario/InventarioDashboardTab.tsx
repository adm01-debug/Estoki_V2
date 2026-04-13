import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ciclo } from "@/hooks/useInventarioCiclico";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";

const COLORS = ['hsl(var(--primary))', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

interface InventarioDashboardTabProps {
  ciclos: Ciclo[];
}

export function InventarioDashboardTab({ ciclos }: InventarioDashboardTabProps) {
  const stats = useMemo(() => ({
    agendados: ciclos.filter(c => c.status === "agendado").length,
    emAndamento: ciclos.filter(c => c.status === "em_andamento").length,
    concluidos: ciclos.filter(c => c.status === "concluido").length,
  }), [ciclos]);

  const dadosStatus = useMemo(() => [
    { name: "Agendados", value: stats.agendados, color: COLORS[0] },
    { name: "Em Andamento", value: stats.emAndamento, color: COLORS[1] },
    { name: "Concluídos", value: stats.concluidos, color: COLORS[2] },
  ].filter(d => d.value > 0), [stats]);

  const dadosAcuracidade = useMemo(() =>
    ciclos.filter(c => c.status === "concluido" && c.acuracidade !== null).slice(0, 5)
      .map(c => ({ nome: c.nome.substring(0, 15) + "...", acuracidade: c.acuracidade || 0 })),
  [ciclos]);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Distribuição por Status</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dadosStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {dadosStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Acuracidade por Ciclo</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[250px]">
            {dadosAcuracidade.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosAcuracidade} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="nome" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="acuracidade" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">Nenhum ciclo concluído ainda</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
