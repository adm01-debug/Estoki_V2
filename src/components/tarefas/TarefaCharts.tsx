import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, CartesianGrid, XAxis, YAxis, Bar } from "recharts";

interface TarefaChartsProps {
  dadosStatus: any[];
  dadosTipo: any[];
}

export function TarefaCharts({ dadosStatus, dadosTipo }: TarefaChartsProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Por Status</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dadosStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {dadosStatus.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Por Tipo</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosTipo} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" /><XAxis type="number" />
                <YAxis dataKey="tipo" type="category" width={100} /><Tooltip />
                <Bar dataKey="quantidade" fill="hsl(var(--primary))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}