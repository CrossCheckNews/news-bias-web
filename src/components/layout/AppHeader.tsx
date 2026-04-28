import { Bell, HelpCircle, LogOut, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AppHeaderProps {
  title: string;
  searchPlaceholder?: string;
}

export default function AppHeader({
  title,
  searchPlaceholder = 'Search...',
}: AppHeaderProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 w-full h-16 px-6 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-8">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        <div className="relative hidden lg:block w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-10 pr-4 py-1.5 bg-slate-100 border-transparent rounded-full focus:ring-2 focus:ring-slate-400 focus:bg-white transition-all text-xs outline-none"
            placeholder={searchPlaceholder}
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 border-r border-slate-200 pr-4 mr-2">
          <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>
          <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900">Admin</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200">
            AU
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:bg-slate-50 hover:text-red-500 rounded-full transition-colors"
            title="로그아웃"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
