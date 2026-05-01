import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import AdminLayout from '@/components/layout/AdminLayout';

const Publisher = lazy(() => import('@/pages/admin/Publisher'));
const PublisherForm = lazy(() => import('@/pages/admin/PublisherForm'));
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const Articles = lazy(() => import('@/pages/admin/Articles'));
const PipelineHistory = lazy(() => import('@/pages/admin/PipelineHistory'));
const Login = lazy(() => import('@/pages/admin/Login'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const TopicList = lazy(() => import('@/pages/TopicList'));
const TopicDetail = lazy(() => import('@/pages/TopicDetail'));

const ADMIN_SECRET_PATH = import.meta.env.VITE_ADMIN_SECRET_PATH;

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={null}>
        <Routes>
          {/* 공개 라우트 */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<TopicList />} />
          <Route path="/topics/:id" element={<TopicDetail />} />

          {/* 인증 필요 라우트 — AdminLayout이 nav/header + auth gate 담당 */}
          <Route element={<AdminLayout />}>
            <Route
              path={`/admin/${ADMIN_SECRET_PATH}`}
              element={
                <Navigate to={`/admin/${ADMIN_SECRET_PATH}/dashboard`} replace />
              }
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
            <Route
              path={`/admin/${ADMIN_SECRET_PATH}/articles`}
              element={<Articles />}
            />
            <Route
              path={`/admin/${ADMIN_SECRET_PATH}/history`}
              element={<PipelineHistory />}
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
