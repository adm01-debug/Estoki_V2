import { supabase } from "@/integrations/supabase/client";

export async function uploadFile(bucket: string, path: string, file: File): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) throw error;
  return data.path;
}

export async function getPublicUrl(bucket: string, path: string): Promise<string> {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

export async function listFiles(bucket: string, folder: string): Promise<string[]> {
  const { data, error } = await supabase.storage.from(bucket).list(folder);
  if (error) throw error;
  return data.map(f => f.name);
}

export function generateFileName(originalName: string): string {
  const ext = originalName.split(".").pop();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${timestamp}-${random}.${ext}`;
}
