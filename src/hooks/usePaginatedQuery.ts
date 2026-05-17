import { useState, useCallback, useEffect, useRef } from 'react';
interface PaginatedResult<T> { data: T[]; page: number; totalPages: number; isLoading: boolean; hasMore: boolean; }
export function usePaginatedQuery<T>(
  fetcher: (page: number, limit: number) => Promise<{ data: T[]; total: number }>,
  limit = 10
) {
  const [state, setState] = useState<PaginatedResult<T>>({
    data: [],
    page: 1,
    totalPages: 1,
    isLoading: false,
    hasMore: true
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPage = useCallback(async (page: number) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState(s => ({ ...s, isLoading: true }));
    try {
      const result = await fetcher(page, limit);
      const totalPages = Math.ceil(result.total / limit);
      setState({
        data: result.data,
        page,
        totalPages,
        isLoading: false,
        hasMore: page < totalPages
      });
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setState(s => ({ ...s, isLoading: false }));
      }
    }
  }, [fetcher, limit]);

  const nextPage = useCallback(() => {
    if (state.hasMore && !state.isLoading) fetchPage(state.page + 1);
  }, [state.page, state.hasMore, state.isLoading, fetchPage]);

  const prevPage = useCallback(() => {
    if (state.page > 1 && !state.isLoading) fetchPage(state.page - 1);
  }, [state.page, state.isLoading, fetchPage]);

  useEffect(() => {
    fetchPage(1);
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchPage]);

  return { ...state, nextPage, prevPage, goToPage: fetchPage };
}
