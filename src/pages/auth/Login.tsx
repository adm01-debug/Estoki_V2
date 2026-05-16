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
      result.error.errors.forEach((err) => { if (err.path[0]) errs[err.path[0].toString()] = err.message; });
      setErrors(errs);
      return;
    }
    setIsSubmitting(true);
    const { error } = await signIn(email, password);
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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) toast({ title: "Erro", description: "Falha ao entrar com Google", variant: "destructive" });
      if (result.redirected) return;
      navigate("/");
    } catch {
      toast({ title: "Erro", description: "Falha ao entrar com Google", variant: "destructive" });
    } finally {
      setGoogleLoading(false);
    }
  };

  if (loading) return (
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

  const inputClasses = "bg-sidebar-accent/60 border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/30 focus:border-primary focus:ring-primary/20 h-11 rounded-lg";

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <div className="absolute inset-0 bg-sidebar" />
      <BrandingContent />
      <div className="relative z-10 w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden text-center mb-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-glow mb-3">
              <Box className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-sidebar-foreground">ESTOKI</h1>
          </div>
          <div>
            <h2 className="text-2xl xl:text-3xl font-bold text-sidebar-foreground">Bem-vindo de volta</h2>
            <p className="text-sidebar-foreground/40 text-sm mt-1">Entre com suas credenciais para continuar</p>
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
            <div className="flex-1 h-px bg-sidebar-border" />
            <span className="text-xs text-sidebar-foreground/30 uppercase font-medium">ou</span>
            <div className="flex-1 h-px bg-sidebar-border" />
          </div>
          <Button
            variant="outline"
            className="w-full h-11 border-sidebar-border bg-sidebar-accent/30 text-sidebar-foreground hover:bg-sidebar-accent/60"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
            Entrar com Google
          </Button>
          <div className="text-center pt-2">
            <Link to="/auth/register" className="text-sm text-sidebar-foreground/50 hover:text-primary transition-colors">
              Não tem uma conta? <span className="text-primary font-semibold">Cadastre-se</span>
            </Link>
          </div>

          {/* Legal Footer */}
          <div className="pt-8 border-t border-sidebar-border mt-8">
            <p className="text-[10px] leading-relaxed text-sidebar-foreground/30 text-center">
              Este sistema é propriedade intelectual exclusiva da Brasil Marcas, sendo protegido pela Lei nº 9.609/98 e demais normas aplicáveis. 
              É proibida sua reprodução, cópia, modificação, distribuição ou uso não autorizado.
              <br />
              <span className="font-semibold text-sidebar-foreground/40 italic">
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