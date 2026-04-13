import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Target } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";

interface ProdutividadeChartsProps {
  dadosEvolucao: Array<{ periodo: string; triagens: number; tarefas: number }>;
  dadosBarras: Array<{ nome: string; triagens: number; tarefas: number }>;
  dadosRadar: Array<{ metrica: string; valor: number; fullMark: number }>;
  showRadar: boolean;
}

const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px'
  }
};

export function ProdutividadeCharts({ dadosEvolucao, dadosBarras, dadosRadar, showRadar }: ProdutividadeChartsProps) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" />Evolução</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dadosEvolucao}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="periodo" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip {...chartTooltipStyle} />
                  <Legend />
                  <Line type="monotone" dataKey="triagens" name="Triagens" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                  <Line type="monotone" dataKey="tarefas" name="Tarefas" stroke="hsl(142, 76%, 36%)" strokeWidth={2} dot={{ fill: 'hsl(142, 76%, 36%)' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" />Por Operador</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosBarras} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis dataKey="nome" type="category" width={60} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip {...chartTooltipStyle} />
                  <Legend />
                  <Bar dataKey="triagens" name="Triagens" fill="hsl(var(--primary))" radius={4} />
                  <Bar dataKey="tarefas" name="Tarefas" fill="hsl(142, 76%, 36%)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {showRadar && dadosRadar.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" />Perfil do Operador</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={dadosRadar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metrica" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Desempenho" dataKey="valor" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
