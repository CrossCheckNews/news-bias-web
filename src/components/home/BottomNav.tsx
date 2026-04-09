import { Bookmark, Layers, LayoutList, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import {
  homeColumnClass,
  homePaddingXClass,
} from '@/components/home/homeLayout';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const { pathname, search } = useLocation();
  const tabParam = new URLSearchParams(search).get('tab');

  const isEditions = pathname === '/' && tabParam !== 'all';
  const isTopics = pathname === '/' && tabParam === 'all';

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
          className={cn(
            'flex flex-col items-center gap-0.5 py-1',
            isEditions ? 'text-cc-slate' : 'text-neutral-400',
          )}
          aria-current={isEditions ? 'page' : undefined}
        >
          <Layers className="size-5 stroke-[2]" />
          <span className="text-[10px] font-semibold uppercase tracking-wide">Today's News</span>
        </Link>
        <Link
          to="/?tab=all"
          className={cn(
            'flex flex-col items-center gap-0.5 py-1',
            isTopics ? 'text-cc-slate' : 'text-neutral-400',
          )}
          aria-current={isTopics ? 'page' : undefined}
        >
          <LayoutList className="size-5 stroke-[2]" />
          <span className="text-[10px] font-semibold uppercase tracking-wide">All</span>
        </Link>
        <span className="flex flex-col items-center gap-0.5 py-1 text-neutral-400">
          <Bookmark className="size-5 stroke-[2]" />
          <span className="text-[10px] font-semibold uppercase tracking-wide">Saved</span>
        </span>
        <span className="flex flex-col items-center gap-0.5 py-1 text-neutral-400">
          <User className="size-5 stroke-[2]" />
          <span className="text-[10px] font-semibold uppercase tracking-wide">Profile</span>
        </span>
      </div>
    </nav>
  );
}
