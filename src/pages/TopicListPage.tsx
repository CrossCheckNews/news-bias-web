import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, FileText } from 'lucide-react'

import { BottomNav } from '@/components/home/BottomNav'
import { homeColumnClass, homePaddingXClass } from '@/components/home/homeLayout'
import { getTopics } from '@/api/topics'
import { cn } from '@/lib/utils'
import type { TopicSummary } from '@/types'

const TODAY = new Date().toISOString().split('T')[0]

const TABS = ['모바일 홈', '전체 주제'] as const
type Tab = (typeof TABS)[number]

function TopicCard({ topic }: { topic: TopicSummary }) {
  return (
    <article className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <FileText className="size-3.5 shrink-0 text-neutral-400" />
          <span>{topic.articleCount}개 기사</span>
        </div>
        {topic.category && (
          <span className="shrink-0 rounded bg-cc-surface-2 px-2 py-0.5 text-[11px] font-medium text-neutral-700">
            {topic.category}
          </span>
        )}
      </div>
      <h3 className="mt-3 text-base font-bold leading-snug tracking-tight text-neutral-900 sm:text-lg">
        {topic.title}
      </h3>
      {topic.description && (
        <p className="mt-1.5 line-clamp-2 text-xs text-neutral-500">{topic.description}</p>
      )}
      <div className="mt-4">
        <Link
          to={`/topics/${topic.id}`}
          className="flex h-10 w-full items-center justify-center rounded-md bg-cc-slate text-sm font-medium text-white hover:bg-cc-slate/90"
        >
          비교하기
        </Link>
      </div>
    </article>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
      <div className="h-3 w-24 rounded bg-neutral-200" />
      <div className="mt-3 h-5 w-3/4 rounded bg-neutral-200" />
      <div className="mt-2 h-3 w-full rounded bg-neutral-100" />
      <div className="mt-4 h-10 rounded-md bg-neutral-200" />
    </div>
  )
}

export default function TopicListPage() {
  const [activeTab, setActiveTab] = useState<Tab>('모바일 홈')
  const [sortDesc, setSortDesc] = useState(true)

  const isHome = activeTab === '모바일 홈'

  const { data, isLoading, isError } = useQuery({
    queryKey: ['topics', activeTab],
    queryFn: () =>
      isHome
        ? getTopics({ status: 'ACTIVE', date: TODAY })
        : getTopics({ status: 'ACTIVE', page: 0, size: 20 }),
  })

  const topics = data?.content ?? []
  const sorted = sortDesc ? [...topics] : [...topics].reverse()

  return (
    <div className="min-h-dvh overflow-x-hidden bg-white text-neutral-900">
      <div className={cn(homeColumnClass, 'pb-24 sm:pb-28')}>
        {/* Header */}
        <header className={cn('border-b border-neutral-200 bg-white pb-3 pt-4 sm:pt-5', homePaddingXClass)}>
          <h1 className="font-cc-serif text-center text-lg font-bold tracking-tight text-black sm:text-xl">
            CROSSCHECK NEWS
          </h1>
          <p className="mt-3 text-xs text-neutral-500 sm:text-sm">테마 콘텐츠 | 피드</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
            주요 주제
          </h2>

          <div className="mt-4 flex items-end justify-between gap-2">
            <nav
              className="-mx-1 flex min-w-0 flex-1 gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="피드 구분"
            >
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'shrink-0 whitespace-nowrap border-b-2 pb-2 text-sm transition-colors',
                    activeTab === tab
                      ? 'border-black font-semibold text-black'
                      : 'border-transparent font-medium text-neutral-500',
                  )}
                >
                  {tab}
                </button>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => setSortDesc((v) => !v)}
              className="mb-0.5 flex shrink-0 items-center gap-0.5 text-xs font-medium text-neutral-600"
            >
              {sortDesc ? '최신순' : '오래된순'}
              <ChevronDown className={cn('size-3.5 transition-transform', !sortDesc && 'rotate-180')} />
            </button>
          </div>
        </header>

        {/* Feed */}
        <main className={cn('space-y-3 py-4 sm:space-y-4 sm:py-6', homePaddingXClass)}>
          {isLoading && Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}

          {isError && (
            <div className="py-12 text-center text-sm text-neutral-400">
              데이터를 불러오지 못했습니다.
            </div>
          )}

          {!isLoading && !isError && sorted.length === 0 && (
            <div className="py-12 text-center text-sm text-neutral-400">
              {isHome ? '오늘의 주제가 없습니다.' : '주제가 없습니다.'}
            </div>
          )}

          {sorted.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
