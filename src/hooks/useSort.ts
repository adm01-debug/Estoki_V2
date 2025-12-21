import { useState, useCallback, useMemo } from "react";

type SortDirection = "asc" | "desc";

interface SortConfig<T> {
  field: keyof T | null;
  direction: SortDirection;
}

export function useSort<T>(initialField?: keyof T) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    field: initialField || null,
    direction: "asc",
  });

  const toggleSort = useCallback((field: keyof T) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const sortData = useCallback((data: T[]): T[] => {
    if (!sortConfig.field) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.field!];
      const bVal = b[sortConfig.field!];
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [sortConfig]);

  return { sortConfig, toggleSort, sortData };
}
