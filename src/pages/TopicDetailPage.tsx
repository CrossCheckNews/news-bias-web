import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ExternalLink, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getTopic, getTopicArticles } from '@/api/topics'
import { BottomNav } from '@/components/home/BottomNav'
import { homeColumnClass } from '@/components/home/homeLayout'
import { cn } from '@/lib/utils'
import type { PoliticalLeaning, TopicArticle } from '@/types'

const FILTER_TABS = ['정치적 성향', '국가별'] as const

const LEANING_SECTIONS: { leaning: PoliticalLeaning; label: string; labelEn: string }[] = [
  { leaning: 'LEFT', label: '진보', labelEn: 'Left-Leaning' },
  { leaning: 'CENTER', label: '중도', labelEn: 'Center' },
  { leaning: 'RIGHT', label: '보수', labelEn: 'Right-Leaning' },
]

const LEANING_COLOR: Record<PoliticalLeaning, string> = {
  LEFT: 'bg-blue-500',
  CENTER: 'bg-neutral-400',
  RIGHT: 'bg-red-500',
}

const LEANING_TEXT_COLOR: Record<PoliticalLeaning, string> = {
  LEFT: 'text-blue-600',
  CENTER: 'text-neutral-500',
  RIGHT: 'text-red-600',
}

function LeaningDot({ leaning }: { leaning: PoliticalLeaning }) {
  return (
    <span className={cn('inline-block size-2 rounded-full', LEANING_COLOR[leaning])} />
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  })
}

function ArticleCard({ article }: { article: TopicArticle }) {
  const leaning = article.publisher.politicalLeaning
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-neutral-100 bg-white p-4 shadow-sm transition-colors hover:bg-neutral-50"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
          {article.publisher.name}
        </span>
        <ExternalLink className="size-3.5 shrink-0 text-neutral-300" />
      </div>
      <p className="text-sm font-semibold leading-snug text-neutral-900">{article.title}</p>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-neutral-400">
        <span className={cn('font-medium', LEANING_TEXT_COLOR[leaning])}>
          {leaning === 'LEFT' ? '진보' : leaning === 'CENTER' ? '중도' : '보수'}
        </span>
        <span>·</span>
        <span>{article.publisher.country}</span>
        <span>·</span>
        <span>{formatDate(article.publishedAt)}</span>
      </div>
    </a>
  )
}

function LeaningSection({
  leaning,
  label,
  labelEn,
  articles,
}: {
  leaning: PoliticalLeaning
  label: string
  labelEn: string
  articles: TopicArticle[]
}) {
  if (articles.length === 0) return null

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <LeaningDot leaning={leaning} />
        <h3 className="text-sm font-bold text-neutral-900">
          {label}{' '}
          <span className="font-normal text-neutral-400">({labelEn})</span>
        </h3>
      </div>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </section>
  )
}

function LeaningDistributionBar({
  distribution,
  total,
}: {
  distribution: { LEFT: number; CENTER: number; RIGHT: number }
  total: number
}) {
  if (total === 0) return null
  const pct = (n: number) => Math.round((n / total) * 100)

  return (
    <div className="space-y-2 rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-black/5 sm:px-5">
      <p className="text-xs font-semibold text-neutral-500">정치 성향 분포</p>
      <div className="flex h-3 w-full overflow-hidden rounded-full">
        {distribution.LEFT > 0 && (
          <div className="bg-blue-500" style={{ width: `${pct(distribution.LEFT)}%` }} />
        )}
        {distribution.CENTER > 0 && (
          <div className="bg-neutral-300" style={{ width: `${pct(distribution.CENTER)}%` }} />
        )}
        {distribution.RIGHT > 0 && (
          <div className="bg-red-500" style={{ width: `${pct(distribution.RIGHT)}%` }} />
        )}
      </div>
      <div className="flex justify-between text-[11px] text-neutral-500">
        <span className="text-blue-500 font-medium">진보 {pct(distribution.LEFT)}%</span>
        <span className="font-medium">중도 {pct(distribution.CENTER)}%</span>
        <span className="text-red-500 font-medium">보수 {pct(distribution.RIGHT)}%</span>
      </div>
    </div>
  )
}

