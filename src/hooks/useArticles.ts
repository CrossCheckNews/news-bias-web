import { useQuery } from '@tanstack/react-query'
import { getArticles } from '@/api/articles'

export function useArticles(page: number, size = 20, headline?: string, date?: string) {
  return useQuery({
    queryKey: ['articles', page, size, headline, date],
    queryFn: () => getArticles(page, size, headline, date),
    placeholderData: (prev) => prev,
    refetchInterval: 30_000,
  })
}
