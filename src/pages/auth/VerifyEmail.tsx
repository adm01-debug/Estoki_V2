import { Link } from "react-router-dom";
import { Box, MailCheck, ArrowRight } from "lucide-react";
import { BrandingContent } from "@/components/auth/BrandingContent";

const VerifyEmailPage = () => {
  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <div className="absolute inset-0 bg-sidebar" />
      <BrandingContent />
      <div className="relative z-10 w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <MailCheck className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl xl:text-3xl font-bold text-sidebar-foreground">Verifique seu email</h2>
          <p className="text-sidebar-foreground/40 text-sm">
            Enviamos um link de confirmação para o seu endereço de email. 
            Por favor, clique no link para ativar sua conta.
          </p>
          <div className="pt-4">
            <Link to="/auth/login" className="inline-flex items-center text-primary font-semibold hover:underline">
              Ir para o login <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;