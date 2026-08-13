import { Link } from "react-router-dom";
import { Box, MailCheck, ArrowRight } from "lucide-react";
import { BrandingContent } from "@/components/auth/BrandingContent";

const VerifyEmailPage = () => {
  return (
    <div className="relative flex min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-sidebar" />
      <BrandingContent />
      <div className="relative z-10 flex w-full items-center justify-center p-6 sm:p-10 lg:w-1/2">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-sidebar-foreground xl:text-3xl">
            Verifique seu email
          </h2>
          <p className="text-sm text-sidebar-foreground/40">
            Enviamos um link de confirmação para o seu endereço de email. Por favor, clique no link
            para ativar sua conta.
          </p>
          <div className="pt-4">
            <Link
              to="/auth/login"
              className="inline-flex items-center font-semibold text-primary hover:underline"
            >
              Ir para o login <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
