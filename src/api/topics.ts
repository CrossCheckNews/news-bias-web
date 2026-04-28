import type { TopicDetail, TopicPage } from '@/types';
import apiClient from './client';

export interface TopicListParams {
  status?: 'ACTIVE' | 'INACTIVE';
  date?: string; // 'YYYY-MM-DD'
  page?: number;
  size?: number;
  sort?: string;
}

export async function getTopics(
  params: TopicListParams = {},
): Promise<TopicPage> {
  const { data } = await apiClient.get<TopicPage>('/api/v1/topics', { params });
  return data;
}

export async function getTopic(id: number): Promise<TopicDetail> {
  const { data } = await apiClient.get<TopicDetail>(`/api/v1/topics/${id}`);
  return data;
}
