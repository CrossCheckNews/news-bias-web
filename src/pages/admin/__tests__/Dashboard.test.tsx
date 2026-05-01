import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import Dashboard from '@/pages/admin/Dashboard'
import type {
  DashboardChartData,
  PipelineHistoryRow,
  PipelineMetrics,
  PublisherArticleCount,
} from '@/types/pipeline'

// ── hook mocks ──────────────────────────────────────────────────────────────

const mockMetrics = vi.fn()
const mockActivePipeline = vi.fn()
const mockHistory = vi.fn()
const mockPublishers = vi.fn()
const mockChartData = vi.fn()
const mockLatestRunDate = vi.fn()

vi.mock('@/hooks/usePipeline', () => ({
  usePipelineMetrics: () => mockMetrics(),
  useActivePipeline: () => mockActivePipeline(),
  usePipelineHistory: () => mockHistory(),
  useArticlesByPublisher: () => mockPublishers(),
  useDashboardChartData: () => mockChartData(),
  useLatestRunDate: () => mockLatestRunDate(),
}))

vi.mock('@/api/pipeline', () => ({
  triggerPipelineCollect: vi.fn(),
  getLatestRunDate: vi.fn(),
}))

// ── helpers ──────────────────────────────────────────────────────────────────

function makeMetrics(overrides: Partial<PipelineMetrics> = {}): PipelineMetrics {
  return {
    totalArticles: 1000,
    totalTopics: 50,
    collectedToday: 30,
    collectedTodayChangePct: 5,
    failedJobs: 2,
    lastFetchedAt: '2026-04-29T10:00:00Z',
    ...overrides,
  }
}

function makeHistoryRow(overrides: Partial<PipelineHistoryRow> = {}): PipelineHistoryRow {
  return {
    id: 1,
    pipelineRunId: 42,
    executedAt: '2026-04-29 10:00',
    step: 'RSS_COLLECT',
    status: 'SUCCESS',
    processed: 15,
    message: 'RSS 수집 완료',
    ...overrides,
  }
}

function makeChartData(overrides: Partial<DashboardChartData> = {}): DashboardChartData {
  return {
    topicsByCountry: [
      { country: 'US', count: 10, color: '#334155' },
      { country: 'KR', count: 5, color: '#0f766e' },
    ],
    pipelineResultStats: { success: 8, failed: 1, partial: 0 },
    ...overrides,
  }
}

function makePublishers(overrides: Partial<PublisherArticleCount>[] = []): PublisherArticleCount[] {
  const defaults = [{ name: 'CNN', count: 200 }, { name: 'Fox News', count: 150 }]
  return overrides.length ? (overrides as PublisherArticleCount[]) : defaults
}

function makeActivePipeline() {
  return {
    data: {
      pipelineId: 'PC_20260429',
      steps: [
        { id: 'rss_collect', label: 'RSS Collect', status: 'WAITING' },
        { id: 'article_save', label: 'Article Save', status: 'WAITING' },
        { id: 'topic_cluster', label: 'Topic Cluster', status: 'WAITING' },
        { id: 'ai_summary', label: 'AI Summary', status: 'WAITING' },
        { id: 'completed', label: 'Completed', status: 'WAITING' },
      ],
    },
    isLoading: false,
    isStreamReady: false,
    activeRunId: null,
    resetForNextRun: vi.fn(),
  }
}

function renderDashboard() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <Dashboard />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

// ── tests ────────────────────────────────────────────────────────────────────

describe('Dashboard', () => {
  beforeEach(() => {
    mockMetrics.mockReturnValue({ data: makeMetrics(), isLoading: false })
    mockActivePipeline.mockReturnValue(makeActivePipeline())
    mockHistory.mockReturnValue({ data: [makeHistoryRow()], isLoading: false })
    mockPublishers.mockReturnValue({ data: makePublishers(), isLoading: false })
    mockChartData.mockReturnValue({ data: makeChartData(), isLoading: false })
    mockLatestRunDate.mockReturnValue({ data: { runDate: null, today: '2026-05-01' }, isPending: false })
  })

  it('renders MetricCard values from summary API', () => {
    renderDashboard()

    expect(screen.getByText('1000')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders chart section headings', () => {
    renderDashboard()

    expect(screen.getByText('Articles by Publisher')).toBeInTheDocument()
    expect(screen.getByText('Topics by Country')).toBeInTheDocument()
    expect(screen.getByText('Pipeline Result Status')).toBeInTheDocument()
  })

  it('renders recentRuns in the history table', () => {
    renderDashboard()

    expect(screen.getByText('Recent Pipeline History')).toBeInTheDocument()
    expect(screen.getByText('#42')).toBeInTheDocument()
    expect(screen.getByText('RSS_COLLECT')).toBeInTheDocument()
    expect(screen.getByText('RSS 수집 완료')).toBeInTheDocument()
  })

  it('shows metrics skeleton while loading', () => {
    mockMetrics.mockReturnValue({ data: undefined, isLoading: true })
    const { container } = renderDashboard()

    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
    expect(screen.queryByText('Total Articles')).not.toBeInTheDocument()
  })

  it('shows history skeleton while loading', () => {
    mockHistory.mockReturnValue({ data: undefined, isLoading: true })
    const { container } = renderDashboard()

    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
    expect(screen.queryByText('Recent Pipeline History')).not.toBeInTheDocument()
  })

  it('renders empty history table without crashing when recentRuns is empty', () => {
    mockHistory.mockReturnValue({ data: [], isLoading: false })
    renderDashboard()

    expect(screen.getByText('Recent Pipeline History')).toBeInTheDocument()
    // table headers still present, no rows
    expect(screen.getByText('Executed At')).toBeInTheDocument()
    expect(screen.queryByText('#42')).not.toBeInTheDocument()
  })

  it('renders orchestration section with pipeline ID', () => {
    renderDashboard()

    expect(screen.getByText('Active Pipeline Orchestration')).toBeInTheDocument()
    expect(screen.getByText('ID: PC_20260429')).toBeInTheDocument()
  })

  it('shows orchestration skeleton when active pipeline data is not yet available', () => {
    mockActivePipeline.mockReturnValue({
      data: undefined,
      isLoading: true,
      isStreamReady: false,
      activeRunId: null,
      resetForNextRun: vi.fn(),
    })
    const { container } = renderDashboard()

    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows FAILED status badge in history table', () => {
    mockHistory.mockReturnValue({
      data: [makeHistoryRow({ status: 'FAILED', errorType: 'RSS_TIMEOUT', message: '수집 실패: timeout' })],
      isLoading: false,
    })
    renderDashboard()

    expect(screen.getByText('FAILED')).toBeInTheDocument()
    expect(screen.getByText('RSS_TIMEOUT')).toBeInTheDocument()
  })
})
