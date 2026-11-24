import { MutationCache } from "@tanstack/react-query";
import { toast } from "sonner";

// Erros de mutação que o fluxo não tratou viram um toast único e legível, em vez
// de falhar silenciosamente na tela. Quem define onError próprio já notifica.
export const mutationCache = new MutationCache({
  onError: (error, _variables, _context, mutation) => {
    if (mutation.options.onError) return;
    toast.error("Não foi possível concluir a ação", {
      description: error instanceof Error ? error.message : String(error),
    });
  },
});
