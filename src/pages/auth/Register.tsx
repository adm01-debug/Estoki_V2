import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Box } from "lucide-react";
import { signupSchema } from "@/components/auth/authSchema";
import { BrandingContent } from "@/components/auth/BrandingContent";
import { SignupForm } from "@/components/auth/SignupForm";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { user, loading, signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && user) navigate("/");
  }, [user, loading, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = signupSchema.safeParse({ nome, email, password, confirmPassword });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach((err) => { if (err.path[0]) errs[err.path[0].toString()] = err.message; });
      setErrors(errs);
      return;
    }
    setIsSubmitting(true);
    const { error } = await signUp(email, password, nome);
    if (error) {
      let msg = "Erro ao criar conta";
      if (error.message.includes("User already registered")) msg = "Este email já está cadastrado";
      toast({ title: "Erro no cadastro", description: msg, variant: "destructive" });
    } else {
      toast({ title: "Conta criada!", description: "Verifique seu email para confirmar o cadastro" });
    }
    setIsSubmitting(false);
  };

  if (loading) return null;
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
            <h2 className="text-2xl xl:text-3xl font-bold text-sidebar-foreground">Crie sua conta</h2>
            <p className="text-sidebar-foreground/40 text-sm mt-1">Preencha os dados para começar</p>
          </div>
          <SignupForm 
            onSubmit={handleSignup}
            nome={nome}
            setNome={setNome}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            errors={errors}
            isSubmitting={isSubmitting}
            inputClasses={inputClasses}
          />
          <div className="text-center pt-2">
            <Link to="/auth/login" className="text-sm text-sidebar-foreground/50 hover:text-primary transition-colors">
              Já tem uma conta? <span className="text-primary font-semibold">Faça login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;