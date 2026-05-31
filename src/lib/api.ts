import { supabase } from "@/integrations/supabase/client";

// Simplificando os tipos para evitar erros de profundidade de recursão no TypeScript
// (TS2589: Type instantiation is excessively deep)

export async function apiGet<T>(table: string, query?: Record<string, unknown>): Promise<T[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let builder = supabase.from(table as any).select("*");
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      builder = builder.eq(key, value);
    });
  }
  const { data, error } = await builder;
  if (error) throw error;
  return (data ?? []) as T[];
}

export async function apiGetById<T>(table: string, id: string): Promise<T | null> {
   
  const { data, error } = await supabase
    .from(table as any)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as T;
}

export async function apiCreate<T>(table: string, payload: Partial<T>): Promise<T> {
   
  const { data: result, error } = await supabase
    .from(table as any)
    .insert(payload as any)
    .select()
    .single();
  if (error) throw error;
  return result as T;
}

export async function apiUpdate<T>(table: string, id: string, payload: Partial<T>): Promise<T> {
   
  const { data: result, error } = await supabase
    .from(table as any)
    .update(payload as any)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result as T;
}

export async function apiDelete(table: string, id: string): Promise<void> {
   
  const { error } = await supabase
    .from(table as any)
    .delete()
    .eq("id", id);
  if (error) throw error;
}
