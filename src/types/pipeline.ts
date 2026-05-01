export type PipelineStepStatus = 'SUCCESS' | 'RUNNING' | 'WAITING' | 'FAILED';
export type PipelineRunStatus =
  | 'SUCCESS'
  | 'FAILED'
  | 'PARTIAL_FAILED'
  | 'RUNNING';

export interface PipelineStepEvent {
  status: 'RUNNING' | 'SUCCESS' | 'FAILED';
  message: string;
  progress: number;
  targetName?: string;
  errorMessage?: string;
  emittedAt: string;
}

export interface PipelineStep {
  id: string;
  label: string;
  status: PipelineStepStatus;
  detail?: string;
  events?: PipelineStepEvent[];
}

export interface ActivePipeline {
  pipelineId: string;
  steps: PipelineStep[];
}

export interface PipelineCollectResult {
  pipelineRunId: number;
  executedAt: string;
}

export interface PipelineMetrics {
  totalArticles: number;
  totalTopics: number;
  collectedToday: number;
  collectedTodayChangePct: number;
  successJobs: number;
  failedJobs: number;
  lastFetchedAt: string;
}

export interface PipelineHistoryRow {
  id: number;
  pipelineRunId: number;
  executedAt: string;
  step: string;
  status: PipelineRunStatus;
  processed: number;
  successCount?: number;
  failedCount?: number;
  targetName?: string;
  errorType?: string;
  errorMessage?: string;
  message: string;
}

export interface PublisherArticleCount {
  name: string;
  count: number;
}

export interface DonutSegment {
  value: number;
  color: string;
  label: string;
}

export interface PipelineResultStats {
  running: number;
  success: number;
  failed: number;
  partialFailed: number;
}

export interface DashboardChartData {
  topicsByCountry: Array<{ country: string; count: number; color: string }>;
  pipelineResultStats: PipelineResultStats;
}

export interface PipelineHistoryItem {
  id: number;
  pipelineRunId: number;
  step: string;
  status: PipelineRunStatus;
  targetType?: string;
  targetName?: string;
  processedCount: number;
  successCount: number;
  failedCount: number;
  errorType?: string;
  errorMessage?: string;
  message: string;
  startedAt: string;
  finishedAt?: string;
}

export type PipelineHistoriesPage = import('@/lib/pagination').PageData<PipelineHistoryItem>;

export interface PipelineStreamEvent {
  pipelineRunId: number | null;
  step:
    | 'RSS_COLLECT'
    | 'ARTICLE_SAVE'
    | 'TOPIC_CLUSTERING'
    | 'AI_SUMMARY'
    | 'COMPLETED';
  status: 'RUNNING' | 'SUCCESS' | 'FAILED';
  message: string;
  progress: number;
  targetName?: string;
  errorMessage?: string;
  emittedAt: string;
}
