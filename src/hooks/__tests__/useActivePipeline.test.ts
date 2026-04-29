import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PipelineStreamEvent } from '@/types/pipeline'

let capturedOnEvent: ((event: PipelineStreamEvent) => void) | undefined
let capturedOnOpen: (() => void) | undefined
let capturedOnClose: (() => void) | undefined
const mockCleanup = vi.fn()

vi.mock('@/api/pipeline', () => ({
  getActivePipeline: vi.fn().mockResolvedValue({
    pipelineId: 'PC_20260429',
    steps: [
      { id: 'rss_collect', label: 'RSS Collect', status: 'WAITING', detail: 'Waiting for stream' },
      { id: 'article_save', label: 'Article Save', status: 'WAITING' },
      { id: 'topic_cluster', label: 'Topic Cluster', status: 'WAITING' },
      { id: 'ai_summary', label: 'AI Summary', status: 'WAITING' },
      { id: 'completed', label: 'Completed', status: 'WAITING' },
    ],
  }),
  subscribePipelineStream: vi.fn((onEvent, onOpen, onClose) => {
    capturedOnEvent = onEvent
    capturedOnOpen = onOpen
    capturedOnClose = onClose
    return mockCleanup
  }),
  mapStreamStatus: vi.fn((s: string) => {
    if (s === 'FAILED') return 'FAILED'
    if (s === 'RUNNING') return 'RUNNING'
    return 'SUCCESS'
  }),
}))

import { useActivePipeline } from '@/hooks/usePipeline'

function makeEvent(overrides: Partial<PipelineStreamEvent> = {}): PipelineStreamEvent {
  return {
    pipelineRunId: 42,
    step: 'RSS_COLLECT',
    status: 'RUNNING',
    message: '',
    progress: 0,
    emittedAt: '2026-04-29T10:00:00Z',
    ...overrides,
  }
}

describe('useActivePipeline', () => {
  beforeEach(() => {
    capturedOnEvent = undefined
    capturedOnOpen = undefined
    capturedOnClose = undefined
    mockCleanup.mockReset()
  })

  it('initialises with default pipeline steps from getActivePipeline', async () => {
    const { result } = renderHook(() => useActivePipeline())
    await waitFor(() => expect(result.current.data).toBeDefined())

    expect(result.current.data?.steps).toHaveLength(5)
    expect(result.current.data?.steps.every((s) => s.status === 'WAITING')).toBe(true)
    expect(result.current.isStreamReady).toBe(false)
    expect(result.current.activeRunId).toBeNull()
  })

  it('sets isStreamReady=true when stream opens', async () => {
    const { result } = renderHook(() => useActivePipeline())
    await waitFor(() => expect(capturedOnOpen).toBeDefined())

    act(() => capturedOnOpen!())
    expect(result.current.isStreamReady).toBe(true)
  })

  it('locks activeRunId on first event', async () => {
    const { result } = renderHook(() => useActivePipeline())
    await waitFor(() => expect(result.current.data).toBeDefined())

    act(() => capturedOnEvent!(makeEvent({ pipelineRunId: 42 })))

    expect(result.current.activeRunId).toBe(42)
  })

  it('transitions the active step to RUNNING', async () => {
    const { result } = renderHook(() => useActivePipeline())
    await waitFor(() => expect(result.current.data).toBeDefined())

    act(() => capturedOnEvent!(makeEvent({ step: 'RSS_COLLECT', status: 'RUNNING' })))

    expect(result.current.data?.steps[0].status).toBe('RUNNING')
    expect(result.current.data?.steps[1].status).toBe('WAITING')
  })

  it('marks all preceding steps as SUCCESS when a later step becomes active', async () => {
    const { result } = renderHook(() => useActivePipeline())
    await waitFor(() => expect(result.current.data).toBeDefined())

    act(() => capturedOnEvent!(makeEvent({ step: 'ARTICLE_SAVE', status: 'RUNNING' })))

    // ARTICLE_SAVE is index 1 → index 0 (RSS_COLLECT) should be SUCCESS
    expect(result.current.data?.steps[0].status).toBe('SUCCESS')
    expect(result.current.data?.steps[1].status).toBe('RUNNING')
    expect(result.current.data?.steps[2].status).toBe('WAITING')
  })

  it('ignores events with a different pipelineRunId', async () => {
    const { result } = renderHook(() => useActivePipeline())
    await waitFor(() => expect(result.current.data).toBeDefined())

    act(() => capturedOnEvent!(makeEvent({ pipelineRunId: 42, step: 'RSS_COLLECT', status: 'RUNNING' })))
    act(() => capturedOnEvent!(makeEvent({ pipelineRunId: 99, step: 'ARTICLE_SAVE', status: 'RUNNING' })))

    expect(result.current.data?.steps[1].status).toBe('WAITING')
  })

  it('ignores events where pipelineRunId is null', async () => {
    const { result } = renderHook(() => useActivePipeline())
    await waitFor(() => expect(result.current.data).toBeDefined())

    act(() => capturedOnEvent!(makeEvent({ pipelineRunId: null as unknown as number })))

    expect(result.current.activeRunId).toBeNull()
  })

  it('marks the step as FAILED and includes error detail', async () => {
    const { result } = renderHook(() => useActivePipeline())
    await waitFor(() => expect(result.current.data).toBeDefined())

    act(() =>
      capturedOnEvent!(
        makeEvent({
          step: 'RSS_COLLECT',
          status: 'FAILED',
          targetName: 'Fox News',
          errorMessage: 'timeout after 30s',
        }),
      ),
    )

    const step = result.current.data?.steps[0]
    expect(step?.status).toBe('FAILED')
    expect(step?.detail).toContain('Fox News')
    expect(step?.detail).toContain('timeout after 30s')
  })

  it('sets isStreamReady=false when stream closes', async () => {
    const { result } = renderHook(() => useActivePipeline())
    await waitFor(() => expect(capturedOnOpen).toBeDefined())

    act(() => capturedOnOpen!())
    expect(result.current.isStreamReady).toBe(true)

    act(() => capturedOnClose!())
    expect(result.current.isStreamReady).toBe(false)
  })

  it('calls the cleanup function on unmount', async () => {
    const { result, unmount } = renderHook(() => useActivePipeline())
    await waitFor(() => expect(result.current.data).toBeDefined())

    unmount()
    expect(mockCleanup).toHaveBeenCalled()
  })
})
