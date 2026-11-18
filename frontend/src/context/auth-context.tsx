import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from '@/services/api-client'
import { authService } from '@/services/auth.service'
import type { LoginPayload, SignupPayload } from '@/services/auth.service'
import type { Article, User } from '@/types/api'

const AUTH_USER_CACHE_KEY = 'kdpl_auth_user'

function getCachedUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_CACHE_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function setCachedUser(user: User | null): void {
  if (!user) {
    localStorage.removeItem(AUTH_USER_CACHE_KEY)
    return
  }
  localStorage.setItem(AUTH_USER_CACHE_KEY, JSON.stringify(user))
}

export interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  login: (payload: LoginPayload) => Promise<User>
  signup: (payload: SignupPayload) => Promise<User>
  logout: () => void
  refreshUser: () => Promise<void>
  canEditOrDelete: (article: Article) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() =>
    getStoredToken() ? getCachedUser() : null,
  )
  const [isLoading, setIsLoading] = useState<boolean>(() =>
    Boolean(getStoredToken()),
  )

  const refreshUser = useCallback(async () => {
    const token = getStoredToken()
    if (!token) {
      setUser(null)
      setCachedUser(null)
      setIsLoading(false)
      return
    }

    try {
      const currentUser = await authService.getMe()
      setUser(currentUser)
      setCachedUser(currentUser)
    } catch {
      clearStoredToken()
      setCachedUser(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshUser()
  }, [refreshUser])

  const login = useCallback(async (payload: LoginPayload) => {
    const data = await authService.login(payload)
    setStoredToken(data.token)
    setCachedUser(data.user)
    setUser(data.user)
    return data.user
  }, [])

  const signup = useCallback(async (payload: SignupPayload) => {
    const data = await authService.signup(payload)
    setStoredToken(data.token)
    setCachedUser(data.user)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    clearStoredToken()
    setCachedUser(null)
    setUser(null)
  }, [])

  const canEditOrDelete = useCallback(
    (article: Article) => {
      if (!user) return false
      if (user.role === 'admin') return true
      const authorId = article.author?.id ?? article.authorId
      return authorId === user.id
    },
    [user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      isAdmin: user?.role === 'admin',
      login,
      signup,
      logout,
      refreshUser,
      canEditOrDelete,
    }),
    [user, isLoading, login, signup, logout, refreshUser, canEditOrDelete],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
