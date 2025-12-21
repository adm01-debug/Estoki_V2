import { supabase } from "@/integrations/supabase/client";

export async function apiGet<T>(table: string, query?: Record<string, unknown>): Promise<T[]> {
  let builder = supabase.from(table).select("*");
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      builder = builder.eq(key, value);
    });
  }
  const { data, error } = await builder;
  if (error) throw error;
  return data as T[];
}

export async function apiGetById<T>(table: string, id: string): Promise<T | null> {
  const { data, error } = await supabase.from(table).select("*").eq("id", id).single();
  if (error) throw error;
  return data as T;
}

export async function apiCreate<T>(table: string, data: Partial<T>): Promise<T> {
  const { data: result, error } = await supabase.from(table).insert(data).select().single();
  if (error) throw error;
  return result as T;
}

export async function apiUpdate<T>(table: string, id: string, data: Partial<T>): Promise<T> {
  const { data: result, error } = await supabase.from(table).update(data).eq("id", id).select().single();
  if (error) throw error;
  return result as T;
}

export async function apiDelete(table: string, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}
