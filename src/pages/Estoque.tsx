import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QrCode, Warehouse, Package, Box, Search } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { PosicaoEstoque, StatusPosicao } from "@/types/estoque";

// Gerar posições mockadas para Porta-Paletes
const generatePPPositions = (): PosicaoEstoque[] => {
  const positions: PosicaoEstoque[] = [];
  const pps = ["PP1", "PP2", "PP3"] as const;
  const niveis = ["N1", "N2", "N3", "N4"] as const;
  const secoes = Array.from({ length: 10 }, (_, i) => String(i + 1).padStart(2, "0"));

  pps.forEach((pp) => {
    secoes.forEach((secao) => {
      niveis.forEach((nivel) => {
        const randomStatus: StatusPosicao =
          Math.random() > 0.2
            ? "ocupado"
            : Math.random() > 0.5
            ? "reservado"
            : "livre";

        positions.push({
          id: `${pp}-S${secao}-${nivel}`,
          tipo: "porta-palete",
          portaPalete: pp,
          secao,
          nivel,
          status: randomStatus,
          atualizadoEm: new Date(),
        });
      });
    });
  });

  return positions;
};

// Gerar posições mockadas para Boxes
const generateBoxPositions = (): PosicaoEstoque[] => {
  return Array.from({ length: 16 }, (_, i) => {
    const boxNum = String(i + 1).padStart(2, "0");
    const randomStatus: StatusPosicao = Math.random() > 0.5 ? "ocupado" : "livre";

    return {
      id: `BOX-${boxNum}`,
      tipo: "box",
      box: boxNum,
      status: randomStatus,
      atualizadoEm: new Date(),
    };
  });
};

const ppPositions = generatePPPositions();
const boxPositions = generateBoxPositions();

const statusColors: Record<StatusPosicao, string> = {
  livre: "bg-muted border-2 border-dashed border-border hover:border-primary/50",
  ocupado: "bg-success/20 border-2 border-success hover:bg-success/30",
  reservado: "bg-warning/20 border-2 border-warning hover:bg-warning/30",
  bloqueado: "bg-destructive/20 border-2 border-destructive",
};

const statusLabels: Record<StatusPosicao, string> = {
  livre: "Livre",
  ocupado: "Ocupado",
  reservado: "Reservado",
  bloqueado: "Bloqueado",
};

export default function EstoquePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("porta-paletes");
  const [selectedPosition, setSelectedPosition] = useState<PosicaoEstoque | null>(null);

  // Calcular estatísticas
  const ppStats = {
    ocupadas: ppPositions.filter((p) => p.status === "ocupado").length,
    livres: ppPositions.filter((p) => p.status === "livre").length,
    reservadas: ppPositions.filter((p) => p.status === "reservado").length,
    total: ppPositions.length,
  };

  const boxStats = {
    ocupados: boxPositions.filter((p) => p.status === "ocupado").length,
    livres: boxPositions.filter((p) => p.status === "livre").length,
    total: boxPositions.length,
  };

  return (
    <AppLayout
      title="Estoque"
      showBack
      rightAction={
        <Button size="sm" variant="outline" className="gap-2" onClick={() => navigate("/scanner")}>
          <QrCode className="h-4 w-4" />
          <span className="hidden sm:inline">Scan</span>
        </Button>
      }
    >
      <div className="p-4 lg:pl-72 space-y-4 animate-fade-in">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="porta-paletes" className="gap-2">
              <Warehouse className="h-4 w-4" />
              <span className="hidden sm:inline">Porta-Paletes</span>
              <span className="sm:hidden">PP</span>
            </TabsTrigger>
            <TabsTrigger value="boxes" className="gap-2">
              <Box className="h-4 w-4" />
              <span>Boxes</span>
            </TabsTrigger>
            <TabsTrigger value="lista" className="gap-2">
              <Package className="h-4 w-4" />
              <span>Lista</span>
            </TabsTrigger>
          </TabsList>

          {/* Porta-Paletes View */}
          <TabsContent value="porta-paletes" className="space-y-4">
            {/* Resumo */}
            <div className="grid grid-cols-3 gap-3">
              <div className="kpi-card text-center">
                <div className="text-2xl font-bold text-success">{ppStats.ocupadas}</div>
                <div className="text-xs text-muted-foreground">Ocupadas ({((ppStats.ocupadas / ppStats.total) * 100).toFixed(0)}%)</div>
              </div>
              <div className="kpi-card text-center">
                <div className="text-2xl font-bold text-muted-foreground">{ppStats.livres}</div>
                <div className="text-xs text-muted-foreground">Livres ({((ppStats.livres / ppStats.total) * 100).toFixed(0)}%)</div>
              </div>
              <div className="kpi-card text-center">
                <div className="text-2xl font-bold text-warning">{ppStats.reservadas}</div>
                <div className="text-xs text-muted-foreground">Reservadas ({((ppStats.reservadas / ppStats.total) * 100).toFixed(0)}%)</div>
              </div>
            </div>

            {/* Mapa Visual */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["PP1", "PP2", "PP3"] as const).map((pp) => (
                <PortaPaleteMap
                  key={pp}
                  pp={pp}
                  positions={ppPositions.filter((p) => p.portaPalete === pp)}
                  onSelectPosition={setSelectedPosition}
                />
              ))}
            </div>

            {/* Legenda */}
            <div className="flex flex-wrap gap-4 justify-center pt-2">
              {(Object.keys(statusColors) as StatusPosicao[]).map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <div className={cn("w-4 h-4 rounded", statusColors[status])} />
                  <span className="text-sm text-muted-foreground">{statusLabels[status]}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Boxes View */}
          <TabsContent value="boxes" className="space-y-4">
            {/* Resumo */}
            <div className="grid grid-cols-2 gap-3">
              <div className="kpi-card text-center">
                <div className="text-2xl font-bold text-success">{boxStats.ocupados}</div>
                <div className="text-xs text-muted-foreground">Ocupados</div>
              </div>
              <div className="kpi-card text-center">
                <div className="text-2xl font-bold text-muted-foreground">{boxStats.livres}</div>
                <div className="text-xs text-muted-foreground">Livres</div>
              </div>
            </div>

            {/* Grid de Boxes */}
            <div className="grid grid-cols-4 gap-3">
              {boxPositions.map((box) => (
                <button
                  key={box.id}
                  onClick={() => setSelectedPosition(box)}
                  className={cn(
                    "aspect-square rounded-xl flex flex-col items-center justify-center transition-all",
                    statusColors[box.status]
                  )}
                >
                  <span className="font-bold text-lg">{box.box}</span>
                  {box.status === "ocupado" && (
                    <span className="text-xs text-muted-foreground mt-1">ABC</span>
                  )}
                </button>
              ))}
            </div>
          </TabsContent>

          {/* Lista View */}
          <TabsContent value="lista" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar produto, pedido, lote..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card"
              />
            </div>

            <div className="space-y-2">
              {/* Mock items */}
              {[
                { pedido: "2638-1", produto: "Mochila Executiva Preta", qtd: 490, posicoes: "PP1-S05-N2, PP1-S06-N2", dias: 0 },
                { pedido: "2639-2", produto: "Caneta Metal Prata", qtd: 980, posicoes: "PP2-S03-N1", dias: 1 },
                { pedido: "2540-1", produto: "Squeeze 500ml Branco", qtd: 150, posicoes: "PP3-S08-N4", dias: 44, alerta: true },
              ].map((item) => (
                <div
                  key={item.pedido}
                  className={cn(
                    "list-item-card",
                    item.alerta && "border-l-warning"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">
                        #{item.pedido} | {item.produto}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Qtd: {item.qtd} un | {item.posicoes}
                      </div>
                    </div>
                    <div className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      item.alerta ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                    )}>
                      {item.dias} dias
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal de detalhes da posição */}
        {selectedPosition && (
          <PositionDetails
            position={selectedPosition}
            onClose={() => setSelectedPosition(null)}
          />
        )}
      </div>
    </AppLayout>
  );
}

