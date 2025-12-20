import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { 
  Bell, 
  Package, 
  User, 
  Palette, 
  Save,
  RotateCcw,
  AlertTriangle,
  Clock,
  Warehouse,
  Volume2
} from "lucide-react";

interface ConfiguracaoAlertas {
  diasParadoAlerta: number;
  diasParadoCritico: number;
  estoqueMinimoPadrao: number;
  alertaSonoro: boolean;
  alertaVibrar: boolean;
  notificacaoPush: boolean;
}

interface ConfiguracaoEstoque {
  nivelMinimoGeral: number;
  nivelCriticoGeral: number;
  diasGiroIdeal: number;
  capacidadeMaxPP: number;
  capacidadeMaxBox: number;
}

interface PreferenciasUsuario {
  nome: string;
  tema: "light" | "dark" | "system";
  idioma: string;
  formatoData: string;
  paginacaoPadrao: number;
  exibirValores: boolean;
}

const configPadrao = {
  alertas: {
    diasParadoAlerta: 30,
    diasParadoCritico: 45,
    estoqueMinimoPadrao: 10,
    alertaSonoro: true,
    alertaVibrar: true,
    notificacaoPush: false,
  } as ConfiguracaoAlertas,
  estoque: {
    nivelMinimoGeral: 50,
    nivelCriticoGeral: 20,
    diasGiroIdeal: 15,
    capacidadeMaxPP: 24,
    capacidadeMaxBox: 48,
  } as ConfiguracaoEstoque,
  preferencias: {
    nome: "Operador",
    tema: "system" as const,
    idioma: "pt-BR",
    formatoData: "DD/MM/YYYY",
    paginacaoPadrao: 20,
    exibirValores: true,
  } as PreferenciasUsuario,
};

