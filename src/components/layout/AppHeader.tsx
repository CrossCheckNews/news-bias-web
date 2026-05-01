import { FolderGit2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AppHeaderProps {
  title: string;
  searchPlaceholder?: string;
}

const GITHUB_URL = import.meta.env.VITE_GITHUB_URL;
export default function AppHeader({ title }: AppHeaderProps) {
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
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 border-r border-slate-200 pr-4 mr-2">
          <button
            title="Go toGitHub Organization"
            className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors"
            onClick={() => window.open(GITHUB_URL, '_blank')}
          >
            <FolderGit2 className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900">Admin</p>
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
