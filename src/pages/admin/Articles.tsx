import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Search,
  X,
} from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { useArticles } from '@/hooks/useArticles';
import type { PublisherLeaning } from '@/types';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

function LeaningBadge({
  publisherLeaning,
}: {
  publisherLeaning?: PublisherLeaning;
}) {
  if (!publisherLeaning)
    return <span className="text-slate-300 text-xs">—</span>;
  const cfg =
    publisherLeaning === 'CONSERVATIVE'
      ? { label: 'CON', classes: 'bg-red-50 text-red-700 border-red-100' }
      : { label: 'PRO', classes: 'bg-blue-50 text-blue-700 border-blue-100' };
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border',
        cfg.classes,
      )}
    >
      {cfg.label}
    </span>
  );
}

export default function Articles() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(0);
  const [headlineInput, setHeadlineInput] = useState(
    searchParams.get('headline') ?? '',
  );

  const headlineParam = searchParams.get('headline') ?? '';
  const dateParam = searchParams.get('date') ?? '';

  const { data, isLoading, isFetching } = useArticles(
    page,
    PAGE_SIZE,
    headlineParam || undefined,
    dateParam || undefined,
  );

  function commitHeadline() {
    setPage(0);
    setSearchParams((prev: URLSearchParams) => {
      const next = new URLSearchParams(prev);
      if (headlineInput.trim()) next.set('headline', headlineInput.trim());
      else next.delete('headline');
      return next;
    });
  }

  function updateDate(value: string | undefined) {
    setPage(0);
    setSearchParams((prev: URLSearchParams) => {
      const next = new URLSearchParams(prev);
      if (value) next.set('date', value);
      else next.delete('date');
      return next;
    });
  }

  function clearFilters() {
    setPage(0);
    setHeadlineInput('');
    setSearchParams({});
  }

  const hasFilters = Boolean(headlineParam || dateParam);

  const columns = [
    { label: 'ID', className: 'pl-6 pr-2 w-[72px]' },
    { label: 'Headline', className: 'px-4 w-[320px]' },
    { label: 'Publisher', className: 'px-4 w-[160px]' },
    { label: 'Country', className: 'px-4 w-[80px]' },
    { label: 'Leaning', className: 'px-4 w-[80px]' },
    { label: 'Published At', className: 'px-4 w-[160px]' },
    { label: 'URL', className: 'pl-4 pr-6 w-[60px]' },
  ];

  return (
    <div className="p-6">
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Articles</h2>
          {data && (
            <span className="text-sm text-slate-500">
              Total {data.totalElements.toLocaleString()}
            </span>
          )}
        </div>

        {/* Filter bar */}
        <div className="px-6 py-3 border-b border-slate-200 flex items-center gap-4 bg-slate-50">
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
              Headline
            </label>
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={headlineInput}
                onChange={(e) => setHeadlineInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && commitHeadline()}
                placeholder="Search headline…"
                className="text-xs border border-slate-200 rounded px-2 py-1.5 w-48 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
              <button
                onClick={commitHeadline}
                className="p-1.5 rounded border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
              Date
            </label>
            <DatePicker
              value={dateParam || undefined}
              onChange={updateDate}
              placeholder="Pick a date"
            />
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left">
            <colgroup>
              {columns.map((c) => (
                <col key={c.label} className={c.className} />
              ))}
            </colgroup>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {columns.map((c) => (
                  <th
                    key={c.label}
                    className={cn(
                      'py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap',
                      c.className,
                    )}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading &&
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-16" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading &&
                data?.items.map((article) => (
                  <tr
                    key={article.id}
                    className={cn(
                      'hover:bg-slate-50 transition-colors',
                      isFetching && 'opacity-60',
                    )}
                  >
                    <td className="pl-6 pr-2 py-4 font-mono text-xs text-slate-400">
                      {article.id}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-800">
                      <div className="truncate" title={article.headline}>
                        {article.headline}
                      </div>
                      {article.category && (
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          {article.category}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600 truncate">
                      {article.publisherName}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600">
                      {article.publisherCountry}
                    </td>
                    <td className="px-4 py-4">
                      <LeaningBadge
                        publisherLeaning={article.publisherLeaning}
                      />
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleString(
                            'sv-SE',
                            {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          )
                        : '-'}
                    </td>
                    <td className="pl-4 pr-6 py-4 text-center">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}

              {!isLoading && data?.items.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-slate-400"
                  >
                    No articles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Page {data.page + 1} of {data.totalPages}
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
  );
}