const ConfiguracoesPage = () => {
  const { theme, setTheme } = useTheme();
  const [alertas, setAlertas] = useState<ConfiguracaoAlertas>(configPadrao.alertas);
  const [estoque, setEstoque] = useState<ConfiguracaoEstoque>(configPadrao.estoque);
  const [preferencias, setPreferencias] = useState<PreferenciasUsuario>(configPadrao.preferencias);
  const [salvando, setSalvando] = useState(false);
  const [alterado, setAlterado] = useState(false);

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem("app-configuracoes");
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.alertas) setAlertas(config.alertas);
        if (config.estoque) setEstoque(config.estoque);
        if (config.preferencias) setPreferencias(config.preferencias);
      } catch (e) {
        console.error("Erro ao carregar configurações:", e);
      }
    }
  }, []);

  const handleSalvar = () => {
    setSalvando(true);
    
    const config = { alertas, estoque, preferencias };
    localStorage.setItem("app-configuracoes", JSON.stringify(config));
    
    setTimeout(() => {
      setSalvando(false);
      setAlterado(false);
      toast({
        title: "Configurações salvas!",
        description: "Suas preferências foram atualizadas com sucesso.",
      });
    }, 500);
  };

  const handleResetar = () => {
    setAlertas(configPadrao.alertas);
    setEstoque(configPadrao.estoque);
    setPreferencias(configPadrao.preferencias);
    setAlterado(true);
    toast({
      title: "Configurações resetadas",
      description: "Valores padrão restaurados. Clique em salvar para confirmar.",
    });
  };

  const updateAlertas = (updates: Partial<ConfiguracaoAlertas>) => {
    setAlertas(prev => ({ ...prev, ...updates }));
    setAlterado(true);
  };

  const updateEstoque = (updates: Partial<ConfiguracaoEstoque>) => {
    setEstoque(prev => ({ ...prev, ...updates }));
    setAlterado(true);
  };

  const updatePreferencias = (updates: Partial<PreferenciasUsuario>) => {
    setPreferencias(prev => ({ ...prev, ...updates }));
    setAlterado(true);
  };

  return (
    <AppLayout title="Configurações" showBack>
      <div className="p-4 space-y-4 pb-24">
        {/* Alertas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Parâmetros de Alertas
            </CardTitle>
            <CardDescription>
              Configure quando e como receber alertas do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  Dias para Alerta
                </Label>
                <Input
                  type="number"
                  value={alertas.diasParadoAlerta}
                  onChange={(e) => updateAlertas({ diasParadoAlerta: Number(e.target.value) })}
                  min={1}
                  max={90}
                />
                <p className="text-xs text-muted-foreground">
                  Item parado gera alerta amarelo
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  Dias para Crítico
                </Label>
                <Input
                  type="number"
                  value={alertas.diasParadoCritico}
                  onChange={(e) => updateAlertas({ diasParadoCritico: Number(e.target.value) })}
                  min={1}
                  max={120}
                />
                <p className="text-xs text-muted-foreground">
                  Item parado gera alerta vermelho
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Estoque Mínimo Padrão</Label>
              <Input
                type="number"
                value={alertas.estoqueMinimoPadrao}
                onChange={(e) => updateAlertas({ estoqueMinimoPadrao: Number(e.target.value) })}
                min={0}
              />
              <p className="text-xs text-muted-foreground">
                Quantidade mínima padrão para novos produtos
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">Notificações</Label>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Alerta Sonoro</span>
                </div>
                <Switch
                  checked={alertas.alertaSonoro}
                  onCheckedChange={(checked) => updateAlertas({ alertaSonoro: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Vibrar ao Escanear</span>
                </div>
                <Switch
                  checked={alertas.alertaVibrar}
                  onCheckedChange={(checked) => updateAlertas({ alertaVibrar: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Notificações Push</span>
                </div>
                <Switch
                  checked={alertas.notificacaoPush}
                  onCheckedChange={(checked) => updateAlertas({ notificacaoPush: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estoque */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-primary" />
              Níveis de Estoque
            </CardTitle>
            <CardDescription>
              Defina os parâmetros de controle do estoque
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Nível Mínimo Geral</Label>
                <Input
                  type="number"
                  value={estoque.nivelMinimoGeral}
                  onChange={(e) => updateEstoque({ nivelMinimoGeral: Number(e.target.value) })}
                  min={0}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Nível Crítico Geral</Label>
                <Input
                  type="number"
                  value={estoque.nivelCriticoGeral}
                  onChange={(e) => updateEstoque({ nivelCriticoGeral: Number(e.target.value) })}
                  min={0}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Dias de Giro Ideal</Label>
              <Input
                type="number"
                value={estoque.diasGiroIdeal}
                onChange={(e) => updateEstoque({ diasGiroIdeal: Number(e.target.value) })}
                min={1}
              />
              <p className="text-xs text-muted-foreground">
                Meta de dias para giro do estoque
              </p>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Capacidade Porta-Palete</Label>
                <Input
                  type="number"
                  value={estoque.capacidadeMaxPP}
                  onChange={(e) => updateEstoque({ capacidadeMaxPP: Number(e.target.value) })}
                  min={1}
                />
                <p className="text-xs text-muted-foreground">Posições por PP</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Capacidade Box</Label>
                <Input
                  type="number"
                  value={estoque.capacidadeMaxBox}
                  onChange={(e) => updateEstoque({ capacidadeMaxBox: Number(e.target.value) })}
                  min={1}
                />
                <p className="text-xs text-muted-foreground">Posições por Box</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferências do Usuário */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Preferências do Usuário
            </CardTitle>
            <CardDescription>
              Personalize sua experiência no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Nome do Operador</Label>
              <Input
                value={preferencias.nome}
                onChange={(e) => updatePreferencias({ nome: e.target.value })}
                placeholder="Seu nome"
                maxLength={50}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Tema
                </Label>
                <Select 
                  value={theme || "system"}
                  onValueChange={(v: "light" | "dark" | "system") => setTheme(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Formato de Data</Label>
                <Select 
                  value={preferencias.formatoData}
                  onValueChange={(v) => updatePreferencias({ formatoData: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Itens por Página</Label>
              <Select 
                value={preferencias.paginacaoPadrao.toString()}
                onValueChange={(v) => updatePreferencias({ paginacaoPadrao: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 itens</SelectItem>
                  <SelectItem value="20">20 itens</SelectItem>
                  <SelectItem value="50">50 itens</SelectItem>
                  <SelectItem value="100">100 itens</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Exibir Valores</span>
                <p className="text-xs text-muted-foreground">
                  Mostrar valores monetários nas telas
                </p>
              </div>
              <Switch
                checked={preferencias.exibirValores}
                onCheckedChange={(checked) => updatePreferencias({ exibirValores: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Versão do Sistema</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Última Sincronização</span>
              <span className="font-medium">{new Date().toLocaleString("pt-BR")}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Fixo */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={handleResetar}
          >
            <RotateCcw className="h-4 w-4" />
            Resetar
          </Button>
          <Button 
            className="flex-1 gap-2"
            onClick={handleSalvar}
            disabled={salvando || !alterado}
          >
            <Save className="h-4 w-4" />
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ConfiguracoesPage;
