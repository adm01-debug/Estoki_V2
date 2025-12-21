import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type TableName = keyof Database["public"]["Tables"];

export async function apiGet<T>(table: TableName, query?: Record<string, unknown>): Promise<T[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let builder = supabase.from(table).select("*") as any;
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      builder = builder.eq(key, value);
    });
  }
  const { data, error } = await builder;
  if (error) throw error;
  return (data ?? []) as T[];
}

export async function apiGetById<T>(table: TableName, id: string): Promise<T | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from(table).select("*").eq("id", id).single() as any);
  if (error) throw error;
  return data as T;
}

export async function apiCreate<T>(table: TableName, payload: Partial<T>): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: result, error } = await (supabase.from(table).insert(payload as any).select().single() as any);
  if (error) throw error;
  return result as T;
}

export async function apiUpdate<T>(table: TableName, id: string, payload: Partial<T>): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: result, error } = await (supabase.from(table).update(payload as any).eq("id", id).select().single() as any);
  if (error) throw error;
  return result as T;
}

export async function apiDelete(table: TableName, id: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from(table).delete().eq("id", id) as any);
  if (error) throw error;
}
