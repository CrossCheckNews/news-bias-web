import type { PoliticalLeaning, Publisher, PublisherPage } from '@/types';
import { parsePage, type PaginatedResponse } from '@/lib/pagination';
import apiClient from './client';

export interface PublisherListParams {
  page?: number;
  size?: number;
  country?: string;
}

/** POST/PUT /api/v1/publishers 요청 본문 */
export interface PublisherFormData {
  name: string;
  country: string;
  politicalLeaning: PoliticalLeaning;
  rssUrl: string;
}

const LEANING_MAP: Record<string, PoliticalLeaning> = {
  LEFT: 'LEFT',
  CENTER: 'CENTER',
  RIGHT: 'RIGHT',
  PROGRESSIVE: 'LEFT',
  CONSERVATIVE: 'RIGHT',
};

/** API가 `leaning` 등 예전 필드를 줄 때도 UI 모델로 통일 */
export function normalizePublisher(raw: unknown): Publisher {
  if (raw == null || typeof raw !== 'object') {
    return {
      id: 0,
      name: '',
      country: '',
      politicalLeaning: 'CENTER',
    };
  }
  const r = raw as Record<string, unknown>;
  const pl = String(r.politicalLeaning ?? r.leaning ?? '');
  const politicalLeaning: PoliticalLeaning = LEANING_MAP[pl] ?? 'CENTER';
  return {
    id: Number(r.id) || 0,
    name: String(r.name ?? ''),
    country: String(r.country ?? ''),
    politicalLeaning,
    rssUrl: r.rssUrl != null ? String(r.rssUrl) : undefined,
    createdAt: r.createdAt != null ? String(r.createdAt) : undefined,
  };
}

export async function getPublishers(
  params: PublisherListParams = {},
): Promise<PublisherPage> {
  const { data } = await apiClient.get<unknown>('/api/v1/publishers', {
    params,
  });

  // 배열 응답 (non-paginated)
  if (Array.isArray(data)) {
    const items = data.map(normalizePublisher);
    return {
      items,
      totalElements: items.length,
      totalPages: 1,
      page: params.page ?? 0,
      size: items.length,
      first: true,
      last: true,
      hasNext: false,
      hasPrevious: false,
    };
  }

  // 페이지 응답
  const raw = data as PaginatedResponse<unknown>;
  return parsePage({
    items: Array.isArray(raw.items) ? raw.items.map(normalizePublisher) : [],
    pagination: raw.pagination,
  });
}

export async function getPublisher(id: number): Promise<Publisher> {
  const { data } = await apiClient.get<unknown>(`/api/v1/publishers/${id}`);
  return normalizePublisher(data);
}
