// @ts-nocheck
import { useCallback, useRef, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface InfiniteScrollOptions<T> {
  table: string;
  selectColumns?: string[];
  pageSize?: number;
  orderBy?: { column: string; ascending?: boolean };
  filters?: Record<string, any>;
  searchTerm?: string;
  searchColumns?: string[];
  enabled?: boolean;
}

interface InfiniteScrollResult<T> {
  data: T[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
  totalCount: number;
  loadedCount: number;
  progress: number;
  observerRef: (node: HTMLElement | null) => void;
}

export function useInfiniteScroll<T = any>(
  options: InfiniteScrollOptions<T>
): InfiniteScrollResult<T> {
  const {
    table,
    selectColumns = ["*"],
    pageSize = 20,
    orderBy = { column: "created_at", ascending: false },
    filters = {},
    searchTerm = "",
    searchColumns = [],
    enabled = true,
  } = options;

  const observerTarget = useRef<HTMLElement | null>(null);
  const intersectionObserver = useRef<IntersectionObserver | null>(null);

  const queryKey = useMemo(
    () => ["infinite", table, pageSize, orderBy, filters, searchTerm],
    [table, pageSize, orderBy, filters, searchTerm]
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from(table)
        .select(selectColumns.join(","), { count: "exact" })
        .order(orderBy.column, { ascending: orderBy.ascending ?? false })
        .range(pageParam, pageParam + pageSize - 1);

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else {
            query = query.eq(key, value);
          }
        }
      });

      if (searchTerm && searchColumns.length > 0) {
        const searchConditions = searchColumns
          .map((col) => `${col}.ilike.%${searchTerm}%`)
          .join(",");
        query = query.or(searchConditions);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        items: data as T[],
        nextPage: data.length === pageSize ? pageParam + pageSize : undefined,
        totalCount: count || 0,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled,
  });

  const allItems = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) ?? [];
  }, [data]);

  const totalCount = data?.pages[0]?.totalCount ?? 0;
  const loadedCount = allItems.length;
  const progress = totalCount > 0 ? (loadedCount / totalCount) * 100 : 0;

  const observerRef = useCallback(
    (node: HTMLElement | null) => {
      if (intersectionObserver.current) {
        intersectionObserver.current.disconnect();
      }

      if (!node) return;

      intersectionObserver.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        {
          rootMargin: "100px",
          threshold: 0.1,
        }
      );

      intersectionObserver.current.observe(node);
      observerTarget.current = node;
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  return {
    data: allItems,
    isLoading,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    fetchNextPage,
    refetch,
    totalCount,
    loadedCount,
    progress,
    observerRef,
  };
}

export function InfiniteScrollTrigger({
  observerRef,
  isFetching,
  hasMore,
}: {
  observerRef: (node: HTMLElement | null) => void;
  isFetching: boolean;
  hasMore: boolean;
}) {
  if (!hasMore && !isFetching) return null;

  return (
    <div ref={observerRef} className="flex justify-center py-4">
      {isFetching && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="text-sm">Carregando mais...</span>
        </div>
      )}
    </div>
  );
}
