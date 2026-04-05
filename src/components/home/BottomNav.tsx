import { Building2, Home, LayoutList } from 'lucide-react'
import { Link } from 'react-router-dom'

import { homeColumnClass, homePaddingXClass } from '@/components/home/homeLayout'
import { cn } from '@/lib/utils'

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:pt-2.5"
      aria-label="하단 메뉴"
    >
      <div
        className={cn(
          homeColumnClass,
          homePaddingXClass,
          'flex items-center justify-around',
        )}
      >
        <Link
          to="/"
          className="flex flex-col items-center gap-0.5 py-1 text-cc-slate"
          aria-current="page"
        >
          <Home className="size-5 stroke-[2.25]" />
          <span className="text-[11px] font-semibold">홈</span>
        </Link>
        <span className="flex flex-col items-center gap-0.5 py-1 text-neutral-400">
          <LayoutList className="size-5 stroke-[2]" />
          <span className="text-[11px] font-medium">리스트</span>
        </span>
        <span className="flex flex-col items-center gap-0.5 py-1 text-neutral-400">
          <Building2 className="size-5 stroke-[2]" />
          <span className="text-[11px] font-medium">crossNews</span>
        </span>
      </div>
    </nav>
  )
}
