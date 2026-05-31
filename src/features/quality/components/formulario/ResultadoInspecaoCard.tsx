import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Hammer, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ResultadoInspecaoCardProps {
  quantidadeTotal: number;
  quantidadeAprovada: number;
  setQuantidadeAprovada: (val: number) => void;
  quantidadeReprovada: number;
  setQuantidadeReprovada: (val: number) => void;
  quantidadeConserto: number;
  setQuantidadeConserto: (val: number) => void;
  observacoes: string;
  setObservacoes: (val: string) => void;
}

export function ResultadoInspecaoCard({
  quantidadeTotal,
  quantidadeAprovada,
  setQuantidadeAprovada,
  quantidadeReprovada,
  setQuantidadeReprovada,
  quantidadeConserto,
  setQuantidadeConserto,
  observacoes,
  setObservacoes,
}: ResultadoInspecaoCardProps) {
  const totalInformado = quantidadeAprovada + quantidadeReprovada + (quantidadeConserto || 0);
  const discrepancia = totalInformado - quantidadeTotal;

  return (
    <Card className="overflow-hidden border-primary/20 shadow-lg">
      <CardHeader className="border-b border-primary/10 bg-primary/5">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Resultado Final da Inspeção
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-wider text-success">
                Aprovados
              </label>
              <CheckCircle2 className="h-3 w-3 text-success" />
            </div>
            <Input
              type="number"
              value={quantidadeAprovada}
              onChange={(e) => setQuantidadeAprovada(Number(e.target.value))}
              className="h-12 border-success/20 bg-success/5 text-center text-xl font-black focus:ring-success/20"
              min={0}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-wider text-warning">
                Para Conserto
              </label>
              <Hammer className="h-3 w-3 text-warning" />
            </div>
            <Input
              type="number"
              value={quantidadeConserto}
              onChange={(e) => setQuantidadeConserto(Number(e.target.value))}
              className="h-12 border-warning/20 bg-warning/5 text-center text-xl font-black focus:ring-warning/20"
              min={0}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-wider text-destructive">
                Reprovados
              </label>
              <XCircle className="h-3 w-3 text-destructive" />
            </div>
            <Input
              type="number"
              value={quantidadeReprovada}
              onChange={(e) => setQuantidadeReprovada(Number(e.target.value))}
              className="h-12 border-destructive/20 bg-destructive/5 text-center text-xl font-black focus:ring-destructive/20"
              min={0}
            />
          </div>
        </div>

        {discrepancia !== 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex items-center justify-between rounded-xl border p-3",
              discrepancia > 0
                ? "border-amber-500/20 bg-amber-500/10 text-amber-700"
                : "border-destructive/20 bg-destructive/10 text-destructive"
            )}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-bold">
                Atenção: Diferença de {Math.abs(discrepancia)} unidade(s) detectada!
              </span>
            </div>
            <Badge variant="outline" className="border-current text-[10px]">
              {discrepancia > 0 ? "Excesso" : "Falta"}
            </Badge>
          </motion.div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            Parecer do Inspetor (Observações)
          </label>
          <Textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Descreva detalhadamente o estado do lote e as razões de eventuais reprovas..."
            className="min-h-[100px] rounded-xl border-border/40 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-dashed border-border/40 bg-muted/30 p-4">
          <span className="text-xs font-bold text-muted-foreground">Total Processado:</span>
          <span className="text-lg font-black">
            {totalInformado} / {quantidadeTotal}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

import { motion } from "framer-motion";
