import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Info,
  LogOut,
  Menu,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';

import { login } from '@/api/auth';
import { deletePublisher, getPublishers } from '@/api/publishers';
import { cn } from '@/lib/utils';
import type { PoliticalLeaning, Publisher } from '@/types';

const ADMIN_SECRET_PATH = import.meta.env.VITE_ADMIN_SECRET_PATH;

// ─── Auth helpers ────────────────────────────────────────────────────────────

const TOKEN_KEY = 'admin_token';
const TOKEN_EXPIRY_KEY = 'admin_token_expiry';

const getToken = () => {
  const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
  if (expiry && Date.now() > Number(expiry)) {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
    return null;
  }
  return sessionStorage.getItem(TOKEN_KEY);
};

const setToken = (token: string, expiresIn: number) => {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(
    TOKEN_EXPIRY_KEY,
    String(Date.now() + expiresIn * 1000),
  );
};

const clearToken = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
};

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const COUNTRY_TABS = [
  { label: '전체', value: '' },
  { label: '영국', value: 'GB' },
  { label: '미국', value: 'US' },
  { label: '대한민국', value: 'KR' },
  { label: '일본', value: 'JP' },
];

const LEANING_LABEL: Record<PoliticalLeaning, string> = {
  LEFT: '좌편향 (LEFT)',
  CENTER: '중도 (CENTER)',
  RIGHT: '우편향 (RIGHT)',
};

const LEANING_COLOR: Record<PoliticalLeaning, string> = {
  LEFT: 'bg-blue-100 text-blue-700',
  CENTER: 'bg-green-100 text-green-700',
  RIGHT: 'bg-red-100 text-red-600',
};

// ─── Login ───────────────────────────────────────────────────────────────────

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, expiresIn } = await login({ username, password });
      setToken(token, expiresIn);
      onSuccess();
    } catch {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-8 shadow-md"
      >
        <div className="mb-2 text-center">
          <p className="font-cc-serif text-sm font-bold tracking-widest text-neutral-400">
            CROSSCHECK NEWS
          </p>
          <h1 className="mt-2 text-xl font-bold text-neutral-900">
            관리자 로그인
          </h1>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="username"
            className="text-sm font-medium text-neutral-700"
          >
            아이디
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            placeholder="아이디를 입력하세요"
            autoComplete="username"
            autoFocus
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-neutral-700"
          >
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="비밀번호를 입력하세요"
            autoComplete="current-password"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>

        {error && <p className="text-center text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading || !username || !password}
          className="mt-1 rounded-md bg-cc-slate py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cc-slate/90 disabled:opacity-50"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-center text-sm text-neutral-400 hover:text-neutral-600"
        >
          돌아가기
        </button>
      </form>
    </div>
  );
}

// ─── Publisher card ───────────────────────────────────────────────────────────

