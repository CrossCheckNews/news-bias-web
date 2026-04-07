import type { Topic, TopicArticle, TopicPage, TopicSummary } from '@/types'
import apiClient from './client'

export interface TopicListParams {
  status?: 'ACTIVE' | 'INACTIVE'
  date?: string   // 'YYYY-MM-DD' — 날짜 기준 필터
  category?: string
  page?: number
  size?: number
  sort?: string   // e.g. 'createdAt,desc'
}

export async function getTopics(params: TopicListParams = {}): Promise<TopicPage> {
  const { data } = await apiClient.get<TopicPage>('/api/v1/topics', { params })
  return data
}

export async function getTopic(id: number): Promise<Topic> {
  const { data } = await apiClient.get<Topic>(`/api/v1/topics/${id}`)
  return data
}

export async function getTopicArticles(id: number): Promise<TopicArticle[]> {
  const { data } = await apiClient.get<TopicArticle[]>(`/api/v1/topics/${id}/articles`)
  return data
}
