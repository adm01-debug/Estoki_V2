import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EntityVersion {
  id: string;
  entity_type: string;
  entity_id: string;
  version_number: number;
  data: Record<string, any>;
  diff?: Record<string, { old: any; new: any }>;
  changed_by: string;
  changed_at: string;
  change_summary?: string;
  change_type: "create" | "update" | "restore";
  user?: {
    full_name?: string;
    email?: string;
  };
}

interface UseEntityVersionsOptions {
  entityType: string;
  entityId: string;
  limit?: number;
  enabled?: boolean;
}

export function useEntityVersions({
  entityType,
  entityId,
  limit = 20,
  enabled = true,
}: UseEntityVersionsOptions) {
  const queryClient = useQueryClient();
  const queryKey = ["entity-versions", entityType, entityId];

  const { data: versions = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entity_versions")
        .select(`
          *,
          user:changed_by(full_name, email)
        `)
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("version_number", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as EntityVersion[];
    },
    enabled: enabled && !!entityId,
  });

  const restoreMutation = useMutation({
    mutationFn: async (versionNumber: number) => {
      const { data, error } = await supabase.rpc("restore_entity_version", {
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_version_number: versionNumber,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Versão restaurada com sucesso!");
      return data;
    },
    onError: (error: Error) => {
      toast.error(`Erro ao restaurar: ${error.message}`);
    },
  });

  const currentVersion = versions[0];
  const previousVersions = versions.slice(1);
  const totalVersions = versions.length;

  const compareVersions = (v1: number, v2: number) => {
    const version1 = versions.find((v) => v.version_number === v1);
    const version2 = versions.find((v) => v.version_number === v2);

    if (!version1 || !version2) return null;

    const changes: Record<string, { old: any; new: any }> = {};
    const allKeys = new Set([
      ...Object.keys(version1.data),
      ...Object.keys(version2.data),
    ]);

    allKeys.forEach((key) => {
      if (key === "updated_at" || key === "created_at") return;

      const val1 = version1.data[key];
      const val2 = version2.data[key];

      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        changes[key] = {
          old: v1 < v2 ? val1 : val2,
          new: v1 < v2 ? val2 : val1,
        };
      }
    });

    return changes;
  };

  const getVersionData = (versionNumber: number) => {
    return versions.find((v) => v.version_number === versionNumber)?.data;
  };

  return {
    versions,
    currentVersion,
    previousVersions,
    totalVersions,
    isLoading,
    error,
    restoreVersion: restoreMutation.mutate,
    isRestoring: restoreMutation.isPending,
    compareVersions,
    getVersionData,
  };
}
