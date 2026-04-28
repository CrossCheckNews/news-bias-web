import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';

import { deletePublisher, getPublishers } from '@/api/publishers';
import { cn } from '@/lib/utils';
import type { PoliticalLeaning, Publisher } from '@/types';

const ADMIN_SECRET_PATH = import.meta.env.VITE_ADMIN_SECRET_PATH;

const PAGE_SIZE = 10;

const COUNTRY_TABS = [
  { label: '전체', value: '' },
  { label: '영국', value: 'GB' },
  { label: '미국', value: 'US' },
  { label: '대한민국', value: 'KR' },
  { label: '일본', value: 'JP' },
];

const LEANING_STYLE: Record<PoliticalLeaning, string> = {
  LEFT: 'bg-blue-50 text-blue-700 border-blue-100',
  CENTER: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  RIGHT: 'bg-red-50 text-red-700 border-red-100',
};

const LEANING_LABEL: Record<PoliticalLeaning, string> = {
  LEFT: 'LEFT',
  CENTER: 'CENTER',
  RIGHT: 'RIGHT',
};

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({
  publisher,
  onConfirm,
  onCancel,
  loading,
}: {
  publisher: Publisher;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl border border-slate-200">
        <h2 className="font-bold text-slate-900">언론사 삭제</h2>
        <p className="mt-2 text-sm text-slate-600">
          <span className="font-semibold">{publisher.name}</span>을(를) 삭제하시겠습니까?
          <br />이 작업은 되돌릴 수 없습니다.
        </p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Publisher management ─────────────────────────────────────────────────────

function PublisherManagement() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [country, setCountry] = useState('');
  const [page, setPage] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Publisher | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['publishers', { country, page }],
    queryFn: () => getPublishers({ page, size: PAGE_SIZE, country: country || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePublisher,
    onSuccess: () => {
      setDeleteTarget(null);
      qc.invalidateQueries({ queryKey: ['publishers'] });
    },
  });

  const publishers = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const displayFrom = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const displayTo = Math.min((page + 1) * PAGE_SIZE, totalElements);

  return (
    <div className="p-6 space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {COUNTRY_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => { setCountry(tab.value); setPage(0); }}
              className={cn(
                'rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                country === tab.value
                  ? 'bg-cc-slate text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => navigate(`/admin/${ADMIN_SECRET_PATH}/publishers/new`)}
          className="flex items-center gap-2 rounded-lg bg-cc-slate px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          언론사 추가
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['언론사명', 'RSS URL', '국가', '성향', '등록일', ''].map((h) => (
                  <th key={h} className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                    불러오는 중...
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-red-400">
                    데이터를 불러오지 못했습니다.
                  </td>
                </tr>
              )}
              {!isLoading && !isError && publishers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                    등록된 언론사가 없습니다.
                  </td>
                </tr>
              )}
              {publishers.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex w-8 h-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-500">
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-sm text-slate-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-[200px]">
                    <p className="truncate font-mono text-xs text-slate-400">{p.rssUrl ?? '—'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{p.country}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border',
                      LEANING_STYLE[p.politicalLeaning],
                    )}>
                      {LEANING_LABEL[p.politicalLeaning]}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString('sv') : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 justify-end">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/${ADMIN_SECRET_PATH}/publishers/${p.id}/edit`)}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(p)}
                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && totalElements > 0 && (
          <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {displayFrom}–{displayTo} / {totalElements}개
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
                className="flex w-8 h-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
                className="flex w-8 h-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteConfirm
          publisher={deleteTarget}
          loading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default function Publisher() {
  return <PublisherManagement />;
}
