import type { PoliticalLeaning, Publisher, PublisherPage } from '@/types'
import apiClient from './client'

export interface PublisherListParams {
  page?: number
  size?: number
  country?: string
}

/** POST/PUT /api/v1/publishers 요청 본문 */
export interface PublisherFormData {
  name: string
  country: string
  politicalLeaning: PoliticalLeaning
  rssUrl: string
}

function isPoliticalLeaning(v: unknown): v is PoliticalLeaning {
  return v === 'LEFT' || v === 'CENTER' || v === 'RIGHT'
}

/** API가 `leaning` 등 예전 필드를 줄 때도 UI 모델로 통일 */
export function normalizePublisher(raw: unknown): Publisher {
  if (raw == null || typeof raw !== 'object') {
    return {
      id: 0,
      name: '',
      country: '',
      politicalLeaning: 'CENTER',
    }
  }
  const r = raw as Record<string, unknown>
  const pl = r.politicalLeaning ?? r.leaning
  const politicalLeaning: PoliticalLeaning = isPoliticalLeaning(pl) ? pl : 'CENTER'
  return {
    id: Number(r.id) || 0,
    name: String(r.name ?? ''),
    country: String(r.country ?? ''),
    politicalLeaning,
    rssUrl: r.rssUrl != null ? String(r.rssUrl) : undefined,
    createdAt: r.createdAt != null ? String(r.createdAt) : undefined,
  }
}

export async function getPublishers(params: PublisherListParams = {}): Promise<PublisherPage> {
  const { data } = await apiClient.get<PublisherPage>('/api/v1/publishers', { params })
  if (data == null || typeof data !== 'object') {
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: params.page ?? 0,
      size: params.size ?? 10,
    }
  }
  const content = Array.isArray(data.content)
    ? data.content.map((item) => normalizePublisher(item))
    : []
  return {
    ...data,
    content,
  }
}

export async function getPublisher(id: number): Promise<Publisher> {
  const { data } = await apiClient.get<unknown>(`/api/v1/publishers/${id}`)
  return normalizePublisher(data)
}

export async function createPublisher(body: PublisherFormData): Promise<Publisher> {
  const { data } = await apiClient.post<unknown>('/api/v1/publishers', body)
  return normalizePublisher(data)
}

export async function updatePublisher(id: number, body: PublisherFormData): Promise<Publisher> {
  const { data } = await apiClient.put<unknown>(`/api/v1/publishers/${id}`, body)
  return normalizePublisher(data)
}

export async function deletePublisher(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/publishers/${id}`)
}
