import { FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import type { HomeFeedItem } from '@/data/homeFeed'
import { cn } from '@/lib/utils'

function CategoryTag({
  label,
  style,
}: {
  label: string
  style: HomeFeedItem['categoryTagStyle']
}) {
  if (!label || style === 'none') return null
  return (
    <span
      className={cn(
        'shrink-0 rounded px-2 py-0.5 text-[11px] font-medium',
        style === 'solidDark' && 'bg-cc-slate text-white',
        style === 'solidLight' && 'bg-cc-surface-2 text-neutral-700',
        style === 'outline' &&
          'border border-neutral-300 bg-white/80 text-neutral-600',
      )}
    >
      {label}
    </span>
  )
}

function MetaRow({ item }: { item: HomeFeedItem }) {
  const { leftRibbon, articleCount, category, categoryTagStyle } = item

  if (item.cardBg === 'hero') return null

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-neutral-600">
        {leftRibbon === 'popular' && (
          <span className="rounded border border-neutral-400 px-1.5 py-0.5 text-[10px] font-medium text-neutral-700">
            인기
          </span>
        )}
        {leftRibbon === 'notable' && (
          <span className="rounded bg-cc-slate px-1.5 py-0.5 text-[10px] font-medium text-white">
            주목할 만한
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <FileText className="size-3.5 shrink-0 text-neutral-500" aria-hidden />
          <span>{articleCount}개 기사</span>
        </span>
      </div>
      <CategoryTag label={category} style={categoryTagStyle} />
    </div>
  )
}

function Cta({
  item,
  to,
}: {
  item: HomeFeedItem
  to: string
}) {
  const { cta, ctaLabel } = item

  if (cta === 'heroReport') {
    return (
      <div className="flex justify-center pt-1">
        <Button
          nativeButton={false}
          render={(props) => <Link {...props} to={to} />}
          className="h-9 rounded-md border-0 bg-white px-6 text-sm font-semibold text-black hover:bg-white/95"
        >
          {ctaLabel}
        </Button>
      </div>
    )
  }

  if (cta === 'link') {
    return (
      <div className="pt-1">
        <Button
          variant="link"
          nativeButton={false}
          render={(props) => <Link {...props} to={to} />}
          className="h-auto p-0 text-sm font-medium text-cc-slate underline-offset-4"
        >
          {ctaLabel}
        </Button>
      </div>
    )
  }

  if (cta === 'smallCompare') {
    return (
      <Button
        nativeButton={false}
        render={(props) => <Link {...props} to={to} />}
        className="h-9 w-full rounded-md bg-cc-slate px-3 text-xs font-medium text-white hover:bg-cc-slate/90 sm:h-8 sm:w-auto"
      >
        {ctaLabel}
      </Button>
    )
  }

  const fullClass =
    cta === 'fullOutline'
      ? 'h-10 w-full rounded-md border border-neutral-400 bg-transparent text-sm font-medium text-neutral-800 hover:bg-neutral-50'
      : cta === 'fullSolidDark'
        ? 'h-10 w-full rounded-md border-0 bg-cc-slate text-sm font-medium text-white hover:bg-cc-slate/90'
        : 'h-10 w-full rounded-md border-0 bg-cc-surface-2 text-sm font-medium text-neutral-800 hover:bg-neutral-200/80'

  return (
    <Button
      nativeButton={false}
      render={(props) => <Link {...props} to={to} />}
      variant={cta === 'fullOutline' ? 'outline' : 'default'}
      className={cn(
        fullClass,
        cta === 'fullOutline' && 'border-neutral-400',
      )}
    >
      {ctaLabel}
    </Button>
  )
}

export function TopicFeedCard({ item }: { item: HomeFeedItem }) {
  const to = `/topics/${item.id}`

  if (item.cardBg === 'hero') {
    const bgStyle = item.heroImageUrl
      ? {
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.78)), url(${item.heroImageUrl})`,
        }
      : undefined

    return (
      <article
        className={cn(
          'relative overflow-hidden rounded-xl bg-neutral-800 bg-cover bg-center p-5 text-white sm:p-6 md:p-7',
          !item.heroImageUrl &&
            'bg-[radial-gradient(ellipse_at_30%_20%,#3d3d3d_0%,#1a1a1a_55%,#0d0d0d_100%)]',
        )}
        style={bgStyle}
      >
        <div className="flex min-h-[min(42dvh,240px)] flex-col justify-end gap-3 sm:min-h-[220px] md:min-h-[260px]">
          {item.heroEyebrow && (
            <p className="text-xs font-medium text-white/85">{item.heroEyebrow}</p>
          )}
          <h3 className="text-lg font-bold leading-snug tracking-tight sm:text-xl">
            {item.title}
          </h3>
          <Cta item={item} to={to} />
        </div>
      </article>
    )
  }

  const surface =
    item.cardBg === 'surface1'
      ? 'bg-cc-surface-1'
      : item.cardBg === 'surface2'
        ? 'bg-cc-surface-2'
        : 'bg-white'

  const hasKeywordRow = Boolean(item.keywords) && item.cta === 'smallCompare'

  return (
    <article
      className={cn(
        'rounded-xl p-4 shadow-sm ring-1 ring-black/5 sm:p-5 md:p-6',
        surface,
      )}
    >
      <MetaRow item={item} />
      <h3 className="mt-3 text-base font-bold leading-snug tracking-tight text-neutral-900 sm:text-lg">
        {item.title}
      </h3>

      {hasKeywordRow ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <p className="min-w-0 text-xs text-neutral-500 sm:text-sm">{item.keywords}</p>
          <div className="flex w-full justify-stretch sm:w-auto sm:shrink-0 sm:justify-end">
            <Cta item={item} to={to} />
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <Cta item={item} to={to} />
        </div>
      )}
    </article>
  )
}
