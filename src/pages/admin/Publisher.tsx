import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react';

import { getPublishers } from '@/api/publishers';
import { cn } from '@/lib/utils';
import type { PoliticalLeaning } from '@/types';

const ADMIN_SECRET_PATH = import.meta.env.VITE_ADMIN_SECRET_PATH;
const PAGE_SIZE = 10;

const LEANING_STYLE: Record<PoliticalLeaning, string> = {
  LEFT: 'bg-blue-50 text-blue-700 border-blue-100',
  CENTER: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  RIGHT: 'bg-red-50 text-red-700 border-red-100',
};

const columns = [
  { label: 'Publisher', className: 'pl-6 pr-4 w-[250px]' },
  { label: 'RSS URL', className: 'px-5' },
  { label: 'Country', className: 'px-5 w-[100px]' },
  { label: 'Leaning', className: 'px-5 w-[110px]' },
  { label: 'Created At', className: 'px-5 w-[140px]' },
  { label: '', className: 'pl-5 pr-6 w-[100px]' },
];

export default function Publisher() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ['publishers', { page }],
    queryFn: () => getPublishers({ page, size: PAGE_SIZE }),
    placeholderData: (prev) => prev,
  });

  const publishers = data?.items ?? [];

  return (
    <div className="p-6">
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Publishers</h2>
          <div className="flex items-center gap-3">
            {data && (
              <span className="text-sm text-slate-500">
                Total {data.totalElements.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {columns.map((col) => (
                  <th
                    key={col.label}
                    className={cn(
                      'py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap',
                      col.className,
                    )}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading &&
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-20" />
                      </td>
                    ))}
                  </tr>
                ))}

              {isError && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-red-400"
                  >
                    데이터를 불러오지 못했습니다.
                  </td>
                </tr>
              )}

              {!isLoading && !isError && publishers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-slate-400"
                  >
                    등록된 언론사가 없습니다.
                  </td>
                </tr>
              )}

              {!isLoading &&
                publishers.map((p) => (
                  <tr
                    key={p.id}
                    className={cn(
                      'hover:bg-slate-50 transition-colors',
                      isFetching && 'opacity-60',
                    )}
                  >
                    <td className="pl-6 pr-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex w-8 h-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-500">
                          {p.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-sm text-slate-900">
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="truncate font-mono text-xs text-slate-400">
                        {p.rssUrl ?? '—'}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-700">
                      {p.country}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border',
                          LEANING_STYLE[p.politicalLeaning],
                        )}
                      >
                        {p.politicalLeaning}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                      {p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString('sv')
                        : '—'}
                    </td>
                    <td className="pl-5 pr-6 py-4">
                      <div className="flex items-center gap-3 justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/${ADMIN_SECRET_PATH}/publishers/${p.id}/edit`,
                            )
                          }
                          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          상세
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
                type="button"
                onClick={() => setPage((p) => p - 1)}
                disabled={data.first || isFetching}
                className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
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
