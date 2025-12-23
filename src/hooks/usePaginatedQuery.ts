import { useState, useCallback, useEffect } from 'react';
interface PaginatedResult<T> { data: T[]; page: number; totalPages: number; isLoading: boolean; hasMore: boolean; }
export function usePaginatedQuery<T>(fetcher: (page: number, limit: number) => Promise<{ data: T[]; total: number }>, limit = 10) {
  const [state, setState] = useState<PaginatedResult<T>>({ data: [], page: 1, totalPages: 1, isLoading: false, hasMore: true });
  const fetchPage = useCallback(async (page: number) => {
    setState(s => ({ ...s, isLoading: true }));
    const result = await fetcher(page, limit);
    const totalPages = Math.ceil(result.total / limit);
    setState({ data: result.data, page, totalPages, isLoading: false, hasMore: page < totalPages });
  }, [fetcher, limit]);
  const nextPage = useCallback(() => { if (state.hasMore) fetchPage(state.page + 1); }, [state.page, state.hasMore, fetchPage]);
  const prevPage = useCallback(() => { if (state.page > 1) fetchPage(state.page - 1); }, [state.page, fetchPage]);
  useEffect(() => { fetchPage(1); }, []);
  return { ...state, nextPage, prevPage, goToPage: fetchPage };
}
