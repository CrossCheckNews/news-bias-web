import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { usePipelineHistories } from '@/hooks/usePipeline';
import type { PipelineHistoryItem, PipelineRunStatus } from '@/types/pipeline';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

function formatDateTime(value: string | null | undefined) {
  if (!value) return '-';
  return new Date(value).toLocaleString('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function calDuration(
  startedAt: string | null | undefined,
  finishedAt: string | null | undefined,
) {
  if (!startedAt || !finishedAt) return '-';
  const start = new Date(startedAt).getTime();
  const end = new Date(finishedAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return '-';
  const ms = end - start;
  if (ms < 0) return '-';
  const totalSec = ms / 1000;
  if (totalSec < 1) return `${totalSec.toFixed(2)}s`;
  const s = Math.floor(totalSec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <span
        className={cn(
          'text-sm text-slate-800 break-all',
          mono && 'font-mono text-xs',
        )}
      >
        {value}
      </span>
    </div>
  );
}

function HistoryDrawer({
  row,
  onClose,
}: {
  row: PipelineHistoryItem | null;
  onClose: () => void;
}) {
  const open = row !== null;

  return (
    <>
      {/* backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/20 transition-opacity duration-200',
          open
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />

      {/* drawer */}
      <aside
        className={cn(
          'fixed right-0 top-0 z-50 h-screen w-[420px] bg-white border-l border-slate-200 shadow-xl flex flex-col transition-transform duration-200 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <span className="text-sm font-semibold text-slate-900">
            Run Detail
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {row && (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <DetailRow label="Run ID" value={`#${row.pipelineRunId}`} mono />
            <DetailRow
              label="Step"
              value={
                <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-xs text-slate-700">
                  {row.step}
                </span>
              }
            />
            <DetailRow
              label="Status"
              value={<StatusBadge status={row.status as PipelineRunStatus} />}
            />
            <DetailRow label="Target" value={row.targetName || '-'} mono />
            <DetailRow
              label="Processed Count"
              value={row.processedCount.toLocaleString()}
              mono
            />
            <DetailRow
              label="Started At"
              value={formatDateTime(row.startedAt)}
              mono
            />
            <DetailRow
              label="Finished At"
              value={formatDateTime(row.finishedAt)}
              mono
            />
            <DetailRow
              label="Duration"
              value={calDuration(row.startedAt, row.finishedAt)}
              mono
            />

            <div className="border-t border-slate-100 pt-5 space-y-5">
              <DetailRow label="Message" value={row.message || '-'} />
              {row.errorType && (
                <DetailRow
                  label="Error Type"
                  value={
                    <span className="font-mono text-xs text-red-600">
                      {row.errorType}
                    </span>
                  }
                />
              )}
              {row.errorMessage && (
                <DetailRow
                  label="Error Message"
                  value={
                    <span className="text-red-600">{row.errorMessage}</span>
                  }
                />
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

export default function PipelineHistory() {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<PipelineHistoryItem | null>(null);
  const { data, isLoading, isFetching } = usePipelineHistories(page, PAGE_SIZE);

  const columns = [
    { label: 'ID', className: 'pl-6 pr-2' },
    { label: 'Step', className: 'px-5' },
    { label: 'Status', className: 'px-5' },
    { label: 'Target', className: 'px-5' },
    { label: 'Processed', className: 'px-5' },
    { label: 'Started At', className: 'px-5' },
    { label: 'Duration', className: 'pl-5 pr-4' },
  ];

  return (
    <>
      <div className="p-6 space-y-4">
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Pipeline History
            </h2>
            {data && (
              <span className="text-s text-slate-500">
                Total {data.totalElements.toLocaleString()}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {columns.map((column) => (
                    <th
                      key={column.label}
                      className={cn(
                        'py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap',
                        column.className,
                      )}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <colgroup>
                <col className="w-[72px]" />
                <col className="w-[190px]" />
                <col className="w-[150px]" />
                <col className="w-[230px]" />
                <col className="w-[130px]" />
                <col className="w-[190px]" />
                <col className="w-[110px]" />
              </colgroup>
              <tbody className="divide-y divide-slate-100">
                {isLoading &&
                  Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-slate-100 rounded animate-pulse w-16" />
                        </td>
                      ))}
                    </tr>
                  ))}
                {!isLoading &&
                  data?.content.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelected(row)}
                      className={cn(
                        'cursor-pointer hover:bg-slate-50 transition-colors',
                        isFetching && 'opacity-60',
                        selected?.id === row.id && 'bg-cyan-50',
                      )}
                    >
                      <td className="pl-6 pr-2 py-4 whitespace-nowrap font-mono text-xs text-slate-500">
                        #{row.pipelineRunId}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono text-slate-700">
                          {row.step}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <StatusBadge status={row.status as PipelineRunStatus} />
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600">
                        <div className="truncate" title={row.targetName ?? '-'}>
                          {row.targetName ?? '-'}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold font-mono text-sm text-slate-900 whitespace-nowrap">
                        {row.processedCount.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap font-mono text-xs text-slate-700">
                        {formatDateTime(row.startedAt)}
                      </td>
                      <td className="pl-5 pr-4 py-4 whitespace-nowrap font-mono text-xs text-slate-500">
                        {calDuration(row.startedAt, row.finishedAt)}
                      </td>
                    </tr>
                  ))}
                {!isLoading && data?.content.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-sm text-slate-400"
                    >
                      No history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Page {data.number + 1} of {data.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={data.first || isFetching}
                  className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={data.last || isFetching}
                  className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <HistoryDrawer row={selected} onClose={() => setSelected(null)} />
    </>
  );
}
