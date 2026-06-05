import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as authApi from '../api/auth.ts'
import { getAccessToken, removeAccessToken, setAccessToken } from '../lib/authStorage.ts'
import type { AuthUser } from '../types/auth.ts'

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      setIsLoading(false)
      return
    }

    authApi
      .getMe()
      .then(setUser)
      .catch(() => {
        removeAccessToken()
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken } = await authApi.login({ email, password })
    setAccessToken(accessToken)
    const me = await authApi.getMe()
    setUser(me)
  }, [])

  const register = useCallback(
    async (email: string, password: string) => {
      await authApi.register({ email, password })
      await login(email, password)
    },
    [login],
  )

  const logout = useCallback(() => {
    removeAccessToken()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
