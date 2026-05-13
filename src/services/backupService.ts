import { supabase } from "@/integrations/supabase/client";

export const backupService = {
  async listBackups(): Promise<any[]> {
    const { data, error } = await supabase.storage
      .from("backups")
      .list();

    if (error) throw error;
    return data || [];
  },

  async createBackup(name: string, data: any): Promise<void> {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const { error } = await supabase.storage
      .from("backups")
      .upload(`${name}_${Date.now()}.json`, blob);

    if (error) throw error;
  },

  async downloadBackup(path: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from("backups")
      .download(path);

    if (error) throw error;
    return URL.createObjectURL(data);
  }
};
