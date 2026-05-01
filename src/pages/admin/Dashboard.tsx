import ArticlesByPublisherChart from '@/components/dashboard/BarChart';
import DonutChart from '@/components/dashboard/DonutChart';
import MetricCard from '@/components/dashboard/MetricCard';
import PipelineHistoryTable from '@/components/dashboard/PipelineHistoryTable';
import PipelineOrchestration from '@/components/dashboard/PipelineOrchestration';
import {
  useArticlesByPublisher,
  useDashboardChartData,
  usePipelineHistory,
  usePipelineMetrics,
  useLatestRunDate,
} from '@/hooks/usePipeline';

type MetricCardItem = {
  key: string;
  label: string;
  value: string | number;
  subValue?: string;
  to?: string;
  badge?: React.ReactNode;
};
const ADMIN_SECRET_PATH = import.meta.env.VITE_ADMIN_SECRET_PATH;

const MetricsSection = (): React.ReactNode => {
  const { data, isLoading } = usePipelineMetrics();
  const latestRunDateQuery = useLatestRunDate();

  if (isLoading || !data) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </section>
    );
  }

  const lastFetched = new Date(data.lastFetchedAt);
  const dateStr = lastFetched.toLocaleDateString('sv');
  const timeStr = lastFetched.toLocaleTimeString('en-GB');

  const metricCards: MetricCardItem[] = [
    {
      key: 'totalArticles',
      label: 'Total Articles',
      value: data.totalArticles,
      to: `/admin/${ADMIN_SECRET_PATH}/articles`,
    },
    {
      key: 'totalTopics',
      label: 'Total Topics',
      value: data.totalTopics,
      to: `/admin/${ADMIN_SECRET_PATH}/topics`,
    },
    {
      key: 'collectedToday',
      label: 'Collected Today',
      value: data.collectedToday,
      to: `/admin/${ADMIN_SECRET_PATH}/history?status=SUCCESS`,
    },
    {
      key: 'failedToday',
      label: 'Failed Today',
      value: data.failedJobs,
      to: `/admin/${ADMIN_SECRET_PATH}/history?status=FAILED`,
    },
    {
      key: 'lastFetched',
      label: 'Last Fetched',
      value: latestRunDateQuery.isPending
        ? '…'
        : (latestRunDateQuery.data?.runDate ?? '—'),
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {metricCards.map((card) => (
        <MetricCard
          key={card.key}
          label={card.label}
          value={card.value}
          subValue={card.subValue}
          badge={card.badge}
          to={card.to}
        />
      ))}
    </section>
  );
};

function PipelineSection() {
  return (
    <section className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
      <PipelineOrchestration />
    </section>
  );
}

function ChartsSection() {
  const { data: publishers, isLoading: loadingPublishers } =
    useArticlesByPublisher();
  const { data: chartData, isLoading: loadingCharts } = useDashboardChartData();

  const topicsTotalCount =
    chartData?.topicsByCountry.reduce((sum, c) => sum + c.count, 0) ?? 0;
  const pipelineTotal = chartData
    ? chartData.pipelineResultStats.success +
      chartData.pipelineResultStats.failed +
      chartData.pipelineResultStats.partial
    : 0;
  const successPct =
    pipelineTotal > 0
      ? Math.round(
          (chartData!.pipelineResultStats.success / pipelineTotal) * 100,
        )
      : 0;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Articles by Publisher */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">
          Articles by Publisher
        </p>
        {loadingPublishers || !publishers ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <ArticlesByPublisherChart data={publishers} />
        )}
      </div>

      {/* Topics by Country */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">
          Topics by Country
        </p>
        {loadingCharts || !chartData ? (
          <div className="h-36 bg-slate-100 rounded animate-pulse" />
        ) : (
          <DonutChart
            segments={chartData.topicsByCountry.map((c) => ({
              value: c.count,
              color: c.color,
              label: c.country,
            }))}
            centerLabel={String(topicsTotalCount)}
            centerSub="TOTAL"
            legend={chartData.topicsByCountry.map((c) => ({
              label: c.country,
              color: c.color,
              value: c.count,
            }))}
          />
        )}
      </div>

      {/* Pipeline Result Status */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">
          Pipeline Result Status
        </p>
        {loadingCharts || !chartData ? (
          <div className="h-36 bg-slate-100 rounded animate-pulse" />
        ) : (
          <DonutChart
            segments={[
              {
                value: chartData.pipelineResultStats.success,
                color: '#10b981',
                label: 'SUCCESS',
              },
              {
                value: chartData.pipelineResultStats.failed,
                color: '#ef4444',
                label: 'FAILED',
              },
              {
                value: chartData.pipelineResultStats.partial,
                color: '#f59e0b',
                label: 'PARTIAL',
              },
            ]}
            centerLabel={`${successPct}%`}
            centerSub="SUCCESS"
            legend={[
              {
                label: 'SUCCESS',
                color: '#10b981',
                value: chartData.pipelineResultStats.success,
              },
              {
                label: 'FAILED',
                color: '#ef4444',
                value: chartData.pipelineResultStats.failed,
              },
              {
                label: 'PARTIAL',
                color: '#f59e0b',
                value: chartData.pipelineResultStats.partial,
              },
            ]}
          />
        )}
      </div>
    </section>
  );
}

function HistorySection() {
  const { data, isLoading } = usePipelineHistory();

  if (isLoading || !data) {
    return <div className="h-48 bg-slate-100 rounded-lg animate-pulse" />;
  }

  return <PipelineHistoryTable rows={data} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="flex-1 p-6 space-y-6 max-w-[1440px]">
        <MetricsSection />
        <PipelineSection />
        <ChartsSection />
        <HistorySection />
      </div>
      <footer className="px-6 py-4 border-t border-slate-200 text-slate-500 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
        <p>© 2026 CrossCheckNews Orchestrator v4.2.0-STABLE</p>
        <div className="flex gap-4">
          <a className="hover:text-slate-700 transition-colors" href="#">
            Documentation
          </a>
          <a className="hover:text-slate-700 transition-colors" href="#">
            API Keys
          </a>
          <a className="hover:text-slate-700 transition-colors" href="#">
            System Health
          </a>
        </div>
      </footer>
    </div>
  );
}
