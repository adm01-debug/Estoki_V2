import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Box, Loader2, Zap } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { loginSchema } from "@/components/auth/authSchema";
import { BrandingContent } from "@/components/auth/BrandingContent";
import { LoginForm } from "@/components/auth/LoginForm";

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, loading, signIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && user) navigate("/");
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) errs[err.path[0].toString()] = err.message;
      });
      setErrors(errs);
      return;
    }
    setIsSubmitting(true);
    const { error } = await signIn(email, password);
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
      if (result.error)
        toast({ title: "Erro", description: "Falha ao entrar com Google", variant: "destructive" });
      if (result.redirected) return;
      navigate("/");
    } catch {
      toast({ title: "Erro", description: "Falha ao entrar com Google", variant: "destructive" });
    } finally {
      setGoogleLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-sidebar">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-glow">
            <Box className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="h-1 w-24 overflow-hidden rounded-full bg-primary/20">
            <div className="shimmer h-full w-1/2 rounded-full bg-primary" />
          </div>
        </div>
      </div>
    );

  const inputClasses =
    "bg-sidebar-accent/60 border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/30 focus:border-primary focus:ring-primary/20 h-11 rounded-lg";

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-sidebar" />
      <BrandingContent />
      <div className="relative z-10 flex w-full items-center justify-center p-6 sm:p-10 lg:w-1/2">
        <div className="w-full max-w-md space-y-6">
          <div className="mb-4 text-center lg:hidden">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-glow">
              <Box className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-sidebar-foreground">PROMO BRINDES</h1>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-sidebar-foreground xl:text-3xl">
              Bem-vindo de volta
            </h2>
            <p className="mt-1 text-sm text-sidebar-foreground/40">
              Entre com suas credenciais para continuar
            </p>
          </div>
          <LoginForm
            onSubmit={handleLogin}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            errors={errors}
            isSubmitting={isSubmitting}
            inputClasses={inputClasses}
          />
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-sidebar-border" />
            <span className="text-xs font-medium uppercase text-sidebar-foreground/30">ou</span>
            <div className="h-px flex-1 bg-sidebar-border" />
          </div>
          <Button
            variant="outline"
            className="h-11 w-full border-sidebar-border bg-sidebar-accent/30 text-sidebar-foreground hover:bg-sidebar-accent/60"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            Entrar com Google
          </Button>
          <div className="space-y-2 pt-2 text-center">
            <Link
              to="/auth/forgot-password"
              className="block text-sm text-sidebar-foreground/50 transition-colors hover:text-primary"
            >
              Esqueceu sua senha?
            </Link>
            <p className="text-[11px] text-sidebar-foreground/30">
              Sistema de uso exclusivo. Para solicitar acesso, contate o administrador.
            </p>
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
    </div>
  );
};

export default LoginPage;
