import { useState } from 'react';
import ArticlesByPublisherChart from '@/components/dashboard/BarChart';
import DonutChart from '@/components/dashboard/DonutChart';
import MetricCard from '@/components/dashboard/MetricCard';
import PipelineHistoryTable from '@/components/dashboard/PipelineHistoryTable';
import PipelineOrchestration from '@/components/dashboard/PipelineOrchestration';
import { DatePicker } from '@/components/ui/date-picker';
import {
  useArticlesByPublisher,
  useDashboardChartData,
  usePipelineHistory,
  usePipelineMetrics,
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

function todayString() {
  return new Date().toLocaleDateString('sv-SE');
}

const MetricsSection = ({
  selectedDate,
  onDateChange,
}: {
  selectedDate: string;
  onDateChange: (date: string) => void;
}): React.ReactNode => {
  const { data, isLoading } = usePipelineMetrics(selectedDate);
  const dateQuery = `date=${encodeURIComponent(selectedDate)}`;

  if (isLoading || !data) {
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-8 w-40 bg-slate-100 rounded animate-pulse" />
          <div className="h-8 w-36 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-slate-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  const metricCards: MetricCardItem[] = [
    {
      key: 'totalArticles',
      label: 'Articles',
      value: data.totalArticles,
      to: `/admin/${ADMIN_SECRET_PATH}/articles`,
    },
    {
      key: 'totalTopics',
      label: 'Topics',
      value: data.totalTopics,
      to: `/admin/${ADMIN_SECRET_PATH}/topics`,
    },
    {
      key: 'collectedToday',
      label: 'Collected',
      value: data.collectedToday,
      to: `/admin/${ADMIN_SECRET_PATH}/history?${dateQuery}`,
    },
    {
      key: 'successToday',
      label: 'Success',
      value: data.successJobs,
      to: `/admin/${ADMIN_SECRET_PATH}/history?${dateQuery}&statuses=SUCCESS&statuses=PARTIAL_FAILED`,
    },
    {
      key: 'failedToday',
      label: 'Failed',
      value: data.failedJobs,
      to: `/admin/${ADMIN_SECRET_PATH}/history?${dateQuery}&statuses=PARTIAL_FAILED&statuses=FAILED`,
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
          Summary Date
        </p>
        <DatePicker
          value={selectedDate}
          onChange={(date) => onDateChange(date ?? todayString())}
          placeholder="Pick a date"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
      </div>
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

function ChartsSection({ selectedDate }: { selectedDate: string }) {
  const { data: publishers, isLoading: loadingPublishers } =
    useArticlesByPublisher();
  const { data: chartData, isLoading: loadingCharts } =
    useDashboardChartData(selectedDate);

  const topicsTotalCount =
    chartData?.topicsByCountry.reduce((sum, c) => sum + c.count, 0) ?? 0;
  const pipelineTotal = chartData
    ? chartData.pipelineResultStats.running +
      chartData.pipelineResultStats.success +
      chartData.pipelineResultStats.partialFailed +
      chartData.pipelineResultStats.failed
    : 0;
  const successPct =
    pipelineTotal > 0
      ? Math.round(
          (chartData!.pipelineResultStats.success / pipelineTotal) * 100,
        )
      : 0;

  const pipelineResultItems = chartData
    ? [
        {
          color: '#10b981',
          label: 'SUCCESS',
          value: chartData.pipelineResultStats.success,
        },
        {
          color: '#ef4444',
          label: 'FAILED',
          value: chartData.pipelineResultStats.failed,
        },
        {
          color: '#f59e0b',
          label: 'PARTIAL',
          value: chartData.pipelineResultStats.partialFailed,
        },
      ]
    : [];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">
          Pipeline Result Status
        </p>
        {loadingCharts || !chartData ? (
          <div className="h-36 bg-slate-100 rounded animate-pulse" />
        ) : (
          <DonutChart
            segments={pipelineResultItems}
            centerLabel={`${successPct}%`}
            centerSub="SUCCESS"
            legend={pipelineResultItems}
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
  const [selectedDate, setSelectedDate] = useState(todayString());

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="flex-1 p-6 space-y-6 max-w-[1440px]">
        <MetricsSection
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
        <PipelineSection />
        <ChartsSection selectedDate={selectedDate} />
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
