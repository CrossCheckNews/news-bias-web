import apiClient from '@/api/client';
import { parsePage, type PaginatedResponse } from '@/lib/pagination';
import type {
  ActivePipeline,
  DashboardChartData,
  PipelineHistoriesPage,
  PipelineHistoryItem,
  PipelineHistoryRow,
  PipelineCollectResult,
  PipelineMetrics,
  PipelineStepStatus,
  PipelineStreamEvent,
  PublisherArticleCount,
} from '@/types/pipeline';

interface DashboardSummaryResponse {
  totalArticles: number;
  totalTopics: number;
  todayCollectedArticles: number;
  successJobs: number;
  failedJobs: number;
  lastCollectedAt: string | null;
  recentRuns: Array<{
    id: number;
    pipelineRunId: number;
    step: string;
    status: 'RUNNING' | 'SUCCESS' | 'FAILED';
    fetchedCount: number;
    savedCount: number;
    clusteredCount: number;
    summarizedCount: number;
    processedCount: number;
    successCount: number;
    failedCount: number;
    targetType?: string;
    targetName?: string;
    errorType?: string;
    errorMessage?: string;
    message: string;
    startedAt: string;
    finishedAt: string | null;
  }>;
}

interface DashboardChartsResponse {
  articlesByPublisher: PublisherArticleCount[];
  topicsByCountry: Array<{ name: string; count: number }>;
  pipelineStatusCounts: Array<{
    name: 'RUNNING' | 'SUCCESS' | 'PARTIAL_FAILED' | 'FAILED';
    count: number;
  }>;
}

const COUNTRY_COLORS = [
  '#334155',
  '#0f766e',
  '#2563eb',
  '#9333ea',
  '#f59e0b',
  '#ef4444',
];

function formatDateTime(value: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export async function getPipelineMetrics(
  date?: string,
): Promise<PipelineMetrics> {
  const { data } = await apiClient.get<DashboardSummaryResponse>(
    '/api/dashboard/summary',
    { params: { ...(date && { date }) } },
  );

  return {
    totalArticles: data.totalArticles,
    totalTopics: data.totalTopics,
    collectedToday: data.todayCollectedArticles,
    collectedTodayChangePct: 0,
    successJobs: data.successJobs,
    failedJobs: data.failedJobs,
    lastFetchedAt: data.lastCollectedAt ?? new Date().toISOString(),
  };
}

export async function getActivePipeline(): Promise<ActivePipeline> {
  return {
    pipelineId: `PC_${new Date().toISOString().slice(0, 10).replaceAll('-', '')}`,
    steps: [
      { id: 'rss_collect', label: 'RSS Collect', status: 'WAITING' },
      { id: 'article_save', label: 'Article Save', status: 'WAITING' },
      { id: 'topic_cluster', label: 'Topic Cluster', status: 'WAITING' },
      { id: 'ai_summary', label: 'AI Summary', status: 'WAITING' },
      { id: 'completed', label: 'Completed', status: 'WAITING' },
    ],
  };
}

export async function getPipelineHistory(): Promise<PipelineHistoryRow[]> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await apiClient.get<PaginatedResponse<PipelineHistoryItem>>(
    '/api/v1/pipeline/histories',
    { params: { page: 0, size: 10, date: today } },
  );

  return parsePage(data).items.map((run) => ({
    id: run.id,
    pipelineRunId: run.pipelineRunId,
    executedAt: formatDateTime(run.finishedAt ?? run.startedAt ?? null),
    step: run.step,
    status: run.status,
    processed: run.processedCount,
    successCount: run.successCount,
    failedCount: run.failedCount,
    targetName: run.targetName,
    errorType: run.errorType,
    errorMessage: run.errorMessage,
    message: run.errorMessage
      ? `${run.message}: ${run.errorMessage}`
      : run.message,
  }));
}

export async function getArticlesByPublisher(): Promise<
  PublisherArticleCount[]
> {
  const { data } = await apiClient.get<DashboardChartsResponse>(
    '/api/dashboard/charts',
  );
  return data.articlesByPublisher;
}

export async function getDashboardChartData(
  date?: string,
): Promise<DashboardChartData> {
  const { data } = await apiClient.get<DashboardChartsResponse>(
    '/api/dashboard/charts',
    { params: { ...(date && { date }) } },
  );
  const statusCounts = Object.fromEntries(
    data.pipelineStatusCounts.map((item) => [item.name, item.count]),
  ) as Record<string, number>;

  return {
    topicsByCountry: data.topicsByCountry.map((item, index) => ({
      country: item.name,
      count: item.count,
      color: COUNTRY_COLORS[index % COUNTRY_COLORS.length],
    })),
    pipelineResultStats: {
      running: statusCounts.RUNNING ?? 0,
      success: statusCounts.SUCCESS ?? 0,
      failed: statusCounts.FAILED ?? 0,
      partialFailed: statusCounts.PARTIAL_FAILED ?? 0,
    },
  };
}

export interface LatestRunDate {
  runDate: string | null;
  today: string;
}

export async function getPipelineHistories(
  page: number,
  size = 20,
  statuses?: string[],
  date?: string,
): Promise<PipelineHistoriesPage> {
  const { data } = await apiClient.get<PaginatedResponse<PipelineHistoryItem>>(
    '/api/v1/pipeline/histories',
    {
      params: {
        page,
        size,
        ...(statuses && statuses.length > 0 && { statuses }),
        ...(date && { date }),
      },
      paramsSerializer: { indexes: null },
    },
  );
  return parsePage(data);
}

export async function getLatestRunDate(): Promise<LatestRunDate> {
  const { data } = await apiClient.get<LatestRunDate>(
    '/api/v1/pipeline/latest-run-date',
  );
  return data;
}

export async function triggerPipelineCollect(
  fromHours = 1,
): Promise<PipelineCollectResult> {
  const { data } = await apiClient.post<PipelineCollectResult>(
    '/api/v1/pipeline/collect',
    { fromHours },
  );
  return data;
}

export function subscribePipelineStream(
  onEvent: (event: PipelineStreamEvent) => void,
  onOpen?: () => void,
  onClose?: () => void,
) {
  const source = new EventSource('/api/pipeline/stream');

  source.onopen = () => {
    onOpen?.();
  };

  source.addEventListener('pipeline', (message) => {
    onEvent(JSON.parse((message as MessageEvent).data) as PipelineStreamEvent);
  });

  source.onerror = () => {
    onClose?.();
    source.close();
  };

  return () => {
    onClose?.();
    source.close();
  };
}

export function mapStreamStatus(
  status: PipelineStreamEvent['status'],
): PipelineStepStatus {
  if (status === 'FAILED') return 'FAILED';
  if (status === 'RUNNING') return 'RUNNING';
  return 'SUCCESS';
}
