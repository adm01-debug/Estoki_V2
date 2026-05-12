import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Box, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { BrandingContent } from "@/components/auth/BrandingContent";
import { lovable } from "@/integrations/lovable/index";

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
    const { error } = await lovable.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) {
      toast({ title: "Erro", description: "Falha ao enviar email de recuperação", variant: "destructive" });
    } else {
      toast({ title: "Email enviado", description: "Verifique sua caixa de entrada para redefinir a senha" });
    }
    setIsSubmitting(false);
  };

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
            <h2 className="text-2xl xl:text-3xl font-bold text-sidebar-foreground">Esqueceu a senha?</h2>
            <p className="text-sidebar-foreground/40 text-sm mt-1">Informe seu email para receber o link de recuperação</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sidebar-foreground/70 text-sm font-medium">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="bg-sidebar-accent/60 border-sidebar-border" 
              />
            </div>
            <Button type="submit" className="w-full h-11 bg-primary shadow-glow text-primary-foreground font-semibold" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : <><Mail className="mr-2 h-4 w-4" />Enviar link de recuperação</>}
            </Button>
          </form>
          <div className="text-center">
            <Link to="/auth/login" className="inline-flex items-center text-sm text-sidebar-foreground/50 hover:text-primary transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;