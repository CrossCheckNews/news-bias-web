import { ChevronDown } from 'lucide-react'

import { homePaddingXClass } from '@/components/home/homeLayout'
import { HOME_FEED_TABS } from '@/data/homeFeed'
import { cn } from '@/lib/utils'

const ACTIVE_TAB_INDEX = 1

export function HomeHeader() {
  return (
    <header
      className={cn(
        'border-b border-neutral-200 bg-white pb-3 pt-4 sm:pt-5',
        homePaddingXClass,
      )}
    >
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
          {HOME_FEED_TABS.map((label, i) => {
            const active = i === ACTIVE_TAB_INDEX
            return (
              <button
                key={label}
                type="button"
                className={cn(
                  'shrink-0 whitespace-nowrap border-b-2 pb-2 text-sm transition-colors',
                  active
                    ? 'border-black font-semibold text-black'
                    : 'border-transparent font-medium text-neutral-500',
                )}
              >
                {label}
              </button>
            )
          })}
        </nav>
        <button
          type="button"
          className="mb-0.5 flex shrink-0 items-center gap-0.5 text-xs font-medium text-neutral-600"
        >
          최신순
          <ChevronDown className="size-3.5" aria-hidden />
        </button>
      </div>
    </header>
  )
}
