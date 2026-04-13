import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from "recharts";

interface ChartDataPoint {
  dataFormatada?: string;
  semana?: string;
  itensTriados?: number;
  taxaAprovacao?: number;
  itensAprovados?: number;
  itensReprovados?: number;
  acuracidadePicking?: number;
  media?: number;
}

interface KPIEvolucaoChartsProps {
  evolucaoDiaria: ChartDataPoint[];
  evolucaoSemanal: ChartDataPoint[];
}

export function KPIEvolucaoCharts({ evolucaoDiaria, evolucaoSemanal }: KPIEvolucaoChartsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-lg">Evolução Diária - Triagem</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={evolucaoDiaria}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dataFormatada" /><YAxis /><Tooltip />
                <Area type="monotone" dataKey="itensTriados" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} name="Itens Triados" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Taxa de Aprovação (%)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolucaoDiaria}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dataFormatada" /><YAxis domain={[0, 100]} /><Tooltip />
                <Line type="monotone" dataKey="taxaAprovacao" stroke="#10B981" strokeWidth={2} dot={false} name="Taxa de Aprovação" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-lg">Média Semanal - Itens Triados</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={evolucaoSemanal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="semana" /><YAxis /><Tooltip />
              <Bar dataKey="media" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Média" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export function KPITriagemCharts({ evolucaoDiaria }: { evolucaoDiaria: ChartDataPoint[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Aprovados vs Reprovados por Dia</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={evolucaoDiaria}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dataFormatada" /><YAxis /><Tooltip /><Legend />
            <Bar dataKey="itensTriados" fill="#10B981" name="Triados" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function KPIPickingCharts({ evolucaoDiaria }: { evolucaoDiaria: ChartDataPoint[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Acuracidade de Picking (%)</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={evolucaoDiaria}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dataFormatada" /><YAxis domain={[90, 100]} /><Tooltip />
            <Line type="monotone" dataKey="acuracidadePicking" stroke="#8B5CF6" strokeWidth={2} dot={false} name="Acuracidade" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
