import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

interface MutationOptions<T, V> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useMutation<T, V = void>(mutationFn: (variables: V) => Promise<T>, options: MutationOptions<T, V> = {}) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(async (variables: V) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await mutationFn(variables);
      setData(result);
      options.onSuccess?.(result);
      if (options.successMessage) toast({ title: "Sucesso", description: options.successMessage });
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Erro desconhecido");
      setError(error);
      options.onError?.(error);
      if (options.errorMessage) toast({ title: "Erro", description: options.errorMessage, variant: "destructive" });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, options]);

  return { mutate, data, error, isLoading, reset: () => { setData(null); setError(null); } };
}
