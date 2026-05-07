import { Box, Package, BarChart3, Users, Shield } from "lucide-react";

export const features = [
  { icon: Package, title: "Gestão de Estoque em Tempo Real", desc: "Controle total de entradas, saídas e posições" },
  { icon: BarChart3, title: "Analytics Avançados", desc: "Relatórios e métricas detalhadas de operação" },
  { icon: Users, title: "Gestão de Equipe", desc: "Gamificação e performance dos operadores" },
];

export const BrandingContent = () => (
  <div className="hidden lg:flex flex-col justify-between relative z-10 w-1/2 p-10 xl:p-16">
    {/* Logo */}
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-glow">
        <Box className="h-6 w-6 text-primary-foreground" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-sidebar-foreground tracking-tight">ESTOKI</h2>
        <p className="text-[10px] font-semibold tracking-[0.3em] text-primary uppercase">Warehouse Suite</p>
      </div>
    </div>

    {/* Hero */}
    <div className="space-y-6 max-w-lg">
      <h1 className="text-4xl xl:text-5xl font-bold text-sidebar-foreground leading-tight">
        Gerencie seu armazém com{" "}
        <span className="text-primary">inteligência</span>
      </h1>
      <p className="text-sidebar-foreground/50 text-lg leading-relaxed">
        Monitore operações em tempo real, otimize a performance da equipe e tome decisões baseadas em dados.
      </p>

      {/* Feature cards */}
      <div className="space-y-3 pt-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="flex items-center gap-4 p-4 rounded-xl border border-sidebar-border/50 bg-sidebar-accent/30 backdrop-blur-sm hover:border-primary/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <f.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-sidebar-foreground">{f.title}</p>
              <p className="text-xs text-sidebar-foreground/40">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Footer */}
    <div className="flex items-center gap-2 text-sidebar-foreground/20 text-xs">
      <Shield className="h-3.5 w-3.5" />
      <span>Criptografia end-to-end · SOC 2 Compliant</span>
    </div>
  </div>
);
