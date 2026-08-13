import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Box, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { BrandingContent } from "@/components/auth/BrandingContent";
import { supabase } from "@/integrations/supabase/client";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Erro", description: "Informe seu email", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar email de recuperação",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir a senha",
      });
    }
    setIsSubmitting(false);
  };

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
            <h1 className="text-2xl font-bold text-sidebar-foreground">ESTOKI</h1>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-sidebar-foreground xl:text-3xl">
              Esqueceu a senha?
            </h2>
            <p className="mt-1 text-sm text-sidebar-foreground/40">
              Informe seu email para receber o link de recuperação
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-sidebar-foreground/70">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-sidebar-border bg-sidebar-accent/60"
              />
            </div>
            <Button
              type="submit"
              className="h-11 w-full bg-primary font-semibold text-primary-foreground shadow-glow"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar link de recuperação
                </>
              )}
            </Button>
          </form>
          <div className="text-center">
            <Link
              to="/auth/login"
              className="inline-flex items-center text-sm text-sidebar-foreground/50 transition-colors hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o login
            </Link>
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

export default ForgotPasswordPage;
