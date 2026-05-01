import {
  AlignJustify,
  Cloud,
  FileText,
  GitBranch,
  LayoutDashboard,
  Settings,
  User,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

const ADMIN_SECRET_PATH = import.meta.env.VITE_ADMIN_SECRET_PATH;
const CROSSCHECKNEWS_URL = import.meta.env.VITE_CROSSCHECKNEWS_URL ?? '/';

const NAV_ITEMS: Array<{ label: string; icon: LucideIcon; to: string }> = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    to: `/admin/${ADMIN_SECRET_PATH}/dashboard`,
  },
  {
    label: 'Topics',
    icon: AlignJustify,
    to: `/admin/${ADMIN_SECRET_PATH}/topics`,
  },
  {
    label: 'Articles',
    icon: FileText,
    to: `/admin/${ADMIN_SECRET_PATH}/articles`,
  },
  {
    label: 'Publishers',
    icon: User,
    to: `/admin/${ADMIN_SECRET_PATH}/publishers`,
  },
  {
    label: 'Pipeline',
    icon: GitBranch,
    to: `/admin/${ADMIN_SECRET_PATH}/dashboard`,
  },
  {
    label: 'Pipeline History',
    icon: Cloud,
    to: `/admin/${ADMIN_SECRET_PATH}/history`,
  },
  {
    label: 'Settings',
    icon: Settings,
    to: `/admin/${ADMIN_SECRET_PATH}/settings`,
  },
];

export default function AppNav() {
  const location = useLocation();

  const handleCrossCheckNews = () => {
    window.location.href = getCrossCheckNewsRootUrl();
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-slate-200 bg-slate-50 flex flex-col py-4 z-40">
      <div className="px-6 py-4 flex flex-col gap-1 mb-4">
        <span className="text-xl font-bold text-slate-900">CrossCheckNews</span>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          Data Orchestrator
        </span>
      </div>
      <nav className="flex-1 flex flex-col px-3 space-y-1">
        {NAV_ITEMS.map(({ label, icon: Icon, to }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-cyan-50 text-cyan-700 border-r-4 border-cyan-600 rounded-l-lg'
                  : 'text-slate-600 hover:bg-slate-100 rounded-lg',
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 mt-auto pt-4">
        <button
          onClick={handleCrossCheckNews}
          className="w-full bg-cc-slate text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-sm"
        >
          Cross Check News 이동
        </button>
      </div>
    </aside>
  );
}

function getCrossCheckNewsRootUrl() {
  if (!CROSSCHECKNEWS_URL || CROSSCHECKNEWS_URL.startsWith('/')) {
    return '/';
  }

  try {
    return new URL('/', CROSSCHECKNEWS_URL).toString();
  } catch {
    return '/';
  }
}
