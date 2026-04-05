import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TopicListPage from '@/pages/TopicListPage'
import TopicDetailPage from '@/pages/TopicDetailPage'
import AdminPage from '@/pages/AdminPage'
import AdminPublisherFormPage from '@/pages/AdminPublisherFormPage'

const ADMIN_SECRET_PATH = import.meta.env.VITE_ADMIN_SECRET_PATH

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TopicListPage />} />
        <Route path="/topics/:id" element={<TopicDetailPage />} />
        <Route path={`/admin/${ADMIN_SECRET_PATH}`} element={<AdminPage />} />
        <Route path={`/admin/${ADMIN_SECRET_PATH}/publishers/new`} element={<AdminPublisherFormPage />} />
        <Route path={`/admin/${ADMIN_SECRET_PATH}/publishers/:publisherId/edit`} element={<AdminPublisherFormPage />} />
      </Routes>
    </BrowserRouter>
  )
}