function CountryDistributionList({
  distribution,
  total,
}: {
  distribution: { country: string; count: number }[]
  total: number
}) {
  if (distribution.length === 0) return null

  return (
    <div className="space-y-3 rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-black/5 sm:px-5">
      <p className="text-xs font-semibold text-neutral-500">국가별 분포</p>
      <ul className="space-y-2">
        {distribution.map(({ country, count }) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <li key={country} className="space-y-1">
              <div className="flex justify-between text-xs text-neutral-700">
                <span className="font-medium">{country}</span>
                <span className="text-neutral-400">{count}개 · {pct}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full rounded-full bg-cc-slate" style={{ width: `${pct}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function SubscribeCta() {
  const [email, setEmail] = useState('')

  return (
    <div className="rounded-xl bg-cc-slate px-5 py-6 text-white sm:px-6 sm:py-8">
      <p className="text-xs font-medium uppercase tracking-widest text-white/60">Stay Objective.</p>
      <h3 className="mt-2 text-lg font-bold leading-snug sm:text-xl">객관성을 유지하세요.</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/75">
        정치적 스펙트럼 전반에 걸쳐 검증된 주요 언론 매체의 50,000명 이상의 구독자들처럼 균형 잡힌 시각을 유지하세요.
      </p>
      <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@publication.com"
          className="flex-1 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
        />
        <button
          type="submit"
          className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-cc-slate transition-colors hover:bg-white/90"
        >
          구독하기
        </button>
      </form>
    </div>
  )
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-neutral-200', className)} />
}

export default function TopicDetailPage() {
  const { id } = useParams<{ id: string }>()
  const topicId = Number(id)

  const [activeFilter, setActiveFilter] = useState<(typeof FILTER_TABS)[number]>('정치적 성향')

  const {
    data: topic,
    isLoading: topicLoading,
    isError: topicError,
  } = useQuery({
    queryKey: ['topic', topicId],
    queryFn: () => getTopic(topicId),
    enabled: !!topicId,
  })

  const {
    data: articles = [],
    isLoading: articlesLoading,
    isError: articlesError,
  } = useQuery({
    queryKey: ['topic-articles', topicId],
    queryFn: () => getTopicArticles(topicId),
    enabled: !!topicId,
  })

  const isLoading = topicLoading || articlesLoading
  const isError = topicError || articlesError

  const articlesByLeaning = (leaning: PoliticalLeaning) =>
    articles.filter((a) => a.publisher.politicalLeaning === leaning)

  const articlesByCountry = (() => {
    const map = new Map<string, TopicArticle[]>()
    for (const a of articles) {
      const c = a.publisher.country
      if (!map.has(c)) map.set(c, [])
      map.get(c)!.push(a)
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length)
  })()

  return (
    <div className="min-h-dvh overflow-x-hidden bg-neutral-50 text-neutral-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
        <div className={cn(homeColumnClass, 'flex items-center justify-between px-4 py-3 sm:px-6')}>
          <Link to="/" className="flex items-center text-neutral-700 hover:text-neutral-900">
            <ArrowLeft className="size-5" />
          </Link>
          <span className="font-cc-serif text-sm font-bold tracking-tight">CrossCheck News</span>
          <button type="button" className="text-neutral-700 hover:text-neutral-900">
            <Search className="size-5" />
          </button>
        </div>
      </header>

      <div className={cn(homeColumnClass, 'pb-28')}>
        {/* Topic hero */}
        <div className="bg-white px-4 pb-5 pt-5 sm:px-6">
          {topicLoading ? (
            <div className="space-y-2">
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="h-7 w-3/4" />
              <SkeletonBlock className="h-4 w-1/2" />
            </div>
          ) : topic ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                {topic.category}
              </p>
              <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-3xl">
                {topic.title}
              </h1>
              {topic.description && (
                <p className="mt-1.5 text-sm text-neutral-500">{topic.description}</p>
              )}
            </>
          ) : null}
        </div>

        {/* Filter tabs */}
        <div className="sticky top-[49px] z-30 border-b border-neutral-200 bg-white px-4 sm:px-6">
          <div className="flex gap-5">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={cn(
                  'border-b-2 py-3 text-sm transition-colors',
                  activeFilter === tab
                    ? 'border-black font-semibold text-black'
                    : 'border-transparent font-medium text-neutral-400',
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <main className="space-y-5 px-4 py-5 sm:px-6">
          {isError && (
            <div className="py-12 text-center text-sm text-neutral-400">
              데이터를 불러오지 못했습니다.
            </div>
          )}

          {!isError && (
            <>
              {/* Distribution chart */}
              {isLoading ? (
                <SkeletonBlock className="h-20 w-full" />
              ) : activeFilter === '정치적 성향' && topic?.leaningDistribution ? (
                <LeaningDistributionBar
                  distribution={topic.leaningDistribution}
                  total={articles.length}
                />
              ) : activeFilter === '국가별' && topic?.countryDistribution ? (
                <CountryDistributionList
                  distribution={topic.countryDistribution}
                  total={articles.length}
                />
              ) : null}

              {/* Articles */}
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonBlock key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : activeFilter === '정치적 성향' ? (
                <div className="space-y-8">
                  {LEANING_SECTIONS.map(({ leaning, label, labelEn }) => (
                    <LeaningSection
                      key={leaning}
                      leaning={leaning}
                      label={label}
                      labelEn={labelEn}
                      articles={articlesByLeaning(leaning)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-8">
                  {articlesByCountry.map(([country, countryArticles]) => (
                    <section key={country} className="space-y-3">
                      <h3 className="text-sm font-bold text-neutral-900">{country}</h3>
                      {countryArticles.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                      ))}
                    </section>
                  ))}
                </div>
              )}

              <SubscribeCta />
            </>
          )}
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
