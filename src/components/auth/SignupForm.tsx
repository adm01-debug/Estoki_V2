import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";

interface SignupFormProps {
  onSubmit: (e: React.FormEvent) => void;
  nome: string;
  setNome: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  errors: Record<string, string>;
  isSubmitting: boolean;
  inputClasses: string;
}

export const SignupForm = ({
  onSubmit,
  nome,
  setNome,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  errors,
  isSubmitting,
  inputClasses
}: SignupFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="signup-nome" className="text-sidebar-foreground/70 text-sm font-medium">Nome</Label>
        <Input 
          id="signup-nome" 
          type="text" 
          placeholder="Seu nome" 
          value={nome} 
          onChange={(e) => setNome(e.target.value)} 
          disabled={isSubmitting} 
          maxLength={100} 
          className={inputClasses} 
        />
        {errors.nome && <p className="text-xs text-destructive" role="alert">{errors.nome}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signup-email" className="text-sidebar-foreground/70 text-sm font-medium">Email</Label>
        <Input 
          id="signup-email" 
          type="email" 
          placeholder="seu@email.com" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          disabled={isSubmitting} 
          className={inputClasses} 
        />
        {errors.email && <p className="text-xs text-destructive" role="alert">{errors.email}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signup-password" className="text-sidebar-foreground/70 text-sm font-medium">Senha</Label>
        <div className="relative">
          <Input 
            id="signup-password" 
            type={showPassword ? "text" : "password"} 
            placeholder="Mínimo 8 caracteres" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            disabled={isSubmitting} 
            className={`${inputClasses} pr-10`} 
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 top-0 h-full px-3 text-sidebar-foreground/30 hover:text-sidebar-foreground hover:bg-transparent" 
            onClick={() => setShowPassword(!showPassword)} 
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {errors.password && <p className="text-xs text-destructive" role="alert">{errors.password}</p>}
        <PasswordStrengthMeter password={password} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signup-confirm" className="text-sidebar-foreground/70 text-sm font-medium">Confirmar Senha</Label>
        <Input 
          id="signup-confirm" 
          type={showPassword ? "text" : "password"} 
          placeholder="Repita a senha" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          disabled={isSubmitting} 
          className={inputClasses} 
        />
        {errors.confirmPassword && <p className="text-xs text-destructive" role="alert">{errors.confirmPassword}</p>}
      </div>
      <Button type="submit" className="w-full h-11 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-glow text-primary-foreground font-semibold" disabled={isSubmitting}>
        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cadastrando...</> : "Criar Conta"}
      </Button>
    </form>
  );
};
