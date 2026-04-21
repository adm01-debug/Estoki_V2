import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Save, RotateCcw } from "lucide-react";
import { AlertasConfigCard, ConfiguracaoAlertas } from "@/components/configuracoes/AlertasConfigCard";
import { EstoqueConfigCard, ConfiguracaoEstoque } from "@/components/configuracoes/EstoqueConfigCard";
import { PreferenciasCard, PreferenciasUsuario } from "@/components/configuracoes/PreferenciasCard";

const configPadrao = {
  alertas: {
    diasParadoAlerta: 30, diasParadoCritico: 45, estoqueMinimoPadrao: 10,
    alertaSonoro: true, alertaVibrar: true, notificacaoPush: false,
  } as ConfiguracaoAlertas,
  estoque: {
    nivelMinimoGeral: 50, nivelCriticoGeral: 20, diasGiroIdeal: 15,
    capacidadeMaxPP: 24, capacidadeMaxBox: 48,
  } as ConfiguracaoEstoque,
  preferencias: {
    nome: "Operador", tema: "system" as const, idioma: "pt-BR",
    formatoData: "DD/MM/YYYY", paginacaoPadrao: 20, exibirValores: true,
  } as PreferenciasUsuario,
};

const ConfiguracoesPage = () => {
  const { theme, setTheme } = useTheme();
  const [alertas, setAlertas] = useState<ConfiguracaoAlertas>(configPadrao.alertas);
  const [estoque, setEstoque] = useState<ConfiguracaoEstoque>(configPadrao.estoque);
  const [preferencias, setPreferencias] = useState<PreferenciasUsuario>(configPadrao.preferencias);
  const [salvando, setSalvando] = useState(false);
  const [alterado, setAlterado] = useState(false);

  useEffect(() => {
    const savedConfig = localStorage.getItem("app-configuracoes");
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.alertas) setAlertas(config.alertas);
        if (config.estoque) setEstoque(config.estoque);
        if (config.preferencias) setPreferencias(config.preferencias);
      } catch (e) {
        if (import.meta.env.DEV) console.error("Erro ao carregar configurações:", e);
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
      toast({ title: "Configurações salvas!", description: "Suas preferências foram atualizadas com sucesso." });
    }, 500);
  };

  const handleResetar = () => {
    setAlertas(configPadrao.alertas);
    setEstoque(configPadrao.estoque);
    setPreferencias(configPadrao.preferencias);
    setAlterado(true);
    toast({ title: "Configurações resetadas", description: "Valores padrão restaurados. Clique em salvar para confirmar." });
  };

  const updateAlertas = (updates: Partial<ConfiguracaoAlertas>) => { setAlertas(p => ({ ...p, ...updates })); setAlterado(true); };
  const updateEstoque = (updates: Partial<ConfiguracaoEstoque>) => { setEstoque(p => ({ ...p, ...updates })); setAlterado(true); };
  const updatePreferencias = (updates: Partial<PreferenciasUsuario>) => { setPreferencias(p => ({ ...p, ...updates })); setAlterado(true); };

  return (
    <AppLayout title="Configurações" showBack>
      <div className="p-4 space-y-4 pb-24">
        <AlertasConfigCard alertas={alertas} onChange={updateAlertas} />
        <EstoqueConfigCard estoque={estoque} onChange={updateEstoque} />
        <PreferenciasCard preferencias={preferencias} theme={theme} onChange={updatePreferencias} onThemeChange={setTheme} />

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

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button variant="outline" className="flex-1 gap-2" onClick={handleResetar}>
            <RotateCcw className="h-4 w-4" />Resetar
          </Button>
          <Button className="flex-1 gap-2" onClick={handleSalvar} disabled={salvando || !alterado}>
            <Save className="h-4 w-4" />{salvando ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ConfiguracoesPage;
