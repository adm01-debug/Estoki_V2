import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  QrCode, 
  Search, 
  ArrowRight, 
  Package, 
  Warehouse,
  RotateCcw,
  Truck,
  ClipboardEdit,
  Clock
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { TipoMovimentacao, Movimentacao } from "@/types/estoque";

const tiposMovimento: Array<{ value: TipoMovimentacao; label: string; icon: typeof ArrowRight }> = [
  { value: "transferencia", label: "Transferência (PP → PP)", icon: ArrowRight },
  { value: "saida_gravacao", label: "Saída para Gravação", icon: Truck },
  { value: "retorno_gravacao", label: "Retorno da Gravação", icon: RotateCcw },
  { value: "expedicao", label: "Envio para Box (Expedição)", icon: Package },
  { value: "ajuste", label: "Ajuste de Inventário", icon: ClipboardEdit },
];

// Histórico mockado
const mockHistorico: Movimentacao[] = [
  {
    id: 1,
    tipo: "saida_gravacao",
    itemId: 1,
    pedido: "2638-1",
    produto: "Mochila Preta",
    volumes: [2],
    quantidade: 125,
    origem: "PP1-S05-N2",
    destino: "Gravação Silk",
    responsavelId: 1,
    responsavelNome: "Carlos Silva",
    dataHora: new Date("2025-12-16T16:45:00"),
  },
  {
    id: 2,
    tipo: "armazenamento",
    itemId: 1,
    pedido: "2638-1",
    produto: "Mochila Preta",
    volumes: [1, 2, 3, 4],
    quantidade: 490,
    origem: "Triagem",
    destino: "PP1-S05-N2, PP1-S06-N2",
    responsavelId: 2,
    responsavelNome: "João Oliveira",
    dataHora: new Date("2025-12-16T16:30:00"),
  },
  {
    id: 3,
    tipo: "recebimento",
    itemId: 1,
    pedido: "2638-1",
    produto: "Mochila Preta",
    volumes: [1, 2, 3, 4],
    quantidade: 500,
    destino: "Conferência",
    responsavelId: 3,
    responsavelNome: "Ana Costa",
    observacao: "Fornecedor: XBZ Brindes",
    dataHora: new Date("2025-12-16T14:30:00"),
  },
];

const tipoIcons: Record<TipoMovimentacao | "recebimento" | "armazenamento", string> = {
  recebimento: "📦",
  armazenamento: "📥",
  transferencia: "🔄",
  saida_gravacao: "📤",
  retorno_gravacao: "📥",
  expedicao: "🚚",
  ajuste: "📝",
};

const tipoLabels: Record<TipoMovimentacao | "recebimento" | "armazenamento", string> = {
  recebimento: "RECEBIMENTO",
  armazenamento: "ARMAZENAMENTO",
  transferencia: "TRANSFERÊNCIA",
  saida_gravacao: "SAÍDA GRAVAÇÃO",
  retorno_gravacao: "RETORNO GRAVAÇÃO",
  expedicao: "EXPEDIÇÃO",
  ajuste: "AJUSTE",
};

export default function MovimentacaoPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("registrar");
  const [tipoMovimento, setTipoMovimento] = useState<TipoMovimentacao>("saida_gravacao");
  const [itemSelecionado, setItemSelecionado] = useState<{ pedido: string; produto: string; local: string } | null>({
    pedido: "2638-1",
    produto: "Mochila Preta - Vol 2/4",
    local: "PP1-S05-N2",
  });

  return (
    <AppLayout title="Movimentação" showBack>
      <div className="p-4 lg:pl-72 space-y-4 animate-fade-in">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="registrar" className="gap-2">
              <ArrowRight className="h-4 w-4" />
              Registrar
            </TabsTrigger>
            <TabsTrigger value="historico" className="gap-2">
              <Clock className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Registrar Movimentação */}
          <TabsContent value="registrar" className="space-y-4">
            {/* Tipo de Movimento */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <Label className="text-sm font-medium mb-3 block">Tipo de Movimento:</Label>
              <RadioGroup
                value={tipoMovimento}
                onValueChange={(v) => setTipoMovimento(v as TipoMovimentacao)}
                className="space-y-2"
              >
                {tiposMovimento.map((tipo) => (
                  <div
                    key={tipo.value}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer",
                      tipoMovimento === tipo.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setTipoMovimento(tipo.value)}
                  >
                    <RadioGroupItem value={tipo.value} id={tipo.value} />
                    <tipo.icon className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor={tipo.value} className="flex-1 cursor-pointer">
                      {tipo.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Item */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <Label className="text-sm font-medium mb-3 block">📦 ITEM</Label>
              <div className="flex gap-2 mb-3">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => navigate("/scanner")}>
                  <QrCode className="h-4 w-4" />
                  Escanear QR
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <Search className="h-4 w-4" />
                  Buscar
                </Button>
              </div>

              {itemSelecionado && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1">Item selecionado:</div>
                  <div className="font-semibold">#{itemSelecionado.pedido} - {itemSelecionado.produto}</div>
                  <div className="text-sm text-muted-foreground">Local atual: {itemSelecionado.local}</div>
                </div>
              )}
            </div>

            {/* Destino */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <Label className="text-sm font-medium mb-3 block">📍 DESTINO</Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="setor" className="text-xs text-muted-foreground">Setor</Label>
                  <Select defaultValue="silk">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o setor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="silk">Gravação - Silk</SelectItem>
                      <SelectItem value="laser">Gravação - Laser</SelectItem>
                      <SelectItem value="sublimacao">Gravação - Sublimação</SelectItem>
                      <SelectItem value="bordado">Gravação - Bordado</SelectItem>
                      <SelectItem value="expedicao">Expedição</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="responsavel" className="text-xs text-muted-foreground">Responsável</Label>
                  <Select defaultValue="maria">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maria">Maria Santos</SelectItem>
                      <SelectItem value="joao">João Silva</SelectItem>
                      <SelectItem value="carlos">Carlos Oliveira</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quantidade" className="text-xs text-muted-foreground">Quantidade</Label>
                  <Input type="number" defaultValue={125} />
                </div>

                <div>
                  <Label htmlFor="observacao" className="text-xs text-muted-foreground">Observação</Label>
                  <Textarea placeholder="Ex: Pedido urgente - prazo 18/12" />
                </div>
              </div>
            </div>

            <Button className="w-full h-12 text-base font-semibold gap-2">
              ✅ CONFIRMAR MOVIMENTAÇÃO
            </Button>
          </TabsContent>

          {/* Histórico */}
          <TabsContent value="historico" className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar..." className="pl-10" />
              </div>
              <Select defaultValue="hoje">
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="semana">Esta semana</SelectItem>
                  <SelectItem value="mes">Este mês</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {mockHistorico.map((mov) => (
                <div key={mov.id} className="bg-card rounded-xl p-4 border border-border">
                  <div className="text-xs text-muted-foreground mb-2">
                    {mov.dataHora.toLocaleDateString("pt-BR")} {mov.dataHora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{tipoIcons[mov.tipo]}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{tipoLabels[mov.tipo]}</div>
                      <div className="text-sm">
                        #{mov.pedido} {mov.volumes.length > 1 ? `Vol ${mov.volumes.join(", ")}` : `Vol ${mov.volumes[0]}`} | {mov.quantidade} un
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {mov.origem && `${mov.origem} → `}{mov.destino}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Por: {mov.responsavelNome}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
