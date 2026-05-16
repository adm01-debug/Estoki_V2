import { Box, Package, BarChart3, Users, Shield } from "lucide-react";

export const features = [
  { icon: Package, title: "Gestão de Estoque em Tempo Real", desc: "Controle total de entradas, saídas e posições" },
  { icon: BarChart3, title: "Analytics Avançados", desc: "Relatórios e métricas detalhadas de operação" },
  { icon: Users, title: "Gestão de Equipe", desc: "Gamificação e performance dos operadores" },
];

 export const BrandingContent = () => (
   <div className="hidden lg:flex flex-col justify-between relative z-10 w-1/2 p-10 xl:p-16 overflow-hidden">
     {/* Professional Background Pattern */}
     <div className="absolute inset-0 z-[-1] opacity-5">
       <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
       <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#3b82f61a,transparent)]" />
     </div>
 
     {/* Logo */}
     <div className="flex items-center gap-4 group cursor-default">
       <div className="relative">
         <div className="absolute -inset-1 bg-primary/20 rounded-2xl blur-lg group-hover:bg-primary/40 transition-all duration-500" />
         <div className="relative w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-glow-lg transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1">
           <Box className="h-9 w-9 text-primary-foreground" />
         </div>
       </div>
       <div>
         <h2 className="text-3xl font-black text-sidebar-foreground tracking-tighter leading-none mb-1">ESTOKI</h2>
         <div className="flex items-center gap-2">
           <p className="text-[12px] font-bold tracking-[0.4em] text-primary uppercase">Warehouse</p>
           <div className="h-1 w-1 rounded-full bg-primary/30" />
           <p className="text-[10px] font-black tracking-[0.2em] text-sidebar-foreground/30 uppercase">Enterprise</p>
         </div>
         <p className="text-[11px] font-black tracking-[0.25em] text-sidebar-foreground/40 uppercase mt-1.5 border-t border-sidebar-border/30 pt-1.5 inline-block">Promo Brindes</p>
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
