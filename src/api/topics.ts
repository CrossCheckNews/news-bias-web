import type { TopicDetail, TopicPage } from '@/types';
import { parsePage, type PaginatedResponse } from '@/lib/pagination';
import type { TopicSummary } from '@/types';
import apiClient from './client';

export interface TopicListParams {
  status?: 'ACTIVE' | 'INACTIVE';
  date?: string; // 'YYYY-MM-DD'
  page?: number;
  size?: number;
}

export async function getTopics(
  params: TopicListParams = {},
): Promise<TopicPage> {
  const { data } = await apiClient.get<PaginatedResponse<TopicSummary>>(
    '/api/v1/topics',
    { params },
  );
  return parsePage(data);
}

export async function getTopic(id: number): Promise<TopicDetail> {
  const { data } = await apiClient.get<TopicDetail>(`/api/v1/topics/${id}`);
  return data;
}
