import { Box, Package, BarChart3, Users, Shield } from "lucide-react";

export const features = [
  {
    icon: Package,
    title: "Gestão de Estoque em Tempo Real",
    desc: "Controle total de entradas, saídas e posições",
  },
  {
    icon: BarChart3,
    title: "Analytics Avançados",
    desc: "Relatórios e métricas detalhadas de operação",
  },
  { icon: Users, title: "Gestão de Equipe", desc: "Gamificação e performance dos operadores" },
];

export const BrandingContent = () => (
  <div className="relative z-10 hidden w-1/2 flex-col justify-between overflow-hidden p-10 lg:flex xl:p-16">
    {/* Professional Background Pattern */}
    <div className="absolute inset-0 z-[-1] opacity-5">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#3b82f61a,transparent)]" />
    </div>

    {/* Logo */}
    <div className="group flex cursor-default items-center gap-4">
      <div className="relative">
        <div className="absolute -inset-1 rounded-2xl bg-primary/20 blur-lg transition-all duration-500 group-hover:bg-primary/40" />
        <div className="relative flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 shadow-glow-lg transition-transform duration-500 group-hover:rotate-1 group-hover:scale-105">
          <Box className="h-9 w-9 text-primary-foreground" />
        </div>
      </div>
      <div>
        <h2 className="mb-1 text-3xl font-black leading-none tracking-tighter text-sidebar-foreground">
          PROMO BRINDES
        </h2>
        <div className="flex items-center gap-2">
          <p className="text-[12px] font-bold uppercase tracking-[0.4em] text-primary">
            Intelligence
          </p>
          <div className="h-1 w-1 rounded-full bg-primary/30" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sidebar-foreground/30">
            WMS v10.0
          </p>
        </div>
        <p className="mt-1.5 inline-block border-t border-sidebar-border/30 pt-1.5 text-[11px] font-black uppercase tracking-[0.25em] text-sidebar-foreground/40">
          Cadeia de Excelência
        </p>
      </div>
    </div>

    {/* Hero */}
    <div className="max-w-lg space-y-6">
      <h1 className="text-4xl font-bold leading-tight text-sidebar-foreground xl:text-5xl">
        Gerencie seu armazém com <span className="text-primary">inteligência</span>
      </h1>
      <p className="text-lg leading-relaxed text-sidebar-foreground/50">
        Monitore operações em tempo real, otimize a performance da equipe e tome decisões baseadas
        em dados.
      </p>

      {/* Feature cards */}
      <div className="space-y-3 pt-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="flex items-center gap-4 rounded-xl border border-sidebar-border/50 bg-sidebar-accent/30 p-4 backdrop-blur-sm transition-colors hover:border-primary/30"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
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
    <div className="flex items-center gap-2 text-xs text-sidebar-foreground/20">
      <Shield className="h-3.5 w-3.5" />
      <span>Criptografia end-to-end · SOC 2 Compliant</span>
    </div>
  </div>
);
