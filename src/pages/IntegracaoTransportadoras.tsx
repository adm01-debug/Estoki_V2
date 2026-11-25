import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/common/AsyncStates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Truck,
  Search,
  MapPin,
  Clock,
  Package,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logger } from "@/utils/logger";
import { Skeleton } from "@/components/ui/skeleton";

interface Rastreio {
  codigo: string;
  romaneioId: string | null;
  romaneioCode: string | null;
  status: string;
  eventos: RastreioEvento[];
}

interface RastreioEvento {
  data: string;
  hora: string;
  local: string;
  descricao: string;
  status: string;
}

async function fetchRomaneiosEmTransito(): Promise<any[]> {
  const { data, error } = await supabase
    .from("romaneios")
    .select("id, codigo, motorista, status, data_saida")
    .in("status", ["em_transito", "confirmado"])
    .order("data_saida", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data || [];
}

export default function IntegracaoTransportadoras() {
  const [codigoRastreio, setCodigoRastreio] = useState("");
  const [rastreios, setRastreios] = useState<Rastreio[]>([]);
  const [tab, setTab] = useState("rastrear");
  const [rastreando, setRastreando] = useState(false);

  const {
    data: romaneios = [],
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["romaneios-em-transito"],
    queryFn: fetchRomaneiosEmTransito,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });

  interface CarrierTrackEvent {
    date: string;
    status: string;
    description: string;
    location: string;
  }

  const converterEventos = (events: CarrierTrackEvent[]): RastreioEvento[] =>
    events.map((ev) => {
      const d = new Date(ev.date);
      return {
        data: d.toLocaleDateString("pt-BR"),
        hora: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        local: ev.location || "N/D",
        descricao: ev.description || ev.status,
        status: ev.status,
      };
    });

  const buscarRastreio = async (codigo: string): Promise<Rastreio> => {
    const { data, error } = await supabase.functions.invoke<{
      success: boolean;
      mode: "real" | "simulated";
      tracking_number: string;
      current_status: string;
      events: CarrierTrackEvent[];
    }>("carrier-track", {
      body: { tracking_number: codigo, carrier: "auto" },
    });

    if (error || !data?.success) {
      throw new Error(error?.message || "Falha ao consultar o rastreio");
    }

    return {
      codigo: data.tracking_number || codigo,
      romaneioId: null,
      romaneioCode: null,
      status: data.current_status || "desconhecido",
      eventos: converterEventos(data.events || []),
    };
  };

  const rastrear = async () => {
    if (!codigoRastreio.trim()) {
      toast.error("Digite o código de rastreio");
      return;
    }
    setRastreando(true);
    try {
      const novoRastreio = await buscarRastreio(codigoRastreio);
      setRastreios((prev) => [novoRastreio, ...prev.filter((r) => r.codigo !== codigoRastreio)]);
      toast.success("Rastreio atualizado!");
    } catch (err) {
      logger.error("Erro ao consultar rastreio:", err);
      toast.error("Não foi possível consultar este código. Tente novamente.");
    } finally {
      setRastreando(false);
    }
  };

  const rastrearRomaneio = async (romaneio: any) => {
    setRastreando(true);
    try {
      const novoRastreio = await buscarRastreio(romaneio.codigo);
      novoRastreio.romaneioId = romaneio.id;
      novoRastreio.romaneioCode = romaneio.codigo;
      setRastreios((prev) => [novoRastreio, ...prev]);
      toast.success(`Rastreio do romaneio ${romaneio.codigo} atualizado`);
    } catch (err) {
      logger.error("Erro ao rastrear romaneio:", err);
      toast.error(`Falha ao rastrear romaneio ${romaneio.codigo}`);
    } finally {
      setRastreando(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "entregue":
      case "delivered":
        return (
          <Badge className="border-success/30 bg-success/20 text-success">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Entregue
          </Badge>
        );
      case "entrega":
      case "out_for_delivery":
        return (
          <Badge className="border-info/30 bg-info/20 text-info">
            <Truck className="mr-1 h-3 w-3" />
            Saiu p/ Entrega
          </Badge>
        );
      case "transito":
      case "in_transit":
        return (
          <Badge className="border-warning/30 bg-warning/20 text-warning">
            <RefreshCw className="mr-1 h-3 w-3" />
            Em Trânsito
          </Badge>
        );
      case "postado":
      case "posted":
        return (
          <Badge className="bg-muted text-muted-foreground">
            <Package className="mr-1 h-3 w-3" />
            Postado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">🔗 Integração Transportadoras</h1>
        <p className="text-sm text-muted-foreground">
          Rastreamento de entregas e atualização automática de status
        </p>
      </div>

      {isError && (
        <ErrorState
          message={`Não foi possível carregar os romaneios em trânsito: ${(error as Error).message}`}
          onRetry={() => refetch()}
        />
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="rastrear">Rastrear Código</TabsTrigger>
          <TabsTrigger value="romaneios">Romaneios em Trânsito ({romaneios.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="rastrear" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Input
                  aria-label="Digite o código de rastreio (ex: BR123456789BR)"
                  placeholder="Digite o código de rastreio (ex: BR123456789BR)"
                  value={codigoRastreio}
                  onChange={(e) => setCodigoRastreio(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && rastrear()}
                  className="flex-1"
                />
                <Button onClick={rastrear} disabled={rastreando}>
                  <Search className="mr-2 h-4 w-4" />
                  {rastreando ? "Buscando..." : "Rastrear"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="romaneios" className="mt-4 space-y-3">
          {loading ? (
            // Carregando: esqueletos em vez de "nenhum romaneio" enquanto a busca não terminou.
            Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))
          ) : romaneios.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <Truck className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">Nenhum romaneio em trânsito</p>
              </CardContent>
            </Card>
          ) : (
            romaneios.map((rom, i) => (
              <motion.div
                key={rom.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="glass-card">
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-semibold">{rom.codigo}</p>
                      <p className="text-xs text-muted-foreground">
                        Motorista: {rom.motorista || "N/D"} | Saída:{" "}
                        {rom.data_saida
                          ? new Date(rom.data_saida).toLocaleDateString("pt-BR")
                          : "N/D"}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => rastrearRomaneio(rom)}>
                      <Search className="mr-1 h-3 w-3" />
                      Rastrear
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Tracking Results */}
      {rastreios.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Resultados</h2>
          {rastreios.map((r, i) => (
            <motion.div
              key={r.codigo + i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                        <Package className="h-4 w-4 text-primary" />
                        {r.codigo}
                      </CardTitle>
                      {r.romaneioCode && (
                        <p className="text-[10px] text-muted-foreground">
                          Romaneio: {r.romaneioCode}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(r.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative space-y-4 pl-6">
                    <div className="absolute top-2 bottom-2 left-[9px] w-0.5 bg-border" />
                    {r.eventos.map((ev, j) => (
                      <div key={j} className="relative">
                        <div
                          className={`absolute left-[-15px] h-3 w-3 rounded-full border-2 ${j === 0 ? "border-primary bg-primary" : "border-muted-foreground/30 bg-background"}`}
                        />
                        <div className="text-xs">
                          <p className="font-semibold text-foreground">{ev.descricao}</p>
                          <div className="mt-0.5 flex items-center gap-3 text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {ev.local}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {ev.data} {ev.hora}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
