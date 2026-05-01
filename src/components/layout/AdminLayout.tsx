import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppHeader from './AppHeader';
import AppNav from './AppNav';

const usePageTitle = () => {
  const { pathname } = useLocation();
  if (pathname.includes('/dashboard')) return 'Pipeline Dashboard';
  if (pathname.includes('/articles')) return 'Articles';
  if (pathname.includes('/topics')) return 'Topics';
  if (pathname.includes('/publishers')) return 'Publishers';
  if (pathname.includes('/history')) return 'Pipeline History';
  return 'Dashboard';
};

export default function AdminLayout() {
  const { authed } = useAuth();
  const title = usePageTitle();

  if (!authed) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav />
      <main className="ml-64 flex flex-col min-h-screen">
        <AppHeader title={title} />
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
