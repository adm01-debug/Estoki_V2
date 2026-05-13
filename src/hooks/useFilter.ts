import { useState, useMemo, useCallback } from 'react';

export function useFilter<T>(items: T[], filterFn?: (item: T, query: string) => boolean) {
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!query) return items;

    if (filterFn) {
      return items.filter(item => filterFn(item, query));
    }

    const lowerQuery = query.toLowerCase();
    return items.filter(item => {
      return Object.values(item as any).some(val => 
        String(val).toLowerCase().includes(lowerQuery)
      );
    });
  }, [items, query, filterFn]);

  return { items: filteredItems, query, setQuery };
}
