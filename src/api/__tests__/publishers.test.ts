import { beforeEach, describe, expect, it, vi } from 'vitest'
import apiClient from '@/api/client'
import { getPublishers, normalizePublisher } from '@/api/publishers'

vi.mock('@/api/client', () => ({
  default: {
    get: vi.fn(),
  },
}))

const mockedGet = vi.mocked(apiClient.get)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('publishers api adapter', () => {
  it('legacy political leaning values are normalized for the UI model', () => {
    expect(normalizePublisher({ id: 1, name: 'A', country: 'US', politicalLeaning: 'PROGRESSIVE' }))
      .toMatchObject({ politicalLeaning: 'LEFT' })
    expect(normalizePublisher({ id: 2, name: 'B', country: 'KR', leaning: 'CONSERVATIVE' }))
      .toMatchObject({ politicalLeaning: 'RIGHT' })
    expect(normalizePublisher({ id: 3, name: 'C', country: 'GB', politicalLeaning: 'UNKNOWN' }))
      .toMatchObject({ politicalLeaning: 'CENTER' })
  })

  it('supports non-paginated publisher responses', async () => {
    mockedGet.mockResolvedValue({
      data: [
        { id: 1, name: 'CNN', country: 'US', politicalLeaning: 'PROGRESSIVE' },
        { id: 2, name: 'Chosun', country: 'KR', politicalLeaning: 'CONSERVATIVE' },
      ],
    })

    await expect(getPublishers()).resolves.toMatchObject({
      totalElements: 2,
      totalPages: 1,
      content: [
        { name: 'CNN', politicalLeaning: 'LEFT' },
        { name: 'Chosun', politicalLeaning: 'RIGHT' },
      ],
    })
  })

  it('normalizes paginated publisher responses', async () => {
    mockedGet.mockResolvedValue({
      data: {
        content: [{ id: 7, name: 'BBC', country: 'GB', politicalLeaning: 'CENTER' }],
        totalElements: 10,
        totalPages: 2,
        number: 1,
        size: 5,
      },
    })

    await expect(getPublishers({ page: 1, size: 5 })).resolves.toMatchObject({
      totalElements: 10,
      totalPages: 2,
      number: 1,
      size: 5,
      content: [{ id: 7, name: 'BBC' }],
    })
  })
})
