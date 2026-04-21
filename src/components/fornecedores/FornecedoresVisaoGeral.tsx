import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Fornecedor, ClassificacaoFornecedor } from "@/hooks/useFornecedores";

const classificacaoConfig: Record<ClassificacaoFornecedor, { label: string; color: string }> = {
  A: { label: "Excelente", color: "text-green-600" },
  B: { label: "Bom", color: "text-blue-600" },
  C: { label: "Regular", color: "text-amber-600" },
  D: { label: "Crítico", color: "text-red-600" },
};

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(221, 83%, 53%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

interface Props {
  fornecedoresFiltrados: Fornecedor[];
  dadosClassificacao: { name: string; value: number; color: string }[];
  dadosQualidade: { nome: string; qualidade: number; pontualidade: number }[];
  searchTerm: string;
  classificacaoFilter: string;
  onSearchChange: (v: string) => void;
  onClassificacaoChange: (v: string) => void;
}

const getTendenciaIcon = (tendencia?: string) => {
  if (tendencia === "subindo") return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (tendencia === "descendo") return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-gray-400" />;
};

export function FornecedoresVisaoGeral({ fornecedoresFiltrados, dadosClassificacao, dadosQualidade, searchTerm, classificacaoFilter, onSearchChange, onClassificacaoChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Por Classificação</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dadosClassificacao} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {dadosClassificacao.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Top Fornecedores</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosQualidade} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="nome" type="category" width={80} />
                  <Tooltip /><Legend />
                  <Bar dataKey="qualidade" name="Qualidade" fill={COLORS[0]} radius={4} />
                  <Bar dataKey="pontualidade" name="Pontualidade" fill={COLORS[1]} radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar fornecedor..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="pl-9" />
        </div>
        <Select value={classificacaoFilter} onValueChange={onClassificacaoChange}>
          <SelectTrigger className="w-[150px]"><Star className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="A">Classe A</SelectItem>
            <SelectItem value="B">Classe B</SelectItem>
            <SelectItem value="C">Classe C</SelectItem>
            <SelectItem value="D">Classe D</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead><TableHead>Classe</TableHead>
                <TableHead className="text-right">Qualidade</TableHead>
                <TableHead className="text-right">Pontualidade</TableHead>
                <TableHead className="text-center">Tendência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fornecedoresFiltrados.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum fornecedor encontrado</TableCell></TableRow>
              ) : (
                fornecedoresFiltrados.map((f) => {
                  const cls = classificacaoConfig[f.classificacao];
                  return (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.nome}</TableCell>
                      <TableCell><Badge variant="outline" className={cls.color}>{f.classificacao} - {cls.label}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Progress value={f.percentual_qualidade} className="w-20 h-2" />
                          <span className="text-sm">{f.percentual_qualidade.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Progress value={f.percentual_pontualidade} className="w-20 h-2" />
                          <span className="text-sm">{f.percentual_pontualidade.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{getTendenciaIcon(f.tendencia)}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
