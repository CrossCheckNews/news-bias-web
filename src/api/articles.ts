import apiClient from '@/api/client'
import { parsePage, type PaginatedResponse } from '@/lib/pagination'
import type { AdminArticle, ArticlesPage } from '@/types'

export async function getArticles(
  page: number,
  size = 20,
  headline?: string,
  date?: string,
): Promise<ArticlesPage> {
  const { data } = await apiClient.get<PaginatedResponse<AdminArticle>>('/api/v1/articles', {
    params: {
      page,
      size,
      ...(headline && { headline }),
      ...(date && { date }),
    },
  })
  return parsePage(data)
}
