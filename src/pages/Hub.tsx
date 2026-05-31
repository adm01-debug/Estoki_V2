import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  RefreshCw,
  Link2,
  ShieldCheck,
  Database,
  Server,
  AlertTriangle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { RouteLoadingFallback } from "@/components/common/RouteLoadingFallback";
import { toast } from "sonner";

export default function HubPage() {
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const projects = [
    {
      id: 1,
      name: "Unidade São Paulo - Matriz",
      status: "online",
      lastSync: "2 min atrás",
      type: "WMS Central",
    },
    {
      id: 2,
      name: "Unidade Curitiba - Filial 01",
      status: "online",
      lastSync: "15 min atrás",
      type: "Cross-docking",
    },
    {
      id: 3,
      name: "Unidade Rio de Janeiro - Filial 02",
      status: "syncing",
      lastSync: "Agora",
      type: "Full WMS",
    },
    {
      id: 4,
      name: "CD Nordeste - Pernambuco",
      status: "online",
      lastSync: "1h atrás",
      type: "Distribuição",
    },
    {
      id: 5,
      name: "Unidade Porto Alegre - Filial 03",
      status: "offline",
      lastSync: "2 dias atrás",
      type: "Expedição",
    },
    {
      id: 6,
      name: "CD Centro-Oeste - Goiás",
      status: "online",
      lastSync: "5 min atrás",
      type: "Armazenagem",
    },
    {
      id: 7,
      name: "Unidade Belo Horizonte - Filial 04",
      status: "online",
      lastSync: "10 min atrás",
      type: "Picking Center",
    },
  ];

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast.success("Sincronização global concluída entre todos os 7 projetos!");
    }, 2000);
  };

  if (loading) {
    return (
      <AppLayout title="Hub de Integração" showBack>
        <RouteLoadingFallback type="hub" />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Hub de Integração" showBack>
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="mb-2 text-xl font-bold">Erro ao carregar o Hub</h2>
          <p className="mb-6 max-w-md text-muted-foreground">{error}</p>
          <Button
            onClick={() => {
              setError(null);
              setLoading(true);
            }}
            variant="outline"
          >
            Tentar novamente
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Hub de Integração" showBack>
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Estoki Hub Central</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie a comunicação e sincronização de dados entre unidades.
            </p>
          </div>
          <Button onClick={handleSync} disabled={syncing} className="gap-2">
            <RefreshCw className={syncing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Sincronizar Tudo
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Database className="h-4 w-4 text-primary" /> Compartilhamento de Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ativo</div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Estoque global sincronizado em tempo real.
              </p>
            </CardContent>
          </Card>
          <Card className="border-green-500/20 bg-green-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <ShieldCheck className="h-4 w-4 text-green-600" /> Autenticação Unificada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">SSO Ativo</div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Mesmo login para todas as unidades do grupo.
              </p>
            </CardContent>
          </Card>
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Globe className="h-4 w-4 text-blue-600" /> Endpoints de Rede
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">14/14</div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Rotas de comunicação bidirecional operacionais.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Link2 className="h-5 w-5 text-primary" /> Unidades Conectadas
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {projects.map((proj) => (
              <Card key={proj.id} className="transition-colors hover:border-primary/30">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${proj.status === "online" ? "bg-green-100" : proj.status === "syncing" ? "bg-blue-100" : "bg-red-100"}`}
                    >
                      <Server
                        className={`h-5 w-5 ${proj.status === "online" ? "text-green-600" : proj.status === "syncing" ? "text-blue-600" : "text-red-600"}`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold">{proj.name}</h4>
                        <Badge variant="outline" className="py-0 text-[10px]">
                          {proj.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Último Sync: {proj.lastSync}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        proj.status === "online"
                          ? "default"
                          : proj.status === "syncing"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-[9px] uppercase"
                    >
                      {proj.status}
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      Configurar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
