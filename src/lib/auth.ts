const TOKEN_KEY = 'admin_token'
const TOKEN_EXPIRY_KEY = 'admin_token_expiry'

export function getToken(): string | null {
  const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY)
  if (expiry && Date.now() > Number(expiry)) {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_EXPIRY_KEY)
    return null
  }
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string, expiresIn: number) {
  sessionStorage.setItem(TOKEN_KEY, token)
  sessionStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + expiresIn * 1000))
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_EXPIRY_KEY)
}
