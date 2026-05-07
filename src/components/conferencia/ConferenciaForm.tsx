import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VolumeContagem } from "@/components/triagem/VolumeContagem";
import { VolumeData, TipoEmbalagem } from "./types";
import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";

interface ConferenciaFormProps {
  volumes: VolumeData[];
  quantidadeConferida: number;
  setQuantidadeConferida: (val: number) => void;
  pesoConferido: number;
  setPesoConferido: (val: number) => void;
  tipoEmbalagem: TipoEmbalagem;
  setTipoEmbalagem: (val: TipoEmbalagem) => void;
  observacoes: string;
  setObservacoes: (val: string) => void;
  quantidadeEsperada: number;
  handleVolumeChange: (id: number, qtd: number) => void;
  handleVolumeConfirm: (id: number) => void;
  balancaConectada: boolean;
  leituraBalanca: { peso: number } | null;
}

export function ConferenciaForm({
  volumes,
  quantidadeConferida,
  setQuantidadeConferida,
  pesoConferido,
  setPesoConferido,
  tipoEmbalagem,
  setTipoEmbalagem,
  observacoes,
  setObservacoes,
  quantidadeEsperada,
  handleVolumeChange,
  handleVolumeConfirm,
  balancaConectada,
  leituraBalanca
}: ConferenciaFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="quantidade">Quantidade Conferida</Label>
        {volumes.length > 1 && (
          <VolumeContagem
            volumes={volumes}
            onVolumeChange={handleVolumeChange}
            onVolumeConfirm={handleVolumeConfirm}
            totalEsperado={quantidadeEsperada}
            className="mb-4"
          />
        )}
        <Input
          id="quantidade"
          type="number"
          value={quantidadeConferida}
          onChange={(e) => setQuantidadeConferida(Number(e.target.value))}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="peso">Peso Conferido (kg)</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="peso"
            type="number"
            step="0.001"
            value={pesoConferido}
            onChange={(e) => setPesoConferido(Number(e.target.value))}
          />
          {balancaConectada && leituraBalanca && (
            <Button 
              variant="outline" 
              onClick={() => setPesoConferido(leituraBalanca.peso)}
            >
              <Scale className="h-4 w-4 mr-2" />
              Capturar
            </Button>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="embalagem">Tipo de Embalagem</Label>
        <Select value={tipoEmbalagem} onValueChange={(v) => setTipoEmbalagem(v as TipoEmbalagem)}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="original">Original do Fabricante</SelectItem>
            <SelectItem value="plastica">Caixa Plástica</SelectItem>
            <SelectItem value="generica">Embalagem Genérica</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Observações sobre o recebimento..."
          className="mt-1"
          rows={3}
        />
      </div>
    </div>
  );
}
