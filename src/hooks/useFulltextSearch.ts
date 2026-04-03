import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface FulltextSearchOptions<T> {
  table: string;
  searchColumns: string[];
  selectColumns?: string[];
  minChars?: number;
  debounceMs?: number;
  limit?: number;
  orderBy?: { column: string; ascending?: boolean };
  additionalFilters?: Record<string, any>;
  enabled?: boolean;
}

interface SearchResult<T> {
  data: T[];
  isLoading: boolean;
  isSearching: boolean;
  error: Error | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
  hasResults: boolean;
  totalResults: number;
}

export function useFulltextSearch<T = any>(
  options: FulltextSearchOptions<T>
): SearchResult<T> {
  const {
    table,
    searchColumns,
    selectColumns = ["*"],
    minChars = 2,
    debounceMs = 300,
    limit = 50,
    orderBy,
    additionalFilters = {},
    enabled = true,
  } = options;

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncedValue(searchTerm, debounceMs);

  const shouldSearch = useMemo(
    () => enabled && debouncedSearchTerm.length >= minChars,
    [enabled, debouncedSearchTerm, minChars]
  );

  const queryKey = useMemo(
    () => ["fulltext-search", table, debouncedSearchTerm, additionalFilters],
    [table, debouncedSearchTerm, additionalFilters]
  );

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = (supabase
        .from(table as any) as any)
        .select(selectColumns.join(","), { count: "exact" });

      if (debouncedSearchTerm.length >= minChars) {
        const searchConditions = searchColumns
          .map((col) => `${col}.ilike.%${debouncedSearchTerm}%`)
          .join(",");
        query = query.or(searchConditions);
      }

      Object.entries(additionalFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          query = query.eq(key, value);
        }
      });

      if (orderBy) {
        query = query.order(orderBy.column, {
          ascending: orderBy.ascending ?? true,
        });
      }

      query = query.limit(limit);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        items: data as T[],
        total: count || 0,
      };
    },
    enabled: shouldSearch || Object.keys(additionalFilters).length > 0,
    staleTime: 30000,
    gcTime: 60000,
  });

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  return {
    data: data?.items || [],
    isLoading,
    isSearching: isFetching && shouldSearch,
    error: error as Error | null,
    searchTerm,
    setSearchTerm,
    clearSearch,
    hasResults: (data?.items?.length || 0) > 0,
    totalResults: data?.total || 0,
  };
}

export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm || searchTerm.length < 2) return text;

  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, "gi");
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function useSearchHighlight(text: string, searchTerm: string): string {
  return useMemo(() => {
    return highlightSearchTerm(text, searchTerm);
  }, [text, searchTerm]);
}
