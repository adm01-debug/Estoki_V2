import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Shield,
  Save,
  Key,
  Clock,
  LogOut,
  Settings,
  Laptop,
  Globe,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { profile, role, user, signOut, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [nome, setNome] = useState(profile?.nome || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setNome(profile?.nome || "");
    }
  }, [profile?.nome, isEditing]);

  const activeSessions = [
    {
      device: "MacBook Pro - Chrome",
      location: "São Paulo, BR",
      lastActive: "Agora",
      ip: "189.122.XX.XX",
      isCurrent: true,
    },
    {
      device: "iPhone 15 - Safari",
      location: "São Paulo, BR",
      lastActive: "2 horas atrás",
      ip: "177.34.XX.XX",
      isCurrent: false,
    },
  ];

  const handleSave = async () => {
    if (!nome.trim()) {
      toast.error("O nome não pode estar vazio");
      return;
    }
    if (nome === profile?.nome) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    const { error } = await updateProfile({ nome: nome.trim() });
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return;
    }
    toast.success("Perfil atualizado com sucesso!");
    setIsEditing(false);
  };

  const initials =
    profile?.nome
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <AppLayout title="Meu Perfil" showBack>
      <PageTransition>
        <div className="mx-auto max-w-[1200px] space-y-8 p-4 md:p-8">
          {/* Header do Perfil */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 p-8 shadow-2xl shadow-primary/20">
            <div className="absolute right-0 top-0 rotate-12 scale-150 p-8 opacity-10">
              <User className="h-48 w-48 text-white" />
            </div>
            <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row">
              <Avatar className="h-32 w-32 border-4 border-white/20 shadow-2xl ring-4 ring-white/10">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-white/20 text-4xl font-black text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                  <h1 className="text-3xl font-black tracking-tight text-white">
                    {profile?.nome || "Usuário Estoki"}
                  </h1>
                  <Badge className="border-white/30 bg-white/20 px-3 font-black uppercase tracking-widest text-white">
                    {role === "admin"
                      ? "Administrador"
                      : role === "supervisor"
                        ? "Supervisor"
                        : "Operador"}
                  </Badge>
                </div>
                <p className="flex items-center justify-center gap-2 font-medium text-white/70 md:justify-start">
                  <Mail className="h-4 w-4" /> {user?.email}
                </p>
              </div>
              <div className="md:ml-auto">
                <Button
                  variant="outline"
                  className="h-11 gap-2 rounded-xl border-white/30 bg-white/10 text-xs font-black uppercase tracking-wider text-white hover:bg-white/20 hover:text-white"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Settings className="h-4 w-4" />
                  {isEditing ? "Cancelar Edição" : "Editar Perfil"}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Informações da Conta */}
            <div className="space-y-6 lg:col-span-2">
              <Card className="glass-card overflow-hidden border-border/30 shadow-lg">
                <CardHeader className="border-b border-border/20 bg-muted/20">
                  <CardTitle className="text-lg font-black tracking-tight">
                    Informações Básicas
                  </CardTitle>
                  <CardDescription className="text-xs font-medium">
                    Gerencie os dados visíveis do seu perfil profissional
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="nome"
                        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                      >
                        Nome Completo
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="nome"
                          disabled={!isEditing}
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          className="h-11 rounded-xl border-border/40 bg-muted/30 pl-10 font-bold transition-all focus:bg-background"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                      >
                        E-mail Corporativo
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          disabled
                          value={user?.email || ""}
                          className="h-11 rounded-xl border-border/20 bg-muted/20 pl-10 font-bold opacity-70"
                        />
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end pt-4">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="glow-button h-11 gap-2 rounded-xl px-8 text-xs font-black uppercase tracking-wider"
                      >
                        <Save className="h-4 w-4" />{" "}
                        {saving ? "Salvando..." : "Salvar Alterações"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card overflow-hidden border-border/30 shadow-lg">
                <CardHeader className="border-b border-border/20 bg-muted/20">
                  <CardTitle className="text-lg font-black tracking-tight">
                    Segurança e Acesso
                  </CardTitle>
                  <CardDescription className="text-xs font-medium">
                    Mantenha sua conta protegida com as melhores práticas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                  <div className="group flex items-center justify-between rounded-2xl border border-border/30 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                        <Key className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-foreground">Alterar Senha</p>
                        <p className="text-xs font-medium text-muted-foreground">
                          Recomendado trocar a cada 90 dias
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-xl border-border/40 font-bold hover:bg-primary/5"
                    >
                      Alterar
                    </Button>
                  </div>

                  <div className="group flex items-center justify-between rounded-2xl border border-border/30 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-success/20 bg-success/10 text-success">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-foreground">
                          Autenticação em Duas Etapas
                        </p>
                        <Badge
                          variant="outline"
                          className="mt-1 border-success/20 bg-success/10 text-[9px] font-black uppercase tracking-widest text-success"
                        >
                          Ativo
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-xl border-border/40 font-bold hover:bg-destructive/5 hover:text-destructive"
                    >
                      Desativar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card overflow-hidden border-border/30 shadow-lg">
                <CardHeader className="border-b border-border/20 bg-muted/20">
                  <CardTitle className="text-lg font-black tracking-tight">
                    Dispositivos Conectados
                  </CardTitle>
                  <CardDescription className="text-xs font-medium">
                    Sessões ativas que acessaram sua conta recentemente
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/20">
                    {activeSessions.map((session, i) => (
                      <div
                        key={i}
                        className="group flex items-center justify-between p-6 transition-colors hover:bg-muted/5"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "flex h-12 w-12 items-center justify-center rounded-2xl border",
                              session.isCurrent
                                ? "border-primary/20 bg-primary/10 text-primary"
                                : "border-border/20 bg-muted/30 text-muted-foreground"
                            )}
                          >
                            <Laptop className="h-6 w-6" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-black text-foreground">{session.device}</p>
                              {session.isCurrent && (
                                <Badge className="border-success/20 bg-success/10 text-[9px] font-black uppercase text-success">
                                  Atual
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-medium text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" /> {session.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {session.lastActive}
                              </span>
                            </div>
                          </div>
                        </div>
                        {!session.isCurrent && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-xl text-[10px] font-bold uppercase text-destructive opacity-0 transition-all group-hover:opacity-100"
                          >
                            Encerrar
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border/20 bg-muted/10 p-4">
                    <Button
                      variant="link"
                      className="w-full text-[10px] font-black uppercase tracking-widest text-primary"
                    >
                      Encerrar todas as outras sessões
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar do Perfil */}
            <div className="space-y-6">
              <Card className="glass-card overflow-hidden border-border/30 shadow-lg">
                <CardHeader className="border-b border-border/20 bg-muted/20">
                  <CardTitle className="text-base font-black tracking-tight">
                    Estatísticas Operacionais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        Triagens Hoje
                      </span>
                      <span className="font-black text-primary">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        Acuracidade Média
                      </span>
                      <span className="font-black text-success">98.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        Tempo de Sessão
                      </span>
                      <span className="font-black text-foreground">2h 45m</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card overflow-hidden border-border/30 shadow-lg">
                <CardContent className="p-6">
                  <Button
                    variant="ghost"
                    className="h-12 w-full justify-start gap-3 rounded-xl text-xs font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={signOut}
                  >
                    <LogOut className="h-5 w-5" />
                    Sair da Conta
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-1 text-center opacity-50">
                <p className="text-[10px] font-bold uppercase tracking-widest">ESTOKI WMS v1.0.0</p>
                <p className="text-[9px] font-medium tracking-tight">
                  ID do Usuário: {user?.id.slice(0, 8)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
