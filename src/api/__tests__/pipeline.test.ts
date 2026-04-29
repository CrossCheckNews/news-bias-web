import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import apiClient from '@/api/client'
import {
  getDashboardChartData,
  getPipelineHistory,
  getPipelineMetrics,
  mapStreamStatus,
  subscribePipelineStream,
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

  it('falls back to current time when lastCollectedAt is null', async () => {
    const before = Date.now()
    mockedGet.mockResolvedValue({
      data: {
        totalArticles: 0,
        totalTopics: 0,
        todayCollectedArticles: 0,
        failedJobs: 0,
        lastCollectedAt: null,
        recentRuns: [],
      },
    })

    const result = await getPipelineMetrics()
    const after = Date.now()

    const fetchedAt = new Date(result.lastFetchedAt).getTime()
    expect(fetchedAt).toBeGreaterThanOrEqual(before)
    expect(fetchedAt).toBeLessThanOrEqual(after)
  })
})

// ─── subscribePipelineStream ────────────────────────────────────────────────

type EventListenerFn = (e: MessageEvent) => void

interface MockSourceShape {
  onopen: (() => void) | null
  onerror: (() => void) | null
  close: ReturnType<typeof vi.fn>
  listeners: Record<string, EventListenerFn[]>
  addEventListener(type: string, listener: EventListenerFn): void
  triggerOpen(): void
  triggerEvent(type: string, data: string): void
  triggerError(): void
}

function makeMockSource(): MockSourceShape {
  const source: MockSourceShape = {
    onopen: null,
    onerror: null,
    close: vi.fn(),
    listeners: {},
    addEventListener(type, listener) {
      ;(this.listeners[type] ??= []).push(listener)
    },
    triggerOpen() {
      this.onopen?.()
    },
    triggerEvent(type, data) {
      this.listeners[type]?.forEach((l) => l({ data } as MessageEvent))
    },
    triggerError() {
      this.onerror?.()
    },
  }
  return source
}

describe('subscribePipelineStream', () => {
  let mockSource: MockSourceShape

  beforeEach(() => {
    mockSource = makeMockSource()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.stubGlobal('EventSource', vi.fn(function () { return mockSource } as any))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('connects to /api/pipeline/stream', () => {
    subscribePipelineStream(vi.fn())
    expect(vi.mocked(EventSource)).toHaveBeenCalledWith('/api/pipeline/stream')
  })

  it('calls onOpen when stream opens', () => {
    const onOpen = vi.fn()
    subscribePipelineStream(vi.fn(), onOpen)
    mockSource.triggerOpen()
    expect(onOpen).toHaveBeenCalledOnce()
  })

  it('parses pipeline events and passes them to onEvent callback', () => {
    const onEvent = vi.fn()
    subscribePipelineStream(onEvent, vi.fn())

    const payload = {
      pipelineRunId: 1,
      step: 'RSS_COLLECT',
      status: 'RUNNING',
      message: 'collecting',
      progress: 0,
      emittedAt: '2026-04-29T10:00:00Z',
    }
    mockSource.triggerEvent('pipeline', JSON.stringify(payload))

    expect(onEvent).toHaveBeenCalledOnce()
    expect(onEvent).toHaveBeenCalledWith(payload)
  })

  it('calls onClose and closes the source on error', () => {
    const onClose = vi.fn()
    subscribePipelineStream(vi.fn(), vi.fn(), onClose)
    mockSource.triggerError()

    expect(onClose).toHaveBeenCalledOnce()
    expect(mockSource.close).toHaveBeenCalledOnce()
  })

  it('calls onClose and closes the source when cleanup function is invoked', () => {
    const onClose = vi.fn()
    const cleanup = subscribePipelineStream(vi.fn(), vi.fn(), onClose)
    cleanup()

    expect(onClose).toHaveBeenCalledOnce()
    expect(mockSource.close).toHaveBeenCalledOnce()
  })
})
