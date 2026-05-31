import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Zap, Loader2 } from "lucide-react";
import { useState } from "react";

interface LoginFormProps {
  onSubmit: (e: React.FormEvent) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  errors: Record<string, string>;
  isSubmitting: boolean;
  inputClasses: string;
}

export const LoginForm = ({
  onSubmit,
  email,
  setEmail,
  password,
  setPassword,
  errors,
  isSubmitting,
  inputClasses,
}: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="login-email" className="text-sm font-medium text-sidebar-foreground/70">
          Email
        </Label>
        <Input
          id="login-email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          className={inputClasses}
        />
        {errors.email && (
          <p className="text-xs text-destructive" role="alert">
            {errors.email}
          </p>
        )}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="login-password"
            className="text-sm font-medium text-sidebar-foreground/70"
          >
            Senha
          </Label>
          <button
            type="button"
            className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            Esqueceu a senha?
          </button>
        </div>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            className={`${inputClasses} pr-10`}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 text-sidebar-foreground/30 hover:bg-transparent hover:text-sidebar-foreground"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive" role="alert">
            {errors.password}
          </p>
        )}
      </div>
      <Button
        type="submit"
        className="h-11 w-full bg-gradient-to-r from-primary to-primary/80 font-semibold text-primary-foreground shadow-glow hover:from-primary/90 hover:to-primary/70"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          <>
            <Zap className="mr-2 h-4 w-4" />
            Entrar
          </>
        )}
      </Button>
    </form>
  );
};
