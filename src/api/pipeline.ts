import apiClient from '@/api/client'
import type {
  ActivePipeline,
  DashboardChartData,
  PipelineHistoriesPage,
  PipelineHistoryRow,
  PipelineCollectResult,
  PipelineMetrics,
  PipelineRunStatus,
  PipelineStepStatus,
  PipelineStreamEvent,
  PublisherArticleCount,
} from '@/types/pipeline'

interface DashboardSummaryResponse {
  totalArticles: number
  totalTopics: number
  todayCollectedArticles: number
  failedJobs: number
  lastCollectedAt: string | null
  recentRuns: Array<{
    id: number
    pipelineRunId: number
    step: string
    status: 'RUNNING' | 'SUCCESS' | 'FAILED'
    fetchedCount: number
    savedCount: number
    clusteredCount: number
    summarizedCount: number
    processedCount: number
    targetType?: string
    targetName?: string
    errorType?: string
    errorMessage?: string
    message: string
    startedAt: string
    finishedAt: string | null
  }>
}

interface DashboardChartsResponse {
  articlesByPublisher: PublisherArticleCount[]
  topicsByCountry: Array<{ name: string; count: number }>
  pipelineStatusCounts: Array<{ name: 'RUNNING' | 'SUCCESS' | 'FAILED'; count: number }>
}

const COUNTRY_COLORS = ['#334155', '#0f766e', '#2563eb', '#9333ea', '#f59e0b', '#ef4444']

function formatDateTime(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleString('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function processedCount(run: DashboardSummaryResponse['recentRuns'][number]) {
  if (typeof run.processedCount === 'number') return run.processedCount
  return run.fetchedCount + run.savedCount + run.clusteredCount + run.summarizedCount
}

export async function getPipelineMetrics(): Promise<PipelineMetrics> {
  const { data } = await apiClient.get<DashboardSummaryResponse>('/api/dashboard/summary')

  return {
    totalArticles: data.totalArticles,
    totalTopics: data.totalTopics,
    collectedToday: data.todayCollectedArticles,
    collectedTodayChangePct: 0,
    failedJobs: data.failedJobs,
    lastFetchedAt: data.lastCollectedAt ?? new Date().toISOString(),
  }
}

export async function getActivePipeline(): Promise<ActivePipeline> {
  return {
    pipelineId: `PC_${new Date().toISOString().slice(0, 10).replaceAll('-', '')}`,
    steps: [
      { id: 'rss_collect', label: 'RSS Collect', status: 'WAITING', detail: 'Waiting for stream' },
      { id: 'article_save', label: 'Article Save', status: 'WAITING' },
      { id: 'topic_cluster', label: 'Topic Cluster', status: 'WAITING' },
      { id: 'ai_summary', label: 'AI Summary', status: 'WAITING' },
      { id: 'completed', label: 'Completed', status: 'WAITING' },
    ],
  }
}

export async function getPipelineHistory(): Promise<PipelineHistoryRow[]> {
  const { data } = await apiClient.get<DashboardSummaryResponse>('/api/dashboard/summary')

  return data.recentRuns.map((run) => ({
    id: run.id,
    pipelineRunId: run.pipelineRunId,
    executedAt: formatDateTime(run.finishedAt ?? run.startedAt),
    step: run.step,
    status: run.status as PipelineRunStatus,
    processed: processedCount(run),
    targetName: run.targetName,
    errorType: run.errorType,
    errorMessage: run.errorMessage,
    message: run.errorMessage ? `${run.message}: ${run.errorMessage}` : run.message,
  }))
}

export async function getArticlesByPublisher(): Promise<PublisherArticleCount[]> {
  const { data } = await apiClient.get<DashboardChartsResponse>('/api/dashboard/charts')
  return data.articlesByPublisher
}

export async function getDashboardChartData(): Promise<DashboardChartData> {
  const { data } = await apiClient.get<DashboardChartsResponse>('/api/dashboard/charts')
  const statusCounts = Object.fromEntries(
    data.pipelineStatusCounts.map((item) => [item.name, item.count]),
  ) as Record<string, number>

  return {
    topicsByCountry: data.topicsByCountry.map((item, index) => ({
      country: item.name,
      count: item.count,
      color: COUNTRY_COLORS[index % COUNTRY_COLORS.length],
    })),
    pipelineResultStats: {
      success: statusCounts.SUCCESS ?? 0,
      failed: statusCounts.FAILED ?? 0,
      partial: statusCounts.RUNNING ?? 0,
    },
  }
}

export interface LatestRunDate {
  runDate: string | null
  today: string
}

export async function getPipelineHistories(
  page: number,
  size = 20,
): Promise<PipelineHistoriesPage> {
  const { data } = await apiClient.get<PipelineHistoriesPage>('/api/v1/pipeline/histories', {
    params: { page, size },
  })
  return data
}

export async function getLatestRunDate(): Promise<LatestRunDate> {
  const { data } = await apiClient.get<LatestRunDate>('/api/v1/pipeline/latest-run-date')
  return data
}

export async function triggerPipelineCollect(fromHours = 1): Promise<PipelineCollectResult> {
  const { data } = await apiClient.post<PipelineCollectResult>('/api/v1/pipeline/collect', { fromHours })
  return data
}

export function subscribePipelineStream(
  onEvent: (event: PipelineStreamEvent) => void,
  onOpen?: () => void,
  onClose?: () => void,
) {
  const source = new EventSource('/api/pipeline/stream')

  source.onopen = () => {
    onOpen?.()
  }

  source.addEventListener('pipeline', (message) => {
    onEvent(JSON.parse((message as MessageEvent).data) as PipelineStreamEvent)
  })

  source.onerror = () => {
    onClose?.()
    source.close()
  }

  return () => {
    onClose?.()
    source.close()
  }
}

export function mapStreamStatus(status: PipelineStreamEvent['status']): PipelineStepStatus {
  if (status === 'FAILED') return 'FAILED'
  if (status === 'RUNNING') return 'RUNNING'
  return 'SUCCESS'
}
