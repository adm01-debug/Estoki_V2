import { useInfiniteQuery as useTanstackInfiniteQuery } from '@tanstack/react-query';
export function useInfiniteQuery<T>(key: string[], fetcher: (page: number) => Promise<{ data: T[]; nextPage?: number }>) {
  return useTanstackInfiniteQuery({ queryKey: key, queryFn: ({ pageParam = 1 }) => fetcher(pageParam), getNextPageParam: (lastPage) => lastPage.nextPage, initialPageParam: 1 });
}
