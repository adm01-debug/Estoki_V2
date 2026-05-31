import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Box, Loader2 } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { loginSchema } from "@/components/auth/authSchema";
import { BrandingContent } from "@/components/auth/BrandingContent";
import { LoginForm } from "@/components/auth/LoginForm";

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, loading, signIn } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && user) {
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirectTo") || "/";
      navigate(redirectTo, { replace: true });
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors({});
    const result = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0].toString()] = err.message;
      });
      setLoginErrors(errors);
      return;
    }
    setIsSubmitting(true);
    const { error } = await signIn(loginEmail, loginPassword);
    if (error) {
      let msg = "Erro ao fazer login";
      if (error.message.includes("Invalid login credentials")) msg = "Email ou senha incorretos";
      else if (error.message.includes("Email not confirmed"))
        msg = "Confirme seu email antes de fazer login";
      toast({ title: "Erro no login", description: msg, variant: "destructive" });
    } else {
      toast({ title: "Login realizado!", description: "Bem-vindo ao sistema" });
      navigate("/");
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
      <div className="flex min-h-screen items-center justify-center bg-sidebar">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-glow">
            <Box className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="h-1 w-24 overflow-hidden rounded-full bg-primary/20">
            <div className="shimmer h-full w-1/2 rounded-full bg-primary" />
          </div>

          {/* Legal Footer */}
          <div className="mt-8 border-t border-sidebar-border pt-8">
            <p className="text-center text-[10px] leading-relaxed text-sidebar-foreground/30">
              Este sistema é propriedade intelectual exclusiva da Brasil Marcas, sendo protegido
              pela Lei nº 9.609/98 e demais normas aplicáveis. É proibida sua reprodução, cópia,
              modificação, distribuição ou uso não autorizado.
              <br />
              <span className="font-semibold italic text-sidebar-foreground/40">
                © 2026 ESTOKI WAREHOUSE Todos os direitos reservados.
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const inputClasses =
    "bg-sidebar-accent/60 border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/30 focus:border-primary focus:ring-primary/20 h-11 rounded-lg";

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* Background Layers */}
      <div className="absolute inset-0 bg-sidebar" />
      <div className="pointer-events-none absolute right-[-10%] top-[-30%] h-[60%] w-[60%] rounded-full bg-primary/[0.05] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-20%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary/[0.03] blur-[100px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--sidebar-foreground) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--sidebar-foreground) / 0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <BrandingContent />

      {/* RIGHT SIDE - Auth Form */}
      <div className="relative z-10 flex w-full items-center justify-center p-6 sm:p-10 lg:w-1/2">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="mb-6 flex flex-col items-center text-center lg:hidden">
            <div className="mb-4 flex h-[68px] w-[68px] items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-glow">
              <Box className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="space-y-1">
              <h1 className="gradient-text text-3xl font-black leading-none tracking-tighter">
                PROMO BRINDES
              </h1>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">
                INTELLIGENCE
              </p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-sidebar-foreground/40">
                WMS 10/10
              </p>
            </div>
          </div>

          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-sidebar-foreground xl:text-3xl">
              Bem-vindo de volta
            </h2>
            <p className="mt-1 text-sm text-sidebar-foreground/40">
              Entre com suas credenciais para continuar
            </p>
            <p className="mt-2 text-[11px] italic text-sidebar-foreground/30">
              Sistema de uso exclusivo. Acesso restrito a colaboradores autorizados.
            </p>
          </div>

          <LoginForm
            onSubmit={handleLogin}
            email={loginEmail}
            setEmail={setLoginEmail}
            password={loginPassword}
            setPassword={setLoginPassword}
            errors={loginErrors}
            isSubmitting={isSubmitting}
            inputClasses={inputClasses}
          />

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-sidebar-border" />
            <span className="text-xs font-medium uppercase text-sidebar-foreground/30">ou</span>
            <div className="h-px flex-1 bg-sidebar-border" />
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full border-sidebar-border bg-sidebar-accent/30 text-sidebar-foreground transition-all hover:border-primary/30 hover:bg-sidebar-accent/60"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l3.56-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.77 14.97 0 12 0 7.7 0 3.99 2.47 2.18 6.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Entrar com Google
            </Button>
          </div>

          {/* Footer toggle */}
          <div className="flex flex-col gap-2 pt-2 text-center">
            <Link
              to="/auth/forgot-password"
              className="text-sm font-medium text-sidebar-foreground/50 transition-colors hover:text-primary"
            >
              Esqueceu sua senha?
            </Link>
            <p className="mt-2 text-[11px] text-sidebar-foreground/30">
              Para solicitar acesso, contate o administrador do sistema.
            </p>
          </div>

          {/* Legal Footer */}
          <div className="mt-4 border-t border-sidebar-border/30 pt-8">
            <p className="px-4 text-center text-[10px] leading-relaxed text-sidebar-foreground/20">
              Este sistema é propriedade intelectual exclusiva da Brasil Marcas, sendo protegido
              pela Lei nº 9.609/98 e demais normas aplicáveis. É proibida sua reprodução, cópia,
              modificação, distribuição ou uso não autorizado.
              <br />
              <span className="font-semibold italic text-sidebar-foreground/30">
                © 2026 ESTOKI WAREHOUSE Todos os direitos reservados.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
