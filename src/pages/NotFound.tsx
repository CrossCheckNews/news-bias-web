import { ArrowLeft, SearchX } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function NotFound() {
  const { pathname } = useLocation();
  const backTo = pathname.startsWith('/admin/') ? '/admin/hello-new-s/dashboard' : '/';
  const backLabel = pathname.startsWith('/admin/') ? 'Back to Dashboard' : 'Back to News';

  return (
    <main className="min-h-dvh bg-white px-6 py-10 text-neutral-900">
      <section className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-xl flex-col items-center justify-center text-center">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500">
          <SearchX className="h-6 w-6" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          404 Not Found
        </p>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-neutral-950">
          페이지를 찾을 수 없습니다.
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-neutral-500">
          다른 경로로 이동해주세요.
        </p>
        <Link
          to={backTo}
          className="mt-6 inline-flex items-center gap-2 rounded bg-neutral-950 px-4 py-2 text-sm font-bold text-white hover:bg-neutral-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      </section>
    </main>
  );
}
