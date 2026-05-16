import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  Package, 
  Navigation, 
  Calendar, 
  User, 
  Search, 
  Plus, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Eye,
  Printer,
  MapPin,
  QrCode,
  MoreVertical,
  ArrowRight
} from "lucide-react";
import { useRomaneios, StatusRomaneio } from "../hooks/useRomaneios";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ShippingPage() {
  const { romaneios, loading, atualizarStatus } = useRomaneios();
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status: StatusRomaneio) => {
    switch (status) {
      case "rascunho": return <Badge variant="secondary">Rascunho</Badge>;
      case "confirmado": return <Badge className="bg-blue-500">Confirmado</Badge>;
      case "em_transito": return <Badge className="bg-orange-500 flex items-center gap-1"><Clock className="h-3 w-3 animate-pulse" /> Em Trânsito</Badge>;
      case "entregue": return <Badge className="bg-success text-success-foreground">Entregue</Badge>;
      case "parcial": return <Badge className="bg-orange-200 text-orange-800">Entrega Parcial</Badge>;
      case "cancelado": return <Badge variant="destructive">Cancelado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredRomaneios = romaneios.filter(r => 
    r.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.motorista?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.placa_veiculo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: romaneios.length,
    emTransito: romaneios.filter(r => r.status === "em_transito").length,
    entreguesHoje: romaneios.filter(r => r.status === "entregue").length,
    pedentes: romaneios.filter(r => r.status === "confirmado" || r.status === "rascunho").length
  };

  return (
    <AppLayout title="Expedição & Shipping" showBack>
      <PageTransition>
        <div className="p-4 space-y-6 pb-24 md:pb-6">
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Pendentes</p>
                  <p className="text-2xl font-bold">{stats.pedentes}</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-full"><Package className="h-5 w-5 text-primary" /></div>
              </CardContent>
            </Card>
            <Card className="bg-orange-500/5 border-orange-500/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Em Rota</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.emTransito}</p>
                </div>
                <div className="p-2 bg-orange-500/10 rounded-full"><Truck className="h-5 w-5 text-orange-500" /></div>
              </CardContent>
            </Card>
            <Card className="bg-success/5 border-success/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Entregues</p>
                  <p className="text-2xl font-bold text-success">{stats.entreguesHoje}</p>
                </div>
                <div className="p-2 bg-success/10 rounded-full"><CheckCircle2 className="h-5 w-5 text-success" /></div>
              </CardContent>
            </Card>
            <Card className="bg-destructive/5 border-destructive/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Alertas</p>
                  <p className="text-2xl font-bold text-destructive">0</p>
                </div>
                <div className="p-2 bg-destructive/10 rounded-full"><AlertCircle className="h-5 w-5 text-destructive" /></div>
              </CardContent>
            </Card>
          </div>

          {/* Control bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por código, motorista, placa..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="outline" className="flex-1 md:flex-none">
                <Calendar className="h-4 w-4 mr-2" /> Agendar
              </Button>
              <Button className="flex-1 md:flex-none">
                <Plus className="h-4 w-4 mr-2" /> Novo Romaneio
              </Button>
            </div>
          </div>

          {/* Tabs View */}
          <Tabs defaultValue="todos" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="em-rota">Em Rota</TabsTrigger>
              <TabsTrigger value="concluidos">Concluídos</TabsTrigger>
              <TabsTrigger value="agendados">Agendados</TabsTrigger>
            </TabsList>

            <TabsContent value="todos" className="space-y-4">
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full" />)}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredRomaneios.map((r) => (
                    <Card key={r.id} className="overflow-hidden hover:border-primary/50 transition-colors group">
                      <CardHeader className="p-4 pb-2 space-y-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge variant="outline" className="mb-2 font-mono">{r.codigo}</Badge>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Truck className="h-4 w-4 text-primary" />
                              {r.placa_veiculo || "Sem placa"}
                            </CardTitle>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> Ver Detalhes</DropdownMenuItem>
                              <DropdownMenuItem><Printer className="h-4 w-4 mr-2" /> Imprimir Romaneio</DropdownMenuItem>
                              <DropdownMenuItem><QrCode className="h-4 w-4 mr-2" /> Gerar QR Codes</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive"><AlertCircle className="h-4 w-4 mr-2" /> Cancelar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> {r.motorista || "Não atribuído"}</span>
                          {getStatusBadge(r.status)}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Progresso de Entrega</span>
                            <span className="font-medium">{r.entregas_realizadas}/{r.total_entregas}</span>
                          </div>
                          <Progress value={(r.entregas_realizadas / r.total_entregas) * 100} className="h-1.5" />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                            <Package className="h-3 w-3 text-muted-foreground" />
                            <span>{r.total_volumes} Volumes</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                            <Navigation className="h-3 w-3 text-muted-foreground" />
                            <span>{r.rota || "Rota Local"}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t flex justify-between items-center">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Criado em {format(new Date(r.data_criacao), "dd/MM HH:mm")}
                          </span>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-primary">
                            Gerenciar <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredRomaneios.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>Nenhum romaneio encontrado.</p>
                      <Button variant="link" onClick={() => setSearchTerm("")}>Limpar busca</Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="em-rota">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRomaneios.filter(r => r.status === "em_transito").map((r) => (
                   <Card key={r.id}>
                      <CardContent className="p-4">
                         <p className="font-bold">{r.codigo}</p>
                         <p className="text-sm text-muted-foreground">Motorista: {r.motorista}</p>
                         <div className="mt-4 flex gap-2">
                           <Button size="sm" variant="outline" className="w-full">Rastrear</Button>
                           <Button size="sm" className="w-full" onClick={() => atualizarStatus(r.id, "entregue")}>Finalizar</Button>
                         </div>
                      </CardContent>
                   </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
