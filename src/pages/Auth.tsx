import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Box, Loader2, Eye, EyeOff, Zap, Globe, Wifi, BarChart3, Package, Users, Shield, Fingerprint } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { z } from "zod";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
});

const signupSchema = z.object({
  nome: z.string().trim().min(2, { message: "Nome deve ter no mínimo 2 caracteres" }).max(100),
  email: z.string().trim().email({ message: "Email inválido" }),
  password: z.string()
    .min(8, { message: "Senha deve ter no mínimo 8 caracteres" })
    .regex(/[A-Z]/, { message: "Deve conter ao menos uma letra maiúscula" })
    .regex(/[a-z]/, { message: "Deve conter ao menos uma letra minúscula" })
    .regex(/[0-9]/, { message: "Deve conter ao menos um número" })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Deve conter ao menos um caractere especial" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

const features = [
  { icon: Package, title: "Gestão de Estoque em Tempo Real", desc: "Controle total de entradas, saídas e posições" },
  { icon: BarChart3, title: "Analytics Avançados", desc: "Relatórios e métricas detalhadas de operação" },
  { icon: Users, title: "Gestão de Equipe", desc: "Gamificação e performance dos operadores" },
];

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, loading, signIn, signUp } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  // Signup fields
  const [signupNome, setSignupNome] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});

  // IP info
  const [ipInfo, setIpInfo] = useState<{ ip: string; city?: string; country?: string } | null>(null);

  useEffect(() => {
    if (!loading && user) navigate("/");
  }, [user, loading, navigate]);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(data => setIpInfo({ ip: data.ip, city: data.city, country: data.country_code }))
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors({});
    const result = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => { if (err.path[0]) errors[err.path[0].toString()] = err.message; });
      setLoginErrors(errors);
      return;
    }
    setIsSubmitting(true);
    const { error } = await signIn(loginEmail, loginPassword);
    if (error) {
      let msg = "Erro ao fazer login";
      if (error.message.includes("Invalid login credentials")) msg = "Email ou senha incorretos";
      else if (error.message.includes("Email not confirmed")) msg = "Confirme seu email antes de fazer login";
      toast({ title: "Erro no login", description: msg, variant: "destructive" });
    } else {
      toast({ title: "Login realizado!", description: "Bem-vindo ao sistema" });
      navigate("/");
    }
    setIsSubmitting(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupErrors({});
    const result = signupSchema.safeParse({ nome: signupNome, email: signupEmail, password: signupPassword, confirmPassword: signupConfirmPassword });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => { if (err.path[0]) errors[err.path[0].toString()] = err.message; });
      setSignupErrors(errors);
      return;
    }
    setIsSubmitting(true);
    const { error } = await signUp(signupEmail, signupPassword, signupNome);
    if (error) {
      let msg = "Erro ao criar conta";
      if (error.message.includes("User already registered")) msg = "Este email já está cadastrado";
      toast({ title: "Erro no cadastro", description: msg, variant: "destructive" });
    } else {
      toast({ title: "Conta criada!", description: "Verifique seu email para confirmar o cadastro" });
    }
    setIsSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast({ title: "Erro", description: "Falha ao entrar com Google", variant: "destructive" });
      }
      if (result.redirected) return;
      navigate("/");
    } catch {
      toast({ title: "Erro", description: "Falha ao entrar com Google", variant: "destructive" });
    } finally {
      setGoogleLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sidebar">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-glow animate-pulse">
            <Box className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="h-1 w-24 bg-primary/20 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-primary rounded-full shimmer" />
          </div>
        </div>
      </div>
    );
  }

  const inputClasses = "bg-sidebar-accent/60 border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/30 focus:border-primary focus:ring-primary/20 h-11 rounded-lg";

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-sidebar" />
      <div className="absolute top-[-30%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/[0.05] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/[0.03] blur-[100px] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(hsl(var(--sidebar-foreground) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--sidebar-foreground) / 0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* LEFT SIDE - Branding (hidden on mobile) */}
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

      {/* RIGHT SIDE - Auth Form */}
      <div className="relative z-10 w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-glow mb-3">
              <Box className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-sidebar-foreground">ESTOKI</h1>
          </div>

          {/* Header */}
          <div>
            <h2 className="text-2xl xl:text-3xl font-bold text-sidebar-foreground">
              {mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
            </h2>
            <p className="text-sidebar-foreground/40 text-sm mt-1">
              {mode === "login" ? "Entre com suas credenciais para continuar" : "Preencha os dados para começar"}
            </p>
          </div>

          {/* IP Badge */}
          {ipInfo && (
            <div className="flex items-center justify-between px-4 py-2.5 rounded-full border border-sidebar-border/60 bg-sidebar-accent/30 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs text-sidebar-foreground/50">
                <Globe className="h-3.5 w-3.5" />
                <span className="font-mono text-primary/80">{ipInfo.ip}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-sidebar-foreground/40">
                <span>{ipInfo.city}, {ipInfo.country}</span>
                <Wifi className="h-3 w-3 text-primary" />
              </div>
            </div>
          )}

          {/* Form */}
          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-sidebar-foreground/70 text-sm font-medium">Email</Label>
                <Input id="login-email" type="email" placeholder="seu@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} disabled={isSubmitting} className={inputClasses} />
                {loginErrors.email && <p className="text-xs text-destructive" role="alert">{loginErrors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="text-sidebar-foreground/70 text-sm font-medium">Senha</Label>
                  <button type="button" className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">Esqueceu a senha?</button>
                </div>
                <div className="relative">
                  <Input id="login-password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} disabled={isSubmitting} className={`${inputClasses} pr-10`} />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 text-sidebar-foreground/30 hover:text-sidebar-foreground hover:bg-transparent" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {loginErrors.password && <p className="text-xs text-destructive" role="alert">{loginErrors.password}</p>}
              </div>
              <Button type="submit" className="w-full h-11 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-glow text-primary-foreground font-semibold" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Entrando...</> : <><Zap className="mr-2 h-4 w-4" />Entrar</>}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="signup-nome" className="text-sidebar-foreground/70 text-sm font-medium">Nome</Label>
                <Input id="signup-nome" type="text" placeholder="Seu nome" value={signupNome} onChange={(e) => setSignupNome(e.target.value)} disabled={isSubmitting} maxLength={100} className={inputClasses} />
                {signupErrors.nome && <p className="text-xs text-destructive" role="alert">{signupErrors.nome}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signup-email" className="text-sidebar-foreground/70 text-sm font-medium">Email</Label>
                <Input id="signup-email" type="email" placeholder="seu@email.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} disabled={isSubmitting} className={inputClasses} />
                {signupErrors.email && <p className="text-xs text-destructive" role="alert">{signupErrors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signup-password" className="text-sidebar-foreground/70 text-sm font-medium">Senha</Label>
                <div className="relative">
                  <Input id="signup-password" type={showPassword ? "text" : "password"} placeholder="Mínimo 8 caracteres" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} disabled={isSubmitting} className={`${inputClasses} pr-10`} />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 text-sidebar-foreground/30 hover:text-sidebar-foreground hover:bg-transparent" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {signupErrors.password && <p className="text-xs text-destructive" role="alert">{signupErrors.password}</p>}
                <PasswordStrengthMeter password={signupPassword} />
              <div className="space-y-1.5">
                <Label htmlFor="signup-confirm" className="text-sidebar-foreground/70 text-sm font-medium">Confirmar Senha</Label>
                <Input id="signup-confirm" type={showPassword ? "text" : "password"} placeholder="Repita a senha" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} disabled={isSubmitting} className={inputClasses} />
                {signupErrors.confirmPassword && <p className="text-xs text-destructive" role="alert">{signupErrors.confirmPassword}</p>}
              </div>
              <Button type="submit" className="w-full h-11 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-glow text-primary-foreground font-semibold" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cadastrando...</> : "Criar Conta"}
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-sidebar-border" />
            <span className="text-xs text-sidebar-foreground/30 uppercase font-medium">ou</span>
            <div className="flex-1 h-px bg-sidebar-border" />
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-sidebar-border bg-sidebar-accent/30 text-sidebar-foreground hover:bg-sidebar-accent/60 hover:border-primary/30 transition-all"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l3.56-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.77 14.97 0 12 0 7.7 0 3.99 2.47 2.18 6.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              Entrar com Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-sidebar-border bg-sidebar-accent/30 text-sidebar-foreground hover:bg-sidebar-accent/60 hover:border-primary/30 transition-all"
              disabled
            >
              <Fingerprint className="mr-2 h-4 w-4" />
              Entrar com Passkey
            </Button>
            <p className="text-center text-[11px] text-sidebar-foreground/25">
              Use Face ID, Touch ID ou Windows Hello
            </p>
          </div>

          {/* Toggle mode */}
          <p className="text-center text-sm text-sidebar-foreground/40">
            {mode === "login" ? (
              <>Não tem uma conta?{" "}<button type="button" onClick={() => setMode("signup")} className="text-primary hover:text-primary/80 font-semibold transition-colors">Registre-se</button></>
            ) : (
              <>Já tem uma conta?{" "}<button type="button" onClick={() => setMode("login")} className="text-primary hover:text-primary/80 font-semibold transition-colors">Entrar</button></>
            )}
          </p>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-1.5 text-sidebar-foreground/20 text-[11px]">
            <Shield className="h-3 w-3" />
            <span>Conexão segura · Dados criptografados</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
