import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Warehouse, 
  Bell, 
  ShieldCheck, 
  Database, 
  Cpu,
  Save,
  Globe
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminSettingsPage() {
  const handleSave = () => {
    toast({ title: "Configurações salvas", description: "As alterações foram aplicadas com sucesso." });
  };

  return (
    <AppLayout title="Configurações do Sistema" showBack>
      <PageTransition>
        <div className="p-4 space-y-6">
          <Tabs defaultValue="geral" className="w-full">
            <TabsList className="grid grid-cols-2 lg:grid-cols-5 mb-8">
              <TabsTrigger value="geral" className="gap-2"><Settings className="h-4 w-4" /> Geral</TabsTrigger>
              <TabsTrigger value="wms" className="gap-2"><Warehouse className="h-4 w-4" /> WMS</TabsTrigger>
              <TabsTrigger value="notificacoes" className="gap-2"><Bell className="h-4 w-4" /> Avisos</TabsTrigger>
              <TabsTrigger value="seguranca" className="gap-2"><ShieldCheck className="h-4 w-4" /> Segurança</TabsTrigger>
              <TabsTrigger value="avancado" className="gap-2"><Cpu className="h-4 w-4" /> Avançado</TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Identidade do Armazém</CardTitle>
                  <CardDescription>Configure as informações básicas da sua operação.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome da Unidade</Label>
                      <Input defaultValue="ESTOKI - CD Central" />
                    </div>
                    <div className="space-y-2">
                      <Label>Código Identificador</Label>
                      <Input defaultValue="CDC-01" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Fuso Horário</Label>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">America/Sao_Paulo (UTC-03:00)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wms" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Regras de Operação</CardTitle>
                  <CardDescription>Defina como o fluxo de mercadorias deve se comportar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Exigir Scan de QR Code</Label>
                      <p className="text-xs text-muted-foreground">Obrigatório escanear item e local em todas as movimentações.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Validação de Validade (FEFO)</Label>
                      <p className="text-xs text-muted-foreground">Priorizar saída de itens com vencimento mais próximo.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Picking Multi-Ondas</Label>
                      <p className="text-xs text-muted-foreground">Permitir agrupamento de vários pedidos em uma única rota.</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="avancado">
              <Card>
                <CardHeader>
                  <CardTitle>Manutenção de Dados</CardTitle>
                  <CardDescription>Ferramentas críticas para administração do banco.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/10 space-y-3">
                    <h4 className="text-sm font-bold text-red-500 flex items-center gap-2">
                      <Database className="h-4 w-4" /> Zona de Perigo
                    </h4>
                    <p className="text-xs text-muted-foreground">Estas ações são irreversíveis e afetam todo o sistema.</p>
                    <div className="flex gap-2">
                      <Button variant="destructive" size="sm">Limpar Cache Global</Button>
                      <Button variant="outline" size="sm" className="text-red-500 border-red-500/20">Resetar Operações</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline">Cancelar</Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" /> Salvar Alterações
            </Button>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
