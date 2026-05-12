import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Box, Lock, Loader2 } from "lucide-react";
import { BrandingContent } from "@/components/auth/BrandingContent";
import { supabase } from "@/integrations/supabase/client";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: "Erro", description: "Falha ao redefinir senha", variant: "destructive" });
    } else {
      toast({ title: "Senha redefinida", description: "Sua senha foi atualizada com sucesso" });
      navigate("/auth/login");
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
            <h2 className="text-2xl xl:text-3xl font-bold text-sidebar-foreground">Nova senha</h2>
            <p className="text-sidebar-foreground/40 text-sm mt-1">Defina sua nova senha de acesso</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sidebar-foreground/70 text-sm font-medium">Nova Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-sidebar-accent/60 border-sidebar-border" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm" className="text-sidebar-foreground/70 text-sm font-medium">Confirmar Nova Senha</Label>
              <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-sidebar-accent/60 border-sidebar-border" />
            </div>
            <Button type="submit" className="w-full h-11 bg-primary shadow-glow text-primary-foreground font-semibold" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Atualizando...</> : <><Lock className="mr-2 h-4 w-4" />Redefinir senha</>}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;