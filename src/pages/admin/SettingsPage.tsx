import { useState, useEffect } from "react";
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
  Globe,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SystemSettings {
  nome_unidade: string;
  codigo_identificador: string;
  exigir_scan_qr: boolean;
  validacao_fefo: boolean;
  picking_multi_ondas: boolean;
}

const DEFAULTS: SystemSettings = {
  nome_unidade: "ESTOKI - CD Central",
  codigo_identificador: "CDC-01",
  exigir_scan_qr: true,
  validacao_fefo: true,
  picking_multi_ondas: false,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("system_settings" as any)
          .select("value")
          .eq("key", "wms_config")
          .maybeSingle();
        if (!error && data?.value) {
          setSettings({ ...DEFAULTS, ...(data.value as Partial<SystemSettings>) });
        }
      } catch {
        // Tabela ainda nao existe — usa defaults silenciosamente
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("system_settings" as any)
        .upsert({ key: "wms_config", value: settings as any }, { onConflict: "key" });

      if (error) throw error;
      toast({ title: "Configuracoes salvas", description: "As alteracoes foram aplicadas." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar";
      // Se a tabela nao existe ainda, avisa de forma amigavel
      if (msg.includes("does not exist") || msg.includes("42P01")) {
        toast({
          title: "Configuracoes salvas localmente",
          description: "Migracao pendente para persistencia permanente.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Erro ao salvar", description: msg, variant: "destructive" });
      }
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof SystemSettings, value: SystemSettings[typeof key]) =>
    setSettings((s) => ({ ...s, [key]: value }));

  if (loading) {
    return (
      <AppLayout title="Configuracoes do Sistema" showBack>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Configuracoes do Sistema" showBack>
      <PageTransition>
        <div className="space-y-6 p-4">
          <Tabs defaultValue="geral" className="w-full">
            <TabsList className="mb-8 grid grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="geral" className="gap-2">
                <Settings className="h-4 w-4" /> Geral
              </TabsTrigger>
              <TabsTrigger value="wms" className="gap-2">
                <Warehouse className="h-4 w-4" /> WMS
              </TabsTrigger>
              <TabsTrigger value="notificacoes" className="gap-2">
                <Bell className="h-4 w-4" /> Avisos
              </TabsTrigger>
              <TabsTrigger value="seguranca" className="gap-2">
                <ShieldCheck className="h-4 w-4" /> Seguranca
              </TabsTrigger>
              <TabsTrigger value="avancado" className="gap-2">
                <Cpu className="h-4 w-4" /> Avancado
              </TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Identidade do Armazem</CardTitle>
                  <CardDescription>
                    Configure as informacoes basicas da sua operacao.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nome da Unidade</Label>
                      <Input
                        value={settings.nome_unidade}
                        onChange={(e) => set("nome_unidade", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Codigo Identificador</Label>
                      <Input
                        value={settings.codigo_identificador}
                        onChange={(e) => set("codigo_identificador", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Fuso Horario</Label>
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
                  <CardTitle>Regras de Operacao</CardTitle>
                  <CardDescription>
                    Defina como o fluxo de mercadorias deve se comportar.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Exigir Scan de QR Code</Label>
                      <p className="text-xs text-muted-foreground">
                        Obrigatorio escanear item e local em todas as movimentacoes.
                      </p>
                    </div>
                    <Switch
                      checked={settings.exigir_scan_qr}
                      onCheckedChange={(v) => set("exigir_scan_qr", v)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Validacao de Validade (FEFO)</Label>
                      <p className="text-xs text-muted-foreground">
                        Priorizar saida de itens com vencimento mais proximo.
                      </p>
                    </div>
                    <Switch
                      checked={settings.validacao_fefo}
                      onCheckedChange={(v) => set("validacao_fefo", v)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Picking Multi-Ondas</Label>
                      <p className="text-xs text-muted-foreground">
                        Permitir agrupamento de varios pedidos em uma unica rota.
                      </p>
                    </div>
                    <Switch
                      checked={settings.picking_multi_ondas}
                      onCheckedChange={(v) => set("picking_multi_ondas", v)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notificacoes">
              <Card>
                <CardHeader>
                  <CardTitle>Avisos e Notificacoes</CardTitle>
                  <CardDescription>Configuracao de alertas e avisos do sistema.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Configuracoes de notificacao disponiveis em breve.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seguranca">
              <Card>
                <CardHeader>
                  <CardTitle>Seguranca</CardTitle>
                  <CardDescription>Configuracoes de acesso e autenticacao.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Configuracoes de seguranca disponiveis em breve.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="avancado">
              <Card>
                <CardHeader>
                  <CardTitle>Manutencao de Dados</CardTitle>
                  <CardDescription>
                    Ferramentas criticas para administracao do banco.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 rounded-lg border border-red-500/10 bg-red-500/5 p-4">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-red-500">
                      <Database className="h-4 w-4" /> Zona de Perigo
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Estas acoes sao irreversiveis. Requerem confirmacao adicional.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="destructive" size="sm" disabled>
                        Limpar Cache Global
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500/20 text-red-500"
                        disabled
                      >
                        Resetar Operacoes
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Acoes criticas disponiveis apos confirmacao dupla (em desenvolvimento).
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setSettings(DEFAULTS)}>
              Restaurar Padrao
            </Button>
            <Button onClick={handleSave} className="gap-2" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Salvando..." : "Salvar Alteracoes"}
            </Button>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
