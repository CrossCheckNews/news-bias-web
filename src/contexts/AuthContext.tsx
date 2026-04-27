import { createContext, useContext, useState } from 'react'
import { clearToken, getToken, setToken } from '@/lib/auth'

interface AuthContextValue {
  authed: boolean
  login: (token: string, expiresIn: number) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(() => Boolean(getToken()))

  const login = (token: string, expiresIn: number) => {
    setToken(token, expiresIn)
    setAuthed(true)
  }

  const logout = () => {
    clearToken()
    setAuthed(false)
  }

  return (
    <AuthContext.Provider value={{ authed, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
