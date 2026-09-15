import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TenantSummary {
  id: string;
  nome: string;
  slug: string;
  plano: "free" | "pro" | "enterprise";
  papel: "owner" | "admin" | "member";
}

/**
 * Retorna os tenants aos quais o usuário autenticado pertence.
 * O primeiro item é considerado o "tenant atual" (mesmo critério de
 * `public.current_tenant_id()` no banco).
 */
export function useUserTenants() {
  return useQuery({
    queryKey: ["user-tenants"],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<TenantSummary[]> => {
      const { data, error } = await supabase
        .from("tenant_members")
        .select("papel, tenants:tenant_id ( id, nome, slug, plano )")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? [])
        .map((row: any) => {
          const t = row.tenants;
          if (!t) return null;
          return {
            id: t.id,
            nome: t.nome,
            slug: t.slug,
            plano: t.plano,
            papel: row.papel,
          } as TenantSummary;
        })
        .filter(Boolean) as TenantSummary[];
    },
  });
}

export function useCurrentTenant() {
  const q = useUserTenants();
  return {
    ...q,
    tenant: q.data?.[0] ?? null,
  };
}
