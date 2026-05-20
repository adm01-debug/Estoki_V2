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
  setObservacoes
}: ResultadoInspecaoCardProps) {
  const totalInformado = quantidadeAprovada + quantidadeReprovada + (quantidadeConserto || 0);
  const discrepancia = totalInformado - quantidadeTotal;

  return (
    <Card className="border-primary/20 shadow-lg overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Resultado Final da Inspeção
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase text-success tracking-wider">Aprovados</label>
              <CheckCircle2 className="h-3 w-3 text-success" />
            </div>
            <Input
              type="number"
              value={quantidadeAprovada}
              onChange={(e) => setQuantidadeAprovada(Number(e.target.value))}
              className="text-xl font-black text-center h-12 bg-success/5 border-success/20 focus:ring-success/20"
              min={0}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase text-warning tracking-wider">Para Conserto</label>
              <Hammer className="h-3 w-3 text-warning" />
            </div>
            <Input
              type="number"
              value={quantidadeConserto}
              onChange={(e) => setQuantidadeConserto(Number(e.target.value))}
              className="text-xl font-black text-center h-12 bg-warning/5 border-warning/20 focus:ring-warning/20"
              min={0}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase text-destructive tracking-wider">Reprovados</label>
              <XCircle className="h-3 w-3 text-destructive" />
            </div>
            <Input
              type="number"
              value={quantidadeReprovada}
              onChange={(e) => setQuantidadeReprovada(Number(e.target.value))}
              className="text-xl font-black text-center h-12 bg-destructive/5 border-destructive/20 focus:ring-destructive/20"
              min={0}
            />
          </div>
        </div>

        {discrepancia !== 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-3 rounded-xl border flex items-center justify-between",
              discrepancia > 0 ? "bg-amber-500/10 border-amber-500/20 text-amber-700" : "bg-destructive/10 border-destructive/20 text-destructive"
            )}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-bold">Atenção: Diferença de {Math.abs(discrepancia)} unidade(s) detectada!</span>
            </div>
            <Badge variant="outline" className="border-current text-[10px]">
              {discrepancia > 0 ? "Excesso" : "Falta"}
            </Badge>
          </motion.div>
        )}
        
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Parecer do Inspetor (Observações)</label>
          <Textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Descreva detalhadamente o estado do lote e as razões de eventuais reprovas..."
            className="min-h-[100px] rounded-xl border-border/40 focus:ring-primary/20"
          />
        </div>

        <div className="bg-muted/30 p-4 rounded-xl border border-dashed border-border/40 flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground">Total Processado:</span>
          <span className="text-lg font-black">{totalInformado} / {quantidadeTotal}</span>
        </div>
      </CardContent>
    </Card>
  );
}

import { motion } from "framer-motion";
