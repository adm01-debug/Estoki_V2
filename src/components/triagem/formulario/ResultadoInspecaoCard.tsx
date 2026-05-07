import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface ResultadoInspecaoCardProps {
  quantidadeTotal: number;
  quantidadeAprovada: number;
  setQuantidadeAprovada: (val: number) => void;
  quantidadeReprovada: number;
  setQuantidadeReprovada: (val: number) => void;
  observacoes: string;
  setObservacoes: (val: string) => void;
}

export function ResultadoInspecaoCard({
  quantidadeTotal,
  quantidadeAprovada,
  setQuantidadeAprovada,
  quantidadeReprovada,
  setQuantidadeReprovada,
  observacoes,
  setObservacoes
}: ResultadoInspecaoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Resultado da Inspeção</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">Quantidade Aprovada</label>
            <input
              type="number"
              value={quantidadeAprovada}
              onChange={(e) => setQuantidadeAprovada(Number(e.target.value))}
              className="w-full mt-1 p-2 border rounded text-lg font-bold text-center"
              min={0}
              max={quantidadeTotal}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Quantidade Reprovada</label>
            <input
              type="number"
              value={quantidadeReprovada}
              onChange={(e) => setQuantidadeReprovada(Number(e.target.value))}
              className="w-full mt-1 p-2 border rounded text-lg font-bold text-center"
              min={0}
              max={quantidadeTotal}
            />
          </div>
        </div>
        
        <div>
          <label className="text-sm text-muted-foreground">Observações</label>
          <Textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Descreva qualquer problema ou observação..."
            className="mt-1"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
