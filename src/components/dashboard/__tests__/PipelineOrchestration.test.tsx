import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PipelineOrchestration from '@/components/dashboard/PipelineOrchestration'

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  resetForNextRun: vi.fn(),
  invalidateQueries: vi.fn(),
}))

function makeActivePipeline() {
  return {
    data: {
      pipelineId: 'RUN #42',
      steps: [
        { id: 'rss', label: 'RSS Collect', status: 'SUCCESS', detail: 'RSS 완료' },
        { id: 'save', label: 'Article Save', status: 'RUNNING', detail: '기사 저장 중' },
        { id: 'cluster', label: 'Topic Cluster', status: 'WAITING' },
        { id: 'ai', label: 'AI Summary', status: 'WAITING' },
        { id: 'done', label: 'Completed', status: 'WAITING' },
      ],
    },
    isLoading: false,
    isStreamReady: true,
    activeRunId: 42,
    resetForNextRun: mocks.resetForNextRun,
  }
}

let mockActivePipeline = makeActivePipeline()

vi.mock('@/hooks/usePipeline', () => ({
  useActivePipeline: () => mockActivePipeline,
}))

vi.mock('@tanstack/react-query', () => ({
  useMutation: (options: { onMutate?: () => void; onSettled?: () => void }) => ({
    mutate: () => {
      mocks.mutate()
      options.onMutate?.()
      options.onSettled?.()
    },
    isPending: false,
  }),
  useQueryClient: () => ({ invalidateQueries: mocks.invalidateQueries }),
}))

vi.mock('@/api/pipeline', () => ({
  triggerPipelineCollect: vi.fn(),
}))

describe('PipelineOrchestration', () => {
  beforeEach(() => {
    mocks.mutate.mockClear()
    mocks.resetForNextRun.mockClear()
    mocks.invalidateQueries.mockClear()
    mockActivePipeline = makeActivePipeline()
  })

  it('renders each pipeline step with status and detail', () => {
    render(<PipelineOrchestration />)

    expect(screen.getByText('ID: RUN #42')).toBeInTheDocument()
    expect(screen.getByText('RSS Collect')).toBeInTheDocument()
    expect(screen.getByText('Article Save')).toBeInTheDocument()
    expect(screen.getByText('기사 저장 중')).toBeInTheDocument()
    expect(screen.getByText('RUNNING')).toBeInTheDocument()
  })

  it('renders FAILED step status', () => {
    mockActivePipeline = {
      ...mockActivePipeline,
      data: {
        pipelineId: 'RUN #43',
        steps: [
          { id: 'rss', label: 'RSS Collect', status: 'FAILED', detail: 'Fox News · timeout after 30s' },
          { id: 'save', label: 'Article Save', status: 'WAITING' },
          { id: 'cluster', label: 'Topic Cluster', status: 'WAITING' },
          { id: 'ai', label: 'AI Summary', status: 'WAITING' },
          { id: 'done', label: 'Completed', status: 'WAITING' },
        ],
      },
    }
    render(<PipelineOrchestration />)

    expect(screen.getByText('FAILED')).toBeInTheDocument()
    expect(screen.getByText('Fox News · timeout after 30s')).toBeInTheDocument()
  })

  it('shows loading skeleton when data is not yet available', () => {
    mockActivePipeline = { ...mockActivePipeline, data: undefined as never }
    const { container } = render(<PipelineOrchestration />)

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(screen.queryByText('Active Pipeline Orchestration')).not.toBeInTheDocument()
  })

  it('disables Run Pipeline button when stream is not ready', () => {
    mockActivePipeline = {
      ...mockActivePipeline,
      data: {
        pipelineId: 'RUN #42',
        steps: [
          { id: 'rss', label: 'RSS Collect', status: 'WAITING' },
          { id: 'save', label: 'Article Save', status: 'WAITING' },
          { id: 'cluster', label: 'Topic Cluster', status: 'WAITING' },
          { id: 'ai', label: 'AI Summary', status: 'WAITING' },
          { id: 'done', label: 'Completed', status: 'WAITING' },
        ],
      },
      isStreamReady: false,
    }
    render(<PipelineOrchestration />)

    expect(screen.getByRole('button', { name: /run pipeline/i })).toBeDisabled()
  })

  it('runs the pipeline mutation when the Run Pipeline button is clicked', async () => {
    const user = userEvent.setup()
    render(<PipelineOrchestration />)

    await user.click(screen.getByRole('button', { name: /run pipeline/i }))

    expect(mocks.mutate).toHaveBeenCalledOnce()
    expect(mocks.resetForNextRun).toHaveBeenCalledOnce()
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['pipeline'] })
  })
})
