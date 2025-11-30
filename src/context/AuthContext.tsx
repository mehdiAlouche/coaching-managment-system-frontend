import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { apiClient, endpoints, persistAuthToken, clearAuthSession, refreshAuthToken, type AuthenticatedRequestConfig } from "../services"
import type { UserRole } from "../lib/rbac"
import { hasRole as rbacHasRole } from "../lib/rbac"
import { User } from "@/models"

// Normalize backend user structures into our User model
function normalizeUser(raw: any): User | null {
  if (!raw || typeof raw !== 'object') return null
  // Backend may return user with _id, firstName/lastName, role, email, etc.
  // Ensure required fields exist; fall back gracefully.
  return {
    _id: raw._id || raw.id || '',
    email: raw.email || '',
    role: raw.role || raw.userRole || '',
    firstName: raw.firstName || raw.name?.split(' ')[0] || raw.first_name || '',
    lastName: raw.lastName || raw.name?.split(' ').slice(1).join(' ') || raw.last_name || '',
    organizationId: raw.organizationId || raw.orgId || raw.organization?._id || raw.organization?.id || '',
    hourlyRate: raw.hourlyRate,
    startupName: raw.startupName,
    phone: raw.phone,
    timezone: raw.timezone,
    isActive: raw.isActive !== undefined ? raw.isActive : true,
    createdAt: raw.createdAt || '',
    updatedAt: raw.updatedAt || '',
  }
}



interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  // return the user object so callers can use the role immediately after login/register
  login: (email: string, password: string) => Promise<User>
 // register: (name: string, email: string, password: string, role: string) => Promise<User>
  logout: () => Promise<void>
  hasRole: (...roles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const performProfileFetch = async (authToken: string) => {
        const response = await apiClient.get(endpoints.auth.me, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        const container = response.data?.data ? response.data.data : response.data
        const rawUser = container?.user ?? container?.data?.user ?? container
        const normalized = normalizeUser(rawUser)
        if (normalized) {
          setUser(normalized)
          setIsAuthenticated(true)
          if (normalized.role) {
            localStorage.setItem("auth_role", normalized.role)
          }
          return true
        }
        clearAuthSession()
        setUser(null)
        setIsAuthenticated(false)
        return false
      }

      let token = localStorage.getItem("auth_token")
      if (!token) {
        token = await refreshAuthToken() ?? null
      }

      let isAuthenticatedNow = false

      if (token) {
        try {
          isAuthenticatedNow = await performProfileFetch(token)
        } catch (error: any) {
          const status = error?.response?.status
          if (status === 401 || status === 403) {
            const refreshedToken = await refreshAuthToken()
            if (refreshedToken) {
              try {
                isAuthenticatedNow = await performProfileFetch(refreshedToken)
              } catch {
                isAuthenticatedNow = false
              }
            }
          }

          if (!isAuthenticatedNow) {
            clearAuthSession()
            setUser(null)
            setIsAuthenticated(false)
          }
        }
      }

      if (!isAuthenticatedNow) {
        // Ensure unauthenticated state if no valid session
        setUser(null)
        setIsAuthenticated(false)
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await apiClient.post(endpoints.auth.login, { email, password })
    // Support both { token, user } and { success, data: { token, user } }
    const container = response.data?.data ? response.data.data : response.data
    const token = container?.token ?? container?.accessToken ?? container?.access_token
    const refreshToken = container?.refreshToken ?? container?.refresh_token ?? container?.tokens?.refreshToken
    const rawUser = container?.user
    const user = normalizeUser(rawUser)

    if (!token || !user) {
      throw new Error('Malformed login response: missing token or user')
    }
    // persist token and role
    persistAuthToken(token, refreshToken)
    if (user?.role) {
      localStorage.setItem("auth_role", user.role)
    }

    setUser(user)
    setIsAuthenticated(true)
    return user
  }

  /*const register = async (name: string, email: string, password: string, role: string) => {
    const response = await apiClient.post(endpoints.auth.register, { name, email, password, role })
    const container = response.data?.data ? response.data.data : response.data
    const token = container?.token
    const rawUser = container?.user
    const user = normalizeUser(rawUser)

    if (!token || !user) {
      throw new Error('Malformed register response: missing token or user')
    }

    localStorage.setItem("auth_token", token)
    if (user?.role) {
      localStorage.setItem("auth_role", user.role)
    }

    try {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`
    } catch (e) {
      // ignore
    }

    setUser(user)
    setIsAuthenticated(true)

    return user
  }*/

  const logout = async () => {
    const config: AuthenticatedRequestConfig = {
      skipAuthRefresh: true,
    }

    const storedRefreshToken = localStorage.getItem('auth_refresh_token')
    const payload = storedRefreshToken ? { refreshToken: storedRefreshToken } : undefined

    try {
      await apiClient.post(endpoints.auth.logout, payload, config)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Logout request failed', error)
      }
    } finally {
      clearAuthSession()
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const hasRole = (...roles: UserRole[]) => {
    if (!user) return false
    return rbacHasRole({ role: user.role }, ...roles)
  }

  return <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, hasRole }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
