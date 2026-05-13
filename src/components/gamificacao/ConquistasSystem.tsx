import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Award,
  Trophy,
  Zap,
  Target,
  Clock,
  Star,
  Flame,
  Crown,
  Medal,
  Shield,
  Gem,
  Rocket,
  CheckCircle,
  Lock,
  Gift,
  Snowflake,
  Heart,
  PartyPopper,
  Sun,
  Sparkles,
  Calendar,
  Loader2,
} from "lucide-react";
import { useConquistas, raridadeConfig, categoriaConfig, ConquistaCompleta, BadgeRarity, BadgeCategory } from "@/hooks/useConquistas";
import { cn } from "@/lib/utils";

interface BadgeIconProps {
  conquista: ConquistaCompleta;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

function BadgeIcon({ conquista, size = "md", showTooltip = true }: BadgeIconProps) {
  const Icon = conquista.IconComponent;
  const raridadeConf = raridadeConfig[conquista.raridade];

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const badge = (
    <div
      className={cn(
        "relative rounded-full flex items-center justify-center border-2 transition-all",
        sizeClasses[size],
        conquista.desbloqueado
          ? `${raridadeConf.bg} ${raridadeConf.border} ${raridadeConf.cor}`
          : "bg-muted border-muted-foreground/20 text-muted-foreground"
      )}
    >
      {conquista.desbloqueado ? (
        <Icon className={iconSizes[size]} />
      ) : (
        <Lock className={iconSizes[size]} />
      )}
      {conquista.desbloqueado && conquista.raridade === "lendario" && (
        <div className="absolute -top-1 -right-1">
          <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
        </div>
      )}
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px]">
        <div className="space-y-1">
          <p className="font-semibold">{conquista.nome}</p>
          <p className="text-xs text-muted-foreground">{conquista.descricao}</p>
          <div className="flex items-center justify-between text-xs">
            <Badge variant="outline" className={raridadeConf.cor}>
              {raridadeConf.label}
            </Badge>
            <span className="text-warning">+{conquista.pontos} XP</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export function ConquistasSystem() {
  const hookData = useConquistas();
  const conquistas = hookData.conquistas;
  const loading = hookData.loading;
  const totalConquistas = hookData.totalConquistas;
  const pontosTotal = hookData.pontosTotal;

  const estatisticas = useMemo(() => ({
    xpTotal: pontosTotal,
    nivel: Math.floor(pontosTotal / 500) + 1,
    desbloqueados: conquistas.filter(c => c.desbloqueado).length,
    total: totalConquistas,
  }), [pontosTotal, conquistas, totalConquistas]);

  const recentes = useMemo(() => 
    conquistas
      .filter((c) => c.desbloqueado && c.dataDesbloqueio)
      .sort((a, b) => {
        const dateA = a.dataDesbloqueio?.getTime() || 0;
        const dateB = b.dataDesbloqueio?.getTime() || 0;
        return dateB - dateA;
      })
      .slice(0, 3),
    [conquistas]
  );

  const progressoNivel = useMemo(() => {
    const xpNoNivel = estatisticas.xpTotal % 500;
    return (xpNoNivel / 500) * 100;
  }, [estatisticas.xpTotal]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }


  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-warning" />
            Conquistas
          </span>
          <Badge variant="secondary" className="gap-1">
            <Star className="h-3 w-3" />
            Nível {estatisticas.nivel}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progresso do nível */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{estatisticas.xpTotal} XP</span>
            <span>{500 - (estatisticas.xpTotal % 500)} XP para nível {estatisticas.nivel + 1}</span>
          </div>
          <Progress value={progressoNivel} className="h-2 [&>div]:bg-warning" />
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-lg font-bold">{estatisticas.desbloqueados}</div>
            <div className="text-xs text-muted-foreground">Desbloqueados</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-lg font-bold">{estatisticas.total - estatisticas.desbloqueados}</div>
            <div className="text-xs text-muted-foreground">Restantes</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-lg font-bold">{estatisticas.xpTotal}</div>
            <div className="text-xs text-muted-foreground">XP Total</div>
          </div>
        </div>

        {/* Conquistas recentes */}
        {recentes.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Recentes</p>
            <div className="flex gap-2">
              {recentes.map((conquista) => (
                <BadgeIcon key={conquista.id} conquista={conquista} size="sm" />
              ))}
            </div>
          </div>
        )}

        {/* Ver todas */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="w-full text-sm text-primary hover:underline">
              Ver todas as conquistas →
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-warning" />
                Todas as Conquistas
              </DialogTitle>
            </DialogHeader>
            <ConquistasCompletas conquistas={conquistas} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

interface ConquistasCompletasProps {
  conquistas: ConquistaCompleta[];
}

function ConquistasCompletas({ conquistas }: ConquistasCompletasProps) {
  const categorias: BadgeCategory[] = ["produtividade", "qualidade", "consistencia", "especial", "sazonal"];

  return (
    <div className="space-y-6">
      {categorias.map((categoria) => {
        const config = categoriaConfig[categoria];
        const CategoriaIcone = config.icone;
        const conquistasCategoria = conquistas.filter((c) => c.categoria === categoria);

        if (conquistasCategoria.length === 0) return null;

        return (
          <div key={categoria}>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <CategoriaIcone className="h-4 w-4" />
              {config.label}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {conquistasCategoria.map((conquista) => {
                const raridadeConf = raridadeConfig[conquista.raridade];
                return (
                  <div
                    key={conquista.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border",
                      conquista.desbloqueado ? raridadeConf.bg : "bg-muted/30",
                      conquista.desbloqueado ? raridadeConf.border : "border-border",
                      !conquista.desbloqueado && "opacity-60"
                    )}
                  >
                    <BadgeIcon conquista={conquista} size="md" showTooltip={false} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{conquista.nome}</span>
                        <Badge variant="outline" className={`text-xs ${raridadeConf.cor}`}>
                          {raridadeConf.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{conquista.descricao}</p>
                      {!conquista.desbloqueado && conquista.progresso !== undefined && conquista.meta && (
                        <div className="mt-1">
                          <Progress 
                            value={(conquista.progresso / conquista.meta) * 100} 
                            className="h-1" 
                          />
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {conquista.progresso}/{conquista.meta}
                          </p>
                        </div>
                      )}
                      {conquista.desbloqueado && conquista.dataDesbloqueio && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Desbloqueado em {conquista.dataDesbloqueio.toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${conquista.desbloqueado ? "text-warning" : "text-muted-foreground"}`}>
                        +{conquista.pontos}
                      </span>
                      <p className="text-xs text-muted-foreground">XP</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ConquistasSystem;
