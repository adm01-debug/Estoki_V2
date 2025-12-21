import { useState, useCallback, useMemo } from "react";

export function useFilter<T>(data: T[], searchFields: (keyof T)[]) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Partial<Record<keyof T, unknown>>>({});

  const filteredData = useMemo(() => {
    let result = data;
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return String(value).toLowerCase().includes(lowerSearch);
        })
      );
    }
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        result = result.filter(item => item[key as keyof T] === value);
      }
    });
    return result;
  }, [data, search, filters, searchFields]);

  const setFilter = useCallback((field: keyof T, value: unknown) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setFilters({});
  }, []);

  return { search, setSearch, filters, setFilter, clearFilters, filteredData };
}
