import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/api/auth';
import { useAuth } from '@/contexts/AuthContext';

const ADMIN_SECRET_PATH = import.meta.env.VITE_ADMIN_SECRET_PATH;

export default function LoginPage() {
  const { authed, login: authLogin } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (authed) {
    navigate(`/admin/${ADMIN_SECRET_PATH}/dashboard`, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, expiresIn } = await login({ username, password });
      authLogin(token, expiresIn);
      navigate(`/admin/${ADMIN_SECRET_PATH}/dashboard`, { replace: true });
    } catch {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-8 shadow-md"
      >
        <div className="mb-2 text-center">
          <p className="font-cc-serif text-sm font-bold tracking-widest text-neutral-400">
            CROSSCHECK NEWS
          </p>
          <h1 className="mt-2 text-xl font-bold text-neutral-900">
            관리자 로그인
          </h1>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="username"
            className="text-sm font-medium text-neutral-700"
          >
            아이디
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            placeholder="아이디를 입력하세요"
            autoComplete="username"
            autoFocus
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-neutral-700"
          >
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="비밀번호를 입력하세요"
            autoComplete="current-password"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>

        {error && <p className="text-center text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading || !username || !password}
          className="mt-1 rounded-md bg-cc-slate py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cc-slate/90 disabled:opacity-50"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
}