function PublisherCard({
  publisher,
  onEdit,
  onDelete,
}: {
  publisher: Publisher;
  onEdit: (p: Publisher) => void;
  onDelete: (p: Publisher) => void;
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-neutral-200 text-xs font-bold text-neutral-500">
          {publisher.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-neutral-900">
            {publisher.name}
          </p>
          <p className="truncate text-xs text-neutral-400">
            {publisher.rssUrl ?? '—'}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-neutral-600">
        <span>
          <span className="text-neutral-400">국가:</span> {publisher.country}
        </span>
        {publisher.createdAt && (
          <span className="text-xs">
            <span className="text-neutral-400">등록:</span>{' '}
            {new Date(publisher.createdAt).toLocaleDateString('ko-KR')}
          </span>
        )}
        <div className="col-span-2 flex items-center gap-2">
          <span className="text-neutral-400">성향:</span>
          <span
            className={cn(
              'rounded px-2 py-0.5 text-xs font-semibold',
              LEANING_COLOR[publisher.politicalLeaning],
            )}
          >
            {LEANING_LABEL[publisher.politicalLeaning]}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 border-t border-neutral-100 pt-3">
        <button
          type="button"
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800"
        >
          <Info className="size-3.5" />
          상세
        </button>
        <button
          type="button"
          onClick={() => onEdit(publisher)}
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800"
        >
          <Pencil className="size-3.5" />
          수정
        </button>
        <button
          type="button"
          onClick={() => onDelete(publisher)}
          className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600"
        >
          <Trash2 className="size-3.5" />
          삭제
        </button>
      </div>
    </div>
  );
}

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
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="font-bold text-neutral-900">언론사 삭제</h2>
        <p className="mt-2 text-sm text-neutral-600">
          <span className="font-semibold">{publisher.name}</span>을(를)
          삭제하시겠습니까?
          <br />이 작업은 되돌릴 수 없습니다.
        </p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-md border border-neutral-300 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-md bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Publisher management ─────────────────────────────────────────────────────

function PublisherManagement({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [country, setCountry] = useState('');
  const [page, setPage] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Publisher | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['publishers', { country, page }],
    queryFn: () =>
      getPublishers({ page, size: PAGE_SIZE, country: country || undefined }),
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
    <div className="min-h-dvh bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:px-6">
          <button type="button" className="text-neutral-700">
            <Menu className="size-5" />
          </button>
          <h1 className="font-bold text-neutral-900">게시자 관리</h1>
          <button
            type="button"
            onClick={onLogout}
            className="text-neutral-500 hover:text-neutral-800"
            title="로그아웃"
          >
            <LogOut className="size-5" />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 pb-16 sm:px-6">
        {/* Hero */}
        <div className="py-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Publisher Management
          </p>
          <h2 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl">
            등록된 언론사를
            <br />
            관리하고 매체
            <br />
            데이터의 무결성을
            <br />
            검토합니다.
          </h2>
        </div>

        {/* Add button */}
        <button
          type="button"
          onClick={() => navigate(`/admin/${ADMIN_SECRET_PATH}/publishers/new`)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-cc-slate py-3.5 text-sm font-semibold text-white hover:bg-cc-slate/90"
        >
          <Plus className="size-4" />
          언론사 추가
        </button>

        {/* Country filter */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {COUNTRY_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setCountry(tab.value);
                setPage(0);
              }}
              className={cn(
                'shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                country === tab.value
                  ? 'bg-cc-slate text-white'
                  : 'bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Publisher list */}
        <div className="mt-4 space-y-3">
          {isLoading && (
            <div className="py-12 text-center text-sm text-neutral-400">
              불러오는 중...
            </div>
          )}
          {isError && (
            <div className="py-12 text-center text-sm text-red-400">
              데이터를 불러오지 못했습니다.
            </div>
          )}
          {!isLoading && !isError && publishers.length === 0 && (
            <div className="py-12 text-center text-sm text-neutral-400">
              등록된 언론사가 없습니다.
            </div>
          )}
          {!isLoading &&
            !isError &&
            publishers.map((p) => (
              <PublisherCard
                key={p.id}
                publisher={p}
                onEdit={(pub) =>
                  navigate(
                    `/admin/${ADMIN_SECRET_PATH}/publishers/${pub.id}/edit`,
                  )
                }
                onDelete={setDeleteTarget}
              />
            ))}
        </div>

        {/* Pagination */}
        {data && totalElements > 0 && (
          <div className="mt-5 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
              Displaying {displayFrom}–{displayTo} of {totalElements} Publishers
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
                className="flex size-9 items-center justify-center rounded-lg ring-1 ring-neutral-200 hover:bg-neutral-100 disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
                className="flex size-9 items-center justify-center rounded-lg ring-1 ring-neutral-200 hover:bg-neutral-100 disabled:opacity-40"
              >
                <ChevronRight className="size-4" />
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

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => Boolean(getToken()));

  const handleLogout = () => {
    clearToken();
    setAuthed(false);
  };

  if (!authed) {
    return <LoginForm onSuccess={() => setAuthed(true)} />;
  }

  return <PublisherManagement onLogout={handleLogout} />;
}
