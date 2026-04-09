import { Link, useSearchParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

import { BottomNav } from '@/components/home/BottomNav';
import {
  homeColumnClass,
  homePaddingXClass,
} from '@/components/home/homeLayout';
import { getTopics } from '@/api/topics';
import { cn } from '@/lib/utils';
import type { TopicSummary } from '@/types';

const TABS = ["Today's News", 'All'] as const;
type Tab = (typeof TABS)[number];

function today() {
  return new Date().toISOString().split('T')[0];
}

function formatDateKo() {
  const d = new Date();
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function formatSectionDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function groupByDate(topics: TopicSummary[]): [string, TopicSummary[]][] {
  const map = new Map<string, TopicSummary[]>();
  for (const topic of topics) {
    const key = topic.startDate ?? 'unknown';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(topic);
  }
  return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}

// ────────────────────────────────────────────────
// Today's News tab — full story card
// ────────────────────────────────────────────────
function TopicStory({ topic }: { topic: TopicSummary }) {
  const summaryEntries = Object.entries(topic.summary);

  return (
    <article className="border-b border-neutral-200 py-5">
      <h2 className="text-xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-2xl">
        {topic.aiSummaryTitle}
      </h2>

      {summaryEntries.length > 0 && (
        <div className="mt-4 space-y-3">
          {summaryEntries.map(([publisher, text]) => (
            <div key={publisher} className="flex gap-3">
              <span className="mt-0.5 w-[4.5rem] shrink-0 text-[10px] font-bold uppercase tracking-wide text-neutral-400">
                {publisher}
              </span>
              <p className="flex-1 text-sm leading-snug text-neutral-700">{text}</p>
            </div>
          ))}
        </div>
      )}

      {topic.aiSummary && (
        <p className="mt-3 text-xs italic leading-relaxed text-neutral-500">
          {topic.aiSummary}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[11px] text-neutral-400">{topic.articleCount}개 기사</span>
        <Link
          to={`/topics/${topic.id}`}
          className="text-[11px] font-bold uppercase tracking-wider text-neutral-900 hover:text-neutral-500"
        >
          Deep Dive Read →
        </Link>
      </div>
    </article>
  );
}

// ────────────────────────────────────────────────
// All tab — compact row
// ────────────────────────────────────────────────
function TopicRow({ topic }: { topic: TopicSummary }) {
  const { CONSERVATIVE = 0, PROGRESSIVE = 0 } = topic.leaningDistribution ?? {};
  const total = CONSERVATIVE + PROGRESSIVE;
  const progPct = total > 0 ? Math.round((PROGRESSIVE / total) * 100) : 50;
  const consPct = 100 - progPct;

  return (
    <Link
      to={`/topics/${topic.id}`}
      className="flex items-start gap-3 border-b border-neutral-100 py-4 hover:bg-neutral-50 active:bg-neutral-100"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug text-neutral-900">
          {topic.aiSummaryTitle}
        </p>
        <div className="mt-2 flex items-center gap-2">
          {/* mini leaning bar */}
          <div className="flex h-1.5 w-16 overflow-hidden rounded-full">
            <div className="bg-blue-400" style={{ width: `${progPct}%` }} />
            <div className="bg-red-400" style={{ width: `${consPct}%` }} />
          </div>
          <span className="text-[11px] text-neutral-400">{topic.articleCount}개 기사</span>
        </div>
      </div>
      <span className="mt-0.5 shrink-0 text-neutral-300">›</span>
    </Link>
  );
}

// ────────────────────────────────────────────────
// Skeleton
// ────────────────────────────────────────────────
function SkeletonStory() {
  return (
    <div className="animate-pulse space-y-3 border-b border-neutral-200 py-5">
      <div className="h-6 w-3/4 rounded bg-neutral-200" />
      <div className="h-3 w-full rounded bg-neutral-100" />
      <div className="h-3 w-2/3 rounded bg-neutral-100" />
      <div className="mt-4 flex justify-between">
        <div className="h-3 w-12 rounded bg-neutral-100" />
        <div className="h-3 w-24 rounded bg-neutral-200" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-start gap-3 border-b border-neutral-100 py-4">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-neutral-200" />
        <div className="h-2 w-24 rounded bg-neutral-100" />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────
export default function TopicListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: Tab = searchParams.get('tab') === 'all' ? 'All' : "Today's News";
  const isHeadline = activeTab === "Today's News";

  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['topics', activeTab],
      queryFn: ({ pageParam }) =>
        isHeadline
          ? getTopics({ status: 'ACTIVE', page: pageParam, size: 20, sort: 'createdAt,desc', date: today() })
          : getTopics({ status: 'ACTIVE', page: pageParam, size: 20, sort: 'createdAt,desc' }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) =>
        lastPage.last ? undefined : (lastPage.number ?? 0) + 1,
    });

  const topics = data?.pages.flatMap((p) => p.content) ?? [];
  const dateGroups = groupByDate(topics);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="min-h-dvh overflow-x-hidden bg-white text-neutral-900">
      <div className={cn(homeColumnClass, 'pb-24 sm:pb-28')}>
        {/* Header */}
        <header className={cn('bg-white', homePaddingXClass)}>
          {/* Brand row */}
          <div className="flex items-center justify-between pb-3 pt-4">
            <div className="w-8" />
            <h1 className="font-cc-serif text-lg font-black tracking-[0.15em] text-black sm:text-xl">
              CROSSCHECK NEWS
            </h1>
            <button type="button" className="text-neutral-600 hover:text-neutral-900">
              <Search className="size-5" />
            </button>
          </div>

          {/* Date section */}
          <div className="border-t border-neutral-200 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              Daily Edition
            </p>
            <p className="mt-1 text-[2.5rem] font-black leading-none tracking-tight text-neutral-900 sm:text-5xl">
              {formatDateKo()}
            </p>
          </div>

          {/* Tabs */}
          <nav
            className="flex gap-5 border-t border-neutral-200 pb-0 pt-3"
            aria-label="피드 구분"
          >
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() =>
                  setSearchParams(tab === "Today's News" ? {} : { tab: 'all' })
                }
                className={cn(
                  'shrink-0 whitespace-nowrap border-b-2 pb-3 text-sm transition-colors',
                  activeTab === tab
                    ? 'border-black font-semibold text-black'
                    : 'border-transparent font-medium text-neutral-500',
                )}
              >
                {tab}
              </button>
            ))}
          </nav>
        </header>

        {/* Feed */}
        <main className={cn('py-1', homePaddingXClass)}>
          {isError && (
            <div className="py-12 text-center text-sm text-neutral-400">
              데이터를 불러오지 못했습니다.
            </div>
          )}

          {!isLoading && !isError && topics.length === 0 && (
            <div className="py-12 text-center text-sm text-neutral-400">
              {isHeadline ? '오늘의 헤드라인이 없습니다.' : '주제가 없습니다.'}
            </div>
          )}

          {/* ── Today's News: story cards ── */}
          {isHeadline && (
            <>
              {isLoading && Array.from({ length: 4 }).map((_, i) => <SkeletonStory key={i} />)}
              {topics.map((topic) => (
                <TopicStory key={topic.id} topic={topic} />
              ))}
            </>
          )}

          {/* ── All: date-grouped compact rows ── */}
          {!isHeadline && (
            <>
              {isLoading && Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
              {dateGroups.map(([date, group]) => (
                <section key={date}>
                  <div className="sticky top-0 z-10 -mx-4 bg-neutral-50 px-4 py-2 sm:-mx-6 sm:px-6">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                      {formatSectionDate(date)}
                    </p>
                  </div>
                  {group.map((topic) => (
                    <TopicRow key={topic.id} topic={topic} />
                  ))}
                </section>
              ))}
            </>
          )}

          {/* 무한 스크롤 트리거 */}
          <div ref={sentinelRef} />

          {isFetchingNextPage &&
            (isHeadline ? <SkeletonStory /> : <SkeletonRow />)}

          {!hasNextPage && topics.length > 0 && (
            <p className="py-8 text-center text-[11px] text-neutral-400">
              모든 주제를 불러왔습니다.
            </p>
          )}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
