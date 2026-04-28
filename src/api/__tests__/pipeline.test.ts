import { beforeEach, describe, expect, it, vi } from 'vitest'
import apiClient from '@/api/client'
import {
  getDashboardChartData,
  getPipelineHistory,
  getPipelineMetrics,
  mapStreamStatus,
  triggerPipelineCollect,
} from '@/api/pipeline'

vi.mock('@/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const mockedGet = vi.mocked(apiClient.get)
const mockedPost = vi.mocked(apiClient.post)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('pipeline api adapter', () => {
  it('maps dashboard summary to metric cards', async () => {
    mockedGet.mockResolvedValue({
      data: {
        totalArticles: 120,
        totalTopics: 12,
        todayCollectedArticles: 7,
        failedJobs: 2,
        lastCollectedAt: '2026-04-28T10:00:00',
        recentRuns: [],
      },
    })

    await expect(getPipelineMetrics()).resolves.toMatchObject({
      totalArticles: 120,
      totalTopics: 12,
      collectedToday: 7,
      failedJobs: 2,
      lastFetchedAt: '2026-04-28T10:00:00',
    })
  })

  it('maps step history with run id, target, and error details', async () => {
    mockedGet.mockResolvedValue({
      data: {
        totalArticles: 0,
        totalTopics: 0,
        todayCollectedArticles: 0,
        failedJobs: 1,
        lastCollectedAt: null,
        recentRuns: [{
          id: 5,
          pipelineRunId: 42,
          step: 'RSS_COLLECT',
          status: 'FAILED',
          fetchedCount: 0,
          savedCount: 0,
          clusteredCount: 0,
          summarizedCount: 0,
          processedCount: 3,
          targetName: 'Fox News',
          errorType: 'RSS_TIMEOUT',
          errorMessage: 'Connection timeout',
          message: 'RSS 피드 수집 실패',
          startedAt: '2026-04-28T09:00:00',
          finishedAt: '2026-04-28T09:01:00',
        }],
      },
    })

    await expect(getPipelineHistory()).resolves.toMatchObject([
      {
        id: 5,
        pipelineRunId: 42,
        step: 'RSS_COLLECT',
        status: 'FAILED',
        processed: 3,
        targetName: 'Fox News',
        errorType: 'RSS_TIMEOUT',
        errorMessage: 'Connection timeout',
        message: 'RSS 피드 수집 실패: Connection timeout',
      },
    ])
  })

  it('maps chart data into dashboard view models', async () => {
    mockedGet.mockResolvedValue({
      data: {
        articlesByPublisher: [],
        topicsByCountry: [{ name: 'US', count: 4 }, { name: 'KR', count: 2 }],
        pipelineStatusCounts: [
          { name: 'SUCCESS', count: 8 },
          { name: 'FAILED', count: 1 },
          { name: 'RUNNING', count: 1 },
        ],
      },
    })

    await expect(getDashboardChartData()).resolves.toMatchObject({
      topicsByCountry: [
        { country: 'US', count: 4 },
        { country: 'KR', count: 2 },
      ],
      pipelineResultStats: { success: 8, failed: 1, partial: 1 },
    })
  })

  it('returns the collect response including pipelineRunId', async () => {
    mockedPost.mockResolvedValue({ data: { pipelineRunId: 99, executedAt: '2026-04-28T10:00:00' } })

    await expect(triggerPipelineCollect(24)).resolves.toEqual({
      pipelineRunId: 99,
      executedAt: '2026-04-28T10:00:00',
    })
    expect(mockedPost).toHaveBeenCalledWith('/api/v1/pipeline/collect', { fromHours: 24 })
  })

  it('maps stream status to orchestration step status', () => {
    expect(mapStreamStatus('RUNNING')).toBe('RUNNING')
    expect(mapStreamStatus('SUCCESS')).toBe('SUCCESS')
    expect(mapStreamStatus('FAILED')).toBe('FAILED')
  })
})
