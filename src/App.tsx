import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import Publisher from '@/pages/admin/Publisher';
import PublisherForm from '@/pages/admin/PublisherForm';
import Dashboard from '@/pages/admin/Dashboard';
import Login from '@/pages/admin/Login';
import TopicList from '@/pages/TopicList';
import TopicDetail from '@/pages/TopicDetail';

const ADMIN_SECRET_PATH = import.meta.env.VITE_ADMIN_SECRET_PATH;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<TopicList />} />
        <Route path="/:id" element={<TopicDetail />} />

        {/* 인증 필요 라우트 — AdminLayout이 nav/header + auth gate 담당 */}
        <Route element={<AdminLayout />}>
          <Route
            path={`/admin/${ADMIN_SECRET_PATH}`}
            element={<Navigate to={`/admin/${ADMIN_SECRET_PATH}/dashboard`} replace />}
          />
          <Route
            path={`/admin/${ADMIN_SECRET_PATH}/dashboard`}
            element={<Dashboard />}
          />
          <Route
            path={`/admin/${ADMIN_SECRET_PATH}/publishers`}
            element={<Publisher />}
          />
          <Route
            path={`/admin/${ADMIN_SECRET_PATH}/publishers/new`}
            element={<PublisherForm />}
          />
          <Route
            path={`/admin/${ADMIN_SECRET_PATH}/publishers/:publisherId/edit`}
            element={<PublisherForm />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