interface PortaPaleteMapProps {
  pp: "PP1" | "PP2" | "PP3";
  positions: PosicaoEstoque[];
  onSelectPosition: (position: PosicaoEstoque) => void;
}

function PortaPaleteMap({ pp, positions, onSelectPosition }: PortaPaleteMapProps) {
  const niveis = ["N4", "N3", "N2", "N1"];
  // Mostrar apenas 4 seções para simplificar a visualização
  const secoes = ["01", "02", "03", "04"];

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <h3 className="font-bold text-center mb-3">{pp}</h3>
      <div className="space-y-1">
        {niveis.map((nivel) => (
          <div key={nivel} className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground w-6">{nivel}</span>
            <div className="flex-1 grid grid-cols-4 gap-1">
              {secoes.map((secao) => {
                const position = positions.find(
                  (p) => p.secao === secao && p.nivel === nivel
                );
                if (!position) return null;
                return (
                  <button
                    key={position.id}
                    onClick={() => onSelectPosition(position)}
                    className={cn(
                      "h-8 rounded transition-all text-xs font-medium",
                      statusColors[position.status]
                    )}
                    title={position.id}
                  />
                );
              })}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-1 mt-2">
          <span className="w-6" />
          <div className="flex-1 grid grid-cols-4 gap-1 text-center">
            {secoes.map((s) => (
              <span key={s} className="text-xs text-muted-foreground">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface PositionDetailsProps {
  position: PosicaoEstoque;
  onClose: () => void;
}

function PositionDetails({ position, onClose }: PositionDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 animate-slide-in-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">📍 {position.id}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        <div className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4",
          position.status === "ocupado" && "bg-success/10 text-success",
          position.status === "livre" && "bg-muted text-muted-foreground",
          position.status === "reservado" && "bg-warning/10 text-warning",
          position.status === "bloqueado" && "bg-destructive/10 text-destructive"
        )}>
          {position.status === "ocupado" && "🟢"}
          {position.status === "livre" && "⬜"}
          {position.status === "reservado" && "🟡"}
          {position.status === "bloqueado" && "🔴"}
          {statusLabels[position.status].toUpperCase()}
        </div>

        {position.status === "ocupado" && (
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <h4 className="font-medium mb-2">📦 ITEM ARMAZENADO</h4>
            <div className="space-y-1 text-sm">
              <div>Pedido: <span className="font-medium">#2638-1</span></div>
              <div>Produto: <span className="font-medium">Mochila Executiva Preta</span></div>
              <div>Lote: <span className="font-medium">2638-1-XBZ-20251216</span></div>
              <div>Quantidade: <span className="font-medium">250 un (2 volumes)</span></div>
              <div className="pt-2 text-xs text-muted-foreground">
                Armazenado em: 16/12/2025 16:30
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {position.status === "ocupado" && (
            <>
              <Button variant="outline" className="flex-1">📦 Ver Item</Button>
              <Button variant="outline" className="flex-1">🔄 Mover</Button>
              <Button className="flex-1">📤 Separar</Button>
            </>
          )}
          {position.status === "livre" && (
            <Button className="w-full">📥 Armazenar Item</Button>
          )}
        </div>
      </div>
    </div>
  );
}
